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
