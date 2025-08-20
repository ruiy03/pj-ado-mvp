import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { hasMinimumRole } from '@/lib/authorization';
import {
  analyzeTemplateChanges,
  validateContentIntegrity,
  getSystemIntegrityStatus,
} from '@/lib/consistency-checker';

// GET: システム全体の整合性状況を取得
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // editorレベル以上のアクセス権限チェック
    if (!(await hasMinimumRole('editor'))) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    const url = new URL(request.url);
    const contentId = url.searchParams.get('contentId');

    // 特定のコンテンツの整合性チェック
    if (contentId) {
      const contentIdNum = parseInt(contentId);
      if (isNaN(contentIdNum)) {
        return NextResponse.json({ error: '無効なコンテンツIDです' }, { status: 400 });
      }

      const result = await validateContentIntegrity(contentIdNum);
      return NextResponse.json(result);
    }

    // システム全体の整合性状況
    const systemStatus = await getSystemIntegrityStatus();
    return NextResponse.json(systemStatus);

  } catch (error) {
    console.error('Integrity check failed:', error);
    return NextResponse.json(
      { error: '整合性チェックに失敗しました' },
      { status: 500 }
    );
  }
}

// POST: テンプレート変更の影響分析
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // editorレベル以上のアクセス権限チェック
    if (!(await hasMinimumRole('editor'))) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    const body = await request.json();
    const { templateId, newHtml, newName } = body;

    // バリデーション
    if (!templateId || typeof templateId !== 'number') {
      return NextResponse.json({ error: 'テンプレートIDが必要です' }, { status: 400 });
    }

    if (!newHtml || typeof newHtml !== 'string' || newHtml.trim() === '') {
      return NextResponse.json({ error: '新しいHTMLコードが必要です' }, { status: 400 });
    }

    // テンプレート変更の影響分析
    const analysisResult = await analyzeTemplateChanges(templateId, newHtml, newName);
    
    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error('Template change analysis failed:', error);
    return NextResponse.json(
      { error: 'テンプレート変更の影響分析に失敗しました' },
      { status: 500 }
    );
  }
}
