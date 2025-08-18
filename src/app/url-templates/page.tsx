import ProtectedPage from '@/components/ProtectedPage';
import UrlTemplateClient from './components/UrlTemplateClient';

export default function UrlTemplates() {
  return (
    <ProtectedPage>
      <UrlTemplateClient />
    </ProtectedPage>
  );
}
