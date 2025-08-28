import React from 'react';
import type { CoverageStats } from '@/lib/wordpress-sync-actions';

interface CoverageStatsCardProps {
  stats: CoverageStats;
  isLoading?: boolean;
}

export default function CoverageStatsCard({ 
  stats, 
  isLoading = false 
}: CoverageStatsCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const { 
    totalArticles, 
    articlesWithAds, 
    articlesWithoutAds, 
    coveragePercentage, 
    categoryBreakdown 
  } = stats;

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📊 広告カバレッジ統計
        </h3>

        {/* 全体統計 */}
        <div className="space-y-4 mb-6">
          {/* カバレッジ率の円グラフ風表示 */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">カバレッジ率</span>
              <span className="text-2xl font-bold text-gray-900">{coveragePercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${coveragePercentage}%` }}
              ></div>
            </div>
          </div>

          {/* 数値統計 */}
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalArticles}</div>
              <div className="text-sm text-blue-800">総記事数</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{articlesWithAds}</div>
              <div className="text-sm text-green-800">広告設定済み</div>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{articlesWithoutAds}</div>
              <div className="text-sm text-orange-800">広告なし</div>
            </div>
          </div>
        </div>

        {/* カテゴリ別詳細 */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">カテゴリ別詳細</h4>
            <div className="space-y-3">
              {Object.entries(categoryBreakdown)
                .sort(([,a], [,b]) => b.total - a.total) // 記事数の多い順
                .map(([category, data]) => (
                  <div key={category} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 text-sm">{category}</span>
                      <span className="text-sm font-semibold text-gray-700">
                        {data.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${data.percentage}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-600">
                      <span>
                        広告あり: {data.withAds}件
                      </span>
                      <span>
                        広告なし: {data.withoutAds}件
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      総記事数: {data.total}件
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* 改善提案 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h5 className="text-sm font-medium text-gray-900 mb-2">💡 改善提案</h5>
          <div className="text-sm text-gray-700 space-y-1">
            {coveragePercentage >= 90 && (
              <p>✅ 優秀なカバレッジ率です！引き続き維持していきましょう。</p>
            )}
            {coveragePercentage >= 70 && coveragePercentage < 90 && (
              <p>👍 良好なカバレッジ率です。残り{articlesWithoutAds}件の記事に広告を設定することで、さらに収益向上が期待できます。</p>
            )}
            {coveragePercentage >= 50 && coveragePercentage < 70 && (
              <p>📈 カバレッジ率を向上させる余地があります。特に記事数の多いカテゴリから優先的に広告設定を行うことをおすすめします。</p>
            )}
            {coveragePercentage < 50 && (
              <p>🚀 大きな改善余地があります。{articlesWithoutAds}件の未設定記事に広告を追加することで、大幅な収益向上が期待できます。</p>
            )}
          </div>
        </div>

        {/* データの注意事項 */}
        <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-400">
          <div className="text-sm text-blue-800">
            <strong>📝 データについて:</strong>
            <ul className="mt-1 list-disc list-inside space-y-1">
              <li>統計はWordPress側の最新データに基づいています</li>
              <li>「WordPress同期」ボタンで最新状態に更新できます</li>
              <li>下書きや非公開記事は含まれません</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
