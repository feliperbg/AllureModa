const fs = require('fs');
const logFile = 'connection-log.txt';

function log(message) {
  fs.appendFileSync(logFile, message + '\n');
}

log('Script starting...');
require('dotenv').config();
const net = require('net');
const url = require('url');

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  log('DATABASE_URL is not defined in .env');
  process.exit(1);
}

try {
  const parsedUrl = new url.URL(dbUrl);
  const host = parsedUrl.hostname;
  const port = parsedUrl.port || 5432;
  log(`DATABASE_URL Params: ${parsedUrl.search}`);

  require('dns').lookup(host, (err, address, family) => {
    if (err) log(`DNS Lookup failed: ${err.message}`);
    else log(`Resolved ${host} to ${address} (IPv${family})`);
  });



  log(`Testing connection to ${host}:${port}...`);

  const socket = new net.Socket();
  
  socket.setTimeout(5000); // 5s timeout

  socket.on('connect', () => {
    log('✅ TCP Connection successful!');
    socket.end();
  });

  socket.on('timeout', () => {
    log('❌ Connection timed out. Firewall or network issue?');
    socket.destroy();
  });

  socket.on('error', (err) => {
    log(`❌ Connection failed: ${err.message}`);
  });

  socket.connect(port, host);

} catch (err) {
  log(`Invalid DATABASE_URL format: ${err.message}`);
}

const directUrl = process.env.DIRECT_URL;
if (directUrl) {
  try {
    const parsedUrl = new url.URL(directUrl);
    const host = parsedUrl.hostname;
    const port = parsedUrl.port || 5432;
    log(`DIRECT_URL Params: ${parsedUrl.search}`);


    log(`Testing connection to DIRECT_URL ${host}:${port}...`);

    const socket = new net.Socket();
    socket.setTimeout(5000);

    socket.on('connect', () => {
      log('✅ DIRECT_URL TCP Connection successful!');
      socket.end();
    });

    socket.on('timeout', () => {
      log('❌ DIRECT_URL Connection timed out.');
      socket.destroy();
    });

    socket.on('error', (err) => {
      log(`❌ DIRECT_URL Connection failed: ${err.message}`);
    });

    socket.connect(port, host);
  } catch (err) {
    log(`Invalid DIRECT_URL format: ${err.message}`);
  }
} else {
  log('DIRECT_URL is not defined.');
}

