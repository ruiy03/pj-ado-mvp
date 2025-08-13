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
      setTemplates(data);
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

    await fetchTemplates();
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

    await fetchTemplates();
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

    await fetchTemplates();
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
  };
}
