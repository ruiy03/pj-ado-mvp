'use client';

import type { AdTemplate } from '@/lib/definitions';
import { getSampleValue, extractPlaceholders } from '@/lib/template-utils';
import Link from 'next/link';

interface TemplateListProps {
  templates: AdTemplate[];
  onDelete: (id: number) => void;
  searchTerm?: string;
}

export default function TemplateList({ templates, onDelete }: TemplateListProps) {
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

  const renderTemplate = (template: AdTemplate) => {
    let previewHtml = template.html;

    const placeholders = extractPlaceholders(template.html);
    placeholders.forEach((placeholder: string) => {
      const regex = new RegExp(`{{${placeholder}}}`, 'g');
      const sampleValue = getSampleValue(placeholder);
      previewHtml = previewHtml.replace(regex, sampleValue);
    });

    return (
      <div
        dangerouslySetInnerHTML={{__html: previewHtml}}
        className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm max-w-full overflow-hidden"
        style={{
          minHeight: '120px',
          fontSize: '14px',
          lineHeight: '1.4'
        }}
      />
    );
  };

  if (templates.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="text-center py-12 text-gray-500">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-lg font-medium mb-2">テンプレートがありません</h3>
            <p className="text-gray-400">広告テンプレートを作成して始めましょう</p>
            <Link
              href="/ad-templates/create"
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors cursor-pointer inline-block"
            >
              最初のテンプレートを作成
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-gray-900">テンプレート一覧</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                    <div className="flex gap-2">
                      <Link
                        href={`/ad-templates/${template.id}/edit`}
                        className="text-blue-600 hover:text-blue-800 text-sm cursor-pointer"
                      >
                        編集
                      </Link>
                      <button
                        onClick={() => onDelete(template.id)}
                        className="text-red-600 hover:text-red-800 text-sm cursor-pointer"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                  {template.description && (
                    <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                  )}
                  <div className="text-xs text-gray-400">
                    プレースホルダー: {extractPlaceholders(template.html).join(', ')}
                  </div>
                </div>
                <div className="p-4 bg-gray-50">
                  <div className="text-xs text-gray-500 mb-3 font-medium">プレビュー:</div>
                  <div className="bg-white rounded border p-2">
                    {renderTemplate(template)}
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                  <span>作成: {formatDate(template.created_at)}</span>
                  {template.updated_at !== template.created_at && (
                    <span>更新: {formatDate(template.updated_at)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
