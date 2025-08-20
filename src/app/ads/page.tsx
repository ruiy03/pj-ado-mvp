'use client';

import ClientProtectedPage from '@/components/ClientProtectedPage';
import Link from 'next/link';
import AdContentList from './components/AdContentList';

export default function Ads() {
  return (
    <ClientProtectedPage>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">広告管理</h1>
          <Link
            href="/ads/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
          >
            新しい広告を作成
          </Link>
        </div>
        <AdContentList />
      </div>
    </ClientProtectedPage>
  );
}
