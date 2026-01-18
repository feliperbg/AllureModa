const path = require('path');

console.log('🛡️ Sentinel: Wishlist IDOR Fix Verification Script');

// 1. Mock prisma/client
const prismaClientPath = path.resolve(__dirname, '../prisma/client.js');
let deleteCalled = false;
let findFirstCalled = false;

const mockPrisma = {
  wishlistItem: {
    findFirst: async ({ where }) => {
      findFirstCalled = true;
      console.log('  [MockPrisma] findFirst called with:', JSON.stringify(where));
      // Simulate database: Item 'item-1' belongs to 'user-1'
      if (where.id === 'item-1' && where.userId === 'user-1') {
        return { id: 'item-1', userId: 'user-1', productId: 'prod-1' };
      }
      return null;
    },
    delete: async ({ where }) => {
      deleteCalled = true;
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

async function runTests() {
  let failed = false;

  console.log('\n--- Test: Model Delete Protection ---');

  // Case 1: Attacker tries to delete someone else's item
  console.log('\n[Case 1] Attacker (user-2) tries to delete victim\'s item (item-1)');
  deleteCalled = false;
  findFirstCalled = false;

  try {
    // Ideally, we want to call: await wishlistModel.deleteWishlistItem('item-1', 'user-2');
    // Currently, the function likely ignores the second argument.
    await wishlistModel.deleteWishlistItem('item-1', 'user-2');

    if (deleteCalled) {
      console.error('❌ FAILURE: Delete operation was executed! (IDOR Vulnerability)');
      console.error('   Expected: Function should throw error or not call delete()');
      failed = true;
    } else {
       console.log('✅ Success: Delete operation was NOT executed.');
    }
  } catch (err) {
    if (deleteCalled) {
        console.error('❌ FAILURE: Delete operation was executed before error!');
        failed = true;
    } else {
        console.log('✅ Success: Function threw error and blocked delete.');
        console.log('   Error message:', err.message);
    }
  }

  // Case 2: Owner deletes their own item
  console.log('\n[Case 2] Owner (user-1) tries to delete their own item (item-1)');
  deleteCalled = false;
  findFirstCalled = false;

  try {
    await wishlistModel.deleteWishlistItem('item-1', 'user-1');

    if (deleteCalled) {
       console.log('✅ Success: Delete operation was executed for owner.');
    } else {
       console.error('❌ FAILURE: Delete operation was NOT executed for owner!');
       failed = true;
    }
  } catch (err) {
      console.error('❌ FAILURE: Function threw error for valid owner!');
      console.error('   Error:', err);
      failed = true;
  }

  if (failed) {
    console.error('\n🚫 VERIFICATION FAILED - IDOR Vulnerability exists or Logic is broken');
    // We don't exit with 1 yet because we expect this to fail initially
  } else {
    console.log('\n✨ ALL TESTS PASSED');
  }
}

runTests();
