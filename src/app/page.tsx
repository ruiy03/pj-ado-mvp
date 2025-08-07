import { auth } from '../../auth';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const session = await auth();
  
  // If user is logged in, redirect to dashboard
  if (session?.user) {
    redirect('/dashboard');
  }
  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">
          LMG 広告管理システムへようこそ
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          効率的な広告管理でメディアコンテンツを最適化
        </p>
        <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            主な機能
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="text-left">
              <h3 className="text-lg font-medium text-blue-600 mb-2">📊 ダッシュボード</h3>
              <p className="text-gray-600">広告パフォーマンスの一元管理</p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-medium text-blue-600 mb-2">📝 テンプレート管理</h3>
              <p className="text-gray-600">広告・URLテンプレートの効率的な作成</p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-medium text-blue-600 mb-2">🎨 広告管理</h3>
              <p className="text-gray-600">コンテンツ広告の包括的な管理</p>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-medium text-blue-600 mb-2">🔗 記事連携</h3>
              <p className="text-gray-600">記事と広告の最適な紐付け</p>
            </div>
          </div>
        </div>
        <div className="text-center">
          <a
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            システムにログイン
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
