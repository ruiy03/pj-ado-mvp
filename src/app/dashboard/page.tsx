import ProtectedPage from '@/components/ProtectedPage';

export default function Dashboard() {
  return (
    <ProtectedPage>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">総広告数</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">広告テンプレート数</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">URLテンプレート数</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">広告なし記事数</h3>
            <p className="text-3xl font-bold text-orange-600">0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">最近の活動</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
              <span className="text-gray-600">システム初期化完了</span>
              <span className="text-sm text-gray-500">今日</span>
            </div>
            <div className="text-center py-8 text-gray-400">
              <p>活動履歴がここに表示されます</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
