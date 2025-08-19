'use client';

import {useState} from 'react';
import type {ImportResult} from '@/lib/definitions';

interface UseImportExportProps {
  importUrl: string;
  exportUrl: string;
  onSuccess?: () => Promise<void>;
}

export function useImportExport({importUrl, exportUrl, onSuccess}: UseImportExportProps) {
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

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    try {
      setImportLoading(true);
      setError(null);

      const response = await fetch(importUrl, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'インポートに失敗しました');
      }

      setImportResult(result);

      if (onSuccess) {
        await onSuccess();
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
      const response = await fetch(exportUrl);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'エクスポートに失敗しました');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;

      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = 'export.csv';
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

  return {
    showImportForm,
    importLoading,
    importResult,
    exportLoading,
    error,
    setError,
    handleImportClick,
    handleImportCancel,
    handleImportResultClose,
    handleImport,
    handleExport,
  };
}
