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

// 2. Import modules
const wishlistModel = require('../model/wishlist');
const wishlistController = require('../controller/wishlistController');

async function runTests() {
  let failed = false;

  console.log('\n--- Test 1: Model Delete Protection ---');
  try {
    console.log('Testing delete with CORRECT user...');
    // This expects the new signature: deleteWishlistItem(id, userId)
    await wishlistModel.deleteWishlistItem('item-1', 'user-1');
    console.log('✅ Success: Delete allowed for owner');

    console.log('Testing delete with WRONG user...');
    try {
      await wishlistModel.deleteWishlistItem('item-1', 'user-2');
      console.error('❌ FAILURE: Delete succeeded for wrong user! (IDOR)');
      failed = true;
    } catch (err) {
      console.log('✅ Success: Delete blocked for wrong user');
      if (!err.message.includes('not found') && !err.message.includes('access denied')) {
        console.warn('  (Warning: Unexpected error message: ' + err.message + ')');
      }
    }

  } catch (err) {
    if (err.message.includes('Wishlist item not found or access denied')) {
         // This catch block might be hit if the first call fails, which implies even correct user failed?
         // No, the first call is awaited.
         console.error('❌ Error during CORRECT user test:', err);
         failed = true;
    } else {
        // If the signature isn't updated, it might ignore the second arg and succeed (returning promise),
        // or fail if we added validation logic that's broken.
        // If it succeeds for wrong user, we catch that above.
        // If it fails for correct user, we catch here.
        console.error('❌ Error during model test:', err);
        failed = true;
    }
  }

  if (failed) {
    console.error('\n🚫 VERIFICATION FAILED');
    process.exit(1);
  } else {
    console.log('\n✨ ALL TESTS PASSED');
  }
}

runTests();
