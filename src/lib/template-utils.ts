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
  'image', 'img', 'picture',
  'url', 'link', 'href',
  'title', 'headline', 'header',
  'description', 'text', 'content', 'body',
  'price', 'cost', 'fee',
  'button', 'cta', 'action',
  'date', 'time',
  'name', 'author', 'company'
];

export function validatePlaceholderNaming(placeholder: string): boolean {
  const lowerPlaceholder = placeholder.toLowerCase();
  return VALID_PLACEHOLDER_KEYWORDS.some(keyword =>
    lowerPlaceholder.includes(keyword)
  );
}

export function validatePlaceholders(html: string, placeholders: string[]): string[] {
  const extractedPlaceholders = extractPlaceholders(html);
  const missingInList: string[] = [];
  const unusedInHtml: string[] = [];
  const invalidNaming: string[] = [];

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

  const errors: string[] = [];

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
  if (lowerPlaceholder.includes('image') || lowerPlaceholder.includes('img') || lowerPlaceholder.includes('picture')) {
    return 'https://picsum.photos/300/200';
  }

  // URL関連のプレースホルダー
  if (lowerPlaceholder.includes('url') || lowerPlaceholder.includes('link') || lowerPlaceholder.includes('href')) {
    return '#';
  }

  // タイトル関連のプレースホルダー
  if (lowerPlaceholder.includes('title') || lowerPlaceholder.includes('headline') || lowerPlaceholder.includes('header')) {
    return 'サンプルタイトル';
  }

  // 説明文関連のプレースホルダー
  if (lowerPlaceholder.includes('description') || lowerPlaceholder.includes('text') || lowerPlaceholder.includes('content') || lowerPlaceholder.includes('body')) {
    return 'サンプル説明文です。ここに実際のコンテンツが表示されます。';
  }

  // 価格関連のプレースホルダー
  if (lowerPlaceholder.includes('price') || lowerPlaceholder.includes('cost') || lowerPlaceholder.includes('fee')) {
    return '¥9,800';
  }

  // ボタンテキスト関連のプレースホルダー
  if (lowerPlaceholder.includes('button') || lowerPlaceholder.includes('cta') || lowerPlaceholder.includes('action')) {
    return '詳細を見る';
  }

  // 日付関連のプレースホルダー
  if (lowerPlaceholder.includes('date') || lowerPlaceholder.includes('time')) {
    return '2024年12月31日';
  }

  // 名前関連のプレースホルダー
  if (lowerPlaceholder.includes('name') || lowerPlaceholder.includes('author') || lowerPlaceholder.includes('company')) {
    return 'サンプル名';
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
