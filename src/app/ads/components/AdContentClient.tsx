'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { 
  AdContent, 
  AdTemplate
} from '@/lib/definitions';
import AdContentCard from './AdContentCard';

interface AdContentClientProps {
  initialContents: AdContent[];
  templates: AdTemplate[];
}

export default function AdContentClient({ 
  initialContents, 
  templates
}: AdContentClientProps) {
  const searchParams = useSearchParams();
  const [contents, setContents] = useState<AdContent[]>(initialContents);
  const [filteredContents, setFilteredContents] = useState<AdContent[]>(initialContents);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [templateFilter, setTemplateFilter] = useState('');
  const [sortBy, setSortBy] = useState('updated_at_desc');
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(9); // 3x3のグリッドレイアウトに合わせて9個

  // URLパラメータから検索クエリを読み取り
  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  // フィルタリング処理
  useEffect(() => {
    let filtered = contents;

    // 検索フィルタ
    if (searchTerm) {
      filtered = filtered.filter(content =>
        content.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // ステータスフィルタ
    if (statusFilter) {
      filtered = filtered.filter(content => content.status === statusFilter);
    }

    // テンプレートフィルタ
    if (templateFilter) {
      filtered = filtered.filter(content => 
        content.template_id === parseInt(templateFilter)
      );
    }

    // ソート
    const sortedFiltered = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name_asc':
          return a.name.localeCompare(b.name, 'ja');
        case 'name_desc':
          return b.name.localeCompare(a.name, 'ja');
        case 'created_at_asc':
          return new Date(a.created_at || '').getTime() - new Date(b.created_at || '').getTime();
        case 'created_at_desc':
          return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
        case 'updated_at_asc':
          return new Date(a.updated_at || '').getTime() - new Date(b.updated_at || '').getTime();
        case 'updated_at_desc':
        default:
          return new Date(b.updated_at || '').getTime() - new Date(a.updated_at || '').getTime();
      }
    });

    setFilteredContents(sortedFiltered);
    
    // フィルタが変更されたらページを1にリセット
    if (currentPage > 1) {
      setCurrentPage(1);
    }
  }, [contents, searchTerm, statusFilter, templateFilter, sortBy, currentPage]);

  // ページネーション用の計算
  const totalItems = filteredContents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = filteredContents.slice(startIndex, endIndex);

  // ページ変更
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // データ再読み込み
  const refreshContents = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ad-contents');
      if (response.ok) {
        const data = await response.json();
        setContents(data);
      } else {
        // Failed to fetch ad contents - handled by UI state
      }
    } catch (_error) {
      // Error fetching ad contents - handled by loading state
    } finally {
      setLoading(false);
    }
  };


  // 削除
  const handleDelete = async (id: number) => {
    if (!confirm('この広告コンテンツを削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/ad-contents/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '削除に失敗しました');
      }

      await refreshContents();
    } catch (error) {
      // Delete error - handled in alert message
      alert(error instanceof Error ? error.message : '削除に失敗しました');
    }
  };

  // ステータス変更
  const handleStatusChange = async (id: number, status: string) => {
    try {
      const response = await fetch(`/api/ad-contents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'ステータス変更に失敗しました');
      }

      await refreshContents();
    } catch (error) {
      // Status change error - handled in alert message
      alert(error instanceof Error ? error.message : 'ステータス変更に失敗しました');
    }
  };

  // フィルタのリセット
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTemplateFilter('');
    setSortBy('updated_at_desc');
    setCurrentPage(1);
  };


  return (
    <div>
      {/* ヘッダー */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">広告管理</h1>
        <Link
          href="/ads/create"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
        >
          新しい広告を作成
        </Link>
      </div>

      {/* フィルタ */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <input
              type="text"
              placeholder="広告名で検索..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">すべてのステータス</option>
              <option value="active">アクティブ</option>
              <option value="paused">停止中</option>
              <option value="draft">下書き</option>
              <option value="archived">アーカイブ</option>
            </select>
          </div>
          <div>
            <select
              value={templateFilter}
              onChange={(e) => setTemplateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">すべてのテンプレート</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="updated_at_desc">更新日時（新しい順）</option>
              <option value="updated_at_asc">更新日時（古い順）</option>
              <option value="created_at_desc">作成日時（新しい順）</option>
              <option value="created_at_asc">作成日時（古い順）</option>
              <option value="name_asc">広告名（昇順）</option>
              <option value="name_desc">広告名（降順）</option>
            </select>
          </div>
          <div>
            <button
              onClick={resetFilters}
              className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors cursor-pointer"
            >
              フィルタをリセット
            </button>
          </div>
        </div>
      </div>

      {/* ローディング */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">読み込み中...</p>
        </div>
      )}

      {/* 結果情報 */}
      {!loading && filteredContents.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          {totalItems}件中 {startIndex + 1}-{Math.min(endIndex, totalItems)}件を表示
        </div>
      )}

      {/* コンテンツリスト */}
      {!loading && (
        <div>
          {currentItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {currentItems.map(content => (
                <AdContentCard
                  key={content.id}
                  content={content}
                  onDelete={handleDelete}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-medium mb-2 text-gray-900">
                {searchTerm || statusFilter || templateFilter 
                  ? '該当する広告がありません' 
                  : '広告がありません'
                }
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || statusFilter || templateFilter 
                  ? 'フィルタ条件を変更してお試しください' 
                  : '最初の広告を作成してみましょう'
                }
              </p>
              {!(searchTerm || statusFilter || templateFilter) && (
                <Link
                  href="/ads/create"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors cursor-pointer inline-block"
                >
                  最初の広告を作成
                </Link>
              )}
            </div>
          )}
        </div>
      )}

      {/* ページネーション */}
      {!loading && totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center">
          <div className="flex items-center space-x-1">
            {/* 前のページ */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              前へ
            </button>
            
            {/* ページ番号 */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
              // 現在のページの周囲のページのみ表示
              const shouldShow = page === 1 || page === totalPages || 
                               (page >= currentPage - 2 && page <= currentPage + 2);
              
              if (!shouldShow) {
                // 省略記号を表示
                if (page === currentPage - 3 || page === currentPage + 3) {
                  return (
                    <span key={page} className="px-3 py-2 text-sm font-medium text-gray-500">
                      ...
                    </span>
                  );
                }
                return null;
              }
              
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium border cursor-pointer ${
                    page === currentPage
                      ? 'z-10 bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
                >
                  {page}
                </button>
              );
            })}
            
            {/* 次のページ */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              次へ
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
