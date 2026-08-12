export type EnvType = 'string' | 'number' | 'boolean' | 'url' | 'port';

export interface EnvFieldConfig {
  type: EnvType;
  required?: boolean;
  default?: string | number | boolean;
}

export type EnvSchema = Record<string, EnvType | EnvFieldConfig>;

type InferredType<T extends EnvType | EnvFieldConfig> =
  T extends 'string' ? string :
  T extends 'number' ? number :
  T extends 'boolean' ? boolean :
  T extends 'url' ? string :
  T extends 'port' ? number :
  T extends EnvFieldConfig ? InferredType<T['type']> :
  never;

type InferredConfig<T extends EnvSchema> = {
  readonly [K in keyof T]: InferredType<T[K]>;
};

export interface ValidationError extends Error {
  name: 'ValidationError';
  issues: { key: string; message: string }[];
}

function createValidationError(issues: { key: string; message: string }[]): ValidationError {
  const error = new Error(
    `Environment validation failed (${issues.length} issue${issues.length === 1 ? '' : 's'}):\n` +
    issues.map(i => `  ${i.key}: ${i.message}`).join('\n')
  ) as ValidationError;
  error.name = 'ValidationError';
  error.issues = issues;
  return error;
}

function coerce(value: string | undefined, type: EnvType): any {
  if (value === undefined || value === '') {
    return undefined;
  }

  switch (type) {
    case 'number': {
      const num = Number(value);
      if (isNaN(num)) throw new Error(`not a valid number`);
      return num;
    }
    case 'boolean': {
      if (value === 'true' || value === '1') return true;
      if (value === 'false' || value === '0') return false;
      throw new Error(`not a valid boolean (expected 'true', 'false', '1', or '0')`);
    }
    case 'url': {
      try {
        new URL(value);
        return value;
      } catch {
        throw new Error(`not a valid URL`);
      }
    }
    case 'port': {
      const num = Number(value);
      if (isNaN(num) || !Number.isInteger(num)) throw new Error(`not a valid port number`);
      if (num < 1 || num > 65535) throw new Error(`port out of range (1-65535)`);
      return num;
    }
    case 'string':
    default:
      return String(value);
  }
}

export function loadEnv<T extends EnvSchema>(schema: T): InferredConfig<T> {
  const result: Record<string, any> = {};
  const issues: { key: string; message: string }[] = [];

  for (const [key, fieldDef] of Object.entries(schema)) {
    const envValue = process.env[key];
    const config: EnvFieldConfig = typeof fieldDef === 'string'
      ? { type: fieldDef, required: true }
      : fieldDef;

    try {
      if (envValue !== undefined && envValue !== '') {
        result[key] = coerce(envValue, config.type);
      } else if (config.default !== undefined) {
        result[key] = config.default;
      } else if (config.required !== false) {
        issues.push({ key, message: 'required but missing' });
      } else {
        result[key] = undefined;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      issues.push({ key, message });
    }
  }

  if (issues.length > 0) {
    throw createValidationError(issues);
  }

  return Object.freeze(result) as InferredConfig<T>;
}
