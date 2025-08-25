import {NextRequest, NextResponse} from 'next/server';
import {getArticleAdMappings, getAdUsageStatsSimple} from '@/lib/wordpress-sync-actions';
import {auth} from '@/auth';
import {generateCsvContent} from '@/lib/csv-utils';
import type {SessionUser} from '@/lib/definitions';

export async function GET(request: NextRequest) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {error: '認証が必要です'},
        {status: 401}
      );
    }

    const user = session.user as SessionUser;
    if (user.role !== 'admin' && user.role !== 'editor') {
      return NextResponse.json(
        {error: '権限がありません'},
        {status: 403}
      );
    }

    // URLパラメータを取得
    const {searchParams} = new URL(request.url);
    const format = searchParams.get('format') || 'mappings'; // 'mappings' | 'usage_stats'

    let csvContent = '';
    let filename = '';

    if (format === 'usage_stats') {
      // 広告使用統計のエクスポート（簡潔版）
      const usageStats = await getAdUsageStatsSimple();

      const data = usageStats.map(stat => ({
        '広告ID': stat.ad_id,
        '総使用回数': stat.usage_count.toString(),
        'ユニーク記事数': stat.unique_posts.toString()
      }));

      csvContent = generateCsvContent(data);
      filename = `ad-usage-stats-${new Date().toISOString().split('T')[0]}.csv`;

    } else {
      // 記事広告紐付け一覧のエクスポート
      const mappings = await getArticleAdMappings();

      const data = mappings.map(mapping => ({
        'ID': mapping.id.toString(),
        '記事ID': mapping.post_id.toString(),
        '記事タイトル': mapping.post_title || '',
        '記事URL': mapping.post_url || '',
        '広告ID': mapping.ad_id,
        '最終同期日時': new Date(mapping.synced_at).toLocaleString('ja-JP'),
        '作成日時': new Date(mapping.created_at).toLocaleString('ja-JP'),
        '更新日時': new Date(mapping.updated_at).toLocaleString('ja-JP')
      }));

      csvContent = generateCsvContent(data);
      filename = `article-ad-mappings-${new Date().toISOString().split('T')[0]}.csv`;
    }

    // CSVファイルとしてレスポンス
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });

  } catch (error) {
    console.error('CSVエクスポートエラー:', error);
    return NextResponse.json(
      {error: 'サーバーエラーが発生しました'},
      {status: 500}
    );
  }
}

export async function POST() {
  return NextResponse.json(
    {error: 'Method not allowed'},
    {status: 405}
  );
}
