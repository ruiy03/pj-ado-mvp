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
    url_template: '',
    description: '',
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name,
        url_template: template.url_template,
        description: template.description || '',
      });
    }
  }, [template]);



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
                URLテンプレート *
              </label>
              <input
                type="text"
                value={formData.url_template}
                onChange={(e) => setFormData(prev => ({...prev, url_template: e.target.value}))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="{{baseUrl}}?utm_source=kijinaka&utm_medium=mirai&utm_campaign=03"
                required
              />
              <p className="text-sm text-gray-500 mt-1">
                ベースURLは {`{{baseUrl}}`} を使用してください。計測パラメータは実際の値を入力してください。
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


            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
                disabled={submitting}
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={submitting || !formData.name || !formData.url_template}
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
