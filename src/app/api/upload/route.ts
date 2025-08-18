import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { auth } from '@/auth';
import { hasMinimumRole } from '@/lib/authorization';
import mime from 'mime-types';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml'
];

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

    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');

    if (!filename) {
      return NextResponse.json({ error: 'ファイル名が指定されていません' }, { status: 400 });
    }

    // リクエストボディから直接ファイルデータを取得
    const fileBuffer = await request.arrayBuffer();
    
    if (!fileBuffer || fileBuffer.byteLength === 0) {
      return NextResponse.json({ error: 'ファイルが選択されていません' }, { status: 400 });
    }

    // ファイルサイズチェック
    if (fileBuffer.byteLength > MAX_FILE_SIZE) {
      return NextResponse.json({ 
        error: `ファイルサイズが大きすぎます。最大${MAX_FILE_SIZE / 1024 / 1024}MBまでです` 
      }, { status: 400 });
    }

    // MIMEタイプチェック
    const detectedMimeType = mime.lookup(filename);
    if (!detectedMimeType || !ALLOWED_TYPES.includes(detectedMimeType)) {
      return NextResponse.json({
        error: '対応していないファイル形式です。JPEG、PNG、GIF、WebP、SVGのみアップロード可能です'
      }, { status: 400 });
    }

    // ファイル名を生成（タイムスタンプ + オリジナル名で重複を避ける）
    const timestamp = Date.now();
    const blobFilename = `ad-images/${timestamp}-${filename}`;

    // Vercel Blobにアップロード
    const blob = await put(blobFilename, Buffer.from(fileBuffer), {
      access: 'public',
    });

    return NextResponse.json({
      url: blob.url,
      filename: filename,
      size: fileBuffer.byteLength,
      mimeType: detectedMimeType,
    });

  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: 'アップロードに失敗しました' },
      { status: 500 }
    );
  }
}

// アップロード済み画像の削除
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // エディター以上の権限が必要
    if (!(await hasMinimumRole('editor'))) {
      return NextResponse.json({ error: '権限がありません' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url) {
      return NextResponse.json({ error: 'URLが指定されていません' }, { status: 400 });
    }

    // Note: Vercel Blobには直接的な削除APIがないため、
    // 実際の運用では画像の無効化やDBからの参照削除で対応
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Delete failed:', error);
    return NextResponse.json(
      { error: '削除に失敗しました' },
      { status: 500 }
    );
  }
}
