'use client';

interface ValidationGuideProps {
  showNamingGuide: boolean;
  setShowNamingGuide: (show: boolean) => void;
}

export default function ValidationGuide({showNamingGuide, setShowNamingGuide}: ValidationGuideProps) {
  return (
    <>
      {/* 命名規則ガイド - トグル式ヘッダー */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex justify-between items-center cursor-pointer"
             onClick={() => setShowNamingGuide(!showNamingGuide)}>
          <h4 className="text-sm font-semibold text-blue-900">プレースホルダー命名規則</h4>
          <button
            type="button"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
          >
            {showNamingGuide ? '非表示にする' : '表示する'}
          </button>
        </div>

        {showNamingGuide && (
          <>

            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 text-xs">
              {/* 基本カテゴリ（7つ） */}
              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="font-medium text-blue-800 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  画像
                </div>
                <div className="space-y-1">
                  <span
                    className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1 mb-1 font-mono">image</span>
                  <div className="text-xs text-gray-500 mt-1">→ /images/sample-ad.svg</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="font-medium text-blue-800 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  リンク
                </div>
                <div className="space-y-1">
                  <span
                    className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-1 mb-1 font-mono">link</span>
                  <div className="text-xs text-gray-500 mt-1">→ #</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="font-medium text-blue-800 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  タイトル
                </div>
                <div className="space-y-1">
                  <span
                    className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mr-1 mb-1 font-mono">title</span>
                  <div className="text-xs text-gray-500 mt-1">→ サンプルタイトル</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="font-medium text-blue-800 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                  説明文
                </div>
                <div className="space-y-1">
                  <span
                    className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1 font-mono">text</span>
                  <div className="text-xs text-gray-500 mt-1">→ サンプル説明文です。ここに実際の...</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="font-medium text-blue-800 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                  ボタン
                </div>
                <div className="space-y-1">
                  <span
                    className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs mr-1 mb-1 font-mono">button</span>
                  <div className="text-xs text-gray-500 mt-1">→ 今すぐ登録</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="font-medium text-blue-800 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  価格
                </div>
                <div className="space-y-1">
                  <span
                    className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs mr-1 mb-1 font-mono">price</span>
                  <div className="text-xs text-gray-500 mt-1">→ 無料</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-blue-100">
                <div className="font-medium text-blue-800 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                  日付
                </div>
                <div className="space-y-1">
                  <span
                    className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs mr-1 mb-1 font-mono">date</span>
                  <div className="text-xs text-gray-500 mt-1">→ 2025年12月31日</div>
                </div>
              </div>

              {/* 就活関連カテゴリ（3つ） */}
              <div className="bg-white p-3 rounded-lg border border-emerald-100">
                <div className="font-medium text-emerald-800 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                  サービス
                </div>
                <div className="space-y-1">
                  <span
                    className="inline-block bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs mr-1 mb-1 font-mono">service</span>
                  <div className="text-xs text-gray-500 mt-1">→ 就活支援サービス</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-lime-100">
                <div className="font-medium text-lime-800 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-lime-500 rounded-full mr-2"></span>
                  特典・メリット
                </div>
                <div className="space-y-1">
                  <span
                    className="inline-block bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs mr-1 mb-1 font-mono">benefit</span>
                  <div className="text-xs text-gray-500 mt-1">→ 内定獲得率95%</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-amber-100">
                <div className="font-medium text-amber-800 mb-2 flex items-center">
                  <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                  評価・実績
                </div>
                <div className="space-y-1">
                  <span
                    className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs mr-1 mb-1 font-mono">rating</span>
                  <div className="text-xs text-gray-500 mt-1">→ ★★★★★ 4.8</div>
                </div>
              </div>
            </div>

          </>
        )}
      </div>

      {/* 詳細なサンプル例 */}
      {showNamingGuide && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">使用例</h4>

          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[400px]">
              <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-700 bg-gray-100">プレースホルダー</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700 bg-gray-100">サンプル出力</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700 bg-gray-100">用途</th>
              </tr>
              </thead>
              <tbody className="bg-white">
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 font-mono bg-blue-50 text-blue-800">{'{{image}}'}</td>
                <td className="py-2 px-3 text-gray-600">/images/sample-ad.svg</td>
                <td className="py-2 px-3 text-gray-500">画像パス（計測パラメータなし）</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 font-mono bg-green-50 text-green-800">{'{{link}}'}</td>
                <td className="py-2 px-3 text-gray-600">#</td>
                <td className="py-2 px-3 text-gray-500">リンクURL（計測パラメータあり）</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 font-mono bg-purple-50 text-purple-800">{'{{title}}'}</td>
                <td className="py-2 px-3 text-gray-600">サンプルタイトル</td>
                <td className="py-2 px-3 text-gray-500">タイトル・見出し</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 font-mono bg-gray-50 text-gray-800">{'{{text}}'}</td>
                <td className="py-2 px-3 text-gray-600">サンプル説明文です。ここに実際の...</td>
                <td className="py-2 px-3 text-gray-500">説明文・本文</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 font-mono bg-red-50 text-red-800">{'{{button}}'}</td>
                <td className="py-2 px-3 text-gray-600">今すぐ登録</td>
                <td className="py-2 px-3 text-gray-500">ボタンテキスト・CTA</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 font-mono bg-yellow-50 text-yellow-800">{'{{price}}'}</td>
                <td className="py-2 px-3 text-gray-600">無料</td>
                <td className="py-2 px-3 text-gray-500">価格・料金</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 font-mono bg-indigo-50 text-indigo-800">{'{{date}}'}</td>
                <td className="py-2 px-3 text-gray-600">2025年12月31日</td>
                <td className="py-2 px-3 text-gray-500">日付・時間</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 font-mono bg-emerald-50 text-emerald-800">{'{{service}}'}</td>
                <td className="py-2 px-3 text-gray-600">就活支援サービス</td>
                <td className="py-2 px-3 text-gray-500">就活サービス名</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 font-mono bg-lime-50 text-lime-800">{'{{benefit}}'}</td>
                <td className="py-2 px-3 text-gray-600">内定獲得率95%</td>
                <td className="py-2 px-3 text-gray-500">特典・メリット</td>
              </tr>
              <tr>
                <td className="py-2 px-3 font-mono bg-amber-50 text-amber-800">{'{{rating}}'}</td>
                <td className="py-2 px-3 text-gray-600">★★★★★ 4.8</td>
                <td className="py-2 px-3 text-gray-500">評価・実績</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
