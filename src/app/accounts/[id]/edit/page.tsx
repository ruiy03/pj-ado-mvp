import ProtectedPage from '@/components/ProtectedPage';
import {getUserById} from '@/lib/user-actions';
import UserEditForm from './UserEditForm';
import {notFound} from 'next/navigation';

export const dynamic = 'force-dynamic';

interface EditUserPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditUserPage({params}: EditUserPageProps) {
  const {id} = await params;
  const userId = parseInt(id);

  if (isNaN(userId)) {
    notFound();
  }

  try {
    const user = await getUserById(userId);

    if (!user) {
      notFound();
    }

    return (
      <ProtectedPage>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">ユーザーを編集</h1>
            <p className="text-gray-600 mt-2">
              {user.name} のアカウント情報を編集しています。
            </p>
          </div>
          <UserEditForm user={user}/>
        </div>
      </ProtectedPage>
    );
  } catch (_error) {
    // Failed to load user - handled by notFound()
    notFound();
  }
}
