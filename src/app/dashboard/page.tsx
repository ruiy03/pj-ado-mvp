'use client';

import ClientProtectedPage from '@/components/ClientProtectedPage';
import {useState, useEffect} from 'react';
import {useSession} from 'next-auth/react';
import Link from 'next/link';
import type {AdTemplate, UrlTemplate, AdContent} from '@/lib/definitions';
import IntegrityMonitor from './components/IntegrityMonitor';
import {formatDateOnlyJST} from '@/lib/date-utils';

interface DashboardStats {
  totalAds: number;
  adTemplates: number;
  urlTemplates: number;
  articlesWithoutAds: number;
}

interface Activity {
  id: number;
  message: string;
  date: string;
  type: 'create' | 'update' | 'delete' | 'system';
  created_at?: string;
}

export default function Dashboard() {
  const {data: session} = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalAds: 0,
    adTemplates: 0,
    urlTemplates: 0,
    articlesWithoutAds: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAdmin = session?.user?.role === 'admin';

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 並列でAPIを呼び出し
      const [
        templatesRes,
        urlTemplatesRes,
        adContentsRes,
        articlesRes
      ] = await Promise.allSettled([
        fetch('/api/templates'),
        fetch('/api/url-templates'),
        fetch('/api/ad-contents'),
        fetch('/api/articles/without-ads?stats_only=true')
      ]);

      // 各レスポンスを処理
      const templates = templatesRes.status === 'fulfilled' && templatesRes.value.ok
        ? await templatesRes.value.json() : [];

      const urlTemplatesData = urlTemplatesRes.status === 'fulfilled' && urlTemplatesRes.value.ok
        ? await urlTemplatesRes.value.json() : {templates: []};
      const urlTemplates = urlTemplatesData.templates || [];

      const adContents = adContentsRes.status === 'fulfilled' && adContentsRes.value.ok
        ? await adContentsRes.value.json() : [];

      const articlesData = articlesRes.status === 'fulfilled' && articlesRes.value.ok
        ? await articlesRes.value.json() : {stats: {}};

      setStats({
        totalAds: adContents.length,
        adTemplates: templates.length,
        urlTemplates: urlTemplates.length,
        articlesWithoutAds: articlesData.stats?.articlesWithoutAds || 0,
      });

      // 最近の活動を設定（テンプレート作成日時から生成）
      const adTemplateActivities: Activity[] = templates
        .map((template: AdTemplate, index: number) => ({
          id: index + 1,
          message: `広告テンプレート「${template.name}」が作成されました`,
          date: formatDateOnlyJST(template.created_at) || '最近',
          type: 'create' as const,
          created_at: template.created_at,
        }));

      // URLテンプレートの活動を追加
      const urlTemplateActivities: Activity[] = urlTemplates
        .map((template: UrlTemplate, index: number) => ({
          id: templates.length + index + 1,
          message: `URLテンプレート「${template.name}」が作成されました`,
          date: formatDateOnlyJST(template.created_at) || '最近',
          type: 'create' as const,
          created_at: template.created_at,
        }));

      // 広告コンテンツの活動を追加
      const adContentActivities: Activity[] = adContents
        .map((content: AdContent, index: number) => ({
          id: templates.length + urlTemplates.length + index + 1,
          message: `広告コンテンツ「${content.name}」が作成されました`,
          date: formatDateOnlyJST(content.created_at) || '最近',
          type: 'create' as const,
          created_at: content.created_at,
        }));

      // 全ての活動を結合し、作成日時でソートして最新10件を取得
      const allActivities = [...adTemplateActivities, ...urlTemplateActivities, ...adContentActivities];
      allActivities.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA; // 新しい順
      });

      const recentActivities = allActivities.slice(0, 10);

      if (recentActivities.length === 0) {
        recentActivities.push({
          id: 1,
          message: 'システム初期化完了',
          date: '今日',
          type: 'system',
        });
      }

      setActivities(recentActivities);
    } catch (_error) {
      setError('データの取得に失敗しました');
      // Dashboard data fetch error - error already handled in catch block
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ClientProtectedPage>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>

          {/* スケルトンローディング用のカード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            ))}
          </div>

          {/* 管理者用の整合性監視のスケルトン */}
          {isAdmin && (
            <div className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="flex items-center justify-between mb-6">
                <div className="h-6 bg-gray-200 rounded w-48"></div>
                <div className="h-10 bg-gray-200 rounded w-24"></div>
              </div>
              <div className="h-32 bg-gray-200 rounded w-full"></div>
            </div>
          )}

          {/* 最近の活動のスケルトン */}
          <div className="bg-white p-6 rounded-lg shadow animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </ClientProtectedPage>
    );
  }

  return (
    <ClientProtectedPage>
      <div>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/ads" className="block hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              <div className="bg-white p-6 rounded-lg shadow cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">総広告数</h3>
                <p className="text-3xl font-bold text-blue-600">{stats.totalAds}</p>
              </div>
            </Link>

            <Link href="/ad-templates"
                  className="block hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              <div className="bg-white p-6 rounded-lg shadow cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">広告テンプレート数</h3>
                <p className="text-3xl font-bold text-green-600">{stats.adTemplates}</p>
              </div>
            </Link>

            <Link href="/url-templates"
                  className="block hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              <div className="bg-white p-6 rounded-lg shadow cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">URLテンプレート数</h3>
                <p className="text-3xl font-bold text-purple-600">{stats.urlTemplates}</p>
              </div>
            </Link>

            <Link href="/article-ad-mapping?tab=coverage"
                  className="block hover:shadow-lg transition-all duration-200 transform hover:scale-105">
              <div className="bg-white p-6 rounded-lg shadow cursor-pointer">
                <h3 className="text-lg font-semibold text-gray-700 mb-2">広告なし記事数</h3>
                <p className="text-3xl font-bold text-orange-600">{stats.articlesWithoutAds}</p>
              </div>
            </Link>
          </div>

          {/* 管理者用の整合性監視 */}
          {isAdmin && (
            <IntegrityMonitor/>
          )}

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">最近の活動</h2>
            <div className="space-y-3">
              {activities.length > 0 ? (
                activities.map((activity) => (
                  <div key={activity.id}
                       className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                    <span className="text-gray-600">{activity.message}</span>
                    <span className="text-sm text-gray-500">{activity.date}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <p>活動履歴がここに表示されます</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ClientProtectedPage>
  );
}
