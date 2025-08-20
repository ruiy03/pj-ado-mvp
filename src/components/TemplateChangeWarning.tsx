'use client';

import { useState } from 'react';
import type { ConsistencyCheckResult } from '@/lib/consistency-checker';

interface TemplateChangeWarningProps {
  analysisResult: ConsistencyCheckResult;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TemplateChangeWarning({
  analysisResult,
  onConfirm,
  onCancel,
  isLoading = false,
}: TemplateChangeWarningProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return '不明';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'high':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-2 rounded-full ${getSeverityColor(analysisResult.severity)}`}>
              {getSeverityIcon(analysisResult.severity)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                テンプレート変更の影響確認
              </h2>
              <p className="text-sm text-gray-600">
                変更による影響を確認してください
              </p>
            </div>
          </div>

          {/* 重要度表示 */}
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${getSeverityColor(analysisResult.severity)}`}>
            影響度: {getSeverityLabel(analysisResult.severity)}
          </div>

          {/* 影響度判定基準 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 mb-2">影響度判定基準</h4>
            <div className="text-xs text-blue-800 space-y-1">
              <div><span className="font-medium text-red-600">高:</span> 影響を受ける広告コンテンツが5件超</div>
              <div><span className="font-medium text-yellow-600">中:</span> プレースホルダーの追加または削除（手動修正必要）</div>
              <div><span className="font-medium text-green-600">低:</span> HTML変更やタイトル変更など軽微な変更のみ</div>
            </div>
          </div>

          {/* 概要 */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">影響の概要</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">影響を受ける広告</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analysisResult.total_affected}件
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">プレースホルダー変更</p>
                  <div className="flex flex-col space-y-1 mt-1">
                    {analysisResult.placeholder_diff.added.length > 0 && (
                      <span className="text-xs text-green-600">
                        追加: {analysisResult.placeholder_diff.added.length}個
                      </span>
                    )}
                    {analysisResult.placeholder_diff.removed.length > 0 && (
                      <span className="text-xs text-red-600">
                        削除: {analysisResult.placeholder_diff.removed.length}個
                      </span>
                    )}
                    {analysisResult.placeholder_diff.added.length === 0 && 
                     analysisResult.placeholder_diff.removed.length === 0 ? (
                      <span className="text-xs text-gray-600">
                        変更なし
                      </span>
                    ) : analysisResult.placeholder_diff.unchanged.length > 0 && (
                      <span className="text-xs text-gray-600">
                        変更なし: {analysisResult.placeholder_diff.unchanged.length}個
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* プレースホルダー変更詳細 */}
          {(analysisResult.placeholder_diff.added.length > 0 || analysisResult.placeholder_diff.removed.length > 0) ? (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">プレースホルダーの変更</h3>
              <div className="space-y-3">
                {analysisResult.placeholder_diff.added.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-green-800 mb-2">
                      追加されるプレースホルダー ({analysisResult.placeholder_diff.added.length}個)
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.placeholder_diff.added.map((placeholder) => (
                        <span
                          key={placeholder}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                        >
                          {placeholder}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {analysisResult.placeholder_diff.removed.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      削除されるプレースホルダー ({analysisResult.placeholder_diff.removed.length}個)
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {analysisResult.placeholder_diff.removed.map((placeholder) => (
                        <span
                          key={placeholder}
                          className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
                        >
                          {placeholder}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            // プレースホルダー変更がない場合でもHTMLが変更されている場合の説明
            analysisResult.affected_contents.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">HTMLテンプレートの変更</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">
                    HTMLコードが変更されました
                  </h4>
                  <p className="text-sm text-blue-700">
                    プレースホルダーの変更はありませんが、HTMLコードの内容（スタイル、構造など）が変更されているため、
                    このテンプレートを使用している全ての広告コンテンツの表示が変わります。
                  </p>
                </div>
              </div>
            )
          )}

          {/* 影響を受ける広告一覧 */}
          {analysisResult.affected_contents.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900">
                  影響を受ける広告 ({analysisResult.affected_contents.length}件)
                </h3>
                <button
                  type="button"
                  onClick={() => setShowDetails(!showDetails)}
                  className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {showDetails ? '詳細を非表示' : '詳細を表示'}
                </button>
              </div>
              
              {showDetails && (
                <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    {analysisResult.affected_contents.map((content) => (
                      <div key={content.id} className="bg-white rounded border p-3">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">{content.name}</h4>
                          <span className={`px-2 py-1 text-xs rounded ${
                            content.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {content.status}
                          </span>
                        </div>
                        {/* プレースホルダー変更がある場合のみ詳細を表示 */}
                        {(analysisResult.placeholder_diff.added.length > 0 || analysisResult.placeholder_diff.removed.length > 0) && (
                          <>
                            {content.missing_placeholders.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs text-red-600 mb-1">不足するプレースホルダー:</p>
                                <div className="flex flex-wrap gap-1">
                                  {content.missing_placeholders.map((placeholder) => (
                                    <span key={placeholder} className="px-1 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                                      {placeholder}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {content.unused_placeholders.length > 0 && (
                              <div>
                                <p className="text-xs text-orange-600 mb-1">不要になるプレースホルダー:</p>
                                <div className="flex flex-wrap gap-1">
                                  {content.unused_placeholders.map((placeholder) => (
                                    <span key={placeholder} className="px-1 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                                      {placeholder}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        
                        {/* HTMLのみ変更の場合の説明 */}
                        {(analysisResult.placeholder_diff.added.length === 0 && analysisResult.placeholder_diff.removed.length === 0) && (
                          <div className="text-xs text-blue-600">
                            HTMLテンプレートの変更により、この広告の表示内容が変更されます。
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 注意事項 */}
          {analysisResult.severity === 'high' && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">重要な注意事項</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• 多数の広告に影響します</li>
                    <li>• 変更後、影響を受ける広告の手動修正が必要です</li>
                    <li>• アクティブな広告が含まれている場合、表示に問題が生じる可能性があります</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 cursor-pointer ${
                analysisResult.severity === 'high'
                  ? 'bg-red-600 hover:bg-red-700'
                  : analysisResult.severity === 'medium'
                  ? 'bg-yellow-600 hover:bg-yellow-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isLoading ? '更新中...' : '更新を実行'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
