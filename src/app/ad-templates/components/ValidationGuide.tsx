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
        <div className="flex justify-between items-center cursor-pointer hover:cursor-pointer" onClick={() => setShowNamingGuide(!showNamingGuide)}>
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
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 text-xs">
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="font-medium text-blue-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
              画像
            </div>
            <div className="space-y-1">
              <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1 mb-1">Image</span>
              <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1 mb-1">Img</span>
              <span
                className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1 mb-1">Picture</span>
              <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1 mb-1">Photo</span>
              <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1 mb-1">Banner</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="font-medium text-blue-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              URL
            </div>
            <div className="space-y-1">
              <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-1 mb-1">Url</span>
              <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-1 mb-1">Link</span>
              <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-1 mb-1">Href</span>
              <span className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-1 mb-1">Path</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="font-medium text-blue-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
              タイトル
            </div>
            <div className="space-y-1">
              <span
                className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mr-1 mb-1">Title</span>
              <span
                className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mr-1 mb-1">Headline</span>
              <span
                className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mr-1 mb-1">Header</span>
              <span
                className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mr-1 mb-1">Subject</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="font-medium text-blue-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
              説明文
            </div>
            <div className="space-y-1">
              <span
                className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1">Description</span>
              <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1">Text</span>
              <span
                className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1">Content</span>
              <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1">Body</span>
              <span
                className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1 mb-1">Message</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="font-medium text-blue-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
              価格
            </div>
            <div className="space-y-1">
              <span
                className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs mr-1 mb-1">Price</span>
              <span
                className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs mr-1 mb-1">Cost</span>
              <span
                className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs mr-1 mb-1">Fee</span>
              <span
                className="inline-block bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs mr-1 mb-1">Amount</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="font-medium text-blue-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
              ボタン
            </div>
            <div className="space-y-1">
              <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs mr-1 mb-1">Button</span>
              <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs mr-1 mb-1">Cta</span>
              <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs mr-1 mb-1">Action</span>
              <span className="inline-block bg-red-100 text-red-700 px-2 py-1 rounded text-xs mr-1 mb-1">Label</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="font-medium text-blue-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
              日付
            </div>
            <div className="space-y-1">
              <span
                className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs mr-1 mb-1">Date</span>
              <span
                className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs mr-1 mb-1">Time</span>
              <span
                className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs mr-1 mb-1">Period</span>
              <span
                className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs mr-1 mb-1">Duration</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="font-medium text-blue-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
              名前
            </div>
            <div className="space-y-1">
              <span className="inline-block bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs mr-1 mb-1">Name</span>
              <span className="inline-block bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs mr-1 mb-1">Author</span>
              <span
                className="inline-block bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs mr-1 mb-1">Company</span>
              <span className="inline-block bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs mr-1 mb-1">Brand</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="font-medium text-blue-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
              アイコン
            </div>
            <div className="space-y-1">
              <span
                className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs mr-1 mb-1">Icon</span>
              <span
                className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs mr-1 mb-1">Symbol</span>
              <span
                className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs mr-1 mb-1">Mark</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="font-medium text-blue-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
              サービス
            </div>
            <div className="space-y-1">
              <span
                className="inline-block bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs mr-1 mb-1">Service</span>
              <span
                className="inline-block bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs mr-1 mb-1">Tool</span>
              <span
                className="inline-block bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs mr-1 mb-1">Platform</span>
              <span
                className="inline-block bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs mr-1 mb-1">App</span>
              <span
                className="inline-block bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs mr-1 mb-1">System</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="font-medium text-blue-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
              職業・キャリア
            </div>
            <div className="space-y-1">
              <span className="inline-block bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs mr-1 mb-1">Job</span>
              <span
                className="inline-block bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs mr-1 mb-1">Position</span>
              <span className="inline-block bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs mr-1 mb-1">Career</span>
              <span className="inline-block bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs mr-1 mb-1">Work</span>
              <span className="inline-block bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs mr-1 mb-1">Role</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="font-medium text-blue-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
              業界・分野
            </div>
            <div className="space-y-1">
              <span
                className="inline-block bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs mr-1 mb-1">Industry</span>
              <span className="inline-block bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs mr-1 mb-1">Field</span>
              <span className="inline-block bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs mr-1 mb-1">Sector</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="font-medium text-blue-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-lime-500 rounded-full mr-2"></span>
              特典・メリット
            </div>
            <div className="space-y-1">
              <span
                className="inline-block bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs mr-1 mb-1">Benefit</span>
              <span
                className="inline-block bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs mr-1 mb-1">Feature</span>
              <span
                className="inline-block bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs mr-1 mb-1">Advantage</span>
              <span className="inline-block bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs mr-1 mb-1">Offer</span>
              <span className="inline-block bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs mr-1 mb-1">Merit</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="font-medium text-blue-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
              評価・実績
            </div>
            <div className="space-y-1">
              <span
                className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs mr-1 mb-1">Rating</span>
              <span
                className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs mr-1 mb-1">Review</span>
              <span
                className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs mr-1 mb-1">Score</span>
              <span
                className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs mr-1 mb-1">Result</span>
              <span
                className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs mr-1 mb-1">Achievement</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="font-medium text-blue-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-rose-500 rounded-full mr-2"></span>
              ロゴ・パートナー
            </div>
            <div className="space-y-1">
              <span className="inline-block bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs mr-1 mb-1">Logo</span>
              <span
                className="inline-block bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs mr-1 mb-1">Sponsor</span>
              <span
                className="inline-block bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs mr-1 mb-1">Partner</span>
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-blue-100">
            <div className="font-medium text-blue-800 mb-2 flex items-center">
              <span className="w-2 h-2 bg-violet-500 rounded-full mr-2"></span>
              カテゴリ・タグ
            </div>
            <div className="space-y-1">
              <span
                className="inline-block bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs mr-1 mb-1">Category</span>
              <span
                className="inline-block bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs mr-1 mb-1">Tag</span>
              <span
                className="inline-block bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs mr-1 mb-1">Type</span>
              <span
                className="inline-block bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs mr-1 mb-1">Kind</span>
              <span
                className="inline-block bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs mr-1 mb-1">Genre</span>
            </div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-blue-200">
          <p className="text-xs text-blue-700">
            <span className="font-medium">💡 ヒント:</span>
            これらのキーワードを含む名前を使用すると、プレビューで適切なサンプルデータが自動表示されます
          </p>
        </div>
        </>
        )}
      </div>

      {/* 詳細なサンプル例 */}
      {showNamingGuide && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-sm font-semibold text-gray-800 mb-3">プレースホルダー例とサンプル出力</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[600px]">
              <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 px-3 font-medium text-gray-700 bg-gray-100">カテゴリ</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700 bg-gray-100">プレースホルダー例</th>
                <th className="text-left py-2 px-3 font-medium text-gray-700 bg-gray-100">サンプル出力</th>
              </tr>
              </thead>
              <tbody className="bg-white">
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 align-top">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      <span className="font-medium text-blue-800">画像</span>
                    </span>
                </td>
                <td className="py-2 px-3">
                  <div className="space-y-1">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1">productImage</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1">bannerPhoto</span>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">mainPicture</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600">https://picsum.photos/300/200</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 align-top">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <span className="font-medium text-green-800">URL</span>
                    </span>
                </td>
                <td className="py-2 px-3">
                  <div className="space-y-1">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-1">productUrl</span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs mr-1">linkHref</span>
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">actionPath</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600">#</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 align-top">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                      <span className="font-medium text-purple-800">タイトル</span>
                    </span>
                </td>
                <td className="py-2 px-3">
                  <div className="space-y-1">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mr-1">productTitle</span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs mr-1">mainHeadline</span>
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">pageHeader</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600">サンプルタイトル</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 align-top">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                      <span className="font-medium text-gray-800">説明文</span>
                    </span>
                </td>
                <td className="py-2 px-3">
                  <div className="space-y-1">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1">productDescription</span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs mr-1">bodyContent</span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">textMessage</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600">サンプル説明文です。ここに実際のコンテンツが表示されます。</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 align-top">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                      <span className="font-medium text-yellow-800">価格</span>
                    </span>
                </td>
                <td className="py-2 px-3">
                  <div className="space-y-1">
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs mr-1">salePrice</span>
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs mr-1">serviceCost</span>
                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs">totalAmount</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600">無料</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 align-top">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      <span className="font-medium text-red-800">ボタン</span>
                    </span>
                </td>
                <td className="py-2 px-3">
                  <div className="space-y-1">
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs mr-1">ctaButton</span>
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs mr-1">submitAction</span>
                    <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">buttonLabel</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600">今すぐ登録</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 align-top">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                      <span className="font-medium text-indigo-800">日付</span>
                    </span>
                </td>
                <td className="py-2 px-3">
                  <div className="space-y-1">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs mr-1">eventDate</span>
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs mr-1">deadlineTime</span>
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">campaignPeriod</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600">2025年12月31日</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 align-top">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                      <span className="font-medium text-pink-800">名前</span>
                    </span>
                </td>
                <td className="py-2 px-3">
                  <div className="space-y-1">
                    <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs mr-1">authorName</span>
                    <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs mr-1">companyName</span>
                    <span className="bg-pink-100 text-pink-700 px-2 py-1 rounded text-xs">brandName</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600">サンプル名</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 align-top">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      <span className="font-medium text-orange-800">アイコン</span>
                    </span>
                </td>
                <td className="py-2 px-3">
                  <div className="space-y-1">
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs mr-1">iconSymbol</span>
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs mr-1">markIcon</span>
                    <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs">visualSymbol</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600">🚀</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 align-top">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                      <span className="font-medium text-emerald-800">サービス</span>
                    </span>
                </td>
                <td className="py-2 px-3">
                  <div className="space-y-1">
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs mr-1">serviceTitle</span>
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs mr-1">toolName</span>
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs">platformName</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600">就活支援サービス</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 align-top">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                      <span className="font-medium text-cyan-800">職業・キャリア</span>
                    </span>
                </td>
                <td className="py-2 px-3">
                  <div className="space-y-1">
                    <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs mr-1">jobTitle</span>
                    <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs mr-1">positionName</span>
                    <span className="bg-cyan-100 text-cyan-700 px-2 py-1 rounded text-xs">careerPath</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600">新卒採用</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 align-top">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-teal-500 rounded-full mr-2"></span>
                      <span className="font-medium text-teal-800">業界・分野</span>
                    </span>
                </td>
                <td className="py-2 px-3">
                  <div className="space-y-1">
                    <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs mr-1">industryName</span>
                    <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs mr-1">fieldType</span>
                    <span className="bg-teal-100 text-teal-700 px-2 py-1 rounded text-xs">sectorName</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600">IT・Web業界</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 align-top">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-lime-500 rounded-full mr-2"></span>
                      <span className="font-medium text-lime-800">特典・メリット</span>
                    </span>
                </td>
                <td className="py-2 px-3">
                  <div className="space-y-1">
                    <span className="bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs mr-1">benefitText</span>
                    <span className="bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs mr-1">featureList</span>
                    <span className="bg-lime-100 text-lime-700 px-2 py-1 rounded text-xs">offerDetail</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600">内定獲得率95%</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 align-top">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                      <span className="font-medium text-amber-800">評価・実績</span>
                    </span>
                </td>
                <td className="py-2 px-3">
                  <div className="space-y-1">
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs mr-1">userRating</span>
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs mr-1">reviewScore</span>
                    <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded text-xs">resultData</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600">★★★★★ 4.8</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 align-top">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-rose-500 rounded-full mr-2"></span>
                      <span className="font-medium text-rose-800">ロゴ・パートナー</span>
                    </span>
                </td>
                <td className="py-2 px-3">
                  <div className="space-y-1">
                    <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs mr-1">companyLogo</span>
                    <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs mr-1">sponsorName</span>
                    <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded text-xs">partnerLogo</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600">PORTキャリア</td>
              </tr>
              <tr>
                <td className="py-2 px-3 align-top">
                    <span className="inline-flex items-center">
                      <span className="w-2 h-2 bg-violet-500 rounded-full mr-2"></span>
                      <span className="font-medium text-violet-800">カテゴリ・タグ</span>
                    </span>
                </td>
                <td className="py-2 px-3">
                  <div className="space-y-1">
                    <span className="bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs mr-1">categoryName</span>
                    <span className="bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs mr-1">tagList</span>
                    <span className="bg-violet-100 text-violet-700 px-2 py-1 rounded text-xs">contentType</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-gray-600">就活ツール</td>
              </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
