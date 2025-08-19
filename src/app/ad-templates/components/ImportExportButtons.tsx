'use client';

import type {ImportResult} from '@/lib/definitions';

interface ImportExportButtonsProps {
  onImport: () => void;
  onExport: () => void;
  onCreateClick: () => void;
  onImportCancel: () => void;
  onImportResultClose: () => void;
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
                                              onImportCancel,
                                              onImportResultClose,
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
              <div
                className="text-gray-600">&quot;サンプル広告&quot;,&quot;&lt;a href=&#123;&#123;linkUrl&#125;&#125;&gt;&lt;div&gt;&#123;&#123;title&#125;&#125;&lt;/div&gt;&lt;/a&gt;&quot;,&quot;title,linkUrl&quot;,&quot;サンプルの説明&quot;</div>
            </div>
            <div className="mt-3 text-xs text-blue-600">
              <strong>注意:</strong> placeholders列には、プレースホルダーをカンマで区切って記載してください
            </div>
          </div>

          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label htmlFor="csv-file" className="block text-sm font-medium text-gray-700 mb-2">
                CSVファイルを選択
              </label>
              <input
                id="csv-file"
                type="file"
                name="file"
                accept=".csv"
                required
                disabled={importLoading}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onImportCancel}
                disabled={importLoading}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={importLoading}
                className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
              >
                {importLoading ? 'インポート中...' : 'インポート実行'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* インポート結果（独立表示） */}
      {importResult && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📊</span>
              <h3 className="font-semibold text-lg">インポート結果</h3>
            </div>
            <button
              onClick={onImportResultClose}
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              aria-label="結果を閉じる"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg border">
              <div className="text-2xl font-bold text-gray-700">{importResult.total}</div>
              <div className="text-sm text-gray-500">処理総数</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-600">{importResult.success}</div>
              <div className="text-sm text-gray-500">成功</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
              <div className="text-sm text-gray-500">エラー</div>
            </div>
          </div>

          {/* 作成されたテンプレート一覧 */}
          {importResult.createdItems.length > 0 && (
            <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <span>✨</span>
                新規作成されたテンプレート ({importResult.createdItems.length}件)
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {importResult.createdItems.map((item) => (
                  <div key={item.id} className="text-sm text-green-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></span>
                    <span className="font-medium">#{item.id}</span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* エラー詳細 */}
          {importResult.errors.length > 0 && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <span>❌</span>
                エラー詳細 ({importResult.errors.length}件)
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {importResult.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700 flex items-start gap-2">
                    <span className="w-1 h-1 bg-red-500 rounded-full mt-2 flex-shrink-0"></span>
                    <span>{error}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
