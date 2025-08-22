import {NextRequest, NextResponse} from 'next/server';
import {getAdContentById, trackImpression} from '@/lib/ad-content-actions';

interface Params {
  id: string;
}

// 配信IDによる広告HTML取得
export async function GET(
  request: NextRequest,
  {params}: {params: Promise<Params>}
) {
  try {
    const {id} = await params;
    const contentId = parseInt(id);
    
    if (isNaN(contentId)) {
      return NextResponse.json(
        {error: '無効な配信IDです'},
        {status: 400}
      );
    }

    // 広告コンテンツを取得
    const content = await getAdContentById(contentId);
    if (!content) {
      return NextResponse.json(
        {error: '広告コンテンツが見つかりません'},
        {status: 404}
      );
    }

    // アクティブな広告コンテンツのみ配信
    if (content.status !== 'active') {
      return NextResponse.json(
        {error: '広告コンテンツが非アクティブです'},
        {status: 403}
      );
    }

    // インプレッション数を増加
    try {
      await trackImpression(contentId);
    } catch (error) {
      console.error(`Impression tracking failed for content ${contentId}:`, error);
    }

    // 広告HTMLを生成
    let html = content.template?.html || '';
    const contentData = content.content_data || {};

    // プレースホルダーを実際の値に置換
    Object.entries(contentData).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
      html = html.replace(regex, String(value || ''));
    });

    // URLテンプレートの処理
    if (content.url_template?.url_template) {
      let urlTemplate = content.url_template.url_template;
      
      // URLテンプレートのプレースホルダーを置換
      Object.entries(contentData).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        urlTemplate = urlTemplate.replace(regex, String(value || ''));
      });

      // HTMLの{{link}}プレースホルダーをURLテンプレートで置換
      html = html.replace(/{{\\s*link\\s*}}/g, urlTemplate);
    }

    // 画像の処理
    if (content.images && content.images.length > 0) {
      content.images.forEach(image => {
        if (image.placeholder_name) {
          const regex = new RegExp(`{{\\s*${image.placeholder_name}\\s*}}`, 'g');
          html = html.replace(regex, image.blob_url);
        }
      });
    }

    // クリック追跡のためのリンク自動変換
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    html = html.replace(
      /<a\s+([^>]*?)href\s*=\s*["']([^"']+)["']([^>]*?)>/gi,
      (match, beforeHref, url, afterHref) => {
        // 相対URLや既にクリック追跡URLの場合はそのまま
        if (url.startsWith('/') || url.includes('/api/delivery/')) {
          return match;
        }
        
        // 外部URLの場合はクリック追跡URLに変換（絶対URL）
        const trackingUrl = `${baseUrl}/api/delivery/${contentId}/click?url=${encodeURIComponent(url)}`;
        return `<a ${beforeHref}href="${trackingUrl}"${afterHref}>`;
      }
    );

    // レスポンスデータ
    const responseData = {
      html,
      id: content.id,
      name: content.name,
      status: content.status,
      template: content.template ? {
        id: content.template.id,
        name: content.template.name
      } : null,
      url_template: content.url_template ? {
        id: content.url_template.id,
        name: content.url_template.name
      } : null
    };

    // CORS ヘッダーを設定（WordPressからの呼び出しを許可）
    const response = NextResponse.json(responseData, {status: 200});
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    // キャッシュヘッダーを設定（5分間キャッシュ）
    response.headers.set('Cache-Control', 'public, max-age=300');

    return response;
  } catch (error) {
    console.error('Delivery API error:', error);
    return NextResponse.json(
      {error: '配信エラーが発生しました'},
      {status: 500}
    );
  }
}

// プリフライトリクエスト対応
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
