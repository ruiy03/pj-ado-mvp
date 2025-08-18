'use client';

import {useState, useEffect, useCallback} from 'react';
import type {UrlTemplate, CreateUrlTemplateRequest} from '@/lib/definitions';

export function useUrlTemplates() {
  const [templates, setTemplates] = useState<UrlTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/url-templates');
      if (!response.ok) {
        throw new Error('URLテンプレートの取得に失敗しました');
      }
      const data = await response.json();
      // updated_atでソート（最新が一番上）
      const sortedData = data.templates.sort((a: UrlTemplate, b: UrlTemplate) => {
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

  const createTemplate = async (formData: CreateUrlTemplateRequest) => {
    const response = await fetch('/api/url-templates', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'URLテンプレートの保存に失敗しました');
    }

    // 新しく作成されたテンプレートを取得して一番上に配置
    const result = await response.json();
    setTemplates(prev => [result.template, ...prev]);
  };

  const updateTemplate = async (id: number, formData: CreateUrlTemplateRequest) => {
    const response = await fetch(`/api/url-templates/${id}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'URLテンプレートの更新に失敗しました');
    }

    // 更新されたテンプレートを取得して一番上に配置
    const result = await response.json();
    setTemplates(prev => {
      const filtered = prev.filter(t => t.id !== id);
      return [result.template, ...filtered];
    });
  };

  const deleteTemplate = async (id: number) => {
    if (!confirm('このURLテンプレートを削除しますか？')) return;

    const response = await fetch(`/api/url-templates/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'URLテンプレートの削除に失敗しました');
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
  };
}