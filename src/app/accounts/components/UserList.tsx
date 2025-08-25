'use client';

import { User, UserRole } from '@/lib/definitions';

interface UserListProps {
  users: User[];
  loading: boolean;
  currentUserId: number;
  onEdit: (user: User) => void;
  onDelete: (userId: number) => void;
  onAddUser?: () => void;
}

export default function UserList({
  users,
  loading,
  currentUserId,
  onEdit,
  onDelete,
}: UserListProps) {
  const getRoleBadgeColor = (role: UserRole) => 
    role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';

  const getRoleDisplayName = (role: UserRole) => 
    role === 'admin' ? '管理者' : '編集者';

  return (
    <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-6 text-center">
            <div className="text-lg">読み込み中...</div>
          </div>
        ) : users.length === 0 ? (
          <div className="p-6 text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium mb-2">ユーザーがいません</h3>
            <p className="text-gray-400">新しいアカウントを追加してください</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ユーザー
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    役割
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    作成日
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('ja-JP') : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => onEdit(user)}
                        className="text-indigo-600 hover:text-indigo-900 cursor-pointer"
                      >
                        編集
                      </button>
                      {!(user.role === 'admin' && user.id === currentUserId) && (
                        <button
                          onClick={() => onDelete(user.id)}
                          className="text-red-600 hover:text-red-900 cursor-pointer"
                        >
                          削除
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}
