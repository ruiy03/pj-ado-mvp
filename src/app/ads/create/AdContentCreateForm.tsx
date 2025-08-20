'use client';

import { useRouter } from 'next/navigation';
import type { AdTemplate, UrlTemplate, CreateAdContentRequest } from '@/lib/definitions';
import AdContentForm from '../components/AdContentForm';

interface AdContentCreateFormProps {
  templates: AdTemplate[];
  urlTemplates: UrlTemplate[];
}

export default function AdContentCreateForm({ templates, urlTemplates }: AdContentCreateFormProps) {
  const router = useRouter();

  const handleSubmit = async (data: CreateAdContentRequest) => {
    try {
      const response = await fetch('/api/ad-contents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '広告コンテンツの作成に失敗しました');
      }

      router.push('/ads');
    } catch (error) {
      console.error('Ad content creation error:', error);
      alert(error instanceof Error ? error.message : 'エラーが発生しました');
    }
  };

  const handleCancel = () => {
    router.push('/ads');
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <AdContentForm
            templates={templates}
            urlTemplates={urlTemplates}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isEdit={false}
          />
        </div>
        <div className="space-y-4">
          {/* プレビューエリア */}
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-4">プレビュー</h3>
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-2">👁️</div>
              <p>テンプレートを選択するとプレビューが表示されます</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
