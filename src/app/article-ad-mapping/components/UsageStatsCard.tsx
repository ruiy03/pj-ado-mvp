import React from 'react';
import { BarChart3, ExternalLink } from 'lucide-react';

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

interface UsageStatsCardProps {
  usageStats: UsageStats[];
}

export default function UsageStatsCard({ usageStats }: UsageStatsCardProps) {
  if (usageStats.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="text-center text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-medium mb-2">使用統計がありません</h3>
          <p className="text-gray-400">WordPress同期を実行して統計を取得してください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-5 h-5 text-orange-500" />
          <h3 className="text-lg font-medium text-gray-900">広告使用統計</h3>
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {usageStats.slice(0, 10).map((stat) => (
          <div key={stat.ad_id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-1">
                <h4 className="text-lg font-medium text-gray-900">
                  {stat.ad_name || stat.ad_id}
                </h4>
                {stat.ad_name && (
                  <p className="text-sm text-purple-600 font-medium">
                    広告ID: {stat.ad_id}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  {stat.usage_count}件の記事で使用
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  {stat.usage_count}
                </div>
                <div className="text-xs text-gray-500">使用回数</div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-sm font-medium text-gray-700">使用記事:</h5>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {stat.posts.slice(0, 5).map((post) => (
                  <div key={post.post_id} className="flex items-center justify-between text-sm bg-gray-50 rounded px-3 py-2">
                    <div className="flex-1 min-w-0">
                      <div className="truncate font-medium text-gray-900">
                        {post.post_title}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {post.post_id}
                      </div>
                    </div>
                    {post.post_url && (
                      <a
                        href={post.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-blue-500 hover:text-blue-700 flex-shrink-0"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                ))}
                {stat.posts.length > 5 && (
                  <div className="text-xs text-gray-500 text-center py-2">
                    他 {stat.posts.length - 5} 件の記事
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {usageStats.length > 10 && (
        <div className="px-6 py-4 bg-gray-50 text-center">
          <p className="text-sm text-gray-500">
            他 {usageStats.length - 10} 件の広告統計があります
          </p>
        </div>
      )}
    </div>
  );
}