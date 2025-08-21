'use client';

import {useState, useEffect} from 'react';
import {User} from '@/lib/definitions';
import {deleteUser, getUsers} from '@/lib/user-actions';
import {useSession} from 'next-auth/react';
import {useRouter} from 'next/navigation';
import UserList from './UserList';

interface AccountsClientProps {
  users: User[];
}

export default function AccountsClient({users: initialUsers}: AccountsClientProps) {
  const {data: session, status} = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  const loadUsers = async () => {
    setLoading(true);
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
      await loadUsers();
    } else {
      alert(result.message);
    }
  };

  const handleEdit = (user: User) => {
    router.push(`/accounts/${user.id}/edit`);
  };

  const handleAddUser = () => {
    router.push('/accounts/create');
  };

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">アカウント管理</h1>
          <p className="text-gray-600 mt-2">
            ユーザーアカウントの管理を行います。管理者権限が必要です。
          </p>
        </div>
        <button
          onClick={handleAddUser}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
        >
          新しいアカウントを追加
        </button>
      </div>
      <UserList
        users={users}
        loading={loading}
        currentUserId={parseInt(session.user.id || '0')}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddUser={handleAddUser}
      />
    </div>
  );
}
