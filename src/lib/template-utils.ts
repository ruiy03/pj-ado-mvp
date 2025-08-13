export function extractPlaceholders(html: string): string[] {
  const placeholderRegex = /\{\{([^}]+)\}\}/g;
  const placeholders: string[] = [];
  let match;

  while ((match = placeholderRegex.exec(html)) !== null) {
    const placeholder = match[1].trim();
    if (placeholder && !placeholders.includes(placeholder)) {
      placeholders.push(placeholder);
    }
  }

  return placeholders.sort();
}

const VALID_PLACEHOLDER_KEYWORDS = [
  // 画像関連
  'Image', 'Img', 'Picture', 'Photo', 'Banner',
  // URL関連
  'Url', 'Link', 'Href', 'Path',
  // タイトル関連
  'Title', 'Headline', 'Header', 'Subject',
  // 説明文関連
  'Description', 'Text', 'Content', 'Body', 'Message',
  // 価格関連
  'Price', 'Cost', 'Fee', 'Amount',
  // ボタン関連
  'Button', 'Cta', 'Action', 'Label',
  // 日付関連
  'Date', 'Time', 'Period', 'Duration',
  // 名前関連
  'Name', 'Author', 'Company', 'Brand',
  // アイコン関連
  'Icon', 'Symbol', 'Mark',
  // 就活関連キーワード
  'Service', 'Tool', 'Platform', 'App', 'System',
  'Job', 'Position', 'Career', 'Work', 'Role',
  'Industry', 'Sector',
  'Benefit', 'Feature', 'Advantage', 'Offer', 'Merit',
  'Rating', 'Review', 'Score', 'Result', 'Achievement',
  'Logo', 'Sponsor', 'Partner',
  'Category', 'Tag', 'Type', 'Kind', 'Genre'
];

export function validatePlaceholderNaming(placeholder: string): boolean {
  if (!placeholder || placeholder.trim() === '') return false;
  
  const lowerPlaceholder = placeholder.toLowerCase();
  return VALID_PLACEHOLDER_KEYWORDS.some(keyword =>
    lowerPlaceholder.includes(keyword.toLowerCase())
  );
}

export function validatePlaceholders(html: string, placeholders: string[]): string[] {
  const extractedPlaceholders = extractPlaceholders(html);
  const missingInList: string[] = [];
  const unusedInHtml: string[] = [];
  const invalidNaming: string[] = [];
  const requiredPlaceholders: string[] = ['linkUrl']; // 必須プレースホルダー
  const missingRequired: string[] = [];

  extractedPlaceholders.forEach(extracted => {
    if (!placeholders.includes(extracted)) {
      missingInList.push(extracted);
    }
  });

  placeholders.forEach(placeholder => {
    if (!extractedPlaceholders.includes(placeholder)) {
      unusedInHtml.push(placeholder);
    }
    if (!validatePlaceholderNaming(placeholder)) {
      invalidNaming.push(placeholder);
    }
  });

  // 必須プレースホルダーのチェック
  requiredPlaceholders.forEach(required => {
    if (!extractedPlaceholders.includes(required)) {
      missingRequired.push(required);
    }
  });

  const errors: string[] = [];

  if (missingRequired.length > 0) {
    errors.push(`必須プレースホルダーが不足: ${missingRequired.join(', ')}`);
  }

  if (missingInList.length > 0) {
    errors.push(`HTMLに存在するがリストにないプレースホルダー: ${missingInList.join(', ')}`);
  }

  if (unusedInHtml.length > 0) {
    errors.push(`リストにあるがHTMLで使用されていないプレースホルダー: ${unusedInHtml.join(', ')}`);
  }

  if (invalidNaming.length > 0) {
    errors.push(`命名規則に違反するプレースホルダー: ${invalidNaming.join(', ')}`);
  }

  return errors;
}

export function getSampleValue(placeholder: string): string {
  const lowerPlaceholder = placeholder.toLowerCase();

  // 画像関連のプレースホルダー
  if (lowerPlaceholder.includes('image') || lowerPlaceholder.includes('img') || lowerPlaceholder.includes('picture') ||
    lowerPlaceholder.includes('photo') || lowerPlaceholder.includes('banner')) {
    return 'https://picsum.photos/300/200';
  }

  // URL関連のプレースホルダー
  if (lowerPlaceholder.includes('url') || lowerPlaceholder.includes('link') || lowerPlaceholder.includes('href') ||
    lowerPlaceholder.includes('path')) {
    return '#';
  }

  // タイトル関連のプレースホルダー
  if (lowerPlaceholder.includes('title') || lowerPlaceholder.includes('headline') || lowerPlaceholder.includes('header') ||
    lowerPlaceholder.includes('subject')) {
    return 'サンプルタイトル';
  }

  // 説明文関連のプレースホルダー
  if (lowerPlaceholder.includes('description') || lowerPlaceholder.includes('text') || lowerPlaceholder.includes('content') ||
    lowerPlaceholder.includes('body') || lowerPlaceholder.includes('message')) {
    return 'サンプル説明文です。ここに実際のコンテンツが表示されます。';
  }

  // 価格関連のプレースホルダー
  if (lowerPlaceholder.includes('price') || lowerPlaceholder.includes('cost') || lowerPlaceholder.includes('fee') ||
    lowerPlaceholder.includes('amount')) {
    return '無料';
  }

  // ボタンテキスト関連のプレースホルダー
  if (lowerPlaceholder.includes('button') || lowerPlaceholder.includes('cta') || lowerPlaceholder.includes('action') ||
    lowerPlaceholder.includes('label')) {
    return '今すぐ登録';
  }

  // 日付関連のプレースホルダー
  if (lowerPlaceholder.includes('date') || lowerPlaceholder.includes('time') || lowerPlaceholder.includes('period') ||
    lowerPlaceholder.includes('duration')) {
    return '2025年12月31日';
  }

  // 名前関連のプレースホルダー
  if (lowerPlaceholder.includes('name') || lowerPlaceholder.includes('author') || lowerPlaceholder.includes('company') ||
    lowerPlaceholder.includes('brand')) {
    return 'サンプル名';
  }

  // アイコン関連のプレースホルダー
  if (lowerPlaceholder.includes('icon') || lowerPlaceholder.includes('symbol') || lowerPlaceholder.includes('mark')) {
    return '🚀';
  }

  // 就活サービス関連のプレースホルダー
  if (lowerPlaceholder.includes('service') || lowerPlaceholder.includes('tool') || lowerPlaceholder.includes('platform') ||
    lowerPlaceholder.includes('app') || lowerPlaceholder.includes('system')) {
    return '就活支援サービス';
  }

  // 求人・職種関連のプレースホルダー
  if (lowerPlaceholder.includes('job') || lowerPlaceholder.includes('position') || lowerPlaceholder.includes('career') ||
    lowerPlaceholder.includes('work') || lowerPlaceholder.includes('role')) {
    return '新卒採用';
  }

  // 業界関連のプレースホルダー
  if (lowerPlaceholder.includes('industry') || lowerPlaceholder.includes('field') || lowerPlaceholder.includes('sector')) {
    return 'IT・Web業界';
  }

  // 特典・メリット関連のプレースホルダー
  if (lowerPlaceholder.includes('benefit') || lowerPlaceholder.includes('feature') || lowerPlaceholder.includes('advantage') ||
    lowerPlaceholder.includes('offer') || lowerPlaceholder.includes('merit')) {
    return '内定獲得率95%';
  }

  // 評価・実績関連のプレースホルダー
  if (lowerPlaceholder.includes('rating') || lowerPlaceholder.includes('review') || lowerPlaceholder.includes('score') ||
    lowerPlaceholder.includes('result') || lowerPlaceholder.includes('achievement')) {
    return '★★★★★ 4.8';
  }

  // ロゴ・パートナー関連のプレースホルダー
  if (lowerPlaceholder.includes('logo') || lowerPlaceholder.includes('sponsor') || lowerPlaceholder.includes('partner')) {
    return 'PORTキャリア';
  }

  // カテゴリ・タグ関連のプレースホルダー
  if (lowerPlaceholder.includes('category') || lowerPlaceholder.includes('tag') || lowerPlaceholder.includes('type') ||
    lowerPlaceholder.includes('kind') || lowerPlaceholder.includes('genre')) {
    return '就活ツール';
  }

  // その他のプレースホルダー
  return `サンプル${placeholder}`;
}

/**
 * HTMLコード内のaタグにrel="nofollow"を自動追加する
 * 既にrel属性がある場合は、nofollowが含まれていなければ追加する
 */
export function addNofollowToLinks(html: string): string {
  return html.replace(/<a\s+([^>]*?)>/gi, (match, attributes) => {
    // rel属性が既に存在するかチェック
    const relMatch = attributes.match(/rel\s*=\s*["']([^"']*?)["']/i);

    if (relMatch) {
      // 既存のrel属性がある場合
      const currentRel = relMatch[1];
      if (!currentRel.includes('nofollow')) {
        // nofollowが含まれていない場合は追加
        const newRel = currentRel.trim() ? `${currentRel} nofollow` : 'nofollow';
        return `<a ${attributes.replace(relMatch[0], `rel="${newRel}"`)}>`;
      }
      // 既にnofollowが含まれている場合はそのまま
      return match;
    } else {
      // rel属性がない場合は追加
      return `<a ${attributes} rel="nofollow">`;
    }
  });
}

/**
 * HTMLコード内のaタグからrel="nofollow"を削除する
 */
export function removeNofollowFromLinks(html: string): string {
  return html.replace(/<a\s+([^>]*?)>/gi, (match, attributes) => {
    const relMatch = attributes.match(/rel\s*=\s*["']([^"']*?)["']/i);

    if (relMatch) {
      const currentRel = relMatch[1];
      const newRel = currentRel.replace(/\bnofollow\b/gi, '').replace(/\s+/g, ' ').trim();

      if (newRel) {
        return `<a ${attributes.replace(relMatch[0], `rel="${newRel}"`)}>`;
      } else {
        // rel属性が空になる場合は削除
        return `<a ${attributes.replace(/\s*rel\s*=\s*["'][^"']*?["']/i, '')}>`;
      }
    }

    return match;
  });
}

/**
 * HTMLコード内のリンクを安全化（プレビュー用）
 * href属性を無効化し、nofollowを追加
 */
export function sanitizeLinksForPreview(html: string): string {
  return html.replace(/<a\s+([^>]*?)>/gi, (match, attributes) => {
    // href属性を無効化（#に変更）
    const sanitizedAttributes = attributes.replace(/href\s*=\s*["'][^"']*?["']/gi, 'href="#"');

    // nofollowを追加
    const withNofollow = addNofollowToLinks(`<a ${sanitizedAttributes}>`);
    return withNofollow;
  });
}
