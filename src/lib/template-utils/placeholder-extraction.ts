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

export function getSampleValue(placeholder: string): string {
  const lowerPlaceholder = placeholder.toLowerCase();

  // 基本カテゴリ（7つ）- 完全一致判定
  if (lowerPlaceholder === 'image') {
    return '/images/sample-ad.svg';
  }

  if (lowerPlaceholder === 'link') {
    return '#';
  }

  if (lowerPlaceholder === 'title') {
    return 'サンプルタイトル';
  }

  if (lowerPlaceholder === 'text') {
    return 'サンプル説明文です。ここに実際のコンテンツが表示されます。';
  }

  if (lowerPlaceholder === 'button') {
    return '今すぐ登録';
  }

  if (lowerPlaceholder === 'price') {
    return '無料';
  }

  if (lowerPlaceholder === 'date') {
    return '2025年12月31日';
  }

  // 就活関連カテゴリ（3つ）- 完全一致判定
  if (lowerPlaceholder === 'service') {
    return '就活支援サービス';
  }

  if (lowerPlaceholder === 'benefit') {
    return '内定獲得率95%';
  }

  if (lowerPlaceholder === 'rating') {
    return '★★★★★ 4.8';
  }

  // その他のプレースホルダー
  return `サンプル${placeholder}`;
}
