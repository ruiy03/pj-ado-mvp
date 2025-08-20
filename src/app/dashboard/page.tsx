'use client';

import ClientProtectedPage from '@/components/ClientProtectedPage';
import {useState, useEffect} from 'react';
import {useSession} from 'next-auth/react';
import type {AdTemplate, UrlTemplate, AdContent} from '@/lib/definitions';
import IntegrityMonitor from './components/IntegrityMonitor';

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
  const { data: session } = useSession();
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

      // 広告テンプレート数を取得
      const templatesResponse = await fetch('/api/templates');
      const templates = templatesResponse.ok ? await templatesResponse.json() : [];

      // URLテンプレート数を取得
      const urlTemplatesResponse = await fetch('/api/url-templates');
      const urlTemplatesData = urlTemplatesResponse.ok ? await urlTemplatesResponse.json() : {templates: []};
      const urlTemplates = urlTemplatesData.templates || [];

      // 広告コンテンツ数を取得
      const adContentsResponse = await fetch('/api/ad-contents');
      const adContents = adContentsResponse.ok ? await adContentsResponse.json() : [];

      setStats({
        totalAds: adContents.length,
        adTemplates: templates.length,
        urlTemplates: urlTemplates.length,
        articlesWithoutAds: 0, // 今後実装予定
      });

      // 最近の活動を設定（テンプレート作成日時から生成）
      const adTemplateActivities: Activity[] = templates
        .map((template: AdTemplate, index: number) => ({
          id: index + 1,
          message: `広告テンプレート「${template.name}」が作成されました`,
          date: template.created_at ? new Date(template.created_at).toLocaleDateString('ja-JP') : '最近',
          type: 'create' as const,
          created_at: template.created_at,
        }));

      // URLテンプレートの活動を追加
      const urlTemplateActivities: Activity[] = urlTemplates
        .map((template: UrlTemplate, index: number) => ({
          id: templates.length + index + 1,
          message: `URLテンプレート「${template.name}」が作成されました`,
          date: template.created_at ? new Date(template.created_at).toLocaleDateString('ja-JP') : '最近',
          type: 'create' as const,
          created_at: template.created_at,
        }));

      // 広告コンテンツの活動を追加
      const adContentActivities: Activity[] = adContents
        .map((content: AdContent, index: number) => ({
          id: templates.length + urlTemplates.length + index + 1,
          message: `広告コンテンツ「${content.name}」が作成されました`,
          date: content.created_at ? new Date(content.created_at).toLocaleDateString('ja-JP') : '最近',
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
    } catch (error) {
      setError('データの取得に失敗しました');
      if (process.env.NODE_ENV !== 'test') {
        console.error('Dashboard data fetch error:', error);
      }
    } finally {
      setLoading(false);
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
          <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">総広告数</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalAds}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">広告テンプレート数</h3>
              <p className="text-3xl font-bold text-green-600">{stats.adTemplates}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">URLテンプレート数</h3>
              <p className="text-3xl font-bold text-purple-600">{stats.urlTemplates}</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">広告なし記事数</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.articlesWithoutAds}</p>
            </div>
          </div>

          {/* 管理者用の整合性監視 */}
          {isAdmin && (
            <IntegrityMonitor />
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
