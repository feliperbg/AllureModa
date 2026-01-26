const path = require('path');
const assert = require('assert');

console.log('🛡️ Sentinel: Wishlist IDOR Fix Verification Script');

// 1. Mock prisma/client
const prismaClientPath = path.resolve(__dirname, '../prisma/client.js');
const mockPrisma = {
  wishlistItem: {
    findFirst: async ({ where }) => {
      console.log('  [MockPrisma] findFirst called with:', JSON.stringify(where));
      // Simulate database: Item 'wish-1' belongs to 'user-1'
      if (where.id === 'wish-1' && where.userId === 'user-1') {
        return { id: 'wish-1', userId: 'user-1', productId: 'prod-1' };
      }
      return null;
    },
    delete: async ({ where }) => {
      console.log('  [MockPrisma] delete called with:', JSON.stringify(where));
      // In a real DB, delete would succeed if ID exists.
      // But we are testing if the MODEL checks for ownership first.
      if (where.id === 'wish-1') {
          return { id: 'wish-1' };
      }
      throw new Error('Record to delete does not exist.');
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
    // Expectation: deleteWishlistItem(id, userId)
    await wishlistModel.deleteWishlistItem('wish-1', 'user-1');
    console.log('✅ Success: Delete allowed for owner');

    console.log('Testing delete with WRONG user...');
    try {
      await wishlistModel.deleteWishlistItem('wish-1', 'user-2');
      console.error('❌ FAILURE: Delete succeeded for wrong user! (IDOR)');
      failed = true;
    } catch (err) {
      if (err.message.includes('not found') || err.message.includes('access denied')) {
         console.log('✅ Success: Delete blocked for wrong user');
      } else {
         console.log('✅ Success: Delete blocked (unexpected error message: ' + err.message + ')');
      }
    }

  } catch (err) {
      if (err.name === 'TypeError' || err.message.includes('is not a function') || err.message.includes('prisma.wishlistItem.findFirst is not a function')) {
           // This might happen if the code is not updated to call findFirst
           console.log('❌ FAILURE: Code likely not updated (unexpected error: ' + err.message + ')');
           failed = true;
      } else {
          // If the first call (CORRECT user) fails, it's a failure.
          console.error('❌ Error during model test (Correct User):', err);
          failed = true;
      }
  }

  console.log('\n--- Test 2: Controller Delete Logic ---');
  try {
    // We mock the response object
    let responseData = null;
    let statusCode = 200;
    const res = {
      status: (code) => { statusCode = code; return res; },
      json: (data) => { responseData = data; return res; }
    };

    const req = {
      params: { id: 'wish-1' },
      user: { id: 'user-1' } // Authenticated user is the owner
    };

    console.log('Calling deleteWishlistItemController with owner...');
    await wishlistController.deleteWishlistItemController(req, res);

    if (statusCode === 200) {
      console.log('✅ Controller returned 200 OK');
    } else {
      console.error(`❌ Controller returned status ${statusCode}`);
      failed = true;
    }

  } catch (err) {
    console.error('❌ Error during controller test:', err);
    failed = true;
  }

  if (failed) {
    console.error('\n🚫 VERIFICATION FAILED');
    process.exit(1);
  } else {
    console.log('\n✨ ALL TESTS PASSED');
  }
}

runTests();
