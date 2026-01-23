const path = require('path');
const assert = require('assert');

console.log('🛡️ Sentinel: IDOR Fix Verification Script (Wishlist)');

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
    console.log('Testing delete with CORRECT user...');
    // We pass both args. In vulnerable code, userId is ignored.
    await wishlistModel.deleteWishlistItem('item-1', 'user-1');
    console.log('✅ Success: Delete allowed for owner');

    console.log('Testing delete with WRONG user...');
    try {
      await wishlistModel.deleteWishlistItem('item-1', 'user-2');
      // If vulnerable, this succeeds.
      console.error('❌ FAILURE: Delete succeeded for wrong user! (IDOR Vulnerability Present)');
      failed = true;
    } catch (err) {
       if (err.message.includes('not found') || err.message.includes('access denied')) {
           console.log('✅ Success: Delete blocked for wrong user');
       } else {
           console.log('❓ Unexpected error: ' + err.message);
           // If it throws something else, it might still be a failure or success depending on error.
           // But normally we expect a specific error message for access denied.
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

    const req = {
      params: { id: 'item-1' },
      user: { id: 'user-2' } // WRONG USER
    };

    console.log('Calling deleteWishlistItemController with WRONG user...');
    await wishlistController.deleteWishlistItemController(req, res);

    if (statusCode === 200) {
      console.error(`❌ Controller returned 200 OK for wrong user! (IDOR)`);
      failed = true;
    } else if (statusCode === 404 || statusCode === 403) {
      console.log('✅ Controller returned 404/403 (Protected)');
    } else {
       console.error(`❌ Controller returned status ${statusCode}`);
       failed = true;
    }

  } catch (err) {
    console.error('❌ Error during controller test:', err);
    failed = true;
  }

  if (failed) {
    console.error('\n🚫 VERIFICATION FAILED (Vulnerability Detected)');
    process.exit(1);
  } else {
    console.log('\n✨ ALL TESTS PASSED (Secure)');
  }
}

runTests();
