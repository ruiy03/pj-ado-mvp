'use client';

import type {ImportResult} from '@/lib/definitions';
import Link from 'next/link';

interface ImportExportButtonsProps {
  title: string;
  itemType: string;
  csvFormat: {
    header: string;
    example: string;
    description: string;
  };
  onImport: () => void;
  onExport: () => void;
  onCreateClick?: () => void;
  createButtonText?: string;
  createButtonHref?: string;
  onImportCancel: () => void;
  onImportResultClose: () => void;
  exportLoading: boolean;
  showImportForm: boolean;
  importLoading: boolean;
  importResult: ImportResult | null;
  handleImport: (e: React.FormEvent) => void;
  showFormsInline?: boolean;
}

export default function ImportExportButtons({
                                              title,
                                              itemType,
                                              csvFormat,
                                              onImport,
                                              onExport,
                                              onCreateClick,
                                              createButtonText,
                                              createButtonHref,
                                              onImportCancel,
                                              onImportResultClose,
                                              exportLoading,
                                              showImportForm,
                                              importLoading,
                                              importResult,
                                              handleImport,
                                              showFormsInline = false,
                                            }: ImportExportButtonsProps) {
  // ボタン群のレンダリング部分
  const renderButtons = () => (
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
      {(createButtonHref || onCreateClick) && (
        createButtonHref ? (
          <Link
            href={createButtonHref}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {createButtonText || '新しいアイテムを作成'}
          </Link>
        ) : (
          <button
            onClick={onCreateClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {createButtonText || '新しいアイテムを作成'}
          </button>
        )
      )}
    </div>
  );

  return (
    <>
      {title ? (
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
          {renderButtons()}
        </div>
      ) : (
        renderButtons()
      )}

      {/* インポートフォーム - showFormsInlineがfalseの場合のみ表示 */}
      {!showFormsInline && showImportForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">CSVファイルからインポート</h2>
          <div className="mb-4 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">📋 CSVフォーマット</h3>
            <p className="text-sm text-blue-700 mb-3">
              以下の形式でCSVファイルを作成してください（1行目はヘッダー行です）
            </p>
            <div className="bg-white p-3 rounded border text-xs font-mono overflow-x-auto">
              <div>{csvFormat.header}</div>
              <div className="text-gray-600">{csvFormat.example}</div>
            </div>
            <div className="mt-3 text-xs text-blue-600">
              <strong>注意:</strong> {csvFormat.description}
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

      {/* インポート結果（独立表示） - showFormsInlineがfalseの場合のみ表示 */}
      {!showFormsInline && importResult && (
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-6 gap-2 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded-lg border">
              <div className="text-xl font-bold text-gray-700">{importResult.total}</div>
              <div className="text-xs text-gray-500">処理総数</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
              <div className="text-xl font-bold text-green-600">{importResult.success}</div>
              <div className="text-xs text-gray-500">成功</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xl font-bold text-blue-600">{importResult.createdItems.length}</div>
              <div className="text-xs text-gray-500">新規作成</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-xl font-bold text-yellow-600">{importResult.updatedItems.length}</div>
              <div className="text-xs text-gray-500">更新</div>
            </div>
            <div className="text-center p-2 bg-gray-100 rounded-lg border border-gray-300">
              <div className="text-xl font-bold text-gray-500">{importResult.skippedItems?.length || 0}</div>
              <div className="text-xs text-gray-500">スキップ</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
              <div className="text-xl font-bold text-red-600">{importResult.errors.length}</div>
              <div className="text-xs text-gray-500">エラー</div>
            </div>
          </div>

          {/* 作成されたテンプレート一覧 */}
          {importResult.createdItems.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <span>✨</span>
                新規作成された{itemType} ({importResult.createdItems.length}件)
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {importResult.createdItems.map((item) => (
                  <div key={item.id} className="text-sm text-blue-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                    <span className="font-medium">#{item.id}</span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 更新されたテンプレート一覧 */}
          {importResult.updatedItems?.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <span>🔄</span>
                更新された{itemType} ({importResult.updatedItems.length}件)
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {importResult.updatedItems.map((item) => (
                  <div key={item.id} className="text-sm text-yellow-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></span>
                    <span className="font-medium">#{item.id}</span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* スキップされたテンプレート一覧 */}
          {importResult.skippedItems?.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-600 mb-2 flex items-center gap-2">
                <span>⏭️</span>
                スキップされた{itemType} ({importResult.skippedItems.length}件)
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {importResult.skippedItems.map((item) => (
                  <div key={item.id} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></span>
                    <span className="font-medium">#{item.id}</span>
                    <span>{item.name}</span>
                    <span className="text-xs text-gray-500">(内容が同一のため)</span>
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
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {importResult.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700 p-2 bg-red-100 rounded border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-red-200 text-red-800 rounded text-xs font-medium">
                        行 {typeof error === 'object' ? error.row : 'N/A'}
                      </span>
                      {typeof error === 'object' && error.name && (
                        <span className="text-xs text-red-600 font-medium">
                          &quot;{error.name}&quot;
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-red-800">
                      {typeof error === 'object' ? error.message : error}
                    </div>
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

// フォームとインポート結果を独立してレンダリングするためのヘルパーコンポーネント
export function ImportFormSection({
                                    itemType,
                                    csvFormat,
                                    showImportForm,
                                    importLoading,
                                    importResult,
                                    handleImport,
                                    onImportCancel,
                                    onImportResultClose,
                                  }: {
  itemType: string;
  csvFormat: {
    header: string;
    example: string;
    description: string;
  };
  showImportForm: boolean;
  importLoading: boolean;
  importResult: ImportResult | null;
  handleImport: (e: React.FormEvent) => void;
  onImportCancel: () => void;
  onImportResultClose: () => void;
}) {
  return (
    <>
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
              <div>{csvFormat.header}</div>
              <div className="text-gray-600">{csvFormat.example}</div>
            </div>
            <div className="mt-3 text-xs text-blue-600">
              <strong>注意:</strong> {csvFormat.description}
            </div>
          </div>

          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label htmlFor="csv-file-inline" className="block text-sm font-medium text-gray-700 mb-2">
                CSVファイルを選択
              </label>
              <input
                id="csv-file-inline"
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

      {/* インポート結果 */}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-6 gap-2 mb-4">
            <div className="text-center p-2 bg-gray-50 rounded-lg border">
              <div className="text-xl font-bold text-gray-700">{importResult.total}</div>
              <div className="text-xs text-gray-500">処理総数</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
              <div className="text-xl font-bold text-green-600">{importResult.success}</div>
              <div className="text-xs text-gray-500">成功</div>
            </div>
            <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-xl font-bold text-blue-600">{importResult.createdItems.length}</div>
              <div className="text-xs text-gray-500">新規作成</div>
            </div>
            <div className="text-center p-2 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="text-xl font-bold text-yellow-600">{importResult.updatedItems.length}</div>
              <div className="text-xs text-gray-500">更新</div>
            </div>
            <div className="text-center p-2 bg-gray-100 rounded-lg border border-gray-300">
              <div className="text-xl font-bold text-gray-500">{importResult.skippedItems?.length || 0}</div>
              <div className="text-xs text-gray-500">スキップ</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded-lg border border-red-200">
              <div className="text-xl font-bold text-red-600">{importResult.errors.length}</div>
              <div className="text-xs text-gray-500">エラー</div>
            </div>
          </div>

          {/* 作成されたテンプレート一覧 */}
          {importResult.createdItems.length > 0 && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <span>✨</span>
                新規作成された{itemType} ({importResult.createdItems.length}件)
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {importResult.createdItems.map((item) => (
                  <div key={item.id} className="text-sm text-blue-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></span>
                    <span className="font-medium">#{item.id}</span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 更新されたテンプレート一覧 */}
          {importResult.updatedItems?.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                <span>🔄</span>
                更新された{itemType} ({importResult.updatedItems.length}件)
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {importResult.updatedItems.map((item) => (
                  <div key={item.id} className="text-sm text-yellow-700 flex items-center gap-2">
                    <span className="w-2 h-2 bg-yellow-400 rounded-full flex-shrink-0"></span>
                    <span className="font-medium">#{item.id}</span>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* スキップされたテンプレート一覧 */}
          {importResult.skippedItems?.length > 0 && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-600 mb-2 flex items-center gap-2">
                <span>⏭️</span>
                スキップされた{itemType} ({importResult.skippedItems.length}件)
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {importResult.skippedItems.map((item) => (
                  <div key={item.id} className="text-sm text-gray-600 flex items-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></span>
                    <span className="font-medium">#{item.id}</span>
                    <span>{item.name}</span>
                    <span className="text-xs text-gray-500">(内容が同一のため)</span>
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
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {importResult.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-700 p-2 bg-red-100 rounded border border-red-200">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-red-200 text-red-800 rounded text-xs font-medium">
                        行 {typeof error === 'object' ? error.row : 'N/A'}
                      </span>
                      {typeof error === 'object' && error.name && (
                        <span className="text-xs text-red-600 font-medium">
                          &quot;{error.name}&quot;
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-red-800">
                      {typeof error === 'object' ? error.message : error}
                    </div>
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
