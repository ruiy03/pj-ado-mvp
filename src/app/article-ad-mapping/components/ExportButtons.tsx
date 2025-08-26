'use client';

import React, { useState } from 'react';
import { FileText, BarChart } from 'lucide-react';

export default function ExportButtons() {
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = async (format: 'mappings' | 'usage_stats') => {
    try {
      setIsExporting(format);

      const response = await fetch(`/api/article-mappings/export?format=${format}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('エクスポートに失敗しました');
      }

      // ファイルをダウンロード
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      
      // ファイル名をContent-Dispositionヘッダーから取得
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = contentDisposition 
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `export-${format}-${new Date().toISOString().split('T')[0]}.csv`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // クリーンアップ
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (_error) {
      // エクスポートエラー - handled in alert message
      alert('エクスポートに失敗しました');
    } finally {
      setIsExporting(null);
    }
  };

  return (
    <div className="flex space-x-3">
      <button
        onClick={() => handleExport('mappings')}
        disabled={isExporting === 'mappings'}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer
          ${isExporting === 'mappings'
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-green-600 hover:bg-green-700 text-white'
          }
        `}
      >
        <FileText className="w-4 h-4" />
        <span>
          {isExporting === 'mappings' ? '紐付け一覧をエクスポート中...' : '紐付け一覧をエクスポート'}
        </span>
      </button>

      <button
        onClick={() => handleExport('usage_stats')}
        disabled={isExporting === 'usage_stats'}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer
          ${isExporting === 'usage_stats'
            ? 'bg-gray-400 text-white cursor-not-allowed'
            : 'bg-orange-600 hover:bg-orange-700 text-white'
          }
        `}
      >
        <BarChart className="w-4 h-4" />
        <span>
          {isExporting === 'usage_stats' ? '使用統計をエクスポート中...' : '使用統計をエクスポート'}
        </span>
      </button>
    </div>
  );
}
