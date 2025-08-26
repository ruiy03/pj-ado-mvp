'use client';

import React, { useState } from 'react';
import type { WordPressArticle } from '@/lib/wordpress-sync-actions';

interface ArticlesWithoutAdsExportButtonsProps {
  articles: WordPressArticle[];
  isLoading?: boolean;
}

export default function ArticlesWithoutAdsExportButtons({
  articles,
  isLoading = false
}: ArticlesWithoutAdsExportButtonsProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = async () => {
    if (articles.length === 0) {
      alert('エクスポートするデータがありません');
      return;
    }

    try {
      setIsExporting(true);

      // CSV ヘッダー
      const headers = [
        '記事ID',
        '記事タイトル',
        'URL',
        'カテゴリー',
        '公開日',
        '広告設定状況'
      ];

      // CSV データ
      const csvData = articles.map(article => [
        article.id,
        `"${article.title.replace(/"/g, '""')}"`, // ダブルクォートのエスケープ
        article.url,
        article.category || '未分類',
        article.published_at,
        '未設定'
      ]);

      // CSV 文字列を作成
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => row.join(','))
      ].join('\n');

      // BOM付きUTF-8として出力（Excelでの文字化け対策）
      const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
      const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });

      // ダウンロードリンクを作成
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // ファイル名を生成（現在の日時を含む）
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/[-:T]/g, '');
      const filename = `広告なし記事一覧_${timestamp}.csv`;
      
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // URLを解放
      URL.revokeObjectURL(url);

      // 成功通知（オプション）
      // CSVエクスポート完了 - export completed successfully

    } catch (_error) {
      // CSVエクスポートエラー - handled in alert message
      alert('エクスポート中にエラーが発生しました');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToJSON = async () => {
    if (articles.length === 0) {
      alert('エクスポートするデータがありません');
      return;
    }

    try {
      setIsExporting(true);

      // JSON データを整形
      const exportData = {
        export_info: {
          export_date: new Date().toISOString(),
          total_count: articles.length,
          data_type: 'articles_without_ads',
          description: '広告が設定されていない記事一覧'
        },
        articles: articles.map(article => ({
          id: article.id,
          title: article.title,
          url: article.url,
          category: article.category || '未分類',
          published_at: article.published_at,
          ad_status: '未設定'
        }))
      };

      // JSON文字列を作成
      const jsonContent = JSON.stringify(exportData, null, 2);

      // Blobを作成
      const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });

      // ダウンロードリンクを作成
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // ファイル名を生成
      const now = new Date();
      const timestamp = now.toISOString().slice(0, 19).replace(/[-:T]/g, '');
      const filename = `広告なし記事一覧_${timestamp}.json`;
      
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // URLを解放
      URL.revokeObjectURL(url);

      // JSONエクスポート完了 - export completed successfully

    } catch (_error) {
      // JSONエクスポートエラー - handled in alert message
      alert('エクスポート中にエラーが発生しました');
    } finally {
      setIsExporting(false);
    }
  };

  const buttonDisabled = isLoading || articles.length === 0 || isExporting;

  return (
    <div className="flex gap-3">
      <button
        onClick={exportToCSV}
        disabled={buttonDisabled}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
          buttonDisabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
        title={`${articles.length}件の広告なし記事をCSV形式でエクスポート`}
      >
        {isExporting ? (
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        CSV出力
      </button>

      <button
        onClick={exportToJSON}
        disabled={buttonDisabled}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
          buttonDisabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
        title={`${articles.length}件の広告なし記事をJSON形式でエクスポート`}
      >
        {isExporting ? (
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2v0a2 2 0 01-2-2v-2a2 2 0 00-2-2H8z" />
          </svg>
        )}
        JSON出力
      </button>

      {articles.length > 0 && (
        <div className="flex items-center text-sm text-gray-600">
          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full">
            {articles.length}件の記事
          </span>
        </div>
      )}
    </div>
  );
}
