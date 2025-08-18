'use client';

import {useState, useEffect} from 'react';
import {User} from '@/lib/definitions';
import {deleteUser, getUsers} from '@/lib/user-actions';
import {useSession} from 'next-auth/react';
import {useRouter} from 'next/navigation';

import UserForm from './components/UserForm';
import UserList from './components/UserList';

export default function AccountsPage() {
  const {data: session, status} = useSession();
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

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleAddUser = () => {
    setEditingUser(undefined);
    setShowForm(true);
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
    <>
      <UserList
        users={users}
        loading={loading}
        currentUserId={parseInt(session.user.id || '0')}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAddUser={handleAddUser}
      />

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
    </>
  );
}
