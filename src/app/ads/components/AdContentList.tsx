'use client';

import { useState, useEffect } from 'react';
import AdContentCard from './AdContentCard';
import type { AdContent } from '@/lib/definitions';
import Link from 'next/link';

export default function AdContentList() {
  const [contents, setContents] = useState<AdContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/ad-contents');
      
      if (!response.ok) {
        throw new Error('広告コンテンツの取得に失敗しました');
      }
      
      const data = await response.json();
      setContents(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この広告コンテンツを削除してもよろしいですか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/ad-contents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('削除に失敗しました');
      }

      await fetchContents();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'エラーが発生しました');
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
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="text-red-600 text-sm">{error}</div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-600 hover:text-red-800 cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {contents.length === 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">📢</div>
              <h3 className="text-lg font-medium mb-2">広告コンテンツがありません</h3>
              <p className="text-gray-400">新しい広告コンテンツを作成して始めましょう</p>
              <Link
                href="/ads/create"
                className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors cursor-pointer"
              >
                最初の広告を作成
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {contents.map((content) => (
            <AdContentCard
              key={content.id}
              content={content}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
