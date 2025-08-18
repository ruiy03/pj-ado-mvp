import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getAdContents, createAdContent } from '@/lib/ad-content-actions';
import { hasMinimumRole } from '@/lib/authorization';
import type { CreateAdContentRequest } from '@/lib/definitions';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const contents = await getAdContents();
    return NextResponse.json(contents);
  } catch (error) {
    console.error('Failed to fetch ad contents:', error);
    return NextResponse.json(
      { error: '広告コンテンツの取得に失敗しました' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // エディター以上の権限が必要
    if (!(await hasMinimumRole('editor'))) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const body: CreateAdContentRequest = await request.json();
    const newContent = await createAdContent(body);

    return NextResponse.json(newContent, { status: 201 });
  } catch (error) {
    console.error('Failed to create ad content:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '広告コンテンツの作成に失敗しました' },
      { status: 500 }
    );
  }
}
