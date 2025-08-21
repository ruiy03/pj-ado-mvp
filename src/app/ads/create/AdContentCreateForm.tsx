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
    <AdContentForm
      templates={templates}
      urlTemplates={urlTemplates}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isEdit={false}
    />
  );
}
