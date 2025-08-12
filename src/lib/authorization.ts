import {auth} from '../../auth';
import {UserRole} from './definitions';

// 役割階層の定義
const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 2,
  editor: 1,
};

// セッション取得ヘルパー
export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

// 最小権限チェック
export async function hasMinimumRole(requiredRole: UserRole): Promise<boolean> {
  const user = await getCurrentUser();
  if (!user) return false;

  const userLevel = ROLE_HIERARCHY[user.role];
  const requiredLevel = ROLE_HIERARCHY[requiredRole];

  return userLevel >= requiredLevel;
}

// 管理者権限チェック
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'admin';
}

// 編集者以上権限チェック
export async function canEdit(): Promise<boolean> {
  return await hasMinimumRole('editor');
}

// 権限チェック付きアクション実行
export async function withAuthorization<T>(
  requiredRole: UserRole,
  action: () => Promise<T>
): Promise<T> {
  const hasPermission = await hasMinimumRole(requiredRole);

  if (!hasPermission) {
    throw new Error('権限が不足しています');
  }

  return await action();
}

// ユーザー管理権限チェック（管理者のみ）
export async function canManageUsers(): Promise<boolean> {
  return await isAdmin();
}
