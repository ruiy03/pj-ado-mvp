import ProtectedPage from '@/components/ProtectedPage';
import ArticleAdMappingClient from './components/ArticleAdMappingClient';

export default function ArticleAdMapping() {
  return (
    <ProtectedPage>
      <div>
        <ArticleAdMappingClient />
      </div>
    </ProtectedPage>
  );
}
