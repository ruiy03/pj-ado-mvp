'use client';

import {useState, useEffect} from 'react';
import type {ReactNode} from 'react';
import type {AdTemplate} from '@/lib/definitions';
import {getSampleValue, extractPlaceholders} from '@/lib/template-utils';

interface AdPreviewProps {
  template: AdTemplate | null;
  contentData: Record<string, string | number | boolean>;
  className?: string;
  title?: string;
  showViewportToggle?: boolean;
}

type ViewportSize = 'desktop' | 'mobile';

interface ViewportConfig {
  name: string;
  width: string;
  icon: ReactNode;
}

const viewportConfigs: Record<ViewportSize, ViewportConfig> = {
  desktop: {
    name: 'デスクトップ',
    width: 'w-full',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
      </svg>
    ),
  },
  mobile: {
    name: 'モバイル',
    width: 'w-80',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z"/>
      </svg>
    ),
  },
};

export default function AdPreview({
                                    template,
                                    contentData,
                                    className = '',
                                    title = 'プレビュー',
                                    showViewportToggle = true,
                                  }: AdPreviewProps) {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // HTMLレンダリング処理
  useEffect(() => {
    if (!template) {
      setRenderedHtml('');
      setError(null);
      return;
    }

    try {
      let html = template.html;

      // HTMLから動的にプレースホルダーを抽出して置換
      const placeholders = extractPlaceholders(template.html);
      placeholders.forEach((placeholder) => {
        const regex = new RegExp(`\\{\\{\\s*${placeholder}\\s*\\}\\}`, 'g');
        const actualValue = contentData[placeholder];
        const hasActualValue = actualValue !== undefined && actualValue !== null && String(actualValue).trim() !== '';
        const value = hasActualValue ? String(actualValue) : getSampleValue(placeholder);
        html = html.replace(regex, value);
      });

      setRenderedHtml(html);
      setError(null);
    } catch (err) {
      console.error('HTML rendering error:', err);
      setError('プレビューの生成に失敗しました');
      setRenderedHtml('');
    }
  }, [template, contentData]);

  const getViewportWidth = () => {
    return viewportConfigs[viewport].width;
  };

  return (
    <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      {/* ヘッダー */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">{title}</h3>

          {showViewportToggle && (
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
              {Object.entries(viewportConfigs).map(([key, config]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setViewport(key as ViewportSize)}
                  className={`
                    flex items-center space-x-1 px-3 py-1 text-xs font-medium rounded transition-colors
                    ${viewport === key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                  }
                  `}
                  title={config.name}
                >
                  {config.icon}
                  <span className="hidden sm:inline">{config.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* プレビューエリア */}
      <div className="p-4 bg-gray-50 min-h-[300px]">
        <div className="flex justify-center">
          <div className={`transition-all duration-300 ${getViewportWidth()}`}>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {template ? (
                error ? (
                  <div className="p-8 text-center">
                    <div className="text-red-500 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                ) : renderedHtml ? (
                  <div>
                    <div
                      className="preview-content"
                      dangerouslySetInnerHTML={{__html: renderedHtml}}
                    />
                    {/* サンプルデータ使用時の注意書き */}
                    {(() => {
                      const placeholders = extractPlaceholders(template.html);
                      return placeholders.some(p => {
                        const value = contentData[p];
                        return !(value !== undefined && value !== null && String(value).trim() !== '');
                      });
                    })() && (
                      <div className="mt-3 px-3 py-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-700">
                        <div className="flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                  clipRule="evenodd"/>
                          </svg>
                          <span>未入力項目はサンプルデータで表示しています</span>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    <div className="mb-3">
                      <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor"
                           viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                      </svg>
                    </div>
                    <p className="text-sm">プレビューを読み込み中...</p>
                  </div>
                )
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <div className="mb-3">
                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor"
                         viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                  </div>
                  <p className="text-sm">テンプレートを選択してください</p>
                  <p className="text-xs text-gray-400 mt-1">選択したテンプレートのプレビューが表示されます</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* フッター情報 */}
      {template && (
        <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>テンプレート: {template.name}</span>
            <span>
              {extractPlaceholders(template.html).length} 個のプレースホルダー
            </span>
          </div>
        </div>
      )}

      <style jsx>{`
        .preview-content {
          all: initial;
          display: block;
          padding: 1rem;
        }

        .preview-content * {
          max-width: 100%;
          word-wrap: break-word;
        }

        .preview-content img {
          max-width: 100%;
          height: auto;
          display: block;
        }

        .preview-content a {
          pointer-events: none;
          text-decoration: underline;
          color: #3b82f6;
        }

        .preview-content table {
          width: 100%;
          border-collapse: collapse;
        }

        .preview-content td,
        .preview-content th {
          padding: 0.5rem;
          border: 1px solid #e5e7eb;
        }
      `}</style>
    </div>
  );
}
