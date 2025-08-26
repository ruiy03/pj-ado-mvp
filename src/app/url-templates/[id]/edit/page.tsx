import ProtectedPage from '@/components/ProtectedPage';
import { getUrlTemplateById } from '@/lib/url-template-actions';
import UrlTemplateEditForm from './UrlTemplateEditForm';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface EditUrlTemplatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditUrlTemplatePage({ params }: EditUrlTemplatePageProps) {
  const { id } = await params;
  const templateId = parseInt(id);
  
  if (isNaN(templateId)) {
    notFound();
  }

  try {
    const template = await getUrlTemplateById(templateId);
    
    if (!template) {
      notFound();
    }

    return (
      <ProtectedPage>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">URLテンプレートを編集</h1>
            <p className="text-gray-600 mt-2">
              {template.name} を編集しています。変更は関連する広告コンテンツに影響する可能性があります。
            </p>
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <UrlTemplateEditForm template={template} />
          </Suspense>
        </div>
      </ProtectedPage>
    );
  } catch (_error) {
    // Failed to load URL template - handled by notFound()
    notFound();
  }
}
