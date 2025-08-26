import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@/auth';
import {getAdTemplates, createAdTemplate} from '@/lib/template-actions';
import {hasMinimumRole} from '@/lib/authorization';
import type {CreateAdTemplateRequest} from '@/lib/definitions';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({error: '認証が必要です'}, {status: 401});
    }

    const templates = await getAdTemplates();
    return NextResponse.json(templates);
  } catch (_error) {
    // Error handled - logging removed
    return NextResponse.json(
      {error: '広告テンプレートの取得に失敗しました'},
      {status: 500}
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({error: '認証が必要です'}, {status: 401});
    }

    // エディター以上の権限が必要
    if (!(await hasMinimumRole('editor'))) {
      return NextResponse.json({error: '権限がありません'}, {status: 403});
    }

    const body: CreateAdTemplateRequest = await request.json();
    const newTemplate = await createAdTemplate(body);

    return NextResponse.json(newTemplate, {status: 201});
  } catch (error) {
    // Error handled - logging removed
    return NextResponse.json(
      {error: error instanceof Error ? error.message : '広告テンプレートの作成に失敗しました'},
      {status: 500}
    );
  }
}
