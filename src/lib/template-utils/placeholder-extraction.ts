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

  // 画像関連のプレースホルダー
  if (lowerPlaceholder.includes('image') || lowerPlaceholder.includes('img') || lowerPlaceholder.includes('picture') ||
    lowerPlaceholder.includes('photo') || lowerPlaceholder.includes('banner')) {
    return '/images/sample-ad.svg';
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
