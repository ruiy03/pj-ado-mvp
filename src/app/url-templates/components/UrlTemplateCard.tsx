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
            className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors cursor-pointer"
            title="編集"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-600 hover:text-red-800 p-1 rounded transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
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
          <label className="block text-xs font-medium text-gray-500 mb-1">URLテンプレート</label>
          <div className="bg-gray-50 p-2 rounded border">
            <code className="text-sm text-gray-800 break-all">{template.url_template}</code>
          </div>
        </div>

        {(() => {
          // URLテンプレートからパラメータを抽出
          const extractParams = (urlTemplate: string) => {
            try {
              const urlParts = urlTemplate.split('?');
              if (urlParts.length < 2) return {};
              
              const queryString = urlParts[1];
              const params = queryString.split('&');
              const extractedParams: Record<string, string> = {};
              
              for (const param of params) {
                const [key, value] = param.split('=');
                if (key && value) {
                  extractedParams[key] = value;
                }
              }
              
              return extractedParams;
            } catch {
              return {};
            }
          };

          const urlParams = extractParams(template.url_template);

          return Object.keys(urlParams).length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">パラメータ</label>
              <div className="bg-gray-50 p-2 rounded border space-y-1">
                {Object.entries(urlParams).map(([key, value]) => (
                  <div key={key} className="text-sm flex items-center">
                    <span className="text-blue-600 font-medium w-24">{key}</span>
                    <span className="text-gray-400 mx-2">=</span>
                    <span className="text-gray-800 flex-1">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}


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
