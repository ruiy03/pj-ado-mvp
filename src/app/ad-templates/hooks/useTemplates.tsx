'use client';

import {useState, useEffect, useCallback} from 'react';
import type {AdTemplate, CreateAdTemplateRequest} from '@/lib/definitions';
import {addNofollowToLinks} from '@/lib/template-utils';

export function useTemplates() {
  const [templates, setTemplates] = useState<AdTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates');
      if (!response.ok) {
        throw new Error('テンプレートの取得に失敗しました');
      }
      const data = await response.json();
      // updated_atでソート（最新が一番上）
      const sortedData = data.sort((a: AdTemplate, b: AdTemplate) => {
        const dateA = a.updated_at ? new Date(a.updated_at).getTime() : 0;
        const dateB = b.updated_at ? new Date(b.updated_at).getTime() : 0;
        return dateB - dateA;
      });
      setTemplates(sortedData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const createTemplate = async (formData: CreateAdTemplateRequest, autoNofollow: boolean) => {
    const htmlToSave = autoNofollow ? addNofollowToLinks(formData.html) : formData.html;
    const dataToSave = { ...formData, html: htmlToSave };

    const response = await fetch('/api/templates', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(dataToSave),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'テンプレートの保存に失敗しました');
    }

    // 新しく作成されたテンプレートを取得して一番上に配置
    const newTemplate = await response.json();
    setTemplates(prev => [newTemplate, ...prev]);
  };

  const analyzeTemplateChanges = async (id: number, formData: CreateAdTemplateRequest) => {
    const htmlToAnalyze = formData.html;
    
    console.log('Starting template analysis:', { id, formData: { ...formData, html: htmlToAnalyze.substring(0, 100) + '...' } });
    
    const response = await fetch('/api/integrity-check', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        templateId: id,
        newHtml: htmlToAnalyze,
        newName: formData.name,
      }),
    });

    console.log('Analysis response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Analysis error:', errorData);
      throw new Error(errorData.error || '影響分析に失敗しました');
    }

    const result = await response.json();
    console.log('Analysis result:', result);
    return result;
  };

  const updateTemplate = async (id: number, formData: CreateAdTemplateRequest, autoNofollow: boolean) => {
    const htmlToSave = autoNofollow ? addNofollowToLinks(formData.html) : formData.html;
    const dataToSave = { ...formData, html: htmlToSave };

    const response = await fetch(`/api/templates/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(dataToSave),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'テンプレートの更新に失敗しました');
    }

    // 更新されたテンプレートを取得して一番上に配置
    const updatedTemplate = await response.json();
    setTemplates(prev => {
      const filtered = prev.filter(t => t.id !== id);
      return [updatedTemplate, ...filtered];
    });
  };

  const deleteTemplate = async (id: number) => {
    if (!confirm('このテンプレートを削除しますか？')) return;

    const response = await fetch(`/api/templates/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'テンプレートの削除に失敗しました');
    }

    // 削除されたテンプレートをリストから除外
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  return {
    templates,
    loading,
    error,
    setError,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    analyzeTemplateChanges,
  };
}
