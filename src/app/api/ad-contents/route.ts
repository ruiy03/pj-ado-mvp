import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@/auth';
import {getAdContents, createAdContent, associateImagesWithAdContent} from '@/lib/ad-content-actions';
import {hasMinimumRole} from '@/lib/authorization';
import {extractImageUrls} from '@/lib/image-utils';
import type {CreateAdContentRequest} from '@/lib/definitions';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({error: '認証が必要です'}, {status: 401});
    }

    const contents = await getAdContents();
    return NextResponse.json(contents);
  } catch (_error) {
    // Error handled - logging removed
    return NextResponse.json(
      {error: '広告コンテンツの取得に失敗しました'},
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

    const body: CreateAdContentRequest = await request.json();
    const newContent = await createAdContent(body);

    // 画像URLがcontent_dataに含まれている場合、ad_imagesテーブルに関連付ける
    if (newContent.content_data) {
      const imageUrls = extractImageUrls(newContent.content_data);

      if (Object.keys(imageUrls).length > 0) {
        try {
          await associateImagesWithAdContent(newContent.id, imageUrls);
        } catch (_error) {
          // Error handled - logging removed
          // 画像の関連付けに失敗してもadContentの作成は成功扱いとする
        }
      }
    }

    return NextResponse.json(newContent, {status: 201});
  } catch (error) {
    // Error handled - logging removed
    return NextResponse.json(
      {error: error instanceof Error ? error.message : '広告コンテンツの作成に失敗しました'},
      {status: 500}
    );
  }
}
