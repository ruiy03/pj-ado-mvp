import ProtectedPage from '@/components/ProtectedPage';

export default function AdTemplates() {
  return (
    <ProtectedPage>
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">広告テンプレート管理</h1>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
          新しいテンプレートを作成
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">テンプレートがありません</h3>
            <p className="text-gray-400">広告テンプレートを作成して始めましょう</p>
            <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
              最初のテンプレートを作成
            </button>
          </div>
        </div>
      </div>
    </div>
    </ProtectedPage>
  );
}
