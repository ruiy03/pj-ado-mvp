'use client';

import ClientProtectedPage from '@/components/ClientProtectedPage';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import type {CreateUrlTemplateRequest} from '@/lib/definitions';
import {createUrlTemplate} from '@/lib/url-template-actions';

export default function UrlTemplateCreateForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateUrlTemplateRequest>({
    name: '',
    url_template: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await createUrlTemplate(formData);
      router.push('/url-templates');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/url-templates');
  };

  // URLテンプレートからパラメータを抽出
  const extractParams = (urlTemplate: string) => {
    try {
      const urlParts = urlTemplate.split('?');
      if (urlParts.length < 2) return {};

      const queryString = urlParts[1];
      const params = queryString.split('&');
      const extractedParams: Record<string, string> = {};

      for (const param of params) {
        const [key, value] = param.split('=');
        if (key && value) {
          extractedParams[key] = value;
        }
      }

      return extractedParams;
    } catch {
      return {};
    }
  };

  const urlParams = extractParams(formData.url_template);

  return (
    <ClientProtectedPage>
      <div className="bg-white rounded-lg shadow p-6">
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                テンプレート名<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="テンプレート名を入力してください"
              />
            </div>

            <div>
              <label htmlFor="url_template" className="block text-sm font-medium text-gray-700 mb-2">
                URLテンプレート<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="url_template"
                name="url_template"
                value={formData.url_template}
                onChange={(e) => setFormData({...formData, url_template: e.target.value})}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="{{baseUrl}}?utm_source=source&utm_medium=medium&utm_content={{utm_content}}"
              />
              <p className="text-sm text-gray-500 mt-1">
                URLにパラメータを含める場合は、{'{{parameter_name}}'} の形式で指定してください
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                説明
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="テンプレートの説明を入力してください（任意）"
              />
            </div>

            {Object.keys(urlParams).length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">パラメータ</label>
                <div className="bg-gray-50 p-3 rounded border space-y-2">
                  {Object.entries(urlParams).map(([key, value]) => (
                    <div key={key} className="text-sm flex items-center">
                      <span className="text-blue-600 font-medium w-32">{key}</span>
                      <span className="text-gray-400 mx-2">=</span>
                      <span className="text-gray-800 flex-1">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                キャンセル
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? '作成中...' : '作成'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ClientProtectedPage>
  );
}
