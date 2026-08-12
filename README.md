# Env Type-Safe

Type-safe environment variable loader for Node.js. Never access `undefined` env vars again.

```javascript
const env = new EnvLoader({
  DATABASE_URL: 'string',
  PORT: 'number',
  DEBUG: 'boolean',
});

console.log(env.PORT); // TypeScript knows this is number
```

## Features
- ✓ Full TypeScript support
- ✓ Runtime validation
- ✓ Helpful error messages
- ✓ Defaults & optional fields
- ✓ Type coercion (string → number)

## Benefits
- Catch missing env vars at startup
- Zero runtime overhead
- IDE autocompletion
- Production-safe

## License: MIT
