'use client';

import {useState, useEffect} from 'react';
import type {UrlTemplate, CreateUrlTemplateRequest} from '@/lib/definitions';

interface UrlTemplateFormProps {
  template?: UrlTemplate;
  onSubmit: (data: CreateUrlTemplateRequest) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

export default function UrlTemplateForm({template, onSubmit, onCancel, isEdit = false}: UrlTemplateFormProps) {
  const [formData, setFormData] = useState<CreateUrlTemplateRequest>({
    name: '',
    url: '',
    parameters: {},
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [parametersText, setParametersText] = useState('');

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        url: template.url,
        parameters: template.parameters,
        description: template.description || '',
      });
      // parametersオブジェクトを文字列に変換
      setParametersText(Object.entries(template.parameters)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n'));
    }
  }, [template]);

  const parseParameters = (text: string): Record<string, string> => {
    const parameters: Record<string, string> = {};
    text.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const value = valueParts.join('=');
        if (key.trim() && value.trim()) {
          parameters[key.trim()] = value.trim();
        }
      }
    });
    return parameters;
  };

  const handleParametersChange = (text: string) => {
    setParametersText(text);
    const parameters = parseParameters(text);
    setFormData(prev => ({...prev, parameters}));
  };

  const buildFullUrl = () => {
    if (!formData.url) return '';
    
    const url = new URL(formData.url);
    Object.entries(formData.parameters).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {isEdit ? 'URLテンプレートを編集' : '新しいURLテンプレートを作成'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                テンプレート名 *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="例: PORTキャリア記事内キャンペーン"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ベースURL *
              </label>
              <input
                type="url"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({...prev, url: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://example.com/page"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                計測パラメータ
              </label>
              <textarea
                value={parametersText}
                onChange={(e) => handleParametersChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows={6}
                placeholder={`utm_campaign=03\nutm_content=102738\nutm_medium=mirai\nutm_source=kijinaka`}
              />
              <p className="text-sm text-gray-500 mt-1">
                各行に「パラメータ名=値」の形式で入力してください
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                説明
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({...prev, description: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="このURLテンプレートの用途や説明を入力"
              />
            </div>

            {formData.url && Object.keys(formData.parameters).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  完成URL（プレビュー）
                </label>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <code className="text-sm text-gray-800 break-all">
                    {buildFullUrl()}
                  </code>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-6 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                disabled={submitting}
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={submitting || !formData.name || !formData.url}
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