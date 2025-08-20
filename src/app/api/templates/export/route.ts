import {NextResponse} from 'next/server';
import {auth} from '@/auth';
import {getAdTemplates} from '@/lib/template-actions';
import {extractPlaceholders} from '@/lib/template-utils';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({error: '認証が必要です'}, {status: 401});
    }

    const templates = await getAdTemplates();

    // CSV ヘッダー
    const csvHeaders = ['name', 'html', 'placeholders', 'description'];

    // CSV データ生成
    const csvRows = templates.map(template => [
      `"${template.name.replace(/"/g, '""')}"`, // エスケープ処理
      `"${template.html.replace(/"/g, '""')}"`,
      `"${extractPlaceholders(template.html).join(',').replace(/"/g, '""')}"`,
      `"${(template.description || '').replace(/"/g, '""')}"`
    ]);

    // CSV コンテンツ作成
    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.join(','))
    ].join('\n');

    // ファイル名生成（日時付き）
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `ad-templates-${timestamp}.csv`;

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Failed to export templates:', error);
    return NextResponse.json(
      {error: 'テンプレートのエクスポートに失敗しました'},
      {status: 500}
    );
  }
}
