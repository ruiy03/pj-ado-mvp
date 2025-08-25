import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getArticlesWithoutAds, getCoverageStats } from '@/lib/wordpress-sync-actions';
import { logger } from '@/lib/logger';
import type { SessionUser } from '@/lib/definitions';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const user = session.user as SessionUser;
    if (user.role !== 'admin' && user.role !== 'editor') {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const url = new URL(request.url);
    const statsOnly = url.searchParams.get('stats_only') === 'true';

    if (statsOnly) {
      // 統計情報のみを取得
      const stats = await getCoverageStats();
      return NextResponse.json({ stats });
    } else {
      // 広告なし記事と統計情報を両方取得
      const { articles, stats } = await getArticlesWithoutAds();
      return NextResponse.json({ articles, stats });
    }

  } catch (error) {
    logger.error('広告なし記事API エラー:', error);
    
    const errorMessage = error instanceof Error ? error.message : '不明なエラーが発生しました';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
