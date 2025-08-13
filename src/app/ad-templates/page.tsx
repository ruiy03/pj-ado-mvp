'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { AdTemplate, CreateAdTemplateRequest } from '@/lib/definitions';
import { extractPlaceholders, validatePlaceholders } from '@/lib/template-utils';

import { useTemplates } from './hooks/useTemplates';
import ImportExportButtons from './components/ImportExportButtons';
import TemplateForm from './components/TemplateForm';
import TemplatePreview from './components/TemplatePreview';
import TemplateList from './components/TemplateList';

interface ImportResult {
  success: number;
  errors: string[];
  total: number;
}

export default function AdTemplates() {
  const {
    templates,
    loading,
    error,
    setError,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  } = useTemplates();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AdTemplate | null>(null);
  const [showImportForm, setShowImportForm] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [showNamingGuide, setShowNamingGuide] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewMode, setPreviewMode] = useState<'sample' | 'custom'>('sample');
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [previewSize, setPreviewSize] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [autoNofollow, setAutoNofollow] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<CreateAdTemplateRequest>({
    name: '',
    html: '',
    placeholders: [],
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validationErrors.length > 0) {
      setError('プレースホルダーの問題を修正してから保存してください');
      return;
    }

    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, formData, autoNofollow);
      } else {
        await createTemplate(formData, autoNofollow);
      }
      
      setShowCreateForm(false);
      setEditingTemplate(null);
      resetForm();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    }
  };

  const handleEdit = (template: AdTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      html: template.html,
      placeholders: template.placeholders,
      description: template.description || '',
    });
    setShowCreateForm(true);
    setShowImportForm(false);
    setImportResult(null);

    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      html: '',
      placeholders: [],
      description: '',
    });
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingTemplate(null);
    resetForm();
  };

  const handleImportClick = () => {
    setShowCreateForm(false);
    setEditingTemplate(null);
    resetForm();
    setShowImportForm(true);
  };

  const handleCreateClick = () => {
    setShowCreateForm(true);
    setShowImportForm(false);
    setImportResult(null);

    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  const autoExtractPlaceholders = () => {
    if (!formData.html.trim()) {
      setError('HTMLコードを入力してください');
      return;
    }

    const extracted = extractPlaceholders(formData.html);
    setFormData((prev: CreateAdTemplateRequest) => ({
      ...prev,
      placeholders: extracted
    }));

    if (extracted.length === 0) {
      setError('プレースホルダーが見つかりませんでした。{{placeholder}}の形式で記述してください。');
    } else {
      setError(null);
    }
  };

  const validateCurrentPlaceholders = useCallback(() => {
    if (!formData.html.trim()) {
      setValidationErrors([]);
      return;
    }

    const errors = validatePlaceholders(formData.html, formData.placeholders);
    setValidationErrors(errors);
  }, [formData.html, formData.placeholders]);

  useEffect(() => {
    validateCurrentPlaceholders();
  }, [formData.html, formData.placeholders, validateCurrentPlaceholders]);

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      setImportLoading(true);
      setError(null);

      const response = await fetch('/api/templates/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'インポートに失敗しました');
      }

      setImportResult(result);

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
      const response = await fetch('/api/templates/export');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'エクスポートに失敗しました');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'ad-templates.csv';
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

  const updateCustomValue = (placeholder: string, value: string) => {
    setCustomValues(prev => ({
      ...prev,
      [placeholder]: value
    }));
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTemplate(id);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'テンプレートの削除に失敗しました');
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
    <div>
      <div className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
            <button
              onClick={() => setError(null)}
              className="float-right text-red-500 hover:text-red-700 cursor-pointer"
            >
              ×
            </button>
          </div>
        )}

        <ImportExportButtons
          onImport={handleImportClick}
          onExport={handleExport}
          onCreateClick={handleCreateClick}
          exportLoading={exportLoading}
          showImportForm={showImportForm}
          importLoading={importLoading}
          importResult={importResult}
          handleImport={handleImport}
        />

        {showCreateForm && (
          <div ref={formRef} className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <TemplateForm
                  formData={formData}
                  setFormData={setFormData}
                  validationErrors={validationErrors}
                  autoNofollow={autoNofollow}
                  setAutoNofollow={setAutoNofollow}
                  showNamingGuide={showNamingGuide}
                  setShowNamingGuide={setShowNamingGuide}
                  editingTemplate={editingTemplate}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  autoExtractPlaceholders={autoExtractPlaceholders}
                />
              </div>

              <div className="space-y-4">
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
        )}

        <TemplateList
          templates={templates}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreateClick={handleCreateClick}
        />
      </div>
    </div>
  );
}
