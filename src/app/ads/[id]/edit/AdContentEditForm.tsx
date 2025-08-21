'use client';

import {useRouter, useSearchParams} from 'next/navigation';
import type {
  AdContent,
  AdTemplate,
  UrlTemplate,
  CreateAdContentRequest,
  UpdateAdContentRequest
} from '@/lib/definitions';
import AdContentForm from '../../components/AdContentForm';

interface AdContentEditFormProps {
  content: AdContent;
  templates: AdTemplate[];
  urlTemplates: UrlTemplate[];
}

export default function AdContentEditForm({content, templates, urlTemplates}: AdContentEditFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');

  const handleSubmit = async (data: CreateAdContentRequest) => {
    try {
      const updateData: UpdateAdContentRequest = {
        id: content.id,
        ...data,
      };

      const response = await fetch(`/api/ad-contents/${content.id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '広告コンテンツの更新に失敗しました');
      }

      const redirectPath = returnTo === 'dashboard' ? '/dashboard' : '/ads';
      router.push(redirectPath);
    } catch (error) {
      console.error('Ad content update error:', error);
      alert(error instanceof Error ? error.message : 'エラーが発生しました');
    }
  };

  const handleCancel = () => {
    const redirectPath = returnTo === 'dashboard' ? '/dashboard' : '/ads';
    router.push(redirectPath);
  };

  return (
    <AdContentForm
      adContent={content}
      templates={templates}
      urlTemplates={urlTemplates}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isEdit={true}
    />
  );
}
