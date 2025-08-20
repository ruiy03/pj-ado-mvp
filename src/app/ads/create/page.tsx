import ProtectedPage from '@/components/ProtectedPage';
import { getAdTemplates } from '@/lib/template-actions';
import { getUrlTemplates } from '@/lib/url-template-actions';
import AdContentCreateForm from './AdContentCreateForm';

export default async function CreateAdContentPage() {
  // サーバーサイドでデータを取得
  const [templates, urlTemplates] = await Promise.all([
    getAdTemplates().catch(() => []),
    getUrlTemplates().catch(() => []),
  ]);

  return (
    <ProtectedPage>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">新しい広告コンテンツを作成</h1>
          <p className="text-gray-600 mt-2">
            テンプレートを選択して、広告コンテンツを作成します。
          </p>
        </div>
        <AdContentCreateForm templates={templates} urlTemplates={urlTemplates} />
      </div>
    </ProtectedPage>
  );
}
