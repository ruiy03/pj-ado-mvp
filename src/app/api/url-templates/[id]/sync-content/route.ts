import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { hasMinimumRole } from '@/lib/authorization';
import { sql } from '@/lib/db';
import { extractPlaceholders } from '@/lib/template-utils';

// POST: URLテンプレート変更時にad_contentsを自動同期
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // editorレベル以上のアクセス権限チェック
    if (!(await hasMinimumRole('editor'))) {
      return NextResponse.json({ error: 'アクセス権限がありません' }, { status: 403 });
    }

    const { id } = await params;
    const templateId = parseInt(id);

    if (isNaN(templateId)) {
      return NextResponse.json({ error: '無効なURLテンプレートIDです' }, { status: 400 });
    }

    const body = await request.json();
    const { newUrlTemplate } = body;

    if (!newUrlTemplate || typeof newUrlTemplate !== 'string') {
      return NextResponse.json({ error: '新しいURLテンプレートが必要です' }, { status: 400 });
    }

    // 現在のURLテンプレート情報を取得
    const templateResult = await sql`
      SELECT url_template FROM url_templates WHERE id = ${templateId}
    `;

    if (templateResult.length === 0) {
      return NextResponse.json({ error: 'URLテンプレートが見つかりません' }, { status: 404 });
    }

    const currentUrlTemplate = templateResult[0].url_template;
    const oldPlaceholders = extractPlaceholders(currentUrlTemplate);
    const newPlaceholders = extractPlaceholders(newUrlTemplate);

    // 削除されたプレースホルダーと追加されたプレースホルダーを特定
    const removedPlaceholders = oldPlaceholders.filter(p => !newPlaceholders.includes(p));
    const addedPlaceholders = newPlaceholders.filter(p => !oldPlaceholders.includes(p));

    // このURLテンプレートを使用するad_contentsを取得
    const contentsResult = await sql`
      SELECT id, name, content_data 
      FROM ad_contents 
      WHERE url_template_id = ${templateId}
    `;

    const updatedContents: Array<{
      id: number;
      name: string;
      removed: string[];
      added: string[];
    }> = [];

    // 各ad_contentのcontent_dataを更新
    for (const content of contentsResult) {
      const contentData = typeof content.content_data === 'string' 
        ? JSON.parse(content.content_data) 
        : (content.content_data || {});

      let hasChanges = false;

      // 削除されたプレースホルダーをcontent_dataから除去
      removedPlaceholders.forEach(placeholder => {
        if (placeholder in contentData) {
          delete contentData[placeholder];
          hasChanges = true;
        }
      });

      // 追加されたプレースホルダーは手動で追加してもらうため、ここでは何もしない
      // (警告は整合性チェックで表示される)

      if (hasChanges) {
        // content_dataを更新
        await sql`
          UPDATE ad_contents 
          SET content_data = ${JSON.stringify(contentData)}, updated_at = NOW()
          WHERE id = ${content.id}
        `;

        updatedContents.push({
          id: content.id,
          name: content.name,
          removed: removedPlaceholders.filter(p => p in (typeof content.content_data === 'string' ? JSON.parse(content.content_data) : content.content_data || {})),
          added: addedPlaceholders
        });
      } else if (addedPlaceholders.length > 0) {
        // 削除はないが追加がある場合も記録
        updatedContents.push({
          id: content.id,
          name: content.name,
          removed: [],
          added: addedPlaceholders
        });
      }
    }

    return NextResponse.json({
      message: 'ad_contentsの同期が完了しました',
      updated_contents: updatedContents,
      summary: {
        total_contents: contentsResult.length,
        updated_contents: updatedContents.filter(c => c.removed.length > 0).length,
        contents_with_new_placeholders: updatedContents.filter(c => c.added.length > 0).length,
        removed_placeholders: removedPlaceholders,
        added_placeholders: addedPlaceholders
      }
    });

  } catch (error) {
    console.error('URL template content sync failed:', error);
    return NextResponse.json(
      { error: 'ad_contentsの同期に失敗しました' },
      { status: 500 }
    );
  }
}
