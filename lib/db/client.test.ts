import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import path from 'path';

// Mock better-sqlite3 with a proper constructor function
vi.mock('better-sqlite3', () => {
  return {
    default: vi.fn(function(this: any, dbPath: string, options: any) {
      return {
        close: vi.fn(),
        prepare: vi.fn(),
      };
    }),
  };
});

describe('getDb', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the module to clear any cached db instance
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates database instance with correct path', async () => {
    const Database = (await import('better-sqlite3')).default;
    const { getDb } = await import('./client');

    const db = getDb();

    expect(Database).toHaveBeenCalledWith(
      path.join(process.cwd(), '1763396571.46251_B5F0F277-C15D-4821-89CA-FE0E734CEE55.sqlite'),
      {
        readonly: true,
        fileMustExist: true,
      }
    );
    expect(db).toBeDefined();
  });

  it('returns same instance on subsequent calls (singleton pattern)', async () => {
    const Database = (await import('better-sqlite3')).default;
    const { getDb } = await import('./client');

    const db1 = getDb();
    const db2 = getDb();

    // Database constructor should only be called once
    expect(Database).toHaveBeenCalledTimes(1);
    expect(db1).toBe(db2);
  });

  it('uses readonly mode', async () => {
    const Database = (await import('better-sqlite3')).default;
    const { getDb } = await import('./client');
    getDb();

    const callArgs = vi.mocked(Database).mock.calls[0];
    expect(callArgs[1]).toMatchObject({ readonly: true });
  });

  it('requires file to exist', async () => {
    const Database = (await import('better-sqlite3')).default;
    const { getDb } = await import('./client');
    getDb();

    const callArgs = vi.mocked(Database).mock.calls[0];
    expect(callArgs[1]).toMatchObject({ fileMustExist: true });
  });
});
