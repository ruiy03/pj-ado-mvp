import {NextRequest, NextResponse} from 'next/server';
import {getAdContentById, trackClick} from '@/lib/ad-content-actions';

interface Params {
  id: string;
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

// クリック追跡とリダイレクト
export async function GET(
  request: NextRequest,
  {params}: { params: Promise<Params> }
) {
  try {
    const {id} = await params;
    const {searchParams} = new URL(request.url);
    const redirectUrl = searchParams.get('url');
    const contentId = parseInt(id);


    if (isNaN(contentId)) {
      return NextResponse.json(
        {error: '無効な配信IDです'},
        {status: 400}
      );
    }

    if (!redirectUrl) {
      return NextResponse.json(
        {error: 'リダイレクトURLが指定されていません'},
        {status: 400}
      );
    }

    // 広告コンテンツを取得
    const content = await getAdContentById(contentId);
    if (!content || content.status !== 'active') {
      // コンテンツがない場合でもリダイレクトは実行
      return NextResponse.redirect(redirectUrl);
    }

    // クリック数を増加（非同期で実行、エラーでもリダイレクトは継続）
    trackClick(contentId).catch(() => {
    }); // Error handled, redirect continues

    // リダイレクト実行
    return NextResponse.redirect(redirectUrl);
  } catch (_error) {
    // Click tracking error - continuing with redirect

    // エラーが発生してもリダイレクトは実行
    const {searchParams} = new URL(request.url);
    const redirectUrl = searchParams.get('url');
    if (redirectUrl) {
      return NextResponse.redirect(redirectUrl);
    }

    return NextResponse.json(
      {error: 'クリック追跡エラーが発生しました'},
      {status: 500}
    );
  }
}
