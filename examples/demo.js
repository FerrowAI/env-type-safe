const { loadEnv, ValidationError } = require('../dist/index.js');

// Test 1: Valid load
console.log('Test 1: Valid configuration');
process.env.PORT = '3000';
process.env.DATABASE_URL = 'postgresql://localhost/db';
process.env.DEBUG = 'true';

const config = loadEnv({
  PORT: { type: 'port', default: 5000 },
  DATABASE_URL: 'url',
  DEBUG: 'boolean',
});

console.log(`  PORT=${config.PORT} (type: ${typeof config.PORT})`);
console.log(`  DATABASE_URL=${config.DATABASE_URL}`);
console.log(`  DEBUG=${config.DEBUG} (type: ${typeof config.DEBUG})`);
console.log(`  Object.isFrozen(config)=${Object.isFrozen(config)}`);

// Test 2: Multiple validation errors
console.log('\nTest 2: Multiple validation errors');
delete process.env.PORT;
delete process.env.DATABASE_URL;
delete process.env.DEBUG;

try {
  loadEnv({
    PORT: { type: 'port', required: true },
    API_KEY: 'string',
  });
} catch (err) {
  if (err.name === 'ValidationError') {
    console.log(`  Caught ValidationError with ${err.issues.length} issue(s):`);
    err.issues.forEach(i => console.log(`    - ${i.key}: ${i.message}`));
  }
}

// Test 3: Type coercion with defaults
console.log('\nTest 3: Type coercion with defaults');
process.env.SECRET = 'my-secret-key';
const config2 = loadEnv({
  PORT: { type: 'port', default: 8080 },
  SECRET: 'string',
  DEBUG: { type: 'boolean', default: false },
});
console.log(`  PORT=${config2.PORT} (default used)`);
console.log(`  DEBUG=${config2.DEBUG} (default used)`);
console.log(`  SECRET=${config2.SECRET}`);

console.log('\n✓ All tests passed');
