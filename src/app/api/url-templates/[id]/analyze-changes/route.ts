import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@/auth';
import {hasMinimumRole} from '@/lib/authorization';
import {getUrlTemplateById} from '@/lib/url-template-actions';
import {analyzeUrlTemplateChanges} from '@/lib/consistency-checker';

export async function POST(
  request: NextRequest,
  {params}: { params: Promise<{ id: string }> }
) {
  let newUrlTemplate: string | undefined;
  let newName: string | undefined;

  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({error: '認証が必要です'}, {status: 401});
    }

    // エディター以上の権限が必要
    if (!(await hasMinimumRole('editor'))) {
      return NextResponse.json({error: '権限がありません'}, {status: 403});
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({error: '無効なIDです'}, {status: 400});
    }

    ({newUrlTemplate, newName} = await request.json());

    if (!newUrlTemplate || !newName) {
      return NextResponse.json({error: '必要なパラメータが不足しています'}, {status: 400});
    }

    // 現在のURLテンプレートを取得
    const currentTemplate = await getUrlTemplateById(id);
    if (!currentTemplate) {
      return NextResponse.json({error: 'URLテンプレートが見つかりません'}, {status: 404});
    }

    // 影響分析を実行
    const analysisResult = await analyzeUrlTemplateChanges(id, newUrlTemplate, newName);

    return NextResponse.json(analysisResult);
  } catch (error) {
    // Error handled - logging removed
    return NextResponse.json(
      {error: `URL影響分析に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`},
      {status: 500}
    );
  }
}
