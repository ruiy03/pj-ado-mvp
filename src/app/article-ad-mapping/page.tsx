import ProtectedPage from '@/components/ProtectedPage';

// TODO: 記事と広告の紐付け管理機能の実装が必要
// - 記事一覧表示
// - 広告との紐付け作成・編集・削除
// - 紐付け状況の確認・管理
export default function ArticleAdMapping() {
  return (
    <ProtectedPage>
      <div>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">記事と広告の紐付け管理</h1>
            <button
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer">
              新しい紐付けを作成
            </button>
          </div>

          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🔗</div>
                <h3 className="text-lg font-medium mb-2">紐付けがありません</h3>
                <p className="text-gray-400">記事と広告の紐付け関係がここに表示されます</p>
                <button
                  className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors cursor-pointer">
                  最初の紐付けを作成
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedPage>
  );
}
