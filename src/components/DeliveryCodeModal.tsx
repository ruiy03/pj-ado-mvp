'use client';

import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';

interface DeliveryCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  adId: number;
  adName: string;
}

export default function DeliveryCodeModal({ isOpen, onClose, adId, adName }: DeliveryCodeModalProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const basicCode = `[lmg_ad id="${adId}"]`;
  const advancedCode = `[lmg_ad id="${adId}" cache="3600" class="sidebar-ad" width="300px" height="250px"]`;

  const copyToClipboard = (text: string, codeType: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedCode(codeType);
      setTimeout(() => setCopiedCode(null), 2000);
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">配信コード取得</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            広告名: <span className="font-medium">{adName}</span>
          </p>
          <p className="text-sm text-gray-600">
            広告ID: <span className="font-medium">{adId}</span>
          </p>
        </div>

        <div className="space-y-6">
          {/* 基本的な使用方法 */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-3">基本的な使用方法</h3>
            <p className="text-sm text-gray-600 mb-3">
              記事やページに以下のショートコードを挿入することで広告を表示できます：
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">基本コード</span>
                <button
                  onClick={() => copyToClipboard(basicCode, 'basic')}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {copiedCode === 'basic' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>コピー済み</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>コピー</span>
                    </>
                  )}
                </button>
              </div>
              <code className="text-sm font-mono bg-white px-3 py-2 rounded border block">
                {basicCode}
              </code>
            </div>
          </section>

          {/* オプション */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-3">オプション</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-medium text-gray-700">属性</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">説明</th>
                    <th className="text-left py-2 px-3 font-medium text-gray-700">例</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600">
                  <tr className="border-b">
                    <td className="py-2 px-3 font-mono">id</td>
                    <td className="py-2 px-3">広告ID（必須）</td>
                    <td className="py-2 px-3 font-mono text-xs">[lmg_ad id=&quot;123&quot;]</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-mono">cache</td>
                    <td className="py-2 px-3">キャッシュ時間（秒）</td>
                    <td className="py-2 px-3 font-mono text-xs">[lmg_ad id=&quot;123&quot; cache=&quot;7200&quot;]</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-mono">class</td>
                    <td className="py-2 px-3">追加CSSクラス</td>
                    <td className="py-2 px-3 font-mono text-xs">[lmg_ad id=&quot;123&quot; class=&quot;my-ad-class&quot;]</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-mono">width</td>
                    <td className="py-2 px-3">幅の指定</td>
                    <td className="py-2 px-3 font-mono text-xs">[lmg_ad id=&quot;123&quot; width=&quot;300px&quot;]</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-3 font-mono">height</td>
                    <td className="py-2 px-3">高さの指定</td>
                    <td className="py-2 px-3 font-mono text-xs">[lmg_ad id=&quot;123&quot; height=&quot;250px&quot;]</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-mono">debug</td>
                    <td className="py-2 px-3">デバッグモード</td>
                    <td className="py-2 px-3 font-mono text-xs">[lmg_ad id=&quot;123&quot; debug=&quot;true&quot;]</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 使用例 */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-3">使用例</h3>
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">オプション付きコード例</span>
                <button
                  onClick={() => copyToClipboard(advancedCode, 'advanced')}
                  className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  {copiedCode === 'advanced' ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>コピー済み</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>コピー</span>
                    </>
                  )}
                </button>
              </div>
              <code className="text-sm font-mono bg-white px-3 py-2 rounded border block break-all">
                {advancedCode}
              </code>
            </div>
          </section>

          {/* API情報 */}
          <section>
            <h3 className="text-lg font-medium text-gray-900 mb-3">API情報</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">配信API:</span>{" "}
                <code className="bg-gray-100 px-2 py-1 rounded font-mono text-xs">
                  /api/delivery/{adId}
                </code>
              </p>
              <p>
                <span className="font-medium">クリック追跡:</span> 自動で有効化されます
              </p>
              <p>
                <span className="font-medium">キャッシュ:</span> 5分間（デフォルト）
              </p>
            </div>
          </section>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
