import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { hasMinimumRole } from '@/lib/authorization';
import { getAdTemplateById } from '@/lib/template-actions';
import { analyzeTemplateChanges } from '@/lib/consistency-checker';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // エディター以上の権限が必要
    if (!(await hasMinimumRole('editor'))) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({ error: '無効なIDです' }, { status: 400 });
    }

    const { newHtml, newName } = await request.json();

    if (!newHtml || !newName) {
      return NextResponse.json({ error: '必要なパラメータが不足しています' }, { status: 400 });
    }

    // 現在のテンプレートを取得
    const currentTemplate = await getAdTemplateById(id);
    if (!currentTemplate) {
      return NextResponse.json({ error: 'テンプレートが見つかりません' }, { status: 404 });
    }

    // 影響分析を実行
    const analysisResult = await analyzeTemplateChanges(id, newHtml, newName);

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('Failed to analyze template changes:', error);
    return NextResponse.json(
      { error: '影響分析に失敗しました' },
      { status: 500 }
    );
  }
}
