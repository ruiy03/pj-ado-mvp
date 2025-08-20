import ProtectedPage from '@/components/ProtectedPage';
import TemplateCreateForm from './TemplateCreateForm';

export default function CreateTemplatePage() {
  return (
    <ProtectedPage>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">新しいテンプレートを作成</h1>
          <p className="text-gray-600 mt-2">
            広告テンプレートを作成します。プレースホルダーは {'{変数名}'} の形式で記述してください。
          </p>
        </div>
        <TemplateCreateForm />
      </div>
    </ProtectedPage>
  );
}
