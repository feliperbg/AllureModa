const path = require('path');
const assert = require('assert');

console.log('🛡️ Sentinel: Review IDOR/Mass Assignment Check');

// 1. Mock prisma/client
const prismaClientPath = path.resolve(__dirname, '../prisma/client.js');
let createdReviewData = null;

const mockPrisma = {
  review: {
    create: async ({ data }) => {
      console.log('  [MockPrisma] create called with:', JSON.stringify(data));
      createdReviewData = data;
      return { id: 'review-1', ...data };
    },
    findMany: async () => []
  }
};

// Inject mock into require cache
require.cache[prismaClientPath] = {
  id: prismaClientPath,
  filename: prismaClientPath,
  loaded: true,
  exports: { prisma: mockPrisma }
};

// 2. Import controller
const reviewController = require('../controller/reviewController');

async function runTests() {
  let failed = false;

  console.log('\n--- Test: Create Review IDOR Check ---');
  try {
    // Reset capture
    createdReviewData = null;

    // Mock Response
    let statusCode = 200;
    const res = {
      status: (code) => { statusCode = code; return res; },
      json: (data) => { return res; }
    };

    // Mock Request
    // Authenticated as 'attacker', but trying to create review for 'victim'
    const req = {
      user: { id: 'attacker' },
      body: {
        userId: 'victim',
        productId: 'product-1',
        rating: 5,
        comment: 'I hacked this review'
      }
    };

    console.log('Calling createReviewController...');
    await reviewController.createReviewController(req, res);

    if (statusCode !== 201) {
      console.error(`❌ Controller returned status ${statusCode} (expected 201)`);
      failed = true;
    } else if (!createdReviewData) {
      console.error('❌ No data was sent to Prisma create');
      failed = true;
    } else {
      console.log('Data sent to Prisma:', createdReviewData);

      if (createdReviewData.userId === 'victim') {
        console.error('❌ VULNERABILITY DETECTED: Review created with spoofed userId ("victim")');
        failed = true;
      } else if (createdReviewData.userId === 'attacker') {
        console.log('✅ SECURE: Review created with authenticated userId ("attacker")');
      } else {
        console.error(`❌ Unexpected userId: ${createdReviewData.userId}`);
        failed = true;
      }
    }

  } catch (err) {
    console.error('❌ Error during test:', err);
    failed = true;
  }

  if (failed) {
    console.log('\n🚫 VERIFICATION FAILED (As expected if bug is present)');
    process.exit(1);
  } else {
    console.log('\n✨ ALL TESTS PASSED');
  }
}

runTests();
