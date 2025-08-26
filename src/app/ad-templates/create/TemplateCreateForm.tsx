'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CreateAdTemplateRequest } from '@/lib/definitions';
import TemplateForm from '../components/TemplateForm';
import TemplatePreview from '../components/TemplatePreview';

export default function TemplateCreateForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showNamingGuide, setShowNamingGuide] = useState(false);
  const [autoNofollow, setAutoNofollow] = useState(true);
  const [formData, setFormData] = useState<CreateAdTemplateRequest>({
    name: '',
    html: '',
    description: '',
  });
  const [previewMode, setPreviewMode] = useState<'sample' | 'custom'>('sample');
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [previewSize, setPreviewSize] = useState<'desktop' | 'mobile'>('desktop');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'テンプレートの作成に失敗しました');
      }

      router.push('/ad-templates');
    } catch (error) {
      // Template creation error - handled in error message display
      const errorMessage = error instanceof Error ? error.message : 'エラーが発生しました';
      
      // プレースホルダー検証エラーの場合は詳細なメッセージを表示
      if (errorMessage.includes('命名規則に違反')) {
        alert(
          'プレースホルダーの命名規則に違反しています。\n\n' +
          errorMessage + '\n\n' +
          '右側の「プレースホルダー命名ガイド」を参照して修正してください。'
        );
      } else {
        alert(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/ad-templates');
  };

  const updateCustomValue = (placeholder: string, value: string) => {
    setCustomValues(prev => ({
      ...prev,
      [placeholder]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 min-h-screen">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
        <div className="space-y-4 min-h-0">
          <TemplateForm
            formData={formData}
            setFormData={setFormData}
            autoNofollow={autoNofollow}
            setAutoNofollow={setAutoNofollow}
            showNamingGuide={showNamingGuide}
            setShowNamingGuide={setShowNamingGuide}
            editingTemplate={null}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={isLoading}
          />
        </div>
        <div className="space-y-4 min-h-0">
          <TemplatePreview
            formData={formData}
            previewMode={previewMode}
            customValues={customValues}
            previewSize={previewSize}
            setPreviewMode={setPreviewMode}
            setPreviewSize={setPreviewSize}
            updateCustomValue={updateCustomValue}
          />
        </div>
      </div>
    </div>
  );
}
