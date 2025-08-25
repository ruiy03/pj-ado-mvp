'use client';

import React, {useState} from 'react';
import {ExternalLink, Search, Eye} from 'lucide-react';
import Link from 'next/link';
import type {ArticleAdMapping} from '@/lib/wordpress-sync-actions';

interface MappingsTableProps {
  mappings: ArticleAdMapping[];
  lastSyncTime: string | null;
}

export default function MappingsTable({mappings, lastSyncTime}: MappingsTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAdId, setFilterAdId] = useState('');

  // フィルタリング処理
  const filteredMappings = mappings.filter(mapping => {
    const matchesSearch = !searchTerm ||
      mapping.post_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.post_url?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.post_id.toString().includes(searchTerm);

    const matchesAdId = !filterAdId || mapping.ad_id === filterAdId;

    return matchesSearch && matchesAdId;
  });

  // 広告IDの一覧を取得（フィルター用）
  const uniqueAdIds = Array.from(new Set(mappings.map(m => m.ad_id))).sort();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  return (
    <div className="space-y-4">
      {/* ヘッダー情報 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex justify-between items-center text-sm text-blue-800">
          <span>
            <strong>総件数:</strong> {mappings.length}件
            {filteredMappings.length !== mappings.length && (
              <span className="ml-2">
                (フィルター後: {filteredMappings.length}件)
              </span>
            )}
          </span>
          {lastSyncTime && (
            <span>
              <strong>最終同期:</strong> {formatDate(lastSyncTime)}
            </span>
          )}
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white p-4 rounded-lg border space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              記事検索
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4"/>
              <input
                type="text"
                placeholder="記事タイトル、URL、IDで検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              広告IDでフィルター
            </label>
            <select
              value={filterAdId}
              onChange={(e) => setFilterAdId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">すべての広告ID</option>
              {uniqueAdIds.map(adId => (
                <option key={adId} value={adId}>
                  {adId}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-lg border overflow-hidden">
        {filteredMappings.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">
              {mappings.length === 0 ? '紐付け情報がありません' : '検索結果がありません'}
            </h3>
            <p className="text-gray-400">
              {mappings.length === 0
                ? 'WordPress同期を実行して紐付け情報を取得してください'
                : '検索条件を変更してお試しください'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  記事情報
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  広告ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  最終同期日時
                </th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {filteredMappings.map((mapping) => (
                <tr key={`${mapping.post_id}-${mapping.ad_id}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">
                            {mapping.post_title || `記事ID: ${mapping.post_id}`}
                          </span>
                        {mapping.post_url && (
                          <a
                            href={mapping.post_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700"
                          >
                            <ExternalLink className="w-4 h-4"/>
                          </a>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        ID: {mapping.post_id}
                      </div>
                      {mapping.post_url && (
                        <div className="text-xs text-gray-400 truncate max-w-xs">
                          {mapping.post_url}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                        <span
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {mapping.ad_id}
                        </span>
                      <Link
                        href={`/ads/${mapping.ad_id}/edit`}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Eye className="w-4 h-4"/>
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(mapping.synced_at)}
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
