'use client';

import ClientProtectedPage from '@/components/ClientProtectedPage';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { UrlTemplate, UpdateUrlTemplateRequest } from '@/lib/definitions';
import type { UrlTemplateConsistencyCheckResult } from '@/lib/consistency-checker';
import { updateUrlTemplate } from '@/lib/url-template-actions';
import UrlTemplateChangeWarning from '@/components/UrlTemplateChangeWarning';

interface UrlTemplateEditFormProps {
  template: UrlTemplate;
}

export default function UrlTemplateEditForm({ template }: UrlTemplateEditFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<UrlTemplateConsistencyCheckResult | null>(null);
  
  const [formData, setFormData] = useState<UpdateUrlTemplateRequest>({
    id: template.id,
    name: template.name,
    url_template: template.url_template,
    description: template.description || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // データに変更があるかチェック
    const hasChanges = 
      formData.name !== template.name ||
      formData.url_template !== template.url_template ||
      formData.description !== (template.description || '');

    if (!hasChanges) {
      const redirectPath = returnTo === 'dashboard' ? '/dashboard' : '/url-templates';
      router.push(redirectPath);
      return;
    }

    await analyzeChanges();
  };

  const analyzeChanges = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // URLテンプレートが変更されているかチェック
      const urlTemplateChanged = formData.url_template !== template.url_template;
      
      // URLテンプレートに変更がない場合（名前・説明のみの変更）は直接更新
      if (!urlTemplateChanged) {
        await updateTemplate();
        return;
      }
      
      // 影響分析を実行
      const response = await fetch(`/api/url-templates/${template.id}/analyze-changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newUrlTemplate: formData.url_template,
          newName: formData.name,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);
        setShowWarning(true);
        setIsLoading(false); // 警告画面表示時にローディング状態をリセット
      } else {
        const error = await response.json();
        throw new Error(error.error || '影響分析に失敗しました');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : '影響分析に失敗しました';
      
      const proceed = confirm(
        '影響分析に失敗しましたが、更新を続行しますか？\n\n' +
        'この変更は既存の広告コンテンツに予期しない影響を与える可能性があります。'
      );
      
      if (proceed) {
        await updateTemplate();
      } else {
        setIsLoading(false);
      }
    }
  };

  const updateTemplate = async () => {
    try {
      setIsLoading(true);
      
      // URLテンプレートが変更されている場合は、先にad_contentsを同期
      if (formData.url_template !== template.url_template) {
        const syncResponse = await fetch(`/api/url-templates/${template.id}/sync-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newUrlTemplate: formData.url_template }),
        });
        
        if (syncResponse.ok) {
          const syncResult = await syncResponse.json();
          console.log('URL template content sync completed:', syncResult);
        } else {
          console.warn('URL template content sync failed, proceeding with template update');
        }
      }
      
      const response = await fetch(`/api/url-templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'URLテンプレートの更新に失敗しました');
      }

      const redirectPath = returnTo === 'dashboard' ? '/dashboard' : '/url-templates';
      router.push(redirectPath);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    const redirectPath = returnTo === 'dashboard' ? '/dashboard' : '/url-templates';
    router.push(redirectPath);
  };

  const handleProceedUpdate = async () => {
    setShowWarning(false);
    await updateTemplate();
  };

  const handleCancelUpdate = () => {
    setShowWarning(false);
    setAnalysisResult(null);
    setIsLoading(false);
  };

  if (showWarning && analysisResult) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <UrlTemplateChangeWarning
          analysisResult={analysisResult}
          onConfirm={handleProceedUpdate}
          onCancel={handleCancelUpdate}
          isLoading={isLoading}
        />
      </div>
    );
  }

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

  const urlParams = extractParams(formData.url_template || '');

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
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, url_template: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="{{baseUrl}}?source={{source}}&medium={{medium}}"
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                {isLoading ? '更新中...' : '更新'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </ClientProtectedPage>
  );
}
