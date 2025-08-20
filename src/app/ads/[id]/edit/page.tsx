import ProtectedPage from '@/components/ProtectedPage';
import { getAdContentById } from '@/lib/ad-content-actions';
import { getAdTemplates } from '@/lib/template-actions';
import { getUrlTemplates } from '@/lib/url-template-actions';
import AdContentEditForm from './AdContentEditForm';
import { notFound } from 'next/navigation';

interface EditAdContentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditAdContentPage({ params }: EditAdContentPageProps) {
  const { id } = await params;
  const contentId = parseInt(id);
  
  if (isNaN(contentId)) {
    notFound();
  }

  try {
    const [content, templates, urlTemplates] = await Promise.all([
      getAdContentById(contentId),
      getAdTemplates().catch(() => []),
      getUrlTemplates().catch(() => []),
    ]);
    
    if (!content) {
      notFound();
    }

    return (
      <ProtectedPage>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">広告コンテンツを編集</h1>
            <p className="text-gray-600 mt-2">
              {content.name} を編集しています。
            </p>
          </div>
          <AdContentEditForm 
            content={content} 
            templates={templates} 
            urlTemplates={urlTemplates} 
          />
        </div>
      </ProtectedPage>
    );
  } catch (error) {
    console.error('Failed to load ad content:', error);
    notFound();
  }
}
