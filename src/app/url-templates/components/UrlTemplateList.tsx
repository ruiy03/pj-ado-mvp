'use client';

import { useUrlTemplates } from '../hooks/useUrlTemplates';
import UrlTemplateCard from './UrlTemplateCard';
import Link from 'next/link';

export default function UrlTemplateList() {
  const { templates, loading, error, setError, deleteTemplate } = useUrlTemplates();

  const handleDeleteTemplate = async (id: number) => {
    try {
      await deleteTemplate(id);
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

      {templates.length === 0 ? (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <div className="text-center py-12 text-gray-500">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-lg font-medium mb-2">URLテンプレートがありません</h3>
              <p className="text-gray-400">計測パラメータ付きのURLテンプレートを作成して始めましょう</p>
              <Link
                href="/url-templates/create"
                className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors cursor-pointer"
              >
                最初のテンプレートを作成
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <UrlTemplateCard
              key={template.id}
              template={template}
              onEdit={(template) => {
                // 編集ページに遷移
                window.location.href = `/url-templates/${template.id}/edit`;
              }}
              onDelete={handleDeleteTemplate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
