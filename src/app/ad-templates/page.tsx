'use client';

import {useState, useEffect, useCallback, useRef} from 'react';
import type {AdTemplate, CreateAdTemplateRequest} from '@/lib/definitions';
import {
  extractPlaceholders,
  validatePlaceholders,
  validatePlaceholderNaming,
  getSampleValue,
  sanitizeLinksForPreview,
  addNofollowToLinks,
  removeNofollowFromLinks
} from '@/lib/template-utils';
import HTMLCodeEditor, {HTMLCodeEditorRef} from '@/components/HTMLCodeEditor';

interface ImportResult {
  success: number;
  errors: string[];
  total: number;
}


export default function AdTemplates() {
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AdTemplate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showImportForm, setShowImportForm] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [showNamingGuide, setShowNamingGuide] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState<'sample' | 'custom'>('sample');
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [previewSize, setPreviewSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [autoNofollow, setAutoNofollow] = useState(true);
  const htmlEditorRef = useRef<HTMLCodeEditorRef>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CreateAdTemplateRequest>({
    name: '',
    html: '',
    placeholders: [],
    description: '',
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('テンプレートの取得に失敗しました');
      }
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // バリデーションエラーがある場合は送信をブロック
    if (validationErrors.length > 0) {
      setError('プレースホルダーの問題を修正してから保存してください');
      return;
    }

    try {
      const url = editingTemplate ? `/api/templates/${editingTemplate.id}` : '/api/templates';
      const method = editingTemplate ? 'PUT' : 'POST';

      // 保存時にautoNofollowが有効な場合はHTMLにnofollowを自動追加
      const htmlToSave = autoNofollow ? addNofollowToLinks(formData.html) : formData.html;

      const dataToSave = {
        ...formData,
        html: htmlToSave
      };

      const response = await fetch(url, {
        method,
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(dataToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'テンプレートの保存に失敗しました');
      }

      await fetchTemplates();
      setShowCreateForm(false);
      setEditingTemplate(null);
      resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('このテンプレートを削除しますか？')) return;

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'テンプレートの削除に失敗しました');
      }

      await fetchTemplates();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    }
  };

  const handleEdit = (template: AdTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      html: template.html,
      placeholders: template.placeholders,
      description: template.description || '',
    });
    setShowCreateForm(true);
    setShowImportForm(false);
    setImportResult(null);

    // 編集フォームにスクロール
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({behavior: 'smooth', block: 'start'});
      } else {
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
    }, 100);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      html: '',
      placeholders: [],
      description: '',
    });
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingTemplate(null);
    resetForm();
  };

  const handleImportClick = () => {
    setShowCreateForm(false);
    setEditingTemplate(null);
    resetForm();
    setShowImportForm(true);
  };

  const handleCreateClick = () => {
    setShowCreateForm(true);
    setShowImportForm(false);
    setImportResult(null);

    // 作成フォームにスクロール
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({behavior: 'smooth', block: 'start'});
      } else {
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
    }, 100);
  };

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

  const autoExtractPlaceholders = () => {
    if (!formData.html.trim()) {
      setError('HTMLコードを入力してください');
      return;
    }

    const extracted = extractPlaceholders(formData.html);
    setFormData((prev: CreateAdTemplateRequest) => ({
      ...prev,
      placeholders: extracted
    }));

    if (extracted.length === 0) {
      setError('プレースホルダーが見つかりませんでした。{{placeholder}}の形式で記述してください。');
    } else {
      setError(null);
    }
  };

  const validateCurrentPlaceholders = useCallback(() => {
    if (!formData.html.trim()) {
      setValidationErrors([]);
      return;
    }

    const errors = validatePlaceholders(formData.html, formData.placeholders);
    setValidationErrors(errors);
  }, [formData.html, formData.placeholders]);

  useEffect(() => {
    validateCurrentPlaceholders();
  }, [formData.html, formData.placeholders, validateCurrentPlaceholders]);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      setImportLoading(true);
      setError(null);

      const response = await fetch('/api/templates/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'インポートに失敗しました');
      }

      setImportResult(result);
      await fetchTemplates();

      if (result.errors.length === 0) {
        setShowImportForm(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setImportLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      setError(null);
      const response = await fetch('/api/templates/export');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'エクスポートに失敗しました');
      }

      // CSV ファイルをダウンロード
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      // ファイル名を Content-Disposition ヘッダーから取得、またはデフォルト値を使用
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'ad-templates.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エクスポートでエラーが発生しました');
    } finally {
      setExportLoading(false);
    }
  };


  const renderTemplate = (template: AdTemplate) => {
    let previewHtml = template.html;

    template.placeholders.forEach((placeholder: string) => {
      const regex = new RegExp(`{{${placeholder}}}`, 'g');
      const sampleValue = getSampleValue(placeholder);
      previewHtml = previewHtml.replace(regex, sampleValue);
    });

    return (
      <div
        dangerouslySetInnerHTML={{__html: previewHtml}}
        className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm max-w-full overflow-hidden"
        style={{
          minHeight: '120px',
          fontSize: '14px',
          lineHeight: '1.4'
        }}
      />
    );
  };

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
    formData.placeholders.forEach((placeholder: string) => {
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
      tablet: 'max-w-md mx-auto',
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

  const updateCustomValue = (placeholder: string, value: string) => {
    setCustomValues(prev => ({
      ...prev,
      [placeholder]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-500 hover:text-red-700 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">広告テンプレート管理</h1>
          <div className="flex gap-2">
            <button
              onClick={handleImportClick}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              CSVインポート
            </button>
            <button
              onClick={handleExport}
              disabled={exportLoading}
              className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
            >
              {exportLoading ? 'エクスポート中...' : 'CSVエクスポート'}
            </button>
            <button
              onClick={handleCreateClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
            >
              新しいテンプレートを作成
            </button>
          </div>
        </div>

        {showCreateForm && (
          <div ref={formRef} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingTemplate ? 'テンプレートを編集' : '新しいテンプレートを作成'}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-4">
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
                        例: &lt;div
                        class=&quot;ad-banner&quot;&gt;&lt;h2&gt;&#123;&#123;title&#125;&#125;&lt;/h2&gt;&lt;img
                        src=&quot;&#123;&#123;imageUrl&#125;&#125;&quot; /&gt;&lt;/div&gt;
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
                                <p
                                  className="text-sm font-medium text-orange-800 mb-1">プレースホルダーの整合性に問題があります:</p>
                                <ul className="text-sm text-orange-700 space-y-1 mb-2">
                                  {validationErrors.map((error, index) => (
                                    <li key={index} className="flex items-start">
                                      <span
                                        className="w-1 h-1 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
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

                    {/* 命名規則ガイド */}
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="text-sm font-semibold text-blue-900 mb-3">プレースホルダー命名規則</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 text-xs">
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="font-medium text-blue-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            画像
                          </div>
                          <div className="space-y-1">
                            <span
                              className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1 mb-1">Image</span>
                            <span
                              className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1 mb-1">Img</span>
                            <span
                              className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1 mb-1">Picture</span>
                            <span
                              className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1 mb-1">Photo</span>
                            <span
                              className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1 mb-1">Banner</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="font-medium text-blue-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            URL
                          </div>
                          <div className="space-y-1">
                            <span
                              className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-1 mb-1">Url</span>
                            <span
                              className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-1 mb-1">Link</span>
                            <span
                              className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-1 mb-1">Href</span>
                            <span
                              className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-1 mb-1">Path</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="font-medium text-blue-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                            タイトル
                          </div>
                          <div className="space-y-1">
                            <span
                              className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mr-1 mb-1">Title</span>
                            <span
                              className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mr-1 mb-1">Headline</span>
                            <span
                              className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mr-1 mb-1">Header</span>
                            <span
                              className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mr-1 mb-1">Subject</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="font-medium text-blue-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                            説明文
                          </div>
                          <div className="space-y-1">
                            <span
                              className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1">Description</span>
                            <span
                              className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1">Text</span>
                            <span
                              className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1">Content</span>
                            <span
                              className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1">Body</span>
                            <span
                              className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1">Message</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="font-medium text-blue-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                            価格
                          </div>
                          <div className="space-y-1">
                            <span
                              className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs mr-1 mb-1">Price</span>
                            <span
                              className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs mr-1 mb-1">Cost</span>
                            <span
                              className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs mr-1 mb-1">Fee</span>
                            <span
                              className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs mr-1 mb-1">Amount</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="font-medium text-blue-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            ボタン
                          </div>
                          <div className="space-y-1">
                            <span
                              className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs mr-1 mb-1">Button</span>
                            <span
                              className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs mr-1 mb-1">Cta</span>
                            <span
                              className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs mr-1 mb-1">Action</span>
                            <span
                              className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs mr-1 mb-1">Label</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="font-medium text-blue-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                            日付
                          </div>
                          <div className="space-y-1">
                            <span
                              className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs mr-1 mb-1">Date</span>
                            <span
                              className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs mr-1 mb-1">Time</span>
                            <span
                              className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs mr-1 mb-1">Period</span>
                            <span
                              className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs mr-1 mb-1">Duration</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="font-medium text-blue-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                            名前
                          </div>
                          <div className="space-y-1">
                            <span
                              className="inline-block bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs mr-1 mb-1">Name</span>
                            <span
                              className="inline-block bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs mr-1 mb-1">Author</span>
                            <span
                              className="inline-block bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs mr-1 mb-1">Company</span>
                            <span
                              className="inline-block bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs mr-1 mb-1">Brand</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="font-medium text-blue-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                            アイコン
                          </div>
                          <div className="space-y-1">
                            <span
                              className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs mr-1 mb-1">Icon</span>
                            <span
                              className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs mr-1 mb-1">Symbol</span>
                            <span
                              className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs mr-1 mb-1">Mark</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="font-medium text-blue-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                            サービス
                          </div>
                          <div className="space-y-1">
                            <span
                              className="inline-block bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs mr-1 mb-1">Service</span>
                            <span
                              className="inline-block bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs mr-1 mb-1">Tool</span>
                            <span
                              className="inline-block bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs mr-1 mb-1">Platform</span>
                            <span
                              className="inline-block bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs mr-1 mb-1">App</span>
                            <span
                              className="inline-block bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs mr-1 mb-1">System</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="font-medium text-blue-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                            職業・キャリア
                          </div>
                          <div className="space-y-1">
                            <span
                              className="inline-block bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs mr-1 mb-1">Job</span>
                            <span
                              className="inline-block bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs mr-1 mb-1">Position</span>
                            <span
                              className="inline-block bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs mr-1 mb-1">Career</span>
                            <span
                              className="inline-block bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs mr-1 mb-1">Work</span>
                            <span
                              className="inline-block bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs mr-1 mb-1">Role</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="font-medium text-blue-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                            業界・分野
                          </div>
                          <div className="space-y-1">
                            <span
                              className="inline-block bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs mr-1 mb-1">Industry</span>
                            <span
                              className="inline-block bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs mr-1 mb-1">Field</span>
                            <span
                              className="inline-block bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs mr-1 mb-1">Sector</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="font-medium text-blue-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-lime-500 rounded-full mr-2"></span>
                            特典・メリット
                          </div>
                          <div className="space-y-1">
                            <span
                              className="inline-block bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs mr-1 mb-1">Benefit</span>
                            <span
                              className="inline-block bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs mr-1 mb-1">Feature</span>
                            <span
                              className="inline-block bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs mr-1 mb-1">Advantage</span>
                            <span
                              className="inline-block bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs mr-1 mb-1">Offer</span>
                            <span
                              className="inline-block bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs mr-1 mb-1">Merit</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="font-medium text-blue-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                            評価・実績
                          </div>
                          <div className="space-y-1">
                            <span
                              className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs mr-1 mb-1">Rating</span>
                            <span
                              className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs mr-1 mb-1">Review</span>
                            <span
                              className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs mr-1 mb-1">Score</span>
                            <span
                              className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs mr-1 mb-1">Result</span>
                            <span
                              className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs mr-1 mb-1">Achievement</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="font-medium text-blue-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-rose-500 rounded-full mr-2"></span>
                            ロゴ・パートナー
                          </div>
                          <div className="space-y-1">
                            <span
                              className="inline-block bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs mr-1 mb-1">Logo</span>
                            <span
                              className="inline-block bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs mr-1 mb-1">Sponsor</span>
                            <span
                              className="inline-block bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs mr-1 mb-1">Partner</span>
                          </div>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-100">
                          <div className="font-medium text-blue-800 mb-2 flex items-center">
                            <span className="w-2 h-2 bg-violet-500 rounded-full mr-2"></span>
                            カテゴリ・タグ
                          </div>
                          <div className="space-y-1">
                            <span
                              className="inline-block bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs mr-1 mb-1">Category</span>
                            <span
                              className="inline-block bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs mr-1 mb-1">Tag</span>
                            <span
                              className="inline-block bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs mr-1 mb-1">Type</span>
                            <span
                              className="inline-block bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs mr-1 mb-1">Kind</span>
                            <span
                              className="inline-block bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs mr-1 mb-1">Genre</span>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-blue-700">
                            <span className="font-medium">💡 ヒント:</span>
                            これらのキーワードを含む名前を使用すると、プレビューで適切なサンプルデータが自動表示されます
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowNamingGuide(!showNamingGuide)}
                            className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                          >
                            {showNamingGuide ? '詳細を非表示' : 'サンプル例を表示'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* 詳細なサンプル例 */}
                    {showNamingGuide && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-semibold text-gray-800 mb-3">プレースホルダー例とサンプル出力</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs border-collapse min-w-[600px]">
                            <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left py-2 px-3 font-medium text-gray-700 bg-gray-100">カテゴリ</th>
                              <th
                                className="text-left py-2 px-3 font-medium text-gray-700 bg-gray-100">プレースホルダー例
                              </th>
                              <th className="text-left py-2 px-3 font-medium text-gray-700 bg-gray-100">サンプル出力
                              </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white">
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 align-top">
                              <span className="inline-flex items-center">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                                <span className="font-medium text-blue-800">画像</span>
                              </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="space-y-1">
                                  <span
                                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1">productImage</span>
                                  <span
                                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1">bannerPhoto</span>
                                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">mainPicture</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-gray-600">https://picsum.photos/300/200</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 align-top">
                              <span className="inline-flex items-center">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                                <span className="font-medium text-green-800">URL</span>
                              </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="space-y-1">
                                  <span
                                    className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-1">productUrl</span>
                                  <span
                                    className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-1">linkHref</span>
                                  <span
                                    className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">actionPath</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-gray-600">#</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 align-top">
                              <span className="inline-flex items-center">
                                <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                                <span className="font-medium text-purple-800">タイトル</span>
                              </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="space-y-1">
                                  <span
                                    className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mr-1">productTitle</span>
                                  <span
                                    className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mr-1">mainHeadline</span>
                                  <span
                                    className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">pageHeader</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-gray-600">サンプルタイトル</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 align-top">
                              <span className="inline-flex items-center">
                                <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                                <span className="font-medium text-gray-800">説明文</span>
                              </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="space-y-1">
                                  <span
                                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1">productDescription</span>
                                  <span
                                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1">bodyContent</span>
                                  <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">textMessage</span>
                                </div>
                              </td>
                              <td
                                className="py-2 px-3 text-gray-600">サンプル説明文です。ここに実際のコンテンツが表示されます。
                              </td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 align-top">
                              <span className="inline-flex items-center">
                                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                                <span className="font-medium text-yellow-800">価格</span>
                              </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="space-y-1">
                                  <span
                                    className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs mr-1">salePrice</span>
                                  <span
                                    className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs mr-1">serviceCost</span>
                                  <span
                                    className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">totalAmount</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-gray-600">無料</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 align-top">
                              <span className="inline-flex items-center">
                                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                                <span className="font-medium text-red-800">ボタン</span>
                              </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="space-y-1">
                                  <span
                                    className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs mr-1">ctaButton</span>
                                  <span
                                    className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs mr-1">submitAction</span>
                                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">buttonLabel</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-gray-600">今すぐ登録</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 align-top">
                              <span className="inline-flex items-center">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                                <span className="font-medium text-indigo-800">日付</span>
                              </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="space-y-1">
                                  <span
                                    className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs mr-1">eventDate</span>
                                  <span
                                    className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs mr-1">deadlineTime</span>
                                  <span
                                    className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">campaignPeriod</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-gray-600">2025年12月31日</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 align-top">
                              <span className="inline-flex items-center">
                                <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                                <span className="font-medium text-pink-800">名前</span>
                              </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="space-y-1">
                                  <span
                                    className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs mr-1">authorName</span>
                                  <span
                                    className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs mr-1">companyName</span>
                                  <span
                                    className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs">brandName</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-gray-600">サンプル名</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 align-top">
                              <span className="inline-flex items-center">
                                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                                <span className="font-medium text-orange-800">アイコン</span>
                              </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="space-y-1">
                                  <span
                                    className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs mr-1">iconSymbol</span>
                                  <span
                                    className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs mr-1">markIcon</span>
                                  <span
                                    className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">visualSymbol</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-gray-600">🚀</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 align-top">
                              <span className="inline-flex items-center">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                                <span className="font-medium text-emerald-800">サービス</span>
                              </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="space-y-1">
                                  <span
                                    className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs mr-1">serviceTitle</span>
                                  <span
                                    className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs mr-1">toolName</span>
                                  <span
                                    className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs">platformName</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-gray-600">就活支援サービス</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 align-top">
                              <span className="inline-flex items-center">
                                <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                                <span className="font-medium text-cyan-800">職業・キャリア</span>
                              </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="space-y-1">
                                  <span
                                    className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs mr-1">jobTitle</span>
                                  <span
                                    className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs mr-1">positionName</span>
                                  <span
                                    className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs">careerPath</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-gray-600">新卒採用</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 align-top">
                              <span className="inline-flex items-center">
                                <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                                <span className="font-medium text-teal-800">業界・分野</span>
                              </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="space-y-1">
                                  <span
                                    className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs mr-1">industryName</span>
                                  <span
                                    className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs mr-1">fieldType</span>
                                  <span
                                    className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs">sectorName</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-gray-600">IT・Web業界</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 align-top">
                              <span className="inline-flex items-center">
                                <span className="w-2 h-2 bg-lime-500 rounded-full mr-2"></span>
                                <span className="font-medium text-lime-800">特典・メリット</span>
                              </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="space-y-1">
                                  <span
                                    className="bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs mr-1">benefitText</span>
                                  <span
                                    className="bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs mr-1">featureList</span>
                                  <span
                                    className="bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs">offerDetail</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-gray-600">内定獲得率95%</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 align-top">
                              <span className="inline-flex items-center">
                                <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                                <span className="font-medium text-amber-800">評価・実績</span>
                              </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="space-y-1">
                                  <span
                                    className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs mr-1">userRating</span>
                                  <span
                                    className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs mr-1">reviewScore</span>
                                  <span
                                    className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs">resultData</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-gray-600">★★★★★ 4.8</td>
                            </tr>
                            <tr className="border-b border-gray-100">
                              <td className="py-2 px-3 align-top">
                              <span className="inline-flex items-center">
                                <span className="w-2 h-2 bg-rose-500 rounded-full mr-2"></span>
                                <span className="font-medium text-rose-800">ロゴ・パートナー</span>
                              </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="space-y-1">
                                  <span
                                    className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs mr-1">companyLogo</span>
                                  <span
                                    className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs mr-1">sponsorName</span>
                                  <span
                                    className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs">partnerLogo</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-gray-600">PORTキャリア</td>
                            </tr>
                            <tr>
                              <td className="py-2 px-3 align-top">
                              <span className="inline-flex items-center">
                                <span className="w-2 h-2 bg-violet-500 rounded-full mr-2"></span>
                                <span className="font-medium text-violet-800">カテゴリ・タグ</span>
                              </span>
                              </td>
                              <td className="py-2 px-3">
                                <div className="space-y-1">
                                  <span
                                    className="bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs mr-1">categoryName</span>
                                  <span
                                    className="bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs mr-1">tagList</span>
                                  <span
                                    className="bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs">contentType</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-gray-600">就活ツール</td>
                            </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

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
                                placeholder="プレースホルダー名（例：title, imageUrl）"
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
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors cursor-pointer"
                    >
                      キャンセル
                    </button>
                  </div>
                </form>
              </div>

              {/* プレビューエリア */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">プレビュー</h3>
                  <div className="flex gap-2">
                    <select
                      value={previewSize}
                      onChange={(e) => setPreviewSize(e.target.value as 'desktop' | 'tablet' | 'mobile')}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="desktop">デスクトップ</option>
                      <option value="tablet">タブレット</option>
                      <option value="mobile">モバイル</option>
                    </select>
                    <select
                      value={previewMode}
                      onChange={(e) => setPreviewMode(e.target.value as 'sample' | 'custom')}
                      className="text-sm border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="sample">サンプルデータ</option>
                      <option value="custom">カスタムデータ</option>
                    </select>
                  </div>
                </div>

                {previewMode === 'custom' && formData.placeholders.length > 0 && (
                  <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700">カスタムデータ入力</h4>
                    {formData.placeholders.map((placeholder: string) => (
                      <div key={placeholder}>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {placeholder}
                        </label>
                        <input
                          type="text"
                          value={customValues[placeholder] || ''}
                          onChange={(e) => updateCustomValue(placeholder, e.target.value)}
                          placeholder={getSampleValue(placeholder)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="sticky top-4">
                  {renderFormPreview()}
                </div>
              </div>
            </div>
          </div>
        )}

        {showImportForm && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold mb-4">CSVインポート</h2>

            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">CSVフォーマット</h3>
              <p className="text-sm text-blue-700 mb-2">以下の形式でCSVファイルを作成してください：</p>
              <code className="text-xs bg-white p-2 rounded block">
                name,html,placeholders,description<br/>
                &quot;バナー基本&quot;,&quot;&lt;div&gt;&#123;&#123;title&#125;&#125;&lt;/div&gt;&quot;,&quot;title,imageUrl,linkUrl&quot;,&quot;基本的なバナーテンプレート&quot;
              </code>
            </div>

            {importResult && (
              <div
                className={`mb-4 p-4 rounded-lg ${importResult.errors.length === 0 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                <h3 className="font-medium mb-2">インポート結果</h3>
                <p className="text-sm mb-2">
                  成功: {importResult.success}件 / 総数: {importResult.total}件
                </p>
                {importResult.errors.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-1">エラー:</p>
                    <ul className="text-xs text-red-600 list-disc list-inside">
                      {importResult.errors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleImport} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CSVファイル
                </label>
                <input
                  type="file"
                  name="file"
                  accept=".csv"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={importLoading}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  {importLoading ? 'インポート中...' : 'インポート'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImportForm(false);
                    setImportResult(null);
                  }}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg transition-colors cursor-pointer"
                >
                  キャンセル
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            {templates.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📝</div>
                <h3 className="text-lg font-medium mb-2">テンプレートがありません</h3>
                <p className="text-gray-400">広告テンプレートを作成して始めましょう</p>
                <button
                  onClick={handleCreateClick}
                  className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors cursor-pointer"
                >
                  最初のテンプレートを作成
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">テンプレート一覧</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden">
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{template.name}</h4>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(template)}
                              className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                            >
                              編集
                            </button>
                            <button
                              onClick={() => handleDelete(template.id)}
                              className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
                            >
                              削除
                            </button>
                          </div>
                        </div>
                        {template.description && (
                          <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                        )}
                        <div className="text-xs text-gray-400">
                          プレースホルダー: {template.placeholders.join(', ')}
                        </div>
                      </div>
                      <div className="p-4 bg-gray-50">
                        <div className="text-xs text-gray-500 mb-3 font-medium">プレビュー:</div>
                        <div className="bg-white rounded border p-2">
                          {renderTemplate(template)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
