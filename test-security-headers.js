const http = require('http');

// Set mock environment variables before requiring server
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgres://mock:5432/db';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'mock_secret';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://mock-frontend.com';
// Force production to test HSTS if we want, or test checking logic.
// Let's assume the environment is what it is, and the test adapts.

const app = require('./server');

const PORT = 3002;

const server = app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);

  const options = {
    hostname: 'localhost',
    port: PORT,
    path: '/api/health',
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);

    let passed = true;

    // Check X-Powered-By (Should be missing)
    if (res.headers['x-powered-by']) {
      console.error('FAIL: X-Powered-By header is present.');
      passed = false;
    } else {
      console.log('PASS: X-Powered-By header is missing.');
    }

    // Check Security Headers
    const checks = {
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'permissions-policy': 'geolocation=(), microphone=(), camera=()'
    };

    for (const [header, expected] of Object.entries(checks)) {
      if (res.headers[header] !== expected) {
        console.error(`FAIL: ${header} is '${res.headers[header]}', expected '${expected}'`);
        passed = false;
      } else {
        console.log(`PASS: ${header} is correct.`);
      }
    }

    // Check HSTS
    if (process.env.NODE_ENV !== 'development') {
         if (res.headers['strict-transport-security'] !== 'max-age=31536000; includeSubDomains') {
             console.error(`FAIL: Strict-Transport-Security is missing or incorrect. Got: ${res.headers['strict-transport-security']}`);
             passed = false;
         } else {
             console.log('PASS: Strict-Transport-Security is correct.');
         }
    } else {
        console.log('INFO: Skipping HSTS check in development environment.');
    }

    server.close(() => {
      if (passed) {
        console.log('All security header checks passed.');
        process.exit(0);
      } else {
        console.error('Some security header checks failed.');
        process.exit(1);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`problem with request: ${e.message}`);
    server.close(() => {
      process.exit(1);
    });
  });

  req.end();
});
