import {NextResponse} from 'next/server';
import {auth} from '@/auth';
import {getUrlTemplates, createUrlTemplate} from '@/lib/url-template-actions';
import type {CreateUrlTemplateRequest} from '@/lib/definitions';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const templates = await getUrlTemplates();
    return NextResponse.json({templates});
  } catch (_error) {
    // Error handled - logging removed
    return NextResponse.json(
      {error: 'URLテンプレートの取得に失敗しました'},
      {status: 500}
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({error: 'Unauthorized'}, {status: 401});
    }

    const body = await request.json() as CreateUrlTemplateRequest;
    const template = await createUrlTemplate(body);
    
    return NextResponse.json({template}, {status: 201});
  } catch (error) {
    // Error handled - logging removed
    
    if (error instanceof Error && error.message.includes('必須です')) {
      return NextResponse.json({error: error.message}, {status: 400});
    }
    
    return NextResponse.json(
      {error: 'URLテンプレートの作成に失敗しました'},
      {status: 500}
    );
  }
}
