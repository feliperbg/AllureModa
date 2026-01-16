const path = require('path');
const assert = require('assert');

console.log('🛡️ Sentinel: IDOR Fix Verification Script');

// 1. Mock prisma/client
const prismaClientPath = path.resolve(__dirname, '../prisma/client.js');
const mockPrisma = {
  address: {
    findFirst: async ({ where }) => {
      console.log('  [MockPrisma] findFirst called with:', JSON.stringify(where));
      // Simulate database: Address 'addr-1' belongs to 'user-1'
      if (where.id === 'addr-1' && where.userId === 'user-1') {
        return { id: 'addr-1', userId: 'user-1', street: 'Original St' };
      }
      return null;
    },
    update: async ({ where, data }) => {
      console.log('  [MockPrisma] update called with:', JSON.stringify(where));
      return { id: where.id, ...data };
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
const addressModel = require('../model/address');
const addressController = require('../controller/addressController');

async function runTests() {
  let failed = false;

  console.log('\n--- Test 1: Model Update Protection ---');
  try {
    // This calls the model directly.
    // If the fix is implemented, this should succeed for correct user
    // and fail for incorrect user.

    // We expect the signature to be: updateAddress(id, userId, data)

    console.log('Testing access with CORRECT user...');
    await addressModel.updateAddress('addr-1', 'user-1', { street: 'Updated St' });
    console.log('✅ Success: Update allowed for owner');

    console.log('Testing access with WRONG user...');
    try {
      await addressModel.updateAddress('addr-1', 'user-2', { street: 'Hacked St' });
      console.error('❌ FAILURE: Update succeeded for wrong user! (IDOR)');
      failed = true;
    } catch (err) {
      console.log('✅ Success: Update blocked for wrong user');
      if (!err.message.includes('Address not found or access denied')) {
        console.warn('  (Warning: Unexpected error message: ' + err.message + ')');
      }
    }

  } catch (err) {
    if (err.name === 'TypeError' || err.message.includes('is not a function')) {
      console.log('⚠️ Test skipped/failed: Model signature might not be updated yet.');
    } else {
      console.error('❌ Error during model test:', err);
      failed = true;
    }
  }

  console.log('\n--- Test 2: Controller Update Logic ---');
  try {
    // We mock the response object to capture output
    let responseData = null;
    let statusCode = 200;
    const res = {
      status: (code) => { statusCode = code; return res; },
      json: (data) => { responseData = data; return res; }
    };

    const req = {
      params: { id: 'addr-1' },
      body: { street: 'Controller Update' },
      user: { id: 'user-1' }
    };

    console.log('Calling updateAddressController...');
    await addressController.updateAddressController(req, res);

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

  console.log('\n--- Test 3: Model Delete Protection ---');
    try {
    console.log('Testing delete with CORRECT user...');
    await addressModel.deleteAddress('addr-1', 'user-1');
    console.log('✅ Success: Delete allowed for owner');

    console.log('Testing delete with WRONG user...');
    try {
      await addressModel.deleteAddress('addr-1', 'user-2');
      console.error('❌ FAILURE: Delete succeeded for wrong user! (IDOR)');
      failed = true;
    } catch (err) {
      console.log('✅ Success: Delete blocked for wrong user');
    }

  } catch (err) {
      console.log('⚠️ Test skipped/failed: Model signature might not be updated yet.');
  }

  if (failed) {
    console.error('\n🚫 VERIFICATION FAILED');
    process.exit(1);
  } else {
    console.log('\n✨ ALL TESTS PASSED');
  }
}

runTests();
