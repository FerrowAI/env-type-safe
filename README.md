# env-type-safe
![CI](https://github.com/FerrowAI/env-type-safe/actions/workflows/ci.yml/badge.svg)

Type-safe environment variable loader with precise TypeScript typing, validation, and detailed multi-error reporting. Validates all variables upfront, coerces strings to proper types (number, boolean, URL, port), and returns an immutable configuration object.

## Installation

```bash
npm install @ferrow/env-type-safe
```

## Quick Start

```javascript
import { loadEnv } from 'env-type-safe';

const config = loadEnv({
  PORT: { type: 'port', default: 3000 },
  DATABASE_URL: { type: 'url', required: true },
  DEBUG: { type: 'boolean', default: false },
  API_KEY: 'string',
});

console.log(config.PORT); // number, type-safe
console.log(config.DEBUG); // boolean
```

## API

### `loadEnv<T>(schema: T): InferredConfig<T>`

Loads and validates environment variables against a schema. Throws `ValidationError` if validation fails.

**Schema field options:**
- `type`: `'string' | 'number' | 'boolean' | 'url' | 'port'`
- `required`: boolean (default: `true`)
- `default`: value of the specified type

**Type Coercion:**
- `'number'`: Parses string as decimal. NaN is an error.
- `'boolean'`: Accepts `'true'`, `'false'`, `'1'`, `'0'` (case-sensitive). Other values are errors.
- `'url'`: Must be a valid URL per `URL()` constructor.
- `'port'`: Must be an integer in range 1–65535.
- `'string'`: Returned as-is.

**Return type:** Frozen (immutable) object with inferred field types.

**Throws:** `ValidationError` with array of `issues` listing all validation failures.

### `ValidationError`

```typescript
interface ValidationError extends Error {
  name: 'ValidationError';
  issues: { key: string; message: string }[];
}
```

Validation is all-or-nothing: if any field fails, all issues are collected and reported in one throw.

## Examples

### Valid configuration

```javascript
process.env.PORT = '3000';
process.env.DATABASE_URL = 'postgresql://localhost/db';
process.env.DEBUG = 'true';

const config = loadEnv({
  PORT: { type: 'port', default: 5000 },
  DATABASE_URL: 'url',
  DEBUG: 'boolean',
});

config.PORT; // 3000 (number)
config.DATABASE_URL; // 'postgresql://localhost/db' (string)
config.DEBUG; // true (boolean)
Object.isFrozen(config); // true
```

### Multiple validation errors

```javascript
try {
  loadEnv({
    PORT: { type: 'port', required: true },
    API_KEY: 'string', // required by default
    DEBUG: { type: 'boolean', default: false },
  });
} catch (err) {
  if (err.name === 'ValidationError') {
    console.log(err.issues);
    // [
    //   { key: 'PORT', message: 'required but missing' },
    //   { key: 'API_KEY', message: 'required but missing' }
    // ]
  }
}
```

### Type safety

TypeScript infers the shape of the returned config from the schema. Missing or incorrect environment variables are caught at validation time, not at access time.

```typescript
const config = loadEnv({
  PORT: { type: 'port', default: 3000 },
  SECRET: 'string',
});

config.PORT; // ✓ number
config.SECRET; // ✓ string
config.MISSING; // ✗ TypeScript error (not in schema)
```

## Limits

- Environment variables are read once at `loadEnv()` call time. Changes to `process.env` afterwards are not reflected.
- Returned config is frozen; mutations are prevented at runtime.
- No support for structured/nested environment variables (JSON strings must be parsed manually).
- Boolean coercion is strict: only `'true'`, `'false'`, `'1'`, `'0'` are recognized.
- URL and port validation follow Node.js standards (Node `URL` class and RFC 6335 port ranges).

## License: MIT

Sponsored by [Ferrow](https://ferrow.ai)

---
Part of the [ferrow-toolkit](https://github.com/FerrowAI/ferrow-toolkit) collection · Sponsored by [Ferrow](https://ferrow.ai)
