'use client';

import {useState} from 'react';
import type {UrlTemplate} from '@/lib/definitions';

interface UrlTemplateCardProps {
  template: UrlTemplate;
  onEdit: (template: UrlTemplate) => void;
  onDelete: (id: number) => Promise<void>;
}

export default function UrlTemplateCard({template, onEdit, onDelete}: UrlTemplateCardProps) {
  const [deleting, setDeleting] = useState(false);

  const buildFullUrl = () => {
    try {
      const url = new URL(template.url);
      Object.entries(template.parameters).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
      return url.toString();
    } catch {
      return template.url;
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('URLをクリップボードにコピーしました');
    } catch {
      alert('クリップボードへのコピーに失敗しました');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(template.id);
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
          {template.description && (
            <p className="text-gray-600 text-sm mb-3">{template.description}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(template)}
            className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
            title="編集"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-800 p-1 rounded transition-colors disabled:opacity-50"
            title="削除"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">ベースURL</label>
          <div className="bg-gray-50 p-2 rounded border">
            <code className="text-sm text-gray-800 break-all">{template.url}</code>
          </div>
        </div>

        {Object.keys(template.parameters).length > 0 && (
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">計測パラメータ</label>
            <div className="bg-gray-50 p-2 rounded border space-y-1">
              {Object.entries(template.parameters).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="text-gray-600">{key}</span>
                  <span className="text-gray-400 mx-1">=</span>
                  <span className="text-gray-800">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">完成URL</label>
          <div className="bg-blue-50 p-2 rounded border flex items-center justify-between">
            <code className="text-sm text-blue-800 break-all flex-1 mr-2">
              {buildFullUrl()}
            </code>
            <button
              onClick={() => copyToClipboard(buildFullUrl())}
              className="flex-shrink-0 text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
              title="URLをコピー"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
        <span>作成: {formatDate(template.created_at)}</span>
        {template.updated_at !== template.created_at && (
          <span>更新: {formatDate(template.updated_at)}</span>
        )}
      </div>
    </div>
  );
}