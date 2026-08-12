export type EnvType = 'string' | 'number' | 'boolean';
export type EnvSchema = Record<string, EnvType | { type: EnvType; required?: boolean; default?: string }>;

export class EnvLoader<T extends EnvSchema> {
  private vars: Record<string, any> = {};

  constructor(schema: T) {
    for (const [key, config] of Object.entries(schema)) {
      const value = process.env[key];
      const typeConfig = typeof config === 'string' ? { type: config, required: true } : config;

      if (!value && typeConfig.required !== false && typeConfig.default === undefined) {
        throw new Error(`Missing required environment variable: ${key}`);
      }

      this.vars[key] = this.coerce(value || typeConfig.default, typeConfig.type);
    }
  }

  private coerce(value: any, type: EnvType): any {
    if (value === undefined) return undefined;
    switch (type) {
      case 'number':
        return Number(value);
      case 'boolean':
        return value === 'true' || value === '1';
      case 'string':
      default:
        return String(value);
    }
  }

  get<K extends keyof T>(key: K): any {
    return this.vars[String(key)];
  }

  [key: string]: any;
}
