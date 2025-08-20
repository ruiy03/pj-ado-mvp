'use client';

import {useState} from 'react';
import type {UrlTemplateConsistencyCheckResult} from '@/lib/consistency-checker';

interface UrlTemplateChangeWarningProps {
  analysisResult: UrlTemplateConsistencyCheckResult;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function UrlTemplateChangeWarning({
                                                   analysisResult,
                                                   onConfirm,
                                                   onCancel,
                                                   isLoading
                                                 }: UrlTemplateChangeWarningProps) {
  const [showDetails, setShowDetails] = useState(false);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
            <path fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"/>
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"/>
          </svg>
        );
      case 'low':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const parametersAdded = analysisResult.url_template_diff.new_parameters.filter(p =>
    !analysisResult.url_template_diff.old_parameters.includes(p)
  );
  const parametersRemoved = analysisResult.url_template_diff.old_parameters.filter(p =>
    !analysisResult.url_template_diff.new_parameters.includes(p)
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg border border-gray-200 shadow-lg">
        <div className="p-6">
          {/* ヘッダー */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${getSeverityColor(analysisResult.severity)}`}>
                {getSeverityIcon(analysisResult.severity)}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  URLテンプレート変更の影響確認
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  「{analysisResult.template_name}」の変更が既存の広告コンテンツに与える影響を確認してください。
                </p>
              </div>
            </div>
          </div>

          {/* 重要度表示 */}
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-4 ${getSeverityColor(analysisResult.severity)}`}>
            影響度: {getSeverityLabel(analysisResult.severity)}
          </div>

          {/* 影響度判定基準 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="text-sm font-medium text-blue-900 mb-2">影響度判定基準</h4>
            <div className="text-xs text-blue-800 space-y-1">
              <div><span className="font-medium text-red-600">高:</span> 影響を受ける広告コンテンツが5件超</div>
              <div><span className="font-medium text-yellow-600">中:</span> URLパラメータの追加または削除（手動修正必要）
              </div>
              <div><span className="font-medium text-green-600">低:</span> 名前・説明変更など軽微な変更のみ</div>
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
                  <p className="text-sm text-gray-600">URLパラメータ変更</p>
                  <div className="flex flex-col space-y-1 mt-1">
                    {parametersAdded.length > 0 && (
                      <span className="text-xs text-green-600">
                        追加: {parametersAdded.length}個
                      </span>
                    )}
                    {parametersRemoved.length > 0 && (
                      <span className="text-xs text-red-600">
                        削除: {parametersRemoved.length}個
                      </span>
                    )}
                    {parametersAdded.length === 0 && parametersRemoved.length === 0 ? (
                      <span className="text-xs text-gray-600">
                        変更なし
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* URLパラメータ変更詳細 */}
          {(parametersAdded.length > 0 || parametersRemoved.length > 0) && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">URLパラメータの変更</h3>
              <div className="space-y-3">
                {parametersAdded.length > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-green-800 mb-2">
                      追加されるパラメータ ({parametersAdded.length}個)
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {parametersAdded.map((parameter) => (
                        <span
                          key={parameter}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                        >
                          {parameter}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {parametersRemoved.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-red-800 mb-2">
                      削除されるパラメータ ({parametersRemoved.length}個)
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {parametersRemoved.map((parameter) => (
                        <span
                          key={parameter}
                          className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded"
                        >
                          {parameter}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
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

                        {/* URLパラメータ変更がある場合のみ詳細を表示 */}
                        {(parametersAdded.length > 0 || parametersRemoved.length > 0) && (
                          <>
                            {content.missing_placeholders.length > 0 && (
                              <div className="mb-2">
                                <p className="text-xs text-red-600 mb-1">不足するパラメータ:</p>
                                <div className="flex flex-wrap gap-1">
                                  {content.missing_placeholders.map((parameter) => (
                                    <span key={parameter}
                                          className="px-1 py-0.5 bg-red-100 text-red-700 text-xs rounded">
                                      {parameter}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            {content.unused_placeholders.length > 0 && (
                              <div>
                                <p className="text-xs text-orange-600 mb-1">不要になるパラメータ:</p>
                                <div className="flex flex-wrap gap-1">
                                  {content.unused_placeholders.map((parameter) => (
                                    <span key={parameter}
                                          className="px-1 py-0.5 bg-orange-100 text-orange-700 text-xs rounded">
                                      {parameter}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* パラメータ追加時の説明 */}
                        {(parametersAdded.length > 0 && content.missing_placeholders.length === 0 && content.unused_placeholders.length === 0) && (
                          <div className="text-xs text-green-600">
                            新しいパラメータが追加されましたが、この広告に修正は必要ありません。
                          </div>
                        )}
                        
                        {/* URLのみ変更の場合の説明 */}
                        {(parametersAdded.length === 0 && parametersRemoved.length === 0) && (
                          <div className="text-xs text-blue-600">
                            URLテンプレートの変更により、この広告の生成されるURLが変更されます。
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
                  <path fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"/>
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">重要な注意事項</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• 多数の広告に影響します</li>
                    <li>• 変更後、影響を受ける広告の手動修正が必要です</li>
                    <li>• アクティブな広告が含まれている場合、URLの生成に問題が生じる可能性があります</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {analysisResult.severity === 'medium' && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"/>
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">注意事項</h4>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• URLパラメータの変更により、影響を受ける広告の確認が必要です</li>
                    <li>• 新しいパラメータが追加された場合、対応するデータの設定が必要です</li>
                    <li>• 削除されたパラメータを使用していた広告は修正が必要です</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* アクションボタン */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 cursor-pointer ${
                analysisResult.severity === 'high'
                  ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                  : analysisResult.severity === 'medium'
                    ? 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
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
