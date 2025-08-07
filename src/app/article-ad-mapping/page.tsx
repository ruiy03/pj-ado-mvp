export default function ArticleAdMapping() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">記事と広告の紐付け管理</h1>
        <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors">
          新しい紐付けを作成
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">🔗</div>
            <h3 className="text-lg font-medium mb-2">紐付けがありません</h3>
            <p className="text-gray-400">記事と広告の紐付け関係がここに表示されます</p>
            <button className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors">
              最初の紐付けを作成
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
