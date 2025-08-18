'use client';

import {useState} from 'react';
import {useUrlTemplates} from '../hooks/useUrlTemplates';
import UrlTemplateForm from './UrlTemplateForm';
import UrlTemplateCard from './UrlTemplateCard';
import ImportExportButtons from './ImportExportButtons';
import type {UrlTemplate, CreateUrlTemplateRequest} from '@/lib/definitions';

interface ImportResult {
  success: number;
  errors: string[];
  total: number;
}

export default function UrlTemplateClient() {
  const {templates, loading, error, setError, fetchTemplates, createTemplate, updateTemplate, deleteTemplate} = useUrlTemplates();
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<UrlTemplate | null>(null);
  const [showImportForm, setShowImportForm] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportLoading, setExportLoading] = useState(false);

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

  const handleImportClick = () => {
    setShowForm(false);
    setEditingTemplate(null);
    setShowImportForm(true);
  };

  const handleImportCancel = () => {
    setShowImportForm(false);
    setImportResult(null);
  };

  const handleCreateClick = () => {
    setShowForm(true);
    setShowImportForm(false);
    setImportResult(null);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      setImportLoading(true);
      setError(null);

      const response = await fetch('/api/url-templates/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'インポートに失敗しました');
      }

      setImportResult(result);

      // テンプレートリストを再取得
      await fetchTemplates();

      if (result.errors.length === 0) {
        setShowImportForm(false);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setImportLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      setError(null);
      const response = await fetch('/api/url-templates/export');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'エクスポートに失敗しました');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'url-templates.csv';
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エクスポートでエラーが発生しました');
    } finally {
      setExportLoading(false);
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
      <ImportExportButtons
        onImport={handleImportClick}
        onExport={handleExport}
        onCreateClick={handleCreateClick}
        onImportCancel={handleImportCancel}
        exportLoading={exportLoading}
        showImportForm={showImportForm}
        importLoading={importLoading}
        importResult={importResult}
        handleImport={handleImport}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-600 text-sm">{error}</div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800 cursor-pointer"
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
                onClick={handleCreateClick}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors cursor-pointer">
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
