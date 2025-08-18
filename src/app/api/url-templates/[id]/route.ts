import {NextResponse} from 'next/server';
import {auth} from '@/auth';
import {getUrlTemplateById, updateUrlTemplate, deleteUrlTemplate} from '@/lib/url-template-actions';
import type {UpdateUrlTemplateRequest} from '@/lib/definitions';

export async function GET(request: Request, {params}: {params: Promise<{id: string}>}) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({error: 'Invalid ID'}, {status: 400});
    }

    const template = await getUrlTemplateById(id);
    if (!template) {
      return NextResponse.json({error: 'URLテンプレートが見つかりません'}, {status: 404});
    }

    return NextResponse.json({template});
  } catch (error) {
    console.error('Error fetching URL template:', error);
    return NextResponse.json(
      {error: 'URLテンプレートの取得に失敗しました'},
      {status: 500}
    );
  }
}

export async function PUT(request: Request, {params}: {params: Promise<{id: string}>}) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({error: 'Invalid ID'}, {status: 400});
    }

    const body = await request.json() as Omit<UpdateUrlTemplateRequest, 'id'>;
    const template = await updateUrlTemplate({...body, id});

    return NextResponse.json({template});
  } catch (error) {
    console.error('Error updating URL template:', error);
    
    if (error instanceof Error && error.message.includes('見つかりません')) {
      return NextResponse.json({error: error.message}, {status: 404});
    }
    
    if (error instanceof Error && error.message.includes('必須です')) {
      return NextResponse.json({error: error.message}, {status: 400});
    }
    
    return NextResponse.json(
      {error: 'URLテンプレートの更新に失敗しました'},
      {status: 500}
    );
  }
}

export async function DELETE(request: Request, {params}: {params: Promise<{id: string}>}) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const resolvedParams = await params;
    const id = parseInt(resolvedParams.id);
    if (isNaN(id)) {
      return NextResponse.json({error: 'Invalid ID'}, {status: 400});
    }

    await deleteUrlTemplate(id);
    return NextResponse.json({success: true});
  } catch (error) {
    console.error('Error deleting URL template:', error);
    
    if (error instanceof Error && error.message.includes('見つかりません')) {
      return NextResponse.json({error: error.message}, {status: 404});
    }
    
    return NextResponse.json(
      {error: 'URLテンプレートの削除に失敗しました'},
      {status: 500}
    );
  }
}