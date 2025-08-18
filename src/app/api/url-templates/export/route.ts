import {NextResponse} from 'next/server';
import {auth} from '@/auth';
import {getUrlTemplates} from '@/lib/url-template-actions';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({error: '認証が必要です'}, {status: 401});
    }

    const templates = await getUrlTemplates();

    // CSV ヘッダー
    const csvHeaders = ['name', 'url', 'parameters', 'description'];

    // CSV データ生成
    const csvRows = templates.map(template => [
      `"${template.name.replace(/"/g, '""')}"`, // エスケープ処理
      `"${template.url.replace(/"/g, '""')}"`,
      `"${JSON.stringify(template.parameters).replace(/"/g, '""')}"`,
      `"${(template.description || '').replace(/"/g, '""')}"`
    ]);

    // CSV コンテンツ作成
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // ファイル名生成（日時付き）
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `url-templates-${timestamp}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Failed to export URL templates:', error);
    return NextResponse.json(
      {error: 'URLテンプレートのエクスポートに失敗しました'},
      {status: 500}
    );
  }
}