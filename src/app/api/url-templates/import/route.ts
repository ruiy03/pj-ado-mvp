import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@/auth';
import {createOrUpdateUrlTemplate} from '@/lib/url-template-actions';
import {hasMinimumRole} from '@/lib/authorization';
import {parseCSV} from '@/lib/csv-utils';
import type {CreateUrlTemplateRequest, ImportResult} from '@/lib/definitions';

function validateUrlTemplateData(data: Record<string, string>): CreateUrlTemplateRequest | null {
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    return null;
  }

  if (!data.url_template || typeof data.url_template !== 'string' || data.url_template.trim() === '') {
    return null;
  }

  // URLテンプレートの基本形式をチェック（プレースホルダーを適切な値に置換してURLチェック）
  try {
    let tempUrl = data.url_template;
    // baseUrlのようなURLベース部分は完全なURLに置換
    tempUrl = tempUrl.replace(/\{\{baseUrl\}\}/g, 'https://example.com');
    // その他のプレースホルダーは適切な値に置換
    tempUrl = tempUrl.replace(/\{\{[^}]+\}\}/g, 'placeholder');
    new URL(tempUrl);
  } catch {
    return null;
  }

  return {
    name: data.name.trim(),
    url_template: data.url_template.trim(),
    description: data.description || '',
  };
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

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({error: 'ファイルが選択されていません'}, {status: 400});
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      return NextResponse.json({error: 'CSVファイルを選択してください'}, {status: 400});
    }

    const csvText = await file.text();
    const rows = parseCSV(csvText);

    if (rows.length < 2) {
      return NextResponse.json({error: 'CSVファイルが空か、ヘッダーのみです'}, {status: 400});
    }

    const headers = rows[0].map(h => h.toLowerCase().trim());
    const expectedHeaders = ['name', 'url_template', 'description'];

    // ヘッダー検証
    const missingHeaders = expectedHeaders.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return NextResponse.json({
        error: `必要なヘッダーが不足しています: ${missingHeaders.join(', ')}`
      }, {status: 400});
    }

    const result: ImportResult = {
      success: 0,
      errors: [],
      total: rows.length - 1,
      createdItems: [],
      updatedItems: [],
      skippedItems: []
    };

    // データ行を処理
    for (let i = 1; i < rows.length; i++) {
      try {
        const values = rows[i];

        if (values.length !== headers.length) {
          result.errors.push({
            row: i + 1,
            name: values[headers.indexOf('name')] || '',
            message: `カラム数が一致しません (期待: ${headers.length}, 実際: ${values.length})`
          });
          continue;
        }

        // データオブジェクト作成
        const rowData: Record<string, string> = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });

        // バリデーション
        const validatedData = validateUrlTemplateData(rowData);
        if (!validatedData) {
          result.errors.push({
            row: i + 1,
            name: rowData.name || '',
            message: 'データが無効です'
          });
          continue;
        }

        // URLテンプレート作成、更新、またはスキップ
        const {template, action} = await createOrUpdateUrlTemplate(validatedData);
        result.success++;
        
        const templateItem = {
          id: template.id,
          name: template.name
        };
        
        switch (action) {
          case 'created':
            result.createdItems.push(templateItem);
            break;
          case 'updated':
            result.updatedItems.push(templateItem);
            break;
          case 'skipped':
            result.skippedItems.push(templateItem);
            break;
        }

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '不明なエラー';
        const values = rows[i];
        const rowData: Record<string, string> = {};
        headers.forEach((header, index) => {
          rowData[header] = values[index] || '';
        });
        result.errors.push({
          row: i + 1,
          name: rowData.name || '',
          message: errorMessage
        });
      }
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Failed to import URL templates:', error);
    return NextResponse.json(
      {error: 'URLテンプレートのインポートに失敗しました'},
      {status: 500}
    );
  }
}
