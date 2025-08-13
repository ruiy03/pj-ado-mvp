import { auth } from '@/auth';
import {
  getCurrentUser,
  hasMinimumRole,
  isAdmin,
  canEdit,
  withAuthorization,
  canManageUsers,
} from '@/lib/authorization';
import { UserRole } from '@/lib/definitions';

// Mock auth
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('Authorization', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentUser', () => {
    it('returns user when session exists', async () => {
      const mockUser = { id: '1', name: 'Test User', email: 'test@example.com', role: 'admin' as UserRole };
      mockAuth.mockResolvedValue({
        user: mockUser,
        expires: '2024-01-01',
      });

      const result = await getCurrentUser();
      expect(result).toEqual(mockUser);
    });

    it('returns undefined when session is null', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await getCurrentUser();
      expect(result).toBeUndefined();
    });

    it('returns undefined when session has no user', async () => {
      mockAuth.mockResolvedValue({
        user: undefined,
        expires: '2024-01-01',
      });

      const result = await getCurrentUser();
      expect(result).toBeUndefined();
    });

    it('handles auth function rejection', async () => {
      mockAuth.mockRejectedValue(new Error('Auth error'));

      await expect(getCurrentUser()).rejects.toThrow('Auth error');
    });
  });

  describe('hasMinimumRole', () => {
    it('returns true when admin user checks for editor role', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' },
        expires: '2024-01-01',
      });

      const result = await hasMinimumRole('editor');
      expect(result).toBe(true);
    });

    it('returns true when admin user checks for admin role', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' },
        expires: '2024-01-01',
      });

      const result = await hasMinimumRole('admin');
      expect(result).toBe(true);
    });

    it('returns true when editor user checks for editor role', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', name: 'Editor', email: 'editor@example.com', role: 'editor' },
        expires: '2024-01-01',
      });

      const result = await hasMinimumRole('editor');
      expect(result).toBe(true);
    });

    it('returns false when editor user checks for admin role', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', name: 'Editor', email: 'editor@example.com', role: 'editor' },
        expires: '2024-01-01',
      });

      const result = await hasMinimumRole('admin');
      expect(result).toBe(false);
    });

    it('returns false when no user is authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await hasMinimumRole('editor');
      expect(result).toBe(false);
    });

    it('returns false when user has no role', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', name: 'User', email: 'user@example.com', role: undefined },
        expires: '2024-01-01',
      });

      const result = await hasMinimumRole('editor');
      expect(result).toBe(false);
    });
  });

  describe('isAdmin', () => {
    it('returns true for admin user', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' },
        expires: '2024-01-01',
      });

      const result = await isAdmin();
      expect(result).toBe(true);
    });

    it('returns false for editor user', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', name: 'Editor', email: 'editor@example.com', role: 'editor' },
        expires: '2024-01-01',
      });

      const result = await isAdmin();
      expect(result).toBe(false);
    });

    it('returns false when no user is authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await isAdmin();
      expect(result).toBe(false);
    });
  });

  describe('canEdit', () => {
    it('returns true for admin user', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' },
        expires: '2024-01-01',
      });

      const result = await canEdit();
      expect(result).toBe(true);
    });

    it('returns true for editor user', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', name: 'Editor', email: 'editor@example.com', role: 'editor' },
        expires: '2024-01-01',
      });

      const result = await canEdit();
      expect(result).toBe(true);
    });

    it('returns false when no user is authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await canEdit();
      expect(result).toBe(false);
    });
  });

  describe('withAuthorization', () => {
    it('executes action when user has required permission', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' },
        expires: '2024-01-01',
      });

      const mockAction = jest.fn().mockResolvedValue('success');

      const result = await withAuthorization('admin', mockAction);

      expect(mockAction).toHaveBeenCalledTimes(1);
      expect(result).toBe('success');
    });

    it('throws error when user lacks required permission', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', name: 'Editor', email: 'editor@example.com', role: 'editor' },
        expires: '2024-01-01',
      });

      const mockAction = jest.fn().mockResolvedValue('success');

      await expect(withAuthorization('admin', mockAction)).rejects.toThrow('権限が不足しています');
      expect(mockAction).not.toHaveBeenCalled();
    });

    it('throws error when no user is authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const mockAction = jest.fn().mockResolvedValue('success');

      await expect(withAuthorization('editor', mockAction)).rejects.toThrow('権限が不足しています');
      expect(mockAction).not.toHaveBeenCalled();
    });

    it('propagates action errors', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' },
        expires: '2024-01-01',
      });

      const mockAction = jest.fn().mockRejectedValue(new Error('Action failed'));

      await expect(withAuthorization('admin', mockAction)).rejects.toThrow('Action failed');
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('canManageUsers', () => {
    it('returns true for admin user', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', name: 'Admin', email: 'admin@example.com', role: 'admin' },
        expires: '2024-01-01',
      });

      const result = await canManageUsers();
      expect(result).toBe(true);
    });

    it('returns false for editor user', async () => {
      mockAuth.mockResolvedValue({
        user: { id: '1', name: 'Editor', email: 'editor@example.com', role: 'editor' },
        expires: '2024-01-01',
      });

      const result = await canManageUsers();
      expect(result).toBe(false);
    });

    it('returns false when no user is authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const result = await canManageUsers();
      expect(result).toBe(false);
    });
  });
});
