'use client';

import { useRef } from 'react';
import type { AdTemplate, CreateAdTemplateRequest } from '@/lib/definitions';
import { extractPlaceholders, validatePlaceholderNaming, addNofollowToLinks, removeNofollowFromLinks } from '@/lib/template-utils';
import HTMLCodeEditor, { HTMLCodeEditorRef } from '@/components/HTMLCodeEditor';
import ValidationGuide from './ValidationGuide';

interface TemplateFormProps {
  formData: CreateAdTemplateRequest;
  setFormData: (data: CreateAdTemplateRequest | ((prev: CreateAdTemplateRequest) => CreateAdTemplateRequest)) => void;
  validationErrors: string[];
  autoNofollow: boolean;
  setAutoNofollow: (value: boolean) => void;
  showNamingGuide: boolean;
  setShowNamingGuide: (show: boolean) => void;
  editingTemplate: AdTemplate | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  autoExtractPlaceholders: () => void;
}

export default function TemplateForm({
  formData,
  setFormData,
  validationErrors,
  autoNofollow,
  setAutoNofollow,
  showNamingGuide,
  setShowNamingGuide,
  editingTemplate,
  onSubmit,
  onCancel,
  autoExtractPlaceholders,
}: TemplateFormProps) {
  const htmlEditorRef = useRef<HTMLCodeEditorRef>(null);

  const addPlaceholder = () => {
    setFormData((prev: CreateAdTemplateRequest) => ({
      ...prev,
      placeholders: [...prev.placeholders, '']
    }));
  };

  const updatePlaceholder = (index: number, value: string) => {
    setFormData((prev: CreateAdTemplateRequest) => ({
      ...prev,
      placeholders: prev.placeholders.map((p: string, i: number) => i === index ? value : p)
    }));
  };

  const removePlaceholder = (index: number) => {
    setFormData((prev: CreateAdTemplateRequest) => ({
      ...prev,
      placeholders: prev.placeholders.filter((_: string, i: number) => i !== index)
    }));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">
        {editingTemplate ? 'テンプレートを編集' : '新しいテンプレートを作成'}
      </h2>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            テンプレート名
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData((prev: CreateAdTemplateRequest) => ({
              ...prev,
              name: e.target.value
            }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-3">
              <label className="block text-sm font-medium text-gray-700">
                HTMLコード
              </label>
              <button
                type="button"
                onClick={() => htmlEditorRef.current?.formatCode()}
                className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors cursor-pointer"
                title="HTMLコードをフォーマット (Shift+Alt+F)"
              >
                フォーマット
              </button>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={autoNofollow}
                  onChange={(e) => setAutoNofollow(e.target.checked)}
                  className="mr-2"
                />
                自動nofollow追加
              </label>
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, html: addNofollowToLinks(prev.html)}))}
                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded transition-colors cursor-pointer"
                  title="現在のHTMLコード内の全リンクにnofollowを追加"
                >
                  nofollow追加
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({...prev, html: removeNofollowFromLinks(prev.html)}))}
                  className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded transition-colors cursor-pointer"
                  title="現在のHTMLコード内の全リンクからnofollowを削除"
                >
                  nofollow削除
                </button>
              </div>
            </div>
          </div>
          <HTMLCodeEditor
            ref={htmlEditorRef}
            value={formData.html}
            onChange={(value) => setFormData((prev: CreateAdTemplateRequest) => ({
              ...prev,
              html: value
            }))}
            height={250}
            placeholder="HTMLコードを入力してください。プレースホルダーは {{placeholder}} の形式で記述してください。"
          />
          <div className="flex justify-between items-start mt-1">
            <p className="text-xs text-gray-500">
              例: &lt;div class=&quot;ad-banner&quot;&gt;&lt;h2&gt;&#123;&#123;title&#125;&#125;&lt;/h2&gt;&lt;a href=&quot;&#123;&#123;linkUrl&#125;&#125;&quot;&gt;&lt;img src=&quot;&#123;&#123;imageUrl&#125;&#125;&quot; /&gt;&lt;/a&gt;&lt;/div&gt;
            </p>
            {autoNofollow && (
              <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                💡 保存時に全リンクにrel=&quot;nofollow&quot;が自動追加されます
              </p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            プレースホルダー
          </label>

          {(validationErrors.length > 0 || (formData.html.trim() && extractPlaceholders(formData.html).length > 0 && formData.placeholders.length === 0)) && (
            <div className="mb-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-start">
                <div className="text-orange-600 mr-2">⚠️</div>
                <div>
                  {validationErrors.length > 0 ? (
                    <>
                      <p className="text-sm font-medium text-orange-800 mb-1">プレースホルダーの整合性に問題があります:</p>
                      <ul className="text-sm text-orange-700 space-y-1 mb-2">
                        {validationErrors.map((error, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1 h-1 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                            {error}
                          </li>
                        ))}
                      </ul>
                    </>
                  ) : (
                    <p className="text-sm font-medium text-orange-800 mb-2">
                      HTMLにプレースホルダーが見つかりましたが、リストが空です
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={autoExtractPlaceholders}
                    className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 px-2 py-1 rounded transition-colors cursor-pointer"
                  >
                    自動修正
                  </button>
                </div>
              </div>
            </div>
          )}

          <ValidationGuide 
            showNamingGuide={showNamingGuide} 
            setShowNamingGuide={setShowNamingGuide} 
          />

          <div className="space-y-2">
            {formData.placeholders.map((placeholder: string, index: number) => {
              const isValid = validatePlaceholderNaming(placeholder);
              return (
                <div key={index} className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={placeholder}
                      onChange={(e) => updatePlaceholder(index, e.target.value)}
                      placeholder="プレースホルダー名（例：title, imageUrl, linkUrl）"
                      className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        placeholder.trim() && !isValid
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-300'
                      }`}
                    />
                    {placeholder.trim() && !isValid && (
                      <p className="text-xs text-red-600 mt-1">
                        命名規則に違反しています。推奨キーワードを含めてください
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removePlaceholder(index)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 cursor-pointer"
                  >
                    削除
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={addPlaceholder}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 cursor-pointer"
            >
              プレースホルダーを追加
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            説明
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData((prev: CreateAdTemplateRequest) => ({
              ...prev,
              description: e.target.value
            }))}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="テンプレートの説明を入力してください"
          />
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors cursor-pointer"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={validationErrors.length > 0}
            className={`px-6 py-2 rounded-lg transition-colors ${
              validationErrors.length > 0
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
            }`}
          >
            {editingTemplate ? '更新' : '作成'}
          </button>
        </div>
      </form>
    </div>
  );
}
