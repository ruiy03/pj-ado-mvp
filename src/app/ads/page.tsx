'use client';

import ClientProtectedPage from '@/components/ClientProtectedPage';
import Link from 'next/link';
import AdContentList from './components/AdContentList';
import {useState} from 'react';

export default function Ads() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  return (
    <ClientProtectedPage>
      <div className="space-y-6">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">広告管理</h1>
            <Link
              href="/ads/create"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
            >
              新しい広告を作成
            </Link>
          </div>

          {/* 検索・フィルタリング */}
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  広告検索
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="広告名で検索..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ステータスでフィルター
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">すべてのステータス</option>
                  <option value="draft">下書き</option>
                  <option value="active">アクティブ</option>
                  <option value="paused">一時停止</option>
                  <option value="archived">アーカイブ</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <AdContentList searchTerm={searchTerm} statusFilter={statusFilter}/>
      </div>
    </ClientProtectedPage>
  );
}
