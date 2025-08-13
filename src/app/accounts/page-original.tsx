'use client';

import React, { useState, useEffect, useActionState } from 'react';
import { User, UserRole } from '@/lib/definitions';
import { createUser, updateUser, deleteUser, getUsers } from '@/lib/user-actions';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface UserFormProps {
  user?: User;
  onClose: () => void;
  onSuccess: () => void;
}

function UserForm({ user, onClose, onSuccess }: UserFormProps) {
  const [createState, createFormAction] = useActionState(createUser, undefined);
  const [updateState, updateFormAction] = useActionState(updateUser, undefined);
  
  // フォームの値を状態で管理
  const [formValues, setFormValues] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
  });

  const isEdit = !!user;
  const formAction = isEdit ? updateFormAction : createFormAction;
  const state = isEdit ? updateState : createState;

  useEffect(() => {
    if (state?.success) {
      onSuccess();
    }
  }, [state, onSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">
          {isEdit ? 'ユーザー編集' : '新しいユーザーを追加'}
        </h2>
        
        <form action={formAction} className="space-y-4">
          {isEdit && <input type="hidden" name="id" value={user.id} />}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名前
            </label>
            <input
              type="text"
              name="name"
              value={formValues.name}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              name="email"
              value={formValues.email}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <input type="hidden" name="role" value="editor" />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード {isEdit && '(変更する場合のみ)'}
            </label>
            <input
              type="password"
              name="password"
              value={formValues.password}
              onChange={handleInputChange}
              required={!isEdit}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* 成功メッセージ */}
          {state?.success && state?.message && (
            <div className="p-3 rounded bg-green-100 text-green-700">
              {state.message}
            </div>
          )}

          {!state?.success && (state?.errors?.length || state?.message) && (
            <div className="p-3 rounded bg-red-100 text-red-700">
              {state?.errors?.length ? (
                <ul className="list-disc list-inside space-y-1">
                  {state.errors.map((error: string, index: number) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              ) : (
                state?.message
              )}
            </div>
          )}

          <div className="flex space-x-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded transition-colors"
            >
              {isEdit ? '更新' : '作成'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded transition-colors"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AccountsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | undefined>();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session?.user) {
      router.push('/login');
      return;
    }
    
    loadUsers();
  }, [session, status, router]);

  const loadUsers = async () => {
    try {
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch {
      // エラーハンドリング: ユーザー取得失敗時は空の配列を設定
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('このユーザーを削除してもよろしいですか？')) return;
    
    const result = await deleteUser(userId);
    if (result.success) {
      loadUsers();
    } else {
      alert(result.message);
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingUser(undefined);
    loadUsers();
  };

  const getRoleBadgeColor = (role: UserRole) => 
    role === 'admin' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800';

  const getRoleDisplayName = (role: UserRole) => 
    role === 'admin' ? '管理者' : '編集者';

  if (status === 'loading') {
    return (
      <div className="p-6 text-center">
        <div className="text-lg">読み込み中...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  if (session.user.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-medium mb-2">アクセス権限がありません</h3>
        <p className="text-gray-500">管理者権限が必要です</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">アカウント管理</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          新しいアカウントを追加
        </button>
      </div>

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
                        onClick={() => {
                          setEditingUser(user);
                          setShowForm(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        編集
                      </button>
                      {!(user.role === 'admin' && user.id === parseInt(session?.user?.id || '0')) && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900"
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

      {showForm && (
        <UserForm
          user={editingUser}
          onClose={() => {
            setShowForm(false);
            setEditingUser(undefined);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  );
}
