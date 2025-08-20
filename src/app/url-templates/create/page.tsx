import ProtectedPage from '@/components/ProtectedPage';
import UrlTemplateCreateForm from './UrlTemplateCreateForm';

export default function CreateUrlTemplatePage() {
  return (
    <ProtectedPage>
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">新しいURLテンプレートを作成</h1>
          <p className="text-gray-600 mt-2">
            新しいURLテンプレートを作成します。UTMパラメータやカスタムパラメータを設定できます。
          </p>
        </div>
        <UrlTemplateCreateForm />
      </div>
    </ProtectedPage>
  );
}
