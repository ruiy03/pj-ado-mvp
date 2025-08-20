'use client';

import ClientProtectedPage from '@/components/ClientProtectedPage';
import {useState, useRef} from 'react';
import type {AdTemplate, CreateAdTemplateRequest} from '@/lib/definitions';

import {useTemplates} from './hooks/useTemplates';
import ImportExportButtons from './components/ImportExportButtons';
import TemplateForm from './components/TemplateForm';
import TemplatePreview from './components/TemplatePreview';
import TemplateList from './components/TemplateList';
import TemplateChangeWarning from '@/components/TemplateChangeWarning';

import type {ImportResult} from '@/lib/definitions';
import type {ConsistencyCheckResult} from '@/lib/consistency-checker';

export default function AdTemplates() {
  const {
    templates,
    loading,
    error,
    setError,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    analyzeTemplateChanges,
  } = useTemplates();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AdTemplate | null>(null);
  const [showImportForm, setShowImportForm] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [showNamingGuide, setShowNamingGuide] = useState(false);
  const [previewMode, setPreviewMode] = useState<'sample' | 'custom'>('sample');
  const [customValues, setCustomValues] = useState<Record<string, string>>({});
  const [previewSize, setPreviewSize] = useState<'desktop' | 'mobile'>('desktop');
  const [autoNofollow, setAutoNofollow] = useState(true);
  const formRef = useRef<HTMLDivElement>(null);

  // 影響分析とテンプレート変更警告の状態
  const [showChangeWarning, setShowChangeWarning] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<ConsistencyCheckResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const [formData, setFormData] = useState<CreateAdTemplateRequest>({
    name: '',
    html: '',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTemplate) {
        // 編集の場合、まず影響分析を実行
        setAnalysisLoading(true);
        try {
          const analysis = await analyzeTemplateChanges(editingTemplate.id, formData);

          // 影響がある場合は警告を表示
          if (analysis.total_affected > 0 || analysis.placeholder_diff.removed.length > 0) {
            setAnalysisResult(analysis);
            setShowChangeWarning(true);
            setAnalysisLoading(false);
            return; // 警告表示で一時停止
          } else {
            // 影響がない場合は直接更新
            await updateTemplate(editingTemplate.id, formData, autoNofollow);
          }
        } catch (analysisError) {
          // 影響分析に失敗した場合は詳細なエラー情報を表示
          console.error('影響分析に失敗しました:', analysisError);
          const errorMessage = analysisError instanceof Error ? analysisError.message : '不明なエラー';
          const continueUpdate = confirm(`影響分析に失敗しました:\n${errorMessage}\n\n更新を続行しますか？`);

          if (continueUpdate) {
            await updateTemplate(editingTemplate.id, formData, autoNofollow);
          } else {
            setAnalysisLoading(false);
            return;
          }
        } finally {
          setAnalysisLoading(false);
        }
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


  const resetForm = () => {
    setFormData({
      name: '',
      html: '',
      description: '',
    });
  };

  const handleCancel = () => {
    setShowCreateForm(false);
    setEditingTemplate(null);
    resetForm();
    setShowChangeWarning(false);
    setAnalysisResult(null);
  };

  // 警告ダイアログでの確認処理
  const handleWarningConfirm = async () => {
    try {
      if (editingTemplate) {
        await updateTemplate(editingTemplate.id, formData, autoNofollow);
        setShowCreateForm(false);
        setEditingTemplate(null);
        resetForm();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setShowChangeWarning(false);
      setAnalysisResult(null);
    }
  };

  // 警告ダイアログでのキャンセル処理
  const handleWarningCancel = () => {
    setShowChangeWarning(false);
    setAnalysisResult(null);
    // フォーム編集状態は維持
  };

  const handleImportClick = () => {
    setShowCreateForm(false);
    setEditingTemplate(null);
    resetForm();
    setShowImportForm(true);
  };

  const handleImportCancel = () => {
    setShowImportForm(false);
    setImportResult(null);
  };

  const handleImportResultClose = () => {
    setImportResult(null);
  };

  const handleCreateClick = () => {
    setShowCreateForm(true);
    setShowImportForm(false);
    setImportResult(null);

    setTimeout(() => {
      if (formRef.current) {
        formRef.current.scrollIntoView({behavior: 'smooth', block: 'start'});
      } else {
        window.scrollTo({top: 0, behavior: 'smooth'});
      }
    }, 100);
  };


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

      // テンプレートリストを再取得
      await fetchTemplates();
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
    <ClientProtectedPage>
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

          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">広告テンプレート管理</h1>
            <ImportExportButtons
              onImport={handleImportClick}
              onExport={handleExport}
              onCreateClick={handleCreateClick}
              onImportCancel={handleImportCancel}
              onImportResultClose={handleImportResultClose}
              exportLoading={exportLoading}
              showImportForm={showImportForm}
              importLoading={importLoading}
              importResult={importResult}
              handleImport={handleImport}
            />
          </div>

          {showCreateForm && (
            <div ref={formRef} className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <TemplateForm
                    formData={formData}
                    setFormData={setFormData}
                    autoNofollow={autoNofollow}
                    setAutoNofollow={setAutoNofollow}
                    showNamingGuide={showNamingGuide}
                    setShowNamingGuide={setShowNamingGuide}
                    editingTemplate={editingTemplate}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isLoading={analysisLoading}
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
            onDelete={handleDelete}
          />
        </div>

        {/* テンプレート変更警告ダイアログ */}
        {showChangeWarning && analysisResult && (
          <TemplateChangeWarning
            analysisResult={analysisResult}
            onConfirm={handleWarningConfirm}
            onCancel={handleWarningCancel}
            isLoading={analysisLoading}
          />
        )}
      </div>
    </ClientProtectedPage>
  );
}
