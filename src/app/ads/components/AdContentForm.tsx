'use client';

import {useState, useEffect, useMemo} from 'react';
import type {
  AdContent,
  AdTemplate,
  UrlTemplate,
  CreateAdContentRequest,
  AdContentStatus
} from '@/lib/definitions';
import ImageUpload from '@/components/ImageUpload';
import AdPreview from './AdPreview';

interface UploadedImage {
  url: string;
  filename: string;
  size: number;
  mimeType: string;
  imageId?: number;
}

interface AdContentFormProps {
  adContent?: AdContent;
  templates: AdTemplate[];
  urlTemplates: UrlTemplate[];
  onSubmit: (data: CreateAdContentRequest) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function AdContentForm({
                                        adContent,
                                        templates,
                                        urlTemplates,
                                        onSubmit,
                                        onCancel,
                                        isEdit = false,
                                      }: AdContentFormProps) {
  const [formData, setFormData] = useState<CreateAdContentRequest>({
    name: '',
    template_id: undefined,
    url_template_id: undefined,
    content_data: {},
    status: 'draft',
  });
  const [selectedTemplate, setSelectedTemplate] = useState<AdTemplate | null>(null);
  const [uploadedImages, setUploadedImages] = useState<Record<string, UploadedImage>>({});
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedUrlTemplate, setSelectedUrlTemplate] = useState<UrlTemplate | null>(null);

  // 初期化
  useEffect(() => {
    if (adContent) {
      setFormData({
        name: adContent.name,
        template_id: adContent.template_id,
        url_template_id: adContent.url_template_id,
        content_data: adContent.content_data || {},
        status: adContent.status,
      });

      if (adContent.template_id) {
        const template = templates.find(t => t.id === adContent.template_id);
        setSelectedTemplate(template || null);
      }

      if (adContent.url_template_id) {
        const urlTemplate = urlTemplates.find(t => t.id === adContent.url_template_id);
        setSelectedUrlTemplate(urlTemplate || null);
      }

      // 既存の画像データを設定
      if (adContent.images) {
        const imageMap: Record<string, UploadedImage> = {};
        adContent.images.forEach(img => {
          if (img.placeholder_name) {
            imageMap[img.placeholder_name] = {
              url: img.blob_url,
              filename: img.original_filename || '',
              size: img.file_size || 0,
              mimeType: img.mime_type || '',
            };
          }
        });
        setUploadedImages(imageMap);
      }
    }
  }, [adContent, templates, urlTemplates]);

  // テンプレート選択時の処理
  const handleTemplateChange = (templateId: string) => {
    const id = templateId ? parseInt(templateId) : undefined;
    const template = id ? templates.find(t => t.id === id) || null : null;

    setSelectedTemplate(template);
    setFormData(prev => ({
      ...prev,
      template_id: id,
      content_data: isEdit ? prev.content_data : {}, // 編集時はコンテンツデータを保持
    }));
    // 編集時は画像をリセットしない
    if (!isEdit) {
      setUploadedImages({});
    }
  };

  // URLテンプレート選択時の処理
  const handleUrlTemplateChange = (templateId: string) => {
    const id = templateId ? parseInt(templateId) : undefined;
    const urlTemplate = id ? urlTemplates.find(t => t.id === id) || null : null;

    setSelectedUrlTemplate(urlTemplate);
    setFormData(prev => ({
      ...prev,
      url_template_id: id,
    }));
  };

  // プレースホルダー値の更新
  const updatePlaceholderValue = (placeholder: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      content_data: {
        ...prev.content_data,
        [placeholder]: value,
      },
    }));
  };

  // 画像アップロード処理
  const handleImageUpload = (placeholder: string, image: UploadedImage) => {
    setUploadedImages(prev => ({
      ...prev,
      [placeholder]: image,
    }));
    updatePlaceholderValue(placeholder, image.url);
  };

  // 画像削除処理
  const handleImageRemove = (placeholder: string) => {
    setUploadedImages(prev => {
      const updated = {...prev};
      delete updated[placeholder];
      return updated;
    });
    updatePlaceholderValue(placeholder, '');
  };

  // プレースホルダーが画像用かどうかを判定
  const isImagePlaceholder = (placeholder: string): boolean => {
    return placeholder.toLowerCase().includes('image') ||
      placeholder.toLowerCase().includes('img') ||
      placeholder.toLowerCase().includes('photo') ||
      placeholder.toLowerCase().includes('picture') ||
      placeholder.toLowerCase().includes('logo');
  };

  // プレースホルダーから波括弧を除去して表示用に整える
  const getCleanPlaceholderName = (placeholder: string): string => {
    return placeholder.replace(/\{\{|\}\}/g, '').trim();
  };



  // URLプレビューの生成
  const generateUrlPreview = (): string => {
    if (!selectedUrlTemplate) return '';

    let url = selectedUrlTemplate.url_template;

    // プレースホルダーをパラメータで置換
    Object.entries(selectedUrlTemplate.parameters).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      url = url.replace(regex, String(value || ''));
    });

    return url;
  };

  // リンクプレビューの生成（linkUrlはパラメータ付き、imageUrlはパラメータなし）
  const linkPreviews = useMemo(() => {
    if (!selectedTemplate) return [];

    // プレースホルダーがリンク用かどうかを判定（内部関数）
    const isLinkPlaceholderInternal = (placeholder: string): boolean => {
      const cleanName = placeholder.replace(/\{\{|\}\}/g, '').trim().toLowerCase();
      return cleanName.includes('link') ||
        cleanName.includes('url') ||
        cleanName.includes('href') ||
        cleanName.includes('リンク');
    };

    // プレースホルダーから波括弧を除去して表示用に整える（内部関数）
    const getCleanPlaceholderNameInternal = (placeholder: string): string => {
      return placeholder.replace(/\{\{|\}\}/g, '').trim();
    };

    const previews: Array<{ placeholder: string, url: string, cleanName: string, hasUrlParams: boolean }> = [];

    selectedTemplate.placeholders.forEach(placeholder => {
      if (isLinkPlaceholderInternal(placeholder)) {
        const baseUrl = formData.content_data[placeholder];
        if (baseUrl && typeof baseUrl === 'string' && baseUrl.trim()) {
          const cleanName = getCleanPlaceholderNameInternal(placeholder).toLowerCase();
          let finalUrl = baseUrl.trim();
          let hasUrlParams = false;
          
          // linkUrlの場合はURLテンプレートのパラメータを適用
          if (cleanName.includes('link') && selectedUrlTemplate) {
            // URLテンプレートからパラメータを生成
            let urlWithParams = selectedUrlTemplate.url_template;
            
            // まずベースURLを置換
            const baseUrlRegex = /\{\{\s*baseUrl\s*\}\}/g;
            urlWithParams = urlWithParams.replace(baseUrlRegex, baseUrl.trim());
            
            // その他のプレースホルダーをパラメータで置換
            Object.entries(selectedUrlTemplate.parameters).forEach(([key, value]) => {
              const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
              urlWithParams = urlWithParams.replace(regex, String(value || ''));
            });
            
            finalUrl = urlWithParams;
            hasUrlParams = true;
          }
          
          previews.push({
            placeholder,
            url: finalUrl,
            cleanName: getCleanPlaceholderNameInternal(placeholder),
            hasUrlParams
          });
        }
      }
    });

    return previews;
  }, [selectedTemplate, formData.content_data, selectedUrlTemplate]);

  // フォーム送信
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (submitting) return;

    // バリデーション
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '広告名は必須です';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '広告名は2文字以上で入力してください';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = '広告名は100文字以内で入力してください';
    }

    if (!formData.template_id) {
      newErrors.template_id = '広告テンプレートを選択してください';
    }

    // プレースホルダーの必須チェック
    if (selectedTemplate && selectedTemplate.placeholders) {
      selectedTemplate.placeholders.forEach(placeholder => {
        const cleanName = getCleanPlaceholderName(placeholder);
        const value = formData.content_data[placeholder];
        
        if (!value || (typeof value === 'string' && !value.trim())) {
          // 画像の場合は uploadedImages もチェック
          if (isImagePlaceholder(placeholder)) {
            if (!uploadedImages[placeholder]) {
              newErrors[`placeholder_${placeholder}`] = `${cleanName}は必須です`;
            }
          } else {
            newErrors[`placeholder_${placeholder}`] = `${cleanName}は必須です`;
          }
        }
      });
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // 最初のエラーにフォーカス
      const firstErrorKey = Object.keys(newErrors)[0];
      const firstErrorElement = document.querySelector(`[data-error-key="${firstErrorKey}"]`);
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setSubmitting(true);
    try {
      // 画像URLをコンテンツデータに含める
      const finalContentData = {...formData.content_data};
      Object.entries(uploadedImages).forEach(([placeholder, image]) => {
        finalContentData[placeholder] = image.url;
      });

      await onSubmit({
        ...formData,
        content_data: finalContentData,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isEdit ? '広告コンテンツを編集' : '新しい広告コンテンツを作成'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 左側: フォーム */}
              <div className="space-y-6">
                {/* 広告名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    広告名 *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                      errors.name ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="例: PORTキャリア春のキャンペーン"
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                {/* テンプレート選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    広告テンプレート
                  </label>
                  <select
                    value={formData.template_id || ''}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">テンプレートを選択...</option>
                    {templates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                  {errors.template_id && (
                    <p className="text-sm text-red-600 mt-1">{errors.template_id}</p>
                  )}
                </div>

                {/* URLテンプレート選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URLテンプレート
                  </label>
                  <select
                    value={formData.url_template_id || ''}
                    onChange={(e) => handleUrlTemplateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">URLテンプレートを選択...</option>
                    {urlTemplates.map(template => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* URLプレビュー */}
                {selectedUrlTemplate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      リンクURLプレビュー
                    </label>
                    <div
                      className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm text-gray-800 break-all">
                      {generateUrlPreview() || 'URLを生成できません'}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      選択したURLテンプレートのパラメータが適用された完全なURLです
                    </p>
                  </div>
                )}

                {/* ステータス */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ステータス
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      status: e.target.value as AdContentStatus
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">下書き</option>
                    <option value="active">アクティブ</option>
                    <option value="paused">停止中</option>
                    <option value="archived">アーカイブ</option>
                  </select>
                </div>

                {/* プレースホルダー入力 */}
                {selectedTemplate && selectedTemplate.placeholders.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">コンテンツ入力</h3>
                    <div className="space-y-4">
                      {selectedTemplate.placeholders.map((placeholder) => {
                        const cleanName = getCleanPlaceholderName(placeholder);
                        const errorKey = `placeholder_${placeholder}`;
                        const hasError = errors[errorKey];
                        return (
                          <div key={placeholder} data-error-key={errorKey}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {cleanName} <span className="text-red-500">*</span>
                            </label>
                            {isImagePlaceholder(placeholder) ? (
                              <div>
                                <ImageUpload
                                  onUpload={(image) => handleImageUpload(placeholder, image)}
                                  onRemove={() => handleImageRemove(placeholder)}
                                  currentImageUrl={uploadedImages[placeholder]?.url || String(formData.content_data[placeholder] || '')}
                                  placeholder={`${cleanName}の画像をアップロード`}
                                  className={hasError ? 'border-red-300' : ''}
                                  adContentId={adContent?.id}
                                  placeholderName={cleanName}
                                  altText={cleanName}
                                />
                                {hasError && (
                                  <p className="text-sm text-red-600 mt-1">{hasError}</p>
                                )}
                              </div>
                            ) : (
                              <div>
                                <input
                                  type="text"
                                  value={String(formData.content_data[placeholder] || '')}
                                  onChange={(e) => updatePlaceholderValue(placeholder, e.target.value)}
                                  className={`w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 ${
                                    hasError ? 'border-red-300' : 'border-gray-300'
                                  }`}
                                  placeholder={`${cleanName}を入力...`}
                                />
                                {hasError && (
                                  <p className="text-sm text-red-600 mt-1">{hasError}</p>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* 右側: プレビュー */}
              <div>
                <AdPreview
                  template={selectedTemplate}
                  contentData={{
                    ...formData.content_data,
                    ...Object.fromEntries(
                      Object.entries(uploadedImages).map(([key, image]) => [key, image.url])
                    ),
                  }}
                  title="リアルタイムプレビュー"
                  showViewportToggle={true}
                  className="mb-4"
                />

                {/* リンクプレビュー */}
                {selectedTemplate && linkPreviews.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-md font-medium text-gray-900 mb-3">リンクプレビュー</h4>
                    <div className="space-y-3">
                      {linkPreviews.map((linkPreview) => (
                        <div key={linkPreview.placeholder} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor"
                                   viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 mb-1">
                                {linkPreview.cleanName}
                              </p>
                              <p className="text-sm text-blue-700 break-all hover:text-blue-800">
                                <a
                                  href={linkPreview.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="underline hover:no-underline"
                                >
                                  {linkPreview.url}
                                </a>
                              </p>
                              {linkPreview.hasUrlParams && selectedUrlTemplate && (
                                <p className="text-xs text-gray-500 mt-1">
                                  URLテンプレート「{selectedUrlTemplate.name}」のパラメータが適用されています
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* フォームボタン */}
            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={onCancel}
                disabled={submitting}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={submitting || !formData.name}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-colors"
              >
                {submitting ? '保存中...' : (isEdit ? '更新する' : '作成する')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
