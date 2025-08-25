export function parseCSV(csvText: string): string[][] {
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

/**
 * オブジェクト配列からCSV文字列を生成
 */
export function generateCsvContent(data: Record<string, string>[]): string {
  if (data.length === 0) {
    return '';
  }

  // ヘッダー行を生成（最初のオブジェクトのキーを使用）
  const headers = Object.keys(data[0]);
  const headerRow = headers.map(header => escapeCsvField(header)).join(',');

  // データ行を生成
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header] || '';
      return escapeCsvField(value);
    }).join(',');
  });

  // BOM付きCSV文字列を生成（日本語の文字化け対策）
  const csvContent = [headerRow, ...dataRows].join('\n');
  return '\ufeff' + csvContent; // BOM (Byte Order Mark) を先頭に追加
}

/**
 * CSVフィールドのエスケープ処理
 */
function escapeCsvField(field: string): string {
  // 文字列に変換
  const stringField = String(field);
  
  // カンマ、改行、引用符が含まれている場合は引用符で囲む
  if (stringField.includes(',') || stringField.includes('\n') || stringField.includes('\r') || stringField.includes('"')) {
    // 引用符をエスケープして引用符で囲む
    return '"' + stringField.replace(/"/g, '""') + '"';
  }
  
  return stringField;
}