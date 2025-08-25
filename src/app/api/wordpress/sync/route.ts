import { NextResponse } from 'next/server';
import { performWordPressSync } from '@/lib/wordpress-sync-actions';
import { auth } from '@/auth';
import type { SessionUser } from '@/lib/definitions';

export async function POST() {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const user = session.user as SessionUser;
    if (user.role !== 'admin' && user.role !== 'editor') {
      return NextResponse.json(
        { error: '権限がありません' },
        { status: 403 }
      );
    }

    // WordPress同期を実行
    const result = await performWordPressSync();

    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'WordPress同期に失敗しました',
          details: result.errors
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'WordPress同期が完了しました',
      result: {
        inserted: result.inserted,
        updated: result.updated,
        deleted: result.deleted,
        errors: result.errors
      }
    });

  } catch (error) {
    console.error('WordPress同期APIエラー:', error);
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}