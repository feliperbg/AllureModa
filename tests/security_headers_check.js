const assert = require('assert');
const { securityHeaders } = require('../middleware/security');

console.log('🛡️ Sentinel: Security Headers Verification Script');

async function runTests() {
  let failed = false;

  console.log('\n--- Test 1: Headers are set correctly ---');
  try {
    // Mock Request and Response
    const req = {};
    const headers = {};
    const res = {
      setHeader: (key, value) => {
        headers[key] = value;
      }
    };
    const next = () => {};

    // Simulate Production Environment for HSTS check
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    // Run Middleware
    securityHeaders(req, res, next);

    // Verify Headers
    const checks = [
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-XSS-Protection', value: '1; mode=block' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' }
    ];

    checks.forEach(check => {
      if (headers[check.key] === check.value) {
        console.log(`✅ ${check.key} set correctly`);
      } else {
        console.error(`❌ ${check.key} mismatch. Expected: "${check.value}", Got: "${headers[check.key]}"`);
        failed = true;
      }
    });

    // Cleanup
    process.env.NODE_ENV = originalEnv;

  } catch (err) {
    console.error('❌ Error during headers test:', err);
    failed = true;
  }

  console.log('\n--- Test 2: HSTS skipped in development ---');
  try {
      // Mock Request and Response
      const req = {};
      const headers = {};
      const res = {
        setHeader: (key, value) => {
          headers[key] = value;
        }
      };
      const next = () => {};

      // Simulate Development Environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      // Run Middleware
      securityHeaders(req, res, next);

      // Verify HSTS is NOT set
      if (headers['Strict-Transport-Security']) {
        console.error(`❌ HSTS should NOT be set in development mode. Got: "${headers['Strict-Transport-Security']}"`);
        failed = true;
      } else {
        console.log(`✅ HSTS correctly skipped in development`);
      }

      // Cleanup
      process.env.NODE_ENV = originalEnv;
  } catch (err) {
      console.error('❌ Error during HSTS dev test:', err);
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
