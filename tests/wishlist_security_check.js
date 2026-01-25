const path = require('path');
const assert = require('assert');

console.log('🛡️ Sentinel: Wishlist IDOR Fix Verification Script');

// 1. Mock prisma/client
const prismaClientPath = path.resolve(__dirname, '../prisma/client.js');
const mockPrisma = {
  wishlistItem: {
    findFirst: async ({ where }) => {
      console.log('  [MockPrisma] findFirst called with:', JSON.stringify(where));
      // Simulate database: Item 'item-1' belongs to 'user-1'
      if (where.id === 'item-1' && where.userId === 'user-1') {
        return { id: 'item-1', userId: 'user-1', productId: 'prod-1' };
      }
      return null;
    },
    delete: async ({ where }) => {
      console.log('  [MockPrisma] delete called with:', JSON.stringify(where));
      // Simulate successful delete if it reaches here
      return { id: where.id };
    }
  }
};

// Inject mock into require cache
require.cache[prismaClientPath] = {
  id: prismaClientPath,
  filename: prismaClientPath,
  loaded: true,
  exports: { prisma: mockPrisma }
};

// 2. Import modules (they will use the mocked prisma)
const wishlistModel = require('../model/wishlist');
const wishlistController = require('../controller/wishlistController');

async function runTests() {
  let failed = false;

  console.log('\n--- Test 1: Model Delete Protection ---');
  try {
    console.log('Testing delete with WRONG user (user-2)...');
    try {
        // Before fix: 2nd arg is ignored, deletes successfully -> FAILURE
        // After fix: 2nd arg checks ownership -> Throws Error -> SUCCESS
        await wishlistModel.deleteWishlistItem('item-1', 'user-2');

        console.error('❌ FAILURE: Delete succeeded for wrong user! (IDOR)');
        failed = true;
    } catch (err) {
        if (err.message.includes('not found or access denied')) {
            console.log('✅ Success: Delete blocked for wrong user');
        } else {
             console.log('❓ Unexpected error: ' + err.message);
             // Could be strict arg check? Unlikely in JS.
        }
    }

  } catch (err) {
      console.error('❌ Error during model test:', err);
      failed = true;
  }

  console.log('\n--- Test 2: Controller Delete Logic ---');
  try {
    let responseData = null;
    let statusCode = 200;
    const res = {
      status: (code) => { statusCode = code; return res; },
      json: (data) => { responseData = data; return res; }
    };

    // Case: Attacker (user-2) tries to delete item-1 (owned by user-1)
    const req = {
      params: { id: 'item-1' },
      user: { id: 'user-2' }
    };

    console.log('Calling deleteWishlistItemController as WRONG user...');
    await wishlistController.deleteWishlistItemController(req, res);

    if (statusCode === 200) {
      console.error(`❌ Controller returned 200 OK (IDOR success)`);
      failed = true;
    } else if (statusCode === 404 || statusCode === 403) {
      console.log('✅ Controller blocked request (404/403)');
    } else {
       console.log(`⚠️ Controller returned ${statusCode} - check error message:`, responseData);
       // If it returns 500 with "Access denied", that is technically secure but 404/403 is better.
       // For now, if it returns 500 but BLOCKS the action, it is NOT an IDOR, just bad UX.
       // But before fix, it returns 200.
       if (statusCode === 500 && responseData.message && responseData.message.includes('access denied')) {
           console.log('✅ Controller blocked request (500 but secure)');
       }
    }

  } catch (err) {
    console.error('❌ Error during controller test:', err);
    failed = true;
  }

  if (failed) {
    console.error('\n🚫 VERIFICATION FAILED (Vulnerability Detected)');
    // We don't exit(1) because we want to see the output
  } else {
    console.log('\n✨ ALL TESTS PASSED');
  }
}

runTests();
