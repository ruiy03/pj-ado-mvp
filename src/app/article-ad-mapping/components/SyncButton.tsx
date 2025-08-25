'use client';

import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface SyncButtonProps {
  onSyncComplete?: () => void;
}

export default function SyncButton({ onSyncComplete }: SyncButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    try {
      setIsLoading(true);
      setMessage(null);
      setError(null);

      const response = await fetch('/api/wordpress/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        // より詳細なエラーメッセージを表示
        let errorMessage = data.error || 'WordPress同期に失敗しました';
        
        // 設定に関するエラーの場合は、ヒントを追加
        if (errorMessage.includes('WordPress API URL が設定されていません')) {
          errorMessage += '\n環境変数 WORDPRESS_API_URL を設定してください';
        }
        
        // 詳細なエラー情報があれば追加
        if (data.details && Array.isArray(data.details)) {
          errorMessage += '\n詳細: ' + data.details.join(', ');
        }
        
        throw new Error(errorMessage);
      }

      setMessage(
        `同期完了: 追加 ${data.result.inserted}件, 更新 ${data.result.updated}件, 削除 ${data.result.deleted}件`
      );

      // エラーがある場合は警告として表示
      if (data.result.errors && data.result.errors.length > 0) {
        console.warn('同期中にエラーが発生:', data.result.errors);
        
        // 部分的な成功の場合はメッセージに追加
        setMessage(prev => 
          prev + `\n一部エラー: ${data.result.errors.length}件のエラーがありました`
        );
      }

      // 同期完了後のコールバック
      onSyncComplete?.();

      // 3秒後にメッセージを消去
      setTimeout(() => {
        setMessage(null);
      }, 3000);

    } catch (error) {
      console.error('WordPress同期エラー:', error);
      const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
      setError(errorMessage);

      // 10秒後にエラーメッセージを消去（設定エラーなので長めに表示）
      setTimeout(() => {
        setError(null);
      }, 10000);

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-start">
      <button
        onClick={handleSync}
        disabled={isLoading}
        className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer
          ${isLoading 
            ? 'bg-gray-400 text-white cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700 text-white'
          }
        `}
      >
        <RefreshCw 
          className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
        />
        <span>
          {isLoading ? 'WordPress同期中...' : 'WordPress同期'}
        </span>
      </button>

      {message && (
        <div className="mt-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded border border-green-200">
          {message}
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600 bg-red-50 px-3 py-2 rounded border border-red-200 max-w-md">
          <div className="whitespace-pre-line">{error}</div>
        </div>
      )}
    </div>
  );
}