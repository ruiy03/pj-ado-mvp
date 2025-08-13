import {sql} from '@/lib/db';

// Neon Database のモック
jest.mock('@neondatabase/serverless', () => ({
  neon: jest.fn()
}));

// 環境変数のモック
const originalEnv = process.env;

describe('db', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {...originalEnv};
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('DATABASE_URL環境変数が設定されている場合はsql関数が利用可能', () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';

    // モジュールを再読み込みして環境変数の変更を反映
    jest.isolateModules(() => {
      const {neon} = require('@neondatabase/serverless');
      const mockSql = jest.fn();
      neon.mockReturnValue(mockSql);

      const {sql} = require('@/lib/db');

      expect(sql).toBeDefined();
      expect(neon).toHaveBeenCalledWith('postgresql://test:test@localhost:5432/testdb');
    });
  });

  it('DATABASE_URL環境変数が設定されていない場合はエラーを投げる', () => {
    delete process.env.DATABASE_URL;

    expect(() => {
      jest.isolateModules(() => {
        require('@/lib/db');
      });
    }).toThrow('DATABASE_URL environment variable is required');
  });

  it('DATABASE_URL環境変数が空文字の場合はエラーを投げる', () => {
    process.env.DATABASE_URL = '';

    expect(() => {
      jest.isolateModules(() => {
        require('@/lib/db');
      });
    }).toThrow('DATABASE_URL environment variable is required');
  });

  it('sql関数が正しい形式でエクスポートされる', () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';

    jest.isolateModules(() => {
      const {neon} = require('@neondatabase/serverless');
      const mockSql = jest.fn();
      neon.mockReturnValue(mockSql);

      const dbModule = require('@/lib/db');

      expect(dbModule).toHaveProperty('sql');
      expect(typeof dbModule.sql).toBe('function');
    });
  });
});
