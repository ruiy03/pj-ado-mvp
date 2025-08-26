import ProtectedPage from '@/components/ProtectedPage';
import { getAdTemplateById } from '@/lib/template-actions';
import TemplateEditForm from './TemplateEditForm';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';

interface EditTemplatePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditTemplatePage({ params }: EditTemplatePageProps) {
  const { id } = await params;
  const templateId = parseInt(id);
  
  if (isNaN(templateId)) {
    notFound();
  }

  try {
    const template = await getAdTemplateById(templateId);
    
    if (!template) {
      notFound();
    }

    return (
      <ProtectedPage>
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">テンプレートを編集</h1>
            <p className="text-gray-600 mt-2">
              {template.name} を編集しています。変更は関連する広告コンテンツに影響する可能性があります。
            </p>
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <TemplateEditForm template={template} />
          </Suspense>
        </div>
      </ProtectedPage>
    );
  } catch (_error) {
    // Failed to load template - handled by notFound()
    notFound();
  }
}
