'use client';

import { useRef, useState, useEffect } from 'react';
import type { AdTemplate, CreateAdTemplateRequest } from '@/lib/definitions';
import { extractPlaceholders, validatePlaceholderNaming, addNofollowToLinks, removeNofollowFromLinks } from '@/lib/template-utils';
import HTMLCodeEditor, { HTMLCodeEditorRef } from '@/components/HTMLCodeEditor';
import ValidationGuide from './ValidationGuide';

interface TemplateFormProps {
  formData: CreateAdTemplateRequest;
  setFormData: (data: CreateAdTemplateRequest | ((prev: CreateAdTemplateRequest) => CreateAdTemplateRequest)) => void;
  autoNofollow: boolean;
  setAutoNofollow: (value: boolean) => void;
  showNamingGuide: boolean;
  setShowNamingGuide: (show: boolean) => void;
  editingTemplate: AdTemplate | null;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export default function TemplateForm({
  formData,
  setFormData,
  autoNofollow,
  setAutoNofollow,
  showNamingGuide,
  setShowNamingGuide,
  editingTemplate,
  onSubmit,
  onCancel,
}: TemplateFormProps) {
  const htmlEditorRef = useRef<HTMLCodeEditorRef>(null);
  const [extractedPlaceholders, setExtractedPlaceholders] = useState<string[]>([]);
  const [placeholderWarnings, setPlaceholderWarnings] = useState<string[]>([]);

  // リアルタイムでプレースホルダーを抽出
  useEffect(() => {
    if (formData.html.trim()) {
      const extracted = extractPlaceholders(formData.html);
      setExtractedPlaceholders(extracted);
      
      // 命名規則違反の警告を生成
      const warnings = extracted
        .filter(placeholder => !validatePlaceholderNaming(placeholder))
        .map(placeholder => `"${placeholder}" は命名規則に違反しています`);
      setPlaceholderWarnings(warnings);
    } else {
      setExtractedPlaceholders([]);
      setPlaceholderWarnings([]);
    }
  }, [formData.html]);


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

        {/* リアルタイムプレースホルダー表示 */}
        {extractedPlaceholders.length > 0 && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              検出されたプレースホルダー
            </label>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex flex-wrap gap-2 mb-2">
                {extractedPlaceholders.map((placeholder, index) => {
                  const isValid = validatePlaceholderNaming(placeholder);
                  const getPlaceholderStyle = (placeholder: string) => {
                    if (!isValid) return 'bg-orange-100 text-orange-800 border border-orange-200';
                    
                    switch (placeholder.toLowerCase()) {
                      case 'image': return 'bg-blue-100 text-blue-700';
                      case 'link': return 'bg-green-100 text-green-700';
                      case 'title': return 'bg-purple-100 text-purple-700';
                      case 'text': return 'bg-gray-100 text-gray-700';
                      case 'button': return 'bg-red-100 text-red-700';
                      case 'price': return 'bg-yellow-100 text-yellow-700';
                      case 'date': return 'bg-indigo-100 text-indigo-700';
                      case 'service': return 'bg-emerald-100 text-emerald-700';
                      case 'benefit': return 'bg-lime-100 text-lime-700';
                      case 'rating': return 'bg-amber-100 text-amber-700';
                      default: return 'bg-gray-100 text-gray-700';
                    }
                  };
                  
                  return (
                    <span 
                      key={index} 
                      className={`px-2 py-1 text-xs rounded font-mono ${getPlaceholderStyle(placeholder)}`}
                    >
                      {placeholder}
                      {!isValid && <span className="ml-1">⚠️</span>}
                    </span>
                  );
                })}
              </div>
              {placeholderWarnings.length > 0 && (
                <div className="text-xs text-orange-700">
                  <div className="font-medium mb-1">命名規則の警告:</div>
                  <ul className="space-y-1">
                    {placeholderWarnings.map((warning, index) => (
                      <li key={index} className="flex items-start">
                        <span className="w-1 h-1 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

          <ValidationGuide 
            showNamingGuide={showNamingGuide} 
            setShowNamingGuide={setShowNamingGuide} 
          />

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
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
          >
            {editingTemplate ? '更新' : '作成'}
          </button>
        </div>
      </form>
    </div>
  );
}
