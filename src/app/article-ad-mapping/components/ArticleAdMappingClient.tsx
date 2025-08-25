'use client';

import React, {useState, useEffect} from 'react';
import {useSearchParams} from 'next/navigation';
import {getArticleAdMappings, getAdUsageStats, getLastSyncTime} from '@/lib/wordpress-sync-actions';
import MappingsTable from './MappingsTable';
import UsageStatsCard from './UsageStatsCard';
import SyncButton from './SyncButton';
import ExportButtons from './ExportButtons';
import ArticlesWithoutAdsTable from './ArticlesWithoutAdsTable';
import CoverageStatsCard from './CoverageStatsCard';
import ArticlesWithoutAdsExportButtons from './ArticlesWithoutAdsExportButtons';
import type {ArticleAdMapping, WordPressArticle, CoverageStats} from '@/lib/wordpress-sync-actions';

interface UsageStats {
  ad_id: string;
  ad_name?: string; // 広告名を追加
  usage_count: number;
  posts: Array<{
    post_id: number;
    post_title: string;
    post_url: string;
  }>;
}

type TabType = 'mappings' | 'coverage';

export default function ArticleAdMappingClient() {
  const searchParams = useSearchParams();
  const [mappings, setMappings] = useState<ArticleAdMapping[]>([]);
  const [usageStats, setUsageStats] = useState<UsageStats[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 新機能の状態 - URLパラメータから初期タブを決定
  const initialTab = (searchParams.get('tab') as TabType) || 'mappings';
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [articlesWithoutAds, setArticlesWithoutAds] = useState<WordPressArticle[]>([]);
  const [coverageStats, setCoverageStats] = useState<CoverageStats | null>(null);
  const [articlesLoading, setArticlesLoading] = useState(false);

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

    // URLパラメータでcoverageタブが指定されている場合、広告なし記事データも読み込む
    if (initialTab === 'coverage') {
      loadArticlesWithoutAds();
    }
  }, [initialTab]);

  const handleSyncComplete = () => {
    loadData();
    // 広告なし記事データもリフレッシュ
    if (activeTab === 'coverage') {
      loadArticlesWithoutAds();
    }
  };

  // 広告なし記事データの読み込み
  const loadArticlesWithoutAds = async () => {
    try {
      setArticlesLoading(true);
      const response = await fetch('/api/articles/without-ads');

      if (!response.ok) {
        throw new Error('広告なし記事の取得に失敗しました');
      }

      const data = await response.json();
      setArticlesWithoutAds(data.articles);
      setCoverageStats(data.stats);
    } catch (err) {
      console.error('広告なし記事読み込みエラー:', err);
      setError(err instanceof Error ? err.message : '広告なし記事の取得に失敗しました');
    } finally {
      setArticlesLoading(false);
    }
  };

  // タブが変更された時の処理
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);

    // 初回の広告なし記事データ読み込み
    if (tab === 'coverage' && articlesWithoutAds.length === 0 && !coverageStats) {
      loadArticlesWithoutAds();
    }
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
            WordPress側で管理されている記事と広告の紐付け状況を確認・分析できます
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <SyncButton onSyncComplete={handleSyncComplete}/>
        </div>
      </div>

      {/* タブナビゲーション */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('mappings')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'mappings'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 紐付け済み記事
            <span className="ml-2 bg-gray-100 text-gray-900 py-1 px-2 rounded-full text-xs">
              {mappings.length}
            </span>
          </button>
          <button
            onClick={() => handleTabChange('coverage')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors cursor-pointer ${
              activeTab === 'coverage'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📈 広告カバレッジ分析
            {articlesWithoutAds.length > 0 && (
              <span className="ml-2 bg-orange-100 text-orange-900 py-1 px-2 rounded-full text-xs">
                {articlesWithoutAds.length}件未設定
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* 概要情報 - タブに応じて表示 */}
      {activeTab === 'mappings' && (
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
      )}

      {activeTab === 'coverage' && coverageStats && (
        <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{coverageStats.totalArticles}</div>
              <div className="text-orange-100">総記事数</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{coverageStats.articlesWithoutAds}</div>
              <div className="text-orange-100">広告なし</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{coverageStats.coveragePercentage}%</div>
              <div className="text-orange-100">カバレッジ率</div>
            </div>
          </div>
        </div>
      )}

      {/* エクスポートボタン - タブに応じて表示 */}
      {activeTab === 'mappings' && (
        <div className="flex justify-end">
          <ExportButtons/>
        </div>
      )}

      {activeTab === 'coverage' && (
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            📤 広告なし記事のデータをエクスポートできます
          </div>
          <ArticlesWithoutAdsExportButtons
            articles={articlesWithoutAds}
            isLoading={articlesLoading}
          />
        </div>
      )}

      {/* メインコンテンツ - タブに応じて切り替え */}
      {activeTab === 'mappings' && (
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
            <UsageStatsCard usageStats={usageStats}/>
          </div>
        </div>
      )}

      {activeTab === 'coverage' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <ArticlesWithoutAdsTable
              articles={articlesWithoutAds}
              isLoading={articlesLoading}
            />
          </div>
          <div className="xl:col-span-1">
            <CoverageStatsCard
              stats={coverageStats || {
                totalArticles: 0,
                articlesWithAds: 0,
                articlesWithoutAds: 0,
                coveragePercentage: 0,
                categoryBreakdown: {}
              }}
              isLoading={articlesLoading}
            />
          </div>
        </div>
      )}

      {/* WordPress連携に関する説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-4">
          📘 WordPress連携について
        </h3>
        <div className="space-y-2 text-sm text-blue-800">
          {activeTab === 'mappings' && (
            <>
              <p>
                • 記事と広告の紐付けは <strong>WordPress側で管理</strong> されています
              </p>
              <p>
                • ショートコード <code className="bg-blue-100 px-2 py-1 rounded">[lmg_ad
                id=&quot;xxx&quot;]</code> を記事に埋め込むことで紐付けを作成
              </p>
              <p>
                • この画面では紐付け状況の <strong>閲覧・レポート出力のみ</strong> 可能です
              </p>
            </>
          )}
          {activeTab === 'coverage' && (
            <>
              <p>
                • <strong>広告カバレッジ分析</strong>では広告なし記事の特定と統計分析ができます
              </p>
              <p>
                • カバレッジ率は全記事に対する広告設定済み記事の割合です
              </p>
              <p>
                • カテゴリ別の詳細分析で改善すべき領域を特定し、優先度の高い記事から対応しましょう
              </p>
              <p>
                • 90%以上のカバレッジ率を目標にすることをおすすめします
              </p>
            </>
          )}
          <p>
            • 最新の状況を確認するには「WordPress同期」ボタンをクリックしてください
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
                <strong>WordPress側</strong>: REST APIエンドポイント <code
                className="bg-yellow-100 px-2 py-1 rounded">/wp-json/lmg-ad-manager/v1/shortcode-usage</code> の実装
              </li>
              <li>
                <strong>管理システム側</strong>: 環境変数 <code
                className="bg-yellow-100 px-2 py-1 rounded">WORDPRESS_API_URL</code> の設定
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
