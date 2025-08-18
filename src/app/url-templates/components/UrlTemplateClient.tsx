'use client';

import {useState} from 'react';
import {useUrlTemplates} from '../hooks/useUrlTemplates';
import UrlTemplateForm from './UrlTemplateForm';
import UrlTemplateCard from './UrlTemplateCard';
import type {UrlTemplate, CreateUrlTemplateRequest} from '@/lib/definitions';

export default function UrlTemplateClient() {
  const {templates, loading, error, setError, createTemplate, updateTemplate, deleteTemplate} = useUrlTemplates();
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<UrlTemplate | null>(null);

  const handleCreateOrUpdate = async (formData: CreateUrlTemplateRequest) => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, formData);
      } else {
        await createTemplate(formData);
      }
      setShowForm(false);
      setEditingTemplate(null);
    } catch (error) {
      throw error;
    }
  };

  const handleEdit = (template: UrlTemplate) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTemplate(null);
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
      await deleteTemplate(id);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">読み込み中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">URLテンプレート管理</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
          新しいテンプレートを作成
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-600 text-sm">{error}</div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {templates.length === 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-lg font-medium mb-2">URLテンプレートがありません</h3>
              <p className="text-gray-400">計測パラメータ付きのURLテンプレートを作成して始めましょう</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">
                最初のテンプレートを作成
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <UrlTemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onDelete={handleDeleteTemplate}
            />
          ))}
        </div>
      )}

      {showForm && (
        <UrlTemplateForm
          template={editingTemplate || undefined}
          onSubmit={handleCreateOrUpdate}
          onCancel={handleCancel}
          isEdit={!!editingTemplate}
        />
      )}
    </div>
  );
}