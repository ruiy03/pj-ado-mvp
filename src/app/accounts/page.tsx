import ProtectedPage from '@/components/ProtectedPage';

export default function Accounts() {
  return (
    <ProtectedPage>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">アカウント管理</h1>
        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors">
          新しいアカウントを追加
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-lg font-medium mb-2">アカウントがありません</h3>
            <p className="text-gray-400">ユーザーアカウントの管理を行います</p>
            <button
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded transition-colors">
              アカウントを追加
            </button>
          </div>
        </div>
      </div>
    </div>
    </ProtectedPage>
  );
}
