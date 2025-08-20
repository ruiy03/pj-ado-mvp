'use client';

import { getSampleValue, sanitizeLinksForPreview, extractPlaceholders } from '@/lib/template-utils';
import type { CreateAdTemplateRequest } from '@/lib/definitions';

interface TemplatePreviewProps {
  formData: CreateAdTemplateRequest;
  previewMode: 'sample' | 'custom';
  customValues: Record<string, string>;
  previewSize: 'desktop' | 'mobile';
  setPreviewMode: (mode: 'sample' | 'custom') => void;
  setPreviewSize: (size: 'desktop' | 'mobile') => void;
  updateCustomValue: (placeholder: string, value: string) => void;
}

export default function TemplatePreview({
  formData,
  previewMode,
  customValues,
  previewSize,
  setPreviewMode,
  setPreviewSize,
  updateCustomValue,
}: TemplatePreviewProps) {
  const renderFormPreview = () => {
    if (!formData.html.trim()) {
      return (
        <div className="border border-gray-200 p-8 rounded-lg bg-gray-50 text-center text-gray-500">
          <div className="text-2xl mb-2">👁️</div>
          <p>HTMLコードを入力するとプレビューが表示されます</p>
        </div>
      );
    }

    let previewHtml = formData.html;

    // プレースホルダーを置換
    const placeholders = extractPlaceholders(formData.html);
    placeholders.forEach((placeholder: string) => {
      const regex = new RegExp(`{{${placeholder}}}`, 'g');
      const value = previewMode === 'custom' && customValues[placeholder]
        ? customValues[placeholder]
        : getSampleValue(placeholder);
      previewHtml = previewHtml.replace(regex, value);
    });

    // プレビュー用にリンクを安全化（href無効化 + nofollow追加）
    previewHtml = sanitizeLinksForPreview(previewHtml);

    const sizeClasses = {
      desktop: 'max-w-full',
      mobile: 'max-w-xs mx-auto'
    };

    try {
      return (
        <div
          className={`border border-gray-200 p-4 rounded-lg bg-white shadow-sm overflow-hidden ${sizeClasses[previewSize]}`}>
          <div
            dangerouslySetInnerHTML={{__html: previewHtml}}
            style={{
              minHeight: '120px',
              fontSize: '14px',
              lineHeight: '1.4'
            }}
          />
        </div>
      );
    } catch {
      return (
        <div className="border border-red-200 p-4 rounded-lg bg-red-50 text-red-700">
          <div className="text-xl mb-2">⚠️</div>
          <p className="font-medium">プレビューエラー</p>
          <p className="text-sm">HTMLコードに問題があります。正しい形式で入力してください。</p>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">プレビュー</h3>
          <div className="flex gap-2 text-sm">
            <div className="flex border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setPreviewMode('sample')}
                className={`px-3 py-1 transition-colors cursor-pointer ${
                  previewMode === 'sample' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                サンプル値
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('custom')}
                className={`px-3 py-1 transition-colors cursor-pointer ${
                  previewMode === 'custom' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                カスタム値
              </button>
            </div>
            <div className="flex border rounded-lg overflow-hidden">
              <button
                type="button"
                onClick={() => setPreviewSize('desktop')}
                className={`px-3 py-1 transition-colors cursor-pointer ${
                  previewSize === 'desktop' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                🖥️
              </button>
              <button
                type="button"
                onClick={() => setPreviewSize('mobile')}
                className={`px-3 py-1 transition-colors cursor-pointer ${
                  previewSize === 'mobile' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                📱
              </button>
            </div>
          </div>
        </div>

        {previewMode === 'custom' && extractPlaceholders(formData.html).length > 0 && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg flex-shrink-0">
            <h4 className="font-semibold mb-3">カスタム値を入力</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {extractPlaceholders(formData.html).map((placeholder: string) => (
                <div key={placeholder} className="space-y-1">
                  <label htmlFor={`custom-${placeholder}`} className="text-sm font-medium text-gray-700">
                    {placeholder}
                  </label>
                  <input
                    id={`custom-${placeholder}`}
                    type="text"
                    value={customValues[placeholder] || ''}
                    onChange={(e) => updateCustomValue(placeholder, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder={getSampleValue(placeholder)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 min-h-0">
          {renderFormPreview()}
        </div>
      </div>
    </div>
  );
}
