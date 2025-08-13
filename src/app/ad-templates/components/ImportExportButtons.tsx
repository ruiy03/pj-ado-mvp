'use client';

interface ImportResult {
  success: number;
  errors: string[];
  total: number;
}

interface ImportExportButtonsProps {
  onImport: () => void;
  onExport: () => void;
  onCreateClick: () => void;
  exportLoading: boolean;
  showImportForm: boolean;
  importLoading: boolean;
  importResult: ImportResult | null;
  handleImport: (e: React.FormEvent) => void;
}

export default function ImportExportButtons({
  onImport,
  onExport,
  onCreateClick,
  exportLoading,
  showImportForm,
  importLoading,
  importResult,
  handleImport,
}: ImportExportButtonsProps) {
  return (
    <>
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">広告テンプレート管理</h1>
        <div className="flex gap-2">
          <button
            onClick={onImport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            CSVインポート
          </button>
          <button
            onClick={onExport}
            disabled={exportLoading}
            className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {exportLoading ? 'エクスポート中...' : 'CSVエクスポート'}
          </button>
          <button
            onClick={onCreateClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
          >
            新しいテンプレートを作成
          </button>
        </div>
      </div>

      {/* インポートフォーム */}
      {showImportForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">CSVファイルからインポート</h2>
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📋 CSVフォーマット</h3>
            <p className="text-sm text-blue-700 mb-3">
              以下の形式でCSVファイルを作成してください（1行目はヘッダー行です）
            </p>
            <div className="bg-white p-3 rounded border text-xs font-mono overflow-x-auto">
              <div>name,html,placeholders,description</div>
              <div className="text-gray-600">&quot;サンプル広告&quot;,&quot;&lt;div&gt;&#123;&#123;title&#125;&#125;&lt;/div&gt;&quot;,&quot;title,linkUrl&quot;,&quot;サンプルの説明&quot;</div>
            </div>
            <div className="mt-3 text-xs text-blue-600">
              <strong>注意:</strong> placeholders列には、プレースホルダーをカンマで区切って記載してください
            </div>
          </div>
          
          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CSVファイルを選択
              </label>
              <input
                type="file"
                name="file"
                accept=".csv"
                required
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={importLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {importLoading ? 'インポート中...' : 'インポート実行'}
              </button>
              <button
                type="button"
                onClick={() => window.location.href = '#'}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                キャンセル
              </button>
            </div>
          </form>

          {/* インポート結果 */}
          {importResult && (
            <div className="mt-6 p-4 rounded-lg border">
              <h3 className="font-semibold mb-2">インポート結果</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>処理総数:</span>
                  <span className="font-mono">{importResult.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>成功:</span>
                  <span className="font-mono text-green-600">{importResult.success}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>エラー:</span>
                  <span className="font-mono text-red-600">{importResult.errors.length}</span>
                </div>
              </div>
              
              {importResult.errors.length > 0 && (
                <div className="mt-4 p-3 bg-red-50 rounded-lg">
                  <h4 className="font-semibold text-red-800 mb-2">エラー詳細:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {importResult.errors.map((error, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1 h-1 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
