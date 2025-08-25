'use client';

import React, { useState, useEffect } from 'react';
import { getArticleAdMappings, getAdUsageStats, getLastSyncTime } from '@/lib/wordpress-sync-actions';
import MappingsTable from './MappingsTable';
import UsageStatsCard from './UsageStatsCard';
import SyncButton from './SyncButton';
import ExportButtons from './ExportButtons';
import type { ArticleAdMapping } from '@/lib/wordpress-sync-actions';

interface UsageStats {
  ad_id: string;
  usage_count: number;
  posts: Array<{
    post_id: number;
    post_title: string;
    post_url: string;
  }>;
}

export default function ArticleAdMappingClient() {
  const [mappings, setMappings] = useState<ArticleAdMapping[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [mappingsData, usageStatsData, lastSyncData] = await Promise.all([
        getArticleAdMappings().catch(() => []),
        getAdUsageStats().catch(() => []),
        getLastSyncTime().catch(() => null),
      ]);

      setMappings(mappingsData);
      setUsageStats(usageStatsData);
      setLastSyncTime(lastSyncData);
    } catch (err) {
      console.error('データ読み込みエラー:', err);
      setError('データの読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSyncComplete = () => {
    loadData();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        
        <div className="animate-pulse bg-gray-200 rounded-lg h-32"></div>
        
        <div className="animate-pulse">
          <div className="bg-gray-200 rounded-lg h-96"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-red-900 mb-2">
            エラーが発生しました
          </h3>
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadData}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors cursor-pointer"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">記事広告マッピング</h1>
          <p className="text-gray-600 mt-2">
            WordPress側で管理されている記事と広告の紐付け状況を確認できます
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <SyncButton onSyncComplete={handleSyncComplete} />
        </div>
      </div>

      {/* 概要情報 */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold">{mappings.length}</div>
            <div className="text-purple-100">総紐付け数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">
              {new Set(mappings.map(m => m.post_id)).size}
            </div>
            <div className="text-purple-100">記事数</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold">
              {new Set(mappings.map(m => m.ad_id)).size}
            </div>
            <div className="text-purple-100">広告種類数</div>
          </div>
        </div>
      </div>

      {/* エクスポートボタン */}
      <div className="flex justify-end">
        <ExportButtons />
      </div>

      {/* メインコンテンツ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* 紐付け一覧 */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">紐付け一覧</h2>
            </div>
            <div className="p-6">
              <MappingsTable 
                mappings={mappings} 
                lastSyncTime={lastSyncTime}
              />
            </div>
          </div>
        </div>

        {/* 使用統計 */}
        <div className="xl:col-span-1">
          <UsageStatsCard usageStats={usageStats} />
        </div>
      </div>

      {/* WordPress連携に関する説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">
          📘 WordPress連携について
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          <p>
            • 記事と広告の紐付けは <strong>WordPress側で管理</strong> されています
          </p>
          <p>
            • ショートコード <code className="bg-blue-100 px-2 py-1 rounded">[lmg_ad id="xxx"]</code> を記事に埋め込むことで紐付けを作成
          </p>
          <p>
            • この画面では紐付け状況の <strong>閲覧・レポート出力のみ</strong> 可能です
          </p>
          <p>
            • 最新の紐付け状況を確認するには「WordPress同期」ボタンをクリックしてください
          </p>
        </div>
      </div>

      {/* 設定に関する注意 */}
      {mappings.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-yellow-900 mb-4">
            ⚙️ 初期設定について
          </h3>
          <div className="space-y-2 text-sm text-yellow-800">
            <p>
              紐付け情報を取得するには、以下の設定が必要です：
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>
                <strong>WordPress側</strong>: REST APIエンドポイント <code className="bg-yellow-100 px-2 py-1 rounded">/wp-json/lmg-ad-manager/v1/shortcode-usage</code> の実装
              </li>
              <li>
                <strong>管理システム側</strong>: 環境変数 <code className="bg-yellow-100 px-2 py-1 rounded">WORDPRESS_API_URL</code> の設定
              </li>
            </ul>
            <p className="mt-3">
              設定完了後、「WordPress同期」ボタンをクリックして紐付け情報を取得してください。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}