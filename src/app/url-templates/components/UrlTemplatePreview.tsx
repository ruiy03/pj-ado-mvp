import type { CreateUrlTemplateRequest } from '@/lib/definitions';

interface UrlTemplatePreviewProps {
  formData: CreateUrlTemplateRequest;
}

export default function UrlTemplatePreview({ formData }: UrlTemplatePreviewProps) {
  const renderPreview = () => {
    if (!formData.url_template.trim()) {
      return (
        <div className="border border-gray-200 p-8 rounded-lg bg-gray-50 text-center text-gray-500">
          <div className="text-2xl mb-2">🔗</div>
          <p>URLテンプレートを入力するとプレビューが表示されます</p>
        </div>
      );
    }

    // サンプルパラメータで置換
    let previewUrl = formData.url_template;
    const parameterMatches = formData.url_template.match(/\{\{([^}]+)\}\}/g);
    
    if (parameterMatches) {
      parameterMatches.forEach((match) => {
        const paramName = match.replace(/[{}]/g, '');
        let sampleValue = 'sample';
        
        // UTMパラメータの場合は適切なサンプル値を設定
        if (paramName.includes('source')) sampleValue = 'website';
        else if (paramName.includes('medium')) sampleValue = 'banner';
        else if (paramName.includes('campaign')) sampleValue = 'spring_sale';
        else if (paramName.includes('term')) sampleValue = 'running_shoes';
        else if (paramName.includes('content')) sampleValue = 'hero_image';
        
        previewUrl = previewUrl.replace(match, sampleValue);
      });
    }

    try {
      const url = new URL(previewUrl);
      const params = new URLSearchParams(url.search);

      return (
        <div className="border border-gray-200 p-4 rounded-lg bg-white shadow-sm">
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">プレビューURL</h4>
              <div className="bg-blue-50 p-3 rounded border text-sm font-mono break-all">
                {previewUrl}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">ベースURL</h4>
              <div className="text-sm text-gray-600">
                {url.origin}{url.pathname}
              </div>
            </div>
            
            {params.size > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-2">パラメータ</h4>
                <div className="space-y-1">
                  {Array.from(params.entries()).map(([key, value], index) => (
                    <div key={index} className="flex text-sm">
                      <span className="font-medium text-gray-700 w-32">{key}:</span>
                      <span className="text-gray-600">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    } catch {
      return (
        <div className="border border-red-200 p-4 rounded-lg bg-red-50 text-red-700">
          <div className="text-xl mb-2">⚠️</div>
          <p className="font-medium">無効なURL形式</p>
          <p className="text-sm">正しいURL形式で入力してください。</p>
        </div>
      );
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-4">プレビュー</h3>
        {renderPreview()}
      </div>
    </div>
  );
}
