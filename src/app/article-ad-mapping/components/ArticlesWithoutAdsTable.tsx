'use client';

import React, { useState } from 'react';
import type { WordPressArticle } from '@/lib/wordpress-sync-actions';

interface ArticlesWithoutAdsTableProps {
  articles: WordPressArticle[];
  isLoading?: boolean;
}

interface FilterState {
  category: string;
  search: string;
}

export default function ArticlesWithoutAdsTable({ 
  articles, 
  isLoading = false 
}: ArticlesWithoutAdsTableProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'title' | 'published_at' | 'category'>('published_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // カテゴリ一覧を取得
  const categories = Array.from(new Set(articles.map(article => article.category || '未分類')));

  // フィルタリング
  const filteredArticles = articles.filter(article => {
    const matchesCategory = !filters.category || article.category === filters.category;
    const matchesSearch = !filters.search || 
      article.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      article.url.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // ソート
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    let aValue: string | Date;
    let bValue: string | Date;

    switch (sortBy) {
      case 'published_at':
        aValue = new Date(a.published_at);
        bValue = new Date(b.published_at);
        break;
      case 'category':
        aValue = a.category || '未分類';
        bValue = b.category || '未分類';
        break;
      case 'title':
      default:
        aValue = a.title;
        bValue = b.title;
        break;
    }

    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: typeof sortBy) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* フィルター */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">フィルター</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリー
            </label>
            <select
              id="category-filter"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">すべてのカテゴリー</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="search-filter" className="block text-sm font-medium text-gray-700 mb-1">
              検索
            </label>
            <input
              id="search-filter"
              type="text"
              placeholder="タイトルやURLで検索"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        {(filters.category || filters.search) && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {filteredArticles.length}件の記事が見つかりました
            </span>
            <button
              onClick={() => setFilters({ category: '', search: '' })}
              className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              フィルターをクリア
            </button>
          </div>
        )}
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-lg border">
        {sortedArticles.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              広告なし記事が見つかりません
            </h3>
            <p className="text-gray-600">
              {articles.length === 0 
                ? 'WordPressから記事データを取得してください' 
                : 'フィルター条件に一致する広告なし記事がありません'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('title')}
                  >
                    記事タイトル
                    {sortBy === 'title' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('category')}
                  >
                    カテゴリー
                    {sortBy === 'category' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort('published_at')}
                  >
                    公開日
                    {sortBy === 'published_at' && (
                      <span className="ml-1">
                        {sortOrder === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedArticles.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {article.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {article.id}
                        </div>
                        <div className="text-xs text-gray-400 truncate max-w-xs">
                          {article.url}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {article.category || '未分類'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(article.published_at).toLocaleDateString('ja-JP')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900 cursor-pointer transition-colors"
                      >
                        記事を表示
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* 件数表示 */}
        {sortedArticles.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
            <span className="text-sm text-gray-700">
              {sortedArticles.length} 件の広告なし記事
              {filteredArticles.length !== articles.length && (
                <span> （全{articles.length}件中）</span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
