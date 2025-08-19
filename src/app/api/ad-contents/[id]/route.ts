import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@/auth';
import {
  getAdContentById,
  updateAdContent,
  deleteAdContent,
  associateImagesWithAdContent
} from '@/lib/ad-content-actions';
import {hasMinimumRole} from '@/lib/authorization';
import {extractImageUrls} from '@/lib/image-utils';
import type {UpdateAdContentRequest} from '@/lib/definitions';

export async function GET(
  request: NextRequest,
  {params}: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({error: '認証が必要です'}, {status: 401});
    }

    const {id: idParam} = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({error: '無効なIDです'}, {status: 400});
    }

    const content = await getAdContentById(id);
    if (!content) {
      return NextResponse.json({error: '広告コンテンツが見つかりません'}, {status: 404});
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error('Failed to fetch ad content:', error);
    return NextResponse.json(
      {error: '広告コンテンツの取得に失敗しました'},
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

    const {id: idParam} = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({error: '無効なIDです'}, {status: 400});
    }

    const body = await request.json();
    const updateData: UpdateAdContentRequest = {id, ...body};

    const updatedContent = await updateAdContent(updateData);

    // 画像URLがcontent_dataに含まれている場合、ad_imagesテーブルに関連付ける
    if (updatedContent.content_data) {
      const imageUrls = extractImageUrls(updatedContent.content_data);

      if (Object.keys(imageUrls).length > 0) {
        try {
          await associateImagesWithAdContent(updatedContent.id, imageUrls);
        } catch (error) {
          console.error('Failed to associate images:', error);
          // 画像の関連付けに失敗してもadContentの更新は成功扱いとする
        }
      }
    }

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error('Failed to update ad content:', error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : '広告コンテンツの更新に失敗しました'},
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

    const {id: idParam} = await params;
    const id = parseInt(idParam);
    if (isNaN(id)) {
      return NextResponse.json({error: '無効なIDです'}, {status: 400});
    }

    await deleteAdContent(id);
    return NextResponse.json({success: true});
  } catch (error) {
    console.error('Failed to delete ad content:', error);
    return NextResponse.json(
      {error: error instanceof Error ? error.message : '広告コンテンツの削除に失敗しました'},
      {status: 500}
    );
  }
}
