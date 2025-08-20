'use client';

import ClientProtectedPage from '@/components/ClientProtectedPage';
import UrlTemplateList from './components/UrlTemplateList';
import ImportExportButtons from './components/ImportExportButtons';
import {useState} from 'react';
import type {ImportResult} from '@/lib/definitions';

export default function UrlTemplates() {
  const [showImportForm, setShowImportForm] = useState(false);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImportClick = () => {
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
    // この関数は ImportExportButtons の必須プロパティですが、URLテンプレートページでは使用されません
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

  return (
    <ClientProtectedPage>
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
          <h1 className="text-3xl font-bold text-gray-900">URLテンプレート管理</h1>
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
        <UrlTemplateList/>
      </div>
    </ClientProtectedPage>
  );
}
