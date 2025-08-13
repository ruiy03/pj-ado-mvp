import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@/auth';
import {getAdTemplateById, updateAdTemplate, deleteAdTemplate} from '@/lib/template-actions';
import {hasMinimumRole} from '@/lib/authorization';
import type {UpdateAdTemplateRequest} from '@/lib/definitions';

export async function GET(
  request: NextRequest,
  {params}: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({error: '認証が必要です'}, {status: 401});
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({error: '無効なIDです'}, {status: 400});
    }

    const template = await getAdTemplateById(id);

    if (!template) {
      return NextResponse.json({error: 'テンプレートが見つかりません'}, {status: 404});
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error('Failed to fetch template:', error);
    return NextResponse.json(
      {error: '広告テンプレートの取得に失敗しました'},
      {status: 500}
    );
  }
}

export async function PUT(
  request: NextRequest,
  {params}: { params: Promise<{ id: string }> }
) {
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

    const body: Omit<UpdateAdTemplateRequest, 'id'> = await request.json();
    const updateData: UpdateAdTemplateRequest = {...body, id};

    const updatedTemplate = await updateAdTemplate(updateData);
    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error('Failed to update template:', error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : '広告テンプレートの更新に失敗しました'},
      {status: 500}
    );
  }
}

export async function DELETE(
  request: NextRequest,
  {params}: { params: Promise<{ id: string }> }
) {
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

    await deleteAdTemplate(id);
    return NextResponse.json({message: '広告テンプレートを削除しました'});
  } catch (error) {
    console.error('Failed to delete template:', error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : '広告テンプレートの削除に失敗しました'},
      {status: 500}
    );
  }
}
