import ProtectedPage from '@/components/ProtectedPage';
import {getUsers} from '@/lib/user-actions';
import AccountsClient from './components/AccountsClient';

export const dynamic = 'force-dynamic';

export default async function AccountsPage() {
  try {
    const users = await getUsers();

    return (
      <ProtectedPage>
        <div className="max-w-7xl mx-auto">
          <AccountsClient users={users}/>
        </div>
      </ProtectedPage>
    );
  } catch (error) {
    console.error('Failed to load users:', error);
    return (
      <ProtectedPage>
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">⚠️</div>
            <h3 className="text-lg font-medium mb-2">データの読み込みに失敗しました</h3>
            <p className="text-gray-500">しばらくしてから再度お試しください</p>
          </div>
        </div>
      </ProtectedPage>
    );
  }
}
