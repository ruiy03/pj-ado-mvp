import ProtectedPage from '@/components/ProtectedPage';
import AdContentClient from './components/AdContentClient';
import { getAdContents } from '@/lib/ad-content-actions';
import { getAdTemplates } from '@/lib/template-actions';
import { getUrlTemplates } from '@/lib/url-template-actions';

export default async function Ads() {
  // サーバーサイドでデータを取得
  const [contents, templates, urlTemplates] = await Promise.all([
    getAdContents().catch(() => []),
    getAdTemplates().catch(() => []),
    getUrlTemplates().catch(() => []),
  ]);

  return (
    <ProtectedPage>
      <div>
        <AdContentClient
          initialContents={contents}
          templates={templates}
          urlTemplates={urlTemplates}
        />
      </div>
    </ProtectedPage>
  );
}
