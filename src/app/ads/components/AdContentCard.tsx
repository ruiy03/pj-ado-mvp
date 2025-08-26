'use client';

import {useState} from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type {AdContent} from '@/lib/definitions';
import {formatDateJST} from '@/lib/date-utils';
import DeliveryCodeModal from '@/components/DeliveryCodeModal';

interface AdContentCardProps {
  content: AdContent;
  onDelete: (id: number) => void;
  onStatusChange?: (id: number, status: string) => void;
}

export default function AdContentCard({
                                        content,
                                        onDelete,
                                        onStatusChange
                                      }: AdContentCardProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [showDeliveryCode, setShowDeliveryCode] = useState(false);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'active':
        return 'アクティブ';
      case 'paused':
        return '停止中';
      case 'draft':
        return '下書き';
      case 'archived':
        return 'アーカイブ';
      default:
        return status;
    }
  };


  const generatePreview = (): string => {
    if (!content.template?.html) return '';

    let html = content.template.html;
    const contentData = content.content_data || {};

    // プレースホルダーを実際の値に置換
    Object.entries(contentData).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      html = html.replace(regex, String(value || ''));
    });

    return html;
  };

  const getPreviewImages = (): string[] => {
    return content.images?.map(img => img.blob_url) || [];
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
      <div className="p-6">
        {/* ヘッダー */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-3">
          <div className="overflow-hidden">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 break-words">{content.name}</h3>
            <div className="flex flex-col gap-2 text-sm text-gray-600">
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(content.status)}`}>
                  {getStatusText(content.status)}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {content.template && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                    {content.template.name}
                  </span>
                )}
                {content.url_template && (
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs whitespace-nowrap">
                    {content.url_template.name}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* アクションボタン */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50 cursor-pointer"
            >
              {showPreview ? '非表示' : 'プレビュー'}
            </button>
            <button
              onClick={() => setShowDeliveryCode(true)}
              className="text-sm text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50 cursor-pointer"
            >
              配信コード
            </button>
            <Link
              href={`/ads/${content.id}/edit`}
              className="text-sm text-gray-600 hover:text-gray-800 px-2 py-1 rounded hover:bg-gray-50 cursor-pointer"
            >
              編集
            </Link>
            <button
              onClick={() => onDelete(content.id)}
              className="text-sm text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 cursor-pointer"
            >
              削除
            </button>
          </div>
        </div>

        {/* 画像プレビュー */}
        {getPreviewImages().length > 0 && (
          <div className="mb-4">
            <div className="flex gap-2 overflow-x-auto">
              {getPreviewImages().slice(0, 3).map((imageUrl, index) => (
                <div key={index} className="flex-shrink-0">
                  <Image
                    src={imageUrl}
                    alt={`Preview ${index + 1}`}
                    width={80}
                    height={60}
                    className="w-16 h-12 sm:w-20 sm:h-12 rounded border object-cover"
                  />
                </div>
              ))}
              {getPreviewImages().length > 3 && (
                <div
                  className="flex-shrink-0 w-16 h-12 sm:w-20 sm:h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500">
                  +{getPreviewImages().length - 3}
                </div>
              )}
            </div>
          </div>
        )}

        {/* プレビュー表示 */}
        {showPreview && content.template && (
          <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700 mb-2">広告プレビュー</h4>
            <div
              className="bg-white p-3 rounded border"
              dangerouslySetInnerHTML={{__html: generatePreview()}}
            />
          </div>
        )}

        {/* 配信情報 */}
        {content.status === 'active' && (
          <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="text-sm font-medium text-blue-900 mb-2">配信設定</h4>
            <div className="space-y-2 text-sm text-blue-800">
              <div className="flex items-center justify-between">
                <span>配信ID:</span>
                <code className="bg-blue-100 px-2 py-1 rounded text-xs">{content.id}</code>
              </div>
              <div className="text-xs text-blue-600">
                <div>WordPress: <code className="bg-blue-100 px-1 rounded">[lmg_ad id=&quot;{content.id}&quot;]</code></div>
                <div className="mt-1">API: <code className="bg-blue-100 px-1 rounded">/api/delivery/{content.id}</code></div>
              </div>
              {(content.impressions || content.clicks) ? (
                <div className="flex items-center justify-between text-xs">
                  <span>表示: {(content.impressions || 0).toLocaleString()}</span>
                  <span>クリック: {(content.clicks || 0).toLocaleString()}</span>
                  <span>CTR: {content.impressions ? ((content.clicks || 0) / content.impressions * 100).toFixed(2) : '0'}%</span>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* メタ情報 */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs text-gray-500 gap-2">
          <div className="truncate">
            作成者: {content.created_by_user?.name || '不明'}
          </div>
          <div className="text-left sm:text-right">
            <div>作成: {formatDateJST(content.created_at) || '-'}</div>
            {content.updated_at && content.updated_at !== content.created_at && (
              <div>更新: {formatDateJST(content.updated_at) || '-'}</div>
            )}
          </div>
        </div>

        {/* ステータス変更 */}
        {content.status !== 'archived' && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">ステータス変更:</span>
              <select
                value={content.status}
                onChange={(e) => onStatusChange?.(content.id, e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
              >
                <option value="draft">下書き</option>
                <option value="active">アクティブ</option>
                <option value="paused">停止中</option>
                <option value="archived">アーカイブ</option>
              </select>
            </div>
          </div>
        )}

        {/* 配信コードモーダル */}
        <DeliveryCodeModal
          isOpen={showDeliveryCode}
          onClose={() => setShowDeliveryCode(false)}
          adId={content.id}
          adName={content.name}
        />
      </div>
    </div>
  );
}
