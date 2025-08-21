import ProtectedPage from '@/components/ProtectedPage';
import UserCreateForm from './UserCreateForm';

export const dynamic = 'force-dynamic';

export default function CreateUserPage() {
  return (
    <ProtectedPage>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">新しいユーザーを作成</h1>
          <p className="text-gray-600 mt-2">
            新しいユーザーアカウントを作成します。管理者権限が必要です。
          </p>
        </div>
        <UserCreateForm/>
      </div>
    </ProtectedPage>
  );
}
