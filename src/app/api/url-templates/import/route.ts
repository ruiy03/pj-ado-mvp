import {NextRequest, NextResponse} from 'next/server';
import {auth} from '@/auth';
import {createUrlTemplate} from '@/lib/url-template-actions';
import {hasMinimumRole} from '@/lib/authorization';
import type {CreateUrlTemplateRequest} from '@/lib/definitions';

interface ImportResult {
  success: number;
  errors: string[];
  total: number;
}

function parseCSV(csvText: string): string[][] {
  const result: string[][] = [];
  const lines = csvText.split(/\r?\n/);
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;
  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const line = lines[lineIndex];
    let i = 0;

    while (i < line.length) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // エスケープされた引用符
          currentField += '"';
          i += 2;
        } else {
          // 引用符の開始/終了
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === ',' && !inQuotes) {
        // フィールド区切り
        currentRow.push(currentField);
        currentField = '';
        i++;
      } else {
        currentField += char;
        i++;
      }
    }

    // 行の終了
    if (inQuotes) {
      // 引用符内の改行の場合、次の行に続く
      currentField += '\n';
      lineIndex++;
    } else {
      // 行の終了
      currentRow.push(currentField);
      if (currentRow.length > 0 && currentRow.some(field => field.trim() !== '')) {
        result.push(currentRow);
      }
      currentRow = [];
      currentField = '';
      lineIndex++;
    }
  }

  // 最後の行を追加
  if (currentRow.length > 0) {
    result.push(currentRow);
  }

  return result;
}

function validateUrlTemplateData(data: Record<string, string>): CreateUrlTemplateRequest | null {
  if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
    return null;
  }

  if (!data.url || typeof data.url !== 'string' || data.url.trim() === '') {
    return null;
  }

  // URLの形式をチェック
  try {
    new URL(data.url);
  } catch {
    return null;
  }

  let parameters: Record<string, string> = {};
  if (data.parameters) {
    try {
      parameters = JSON.parse(data.parameters);
      if (typeof parameters !== 'object' || parameters === null || Array.isArray(parameters)) {
        parameters = {};
      }
    } catch {
      // JSON parse failed, treat as empty object
      parameters = {};
    }
  }

  return {
    name: data.name.trim(),
    url: data.url.trim(),
    parameters,
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
    const expectedHeaders = ['name', 'url', 'parameters', 'description'];

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
      total: rows.length - 1
    };

    // データ行を処理
    for (let i = 1; i < rows.length; i++) {
      try {
        const values = rows[i];

        if (values.length !== headers.length) {
          result.errors.push(`行 ${i + 1}: カラム数が一致しません (期待: ${headers.length}, 実際: ${values.length})`);
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
          result.errors.push(`行 ${i + 1}: データが無効です`);
          continue;
        }

        // URLテンプレート作成
        await createUrlTemplate(validatedData);
        result.success++;

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '不明なエラー';
        result.errors.push(`行 ${i + 1}: ${errorMessage}`);
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