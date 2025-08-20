'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { AdTemplate, CreateAdTemplateRequest } from '@/lib/definitions';
import type { ConsistencyCheckResult } from '@/lib/consistency-checker';
import { extractPlaceholders, validatePlaceholderNaming } from '@/lib/template-utils';
import { VALID_PLACEHOLDERS } from '@/lib/template-utils/constants';
import TemplateForm from '../../components/TemplateForm';
import TemplatePreview from '../../components/TemplatePreview';
import TemplateChangeWarning from '@/components/TemplateChangeWarning';

interface TemplateEditFormProps {
  template: AdTemplate;
}

export default function TemplateEditForm({ template }: TemplateEditFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo');
  const [isLoading, setIsLoading] = useState(false);
  const [showNamingGuide, setShowNamingGuide] = useState(false);
  const [autoNofollow, setAutoNofollow] = useState(true);
  const [formData, setFormData] = useState<CreateAdTemplateRequest>({
    name: template.name,
    html: template.html,
    description: template.description || '',
  });

  const [showWarning, setShowWarning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ConsistencyCheckResult | null>(null);
  const [previewMode, setPreviewMode] = useState<'sample' | 'custom'>('sample');
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [previewSize, setPreviewSize] = useState<'desktop' | 'mobile'>('desktop');

  // クライアントサイド版のプレースホルダー検証
  const validateClientSidePlaceholders = (html: string): { isValid: boolean; errors: string[] } => {
    const extractedPlaceholders = extractPlaceholders(html);
    const errors: string[] = [];
    const invalidNaming: string[] = [];

    extractedPlaceholders.forEach(placeholder => {
      if (!validatePlaceholderNaming(placeholder)) {
        invalidNaming.push(placeholder);
      }
    });

    if (invalidNaming.length > 0) {
      errors.push(`命名規則に違反するプレースホルダーが検出されました: ${invalidNaming.join(', ')}`);
      errors.push(`許可されているプレースホルダー: ${VALID_PLACEHOLDERS.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const analyzeChanges = async () => {
    try {
      setIsLoading(true);
      
      // HTMLが変更されているかチェック
      const htmlChanged = formData.html !== template.html;
      
      // HTMLに変更がない場合（名前・説明のみの変更）は直接更新
      if (!htmlChanged) {
        await updateTemplate();
        return;
      }
      
      // まずプレースホルダーの命名規則を検証
      const placeholderValidation = validateClientSidePlaceholders(formData.html);
      if (!placeholderValidation.isValid) {
        setIsLoading(false);
        alert(
          'プレースホルダーの命名規則に違反しています。\n\n' +
          placeholderValidation.errors.join('\n') + '\n\n' +
          '右側の「プレースホルダー命名ガイド」を参照して修正してください。'
        );
        return;
      }
      
      // プレースホルダー検証が通った場合のみ影響分析を実行
      const response = await fetch(`/api/templates/${template.id}/analyze-changes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newHtml: formData.html,
          newName: formData.name,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);
        setShowWarning(true);
      } else {
        const error = await response.json();
        throw new Error(error.error || '影響分析に失敗しました');
      }
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : '影響分析に失敗しました';
      
      // プレースホルダー検証エラーの場合は詳細なメッセージを表示
      if (errorMessage.includes('命名規則に違反')) {
        alert(
          'プレースホルダーの命名規則に違反しています。\n\n' +
          errorMessage + '\n\n' +
          '右側の「プレースホルダー命名ガイド」を参照して修正してください。'
        );
      } else {
        const proceed = confirm(
          '影響分析に失敗しましたが、更新を続行しますか？\n\n' +
          'この変更は既存の広告コンテンツに予期しない影響を与える可能性があります。'
        );
        
        if (proceed) {
          await updateTemplate();
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateTemplate = async () => {
    try {
      setIsLoading(true);
      
      // HTMLが変更されている場合は、先にad_contentsを同期
      if (formData.html !== template.html) {
        const syncResponse = await fetch(`/api/templates/${template.id}/sync-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ newHtml: formData.html }),
        });
        
        if (syncResponse.ok) {
          const syncResult = await syncResponse.json();
          console.log('Content sync completed:', syncResult);
        } else {
          console.warn('Content sync failed, proceeding with template update');
        }
      }
      
      const response = await fetch(`/api/templates/${template.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'テンプレートの更新に失敗しました');
      }

      const redirectPath = returnTo === 'dashboard' ? '/dashboard' : '/ad-templates';
      router.push(redirectPath);
    } catch (error) {
      console.error('Template update error:', error);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // データに変更があるかチェック
    const hasChanges = 
      formData.name !== template.name ||
      formData.html !== template.html ||
      formData.description !== (template.description || '');

    if (!hasChanges) {
      const redirectPath = returnTo === 'dashboard' ? '/dashboard' : '/ad-templates';
      router.push(redirectPath);
      return;
    }

    await analyzeChanges();
  };

  const handleCancel = () => {
    const redirectPath = returnTo === 'dashboard' ? '/dashboard' : '/ad-templates';
    router.push(redirectPath);
  };

  const handleProceedUpdate = () => {
    setShowWarning(false);
    updateTemplate();
  };

  const handleCancelUpdate = () => {
    setShowWarning(false);
    setAnalysisResult(null);
    setIsLoading(false);
  };

  const updateCustomValue = (placeholder: string, value: string) => {
    setCustomValues(prev => ({
      ...prev,
      [placeholder]: value
    }));
  };

  
  if (showWarning && analysisResult) {
    return (
      <TemplateChangeWarning
        analysisResult={analysisResult}
        onConfirm={handleProceedUpdate}
        onCancel={handleCancelUpdate}
        isLoading={isLoading}
      />
    );
  }

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
            editingTemplate={template}
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
