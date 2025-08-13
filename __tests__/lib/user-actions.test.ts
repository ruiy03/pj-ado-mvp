import {createUser, updateUser, deleteUser, getUsers} from '@/lib/user-actions';
import {getCurrentUser, withAuthorization} from '@/lib/authorization';
import {sql} from '@/lib/db';
import bcrypt from 'bcrypt';

// NextAuth.jsのモック
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

// Mock dependencies
jest.mock('@/lib/authorization');
jest.mock('@/lib/db');
jest.mock('bcrypt');
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const mockWithAuthorization = withAuthorization as jest.MockedFunction<typeof withAuthorization>;
const mockGetCurrentUser = getCurrentUser as jest.MockedFunction<typeof getCurrentUser>;
const mockSql = sql as jest.MockedFunction<typeof sql>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('user-actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('管理者権限でユーザー一覧を取得できる', async () => {
      const mockUsers = [
        {id: 1, name: 'Admin User', email: 'admin@example.com', role: 'admin', created_at: new Date()},
        {id: 2, name: 'Editor User', email: 'editor@example.com', role: 'editor', created_at: new Date()},
      ];

      mockWithAuthorization.mockImplementation(async (role, action) => {
        if (role === 'admin') {
          return await action();
        }
        throw new Error('権限が不足しています');
      });

      mockSql.mockResolvedValue(mockUsers as any);

      const result = await getUsers();
      expect(result).toEqual(mockUsers);
      expect(mockWithAuthorization).toHaveBeenCalledWith('admin', expect.any(Function));
    });
  });

  describe('createUser', () => {
    it('有効なデータで新しいユーザーを作成する', async () => {
      const formData = new FormData();
      formData.set('name', 'Test User');
      formData.set('email', 'test@example.com');
      formData.set('password', 'password123');
      formData.set('role', 'editor');

      const hashedPassword = 'hashed_password';
      const newUser = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'editor',
        created_at: new Date()
      };

      mockWithAuthorization.mockImplementation(async (role, action) => {
        if (role === 'admin') {
          return await action();
        }
        throw new Error('権限が不足しています');
      });

      mockSql
        .mockResolvedValueOnce([]) // 重複チェック
        .mockResolvedValueOnce([newUser] as any); // ユーザー作成

      mockBcrypt.hash.mockResolvedValue(hashedPassword);

      const result = await createUser(undefined, formData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('ユーザーが作成されました');
      expect(result.user).toEqual(newUser);
      expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('管理者権限ユーザーの作成を拒否する', async () => {
      const formData = new FormData();
      formData.set('name', 'Admin User');
      formData.set('email', 'admin@example.com');
      formData.set('password', 'password123');
      formData.set('role', 'admin');

      mockWithAuthorization.mockImplementation(async (role, action) => {
        if (role === 'admin') {
          return await action();
        }
        throw new Error('権限が不足しています');
      });

      const result = await createUser(undefined, formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('管理者アカウントは作成できません');
    });

    it('重複するメールアドレスでエラーを返す', async () => {
      const formData = new FormData();
      formData.set('name', 'Test User');
      formData.set('email', 'existing@example.com');
      formData.set('password', 'password123');
      formData.set('role', 'editor');

      mockWithAuthorization.mockImplementation(async (role, action) => {
        if (role === 'admin') {
          return await action();
        }
        throw new Error('権限が不足しています');
      });

      mockSql.mockResolvedValueOnce([{id: 1}] as any); // 既存ユーザー

      const result = await createUser(undefined, formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('このメールアドレスは既に使用されています');
    });

    it('バリデーションエラーを正しく処理する', async () => {
      const formData = new FormData();
      formData.set('name', '');
      formData.set('email', 'invalid-email');
      formData.set('password', '123'); // 短すぎる
      formData.set('role', 'editor');

      mockWithAuthorization.mockImplementation(async (role, action) => {
        if (role === 'admin') {
          return await action();
        }
        throw new Error('権限が不足しています');
      });

      const result = await createUser(undefined, formData);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors!.length).toBeGreaterThan(0);
    });
  });

  describe('updateUser', () => {
    it('有効なデータでユーザーを更新する', async () => {
      const formData = new FormData();
      formData.set('id', '1');
      formData.set('name', 'Updated User');
      formData.set('email', 'updated@example.com');
      formData.set('role', 'editor');

      const existingUser = {
        id: 1,
        name: 'Old User',
        email: 'old@example.com',
        role: 'editor',
        password: 'old_password'
      };

      const updatedUser = {
        id: 1,
        name: 'Updated User',
        email: 'updated@example.com',
        role: 'editor',
        created_at: new Date(),
        updated_at: new Date()
      };

      mockWithAuthorization.mockImplementation(async (role, action) => {
        if (role === 'admin') {
          return await action();
        }
        throw new Error('権限が不足しています');
      });

      mockSql
        .mockResolvedValueOnce([existingUser] as any) // 既存ユーザー取得
        .mockResolvedValueOnce([updatedUser] as any); // ユーザー更新

      const result = await updateUser(undefined, formData);

      expect(result.success).toBe(true);
      expect(result.message).toBe('ユーザーが更新されました');
      expect(result.user).toEqual(updatedUser);
    });

    it('管理者権限への変更を拒否する', async () => {
      const formData = new FormData();
      formData.set('id', '1');
      formData.set('role', 'admin');

      mockWithAuthorization.mockImplementation(async (role, action) => {
        if (role === 'admin') {
          return await action();
        }
        throw new Error('権限が不足しています');
      });

      const result = await updateUser(undefined, formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('管理者権限への変更はできません');
    });

    it('存在しないユーザーの更新でエラーを返す', async () => {
      const formData = new FormData();
      formData.set('id', '999');
      formData.set('name', 'Updated User');

      mockWithAuthorization.mockImplementation(async (role, action) => {
        if (role === 'admin') {
          return await action();
        }
        throw new Error('権限が不足しています');
      });

      mockSql.mockResolvedValueOnce([] as any); // ユーザーが見つからない

      const result = await updateUser(undefined, formData);

      expect(result.success).toBe(false);
      expect(result.message).toBe('ユーザーが見つかりませんでした');
    });
  });

  describe('deleteUser', () => {
    it('有効なIDでユーザーを削除する', async () => {
      const userId = 2;
      const currentUser = {id: '1', role: 'admin'};
      const userToDelete = [{id: 2, role: 'editor'}];

      mockWithAuthorization.mockImplementation(async (role, action) => {
        if (role === 'admin') {
          return await action();
        }
        throw new Error('権限が不足しています');
      });

      mockGetCurrentUser.mockResolvedValue(currentUser as any);
      mockSql
        .mockResolvedValueOnce(userToDelete as any) // 削除対象ユーザー取得
        .mockResolvedValueOnce([] as any); // 削除実行

      const result = await deleteUser(userId);

      expect(result.success).toBe(true);
      expect(result.message).toBe('ユーザーが削除されました');
    });

    it('管理者が自分自身を削除しようとした場合にエラーを返す', async () => {
      const userId = 1;
      const currentUser = {id: '1', role: 'admin'};
      const userToDelete = [{id: 1, role: 'admin'}];

      mockWithAuthorization.mockImplementation(async (role, action) => {
        if (role === 'admin') {
          return await action();
        }
        throw new Error('権限が不足しています');
      });

      mockGetCurrentUser.mockResolvedValue(currentUser as any);
      mockSql.mockResolvedValueOnce(userToDelete as any);

      const result = await deleteUser(userId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('管理者は自分自身のアカウントを削除できません');
    });

    it('存在しないユーザーの削除でエラーを返す', async () => {
      const userId = 999;
      const currentUser = {id: '1', role: 'admin'};

      mockWithAuthorization.mockImplementation(async (role, action) => {
        if (role === 'admin') {
          return await action();
        }
        throw new Error('権限が不足しています');
      });

      mockGetCurrentUser.mockResolvedValue(currentUser as any);
      mockSql.mockResolvedValueOnce([] as any); // ユーザーが見つからない

      const result = await deleteUser(userId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('ユーザーが見つかりませんでした');
    });

    it('未認証ユーザーがアクセスしようとした場合にエラーを返す', async () => {
      const userId = 1;

      mockWithAuthorization.mockImplementation(async (role, action) => {
        if (role === 'admin') {
          return await action();
        }
        throw new Error('権限が不足しています');
      });

      mockGetCurrentUser.mockResolvedValue(null);

      const result = await deleteUser(userId);

      expect(result.success).toBe(false);
      expect(result.message).toBe('ログインしていません');
    });
  });
});
