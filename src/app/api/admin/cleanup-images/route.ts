import {NextRequest, NextResponse} from 'next/server';
import {cleanupAllUnusedImages} from '@/lib/image-cleanup';
import {logger} from '@/lib/logger';

// 自動クリーンアップAPI（Cron Job用）
export async function GET(request: NextRequest) {
  try {
    // Vercel Cron Jobからのリクエストの認証チェック
    const authHeader = request.headers.get('Authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    logger.info('Starting automated cleanup...');

    // デフォルト設定での包括的クリーンアップを実行
    const result = await cleanupAllUnusedImages(7);

    // 詳細ログ出力
    logger.info('Automated cleanup completed:', {
      timestamp: new Date().toISOString(),
      success: result.success,
      totalImages: result.stats.totalImages,
      deletedImages: result.stats.deletedImages,
      failedDeletions: result.stats.failedDeletions,
      deletedSize: result.stats.deletedSize,
      errors: result.stats.errors,
    });

    // 失敗がある場合は警告ログ
    if (result.stats.failedDeletions > 0) {
      // Warning handled - logging removed
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      stats: result.stats,
      timestamp: new Date().toISOString(),
    });
  } catch (_error) {
    // Error handled - logging removed
    return NextResponse.json(
      {
        success: false,
        error: 'Automated cleanup failed',
        timestamp: new Date().toISOString(),
      },
      {status: 500}
    );
  }
}
