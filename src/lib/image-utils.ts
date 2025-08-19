/**
 * 画像関連のユーティリティ関数
 */

/**
 * プレースホルダー名から画像用かどうかを判定
 */
export function isImagePlaceholder(placeholder: string): boolean {
  const cleanName = placeholder.toLowerCase().replace(/\{\{|\}\}/g, '').trim();
  return cleanName.includes('image') ||
    cleanName.includes('img') ||
    cleanName.includes('photo') ||
    cleanName.includes('picture') ||
    cleanName.includes('logo');
}

/**
 * 値が画像URLかどうかを判定
 */
export function isImageUrl(value: string): boolean {
  return typeof value === 'string' &&
    (value.startsWith('https://') || value.startsWith('http://'));
}

/**
 * content_dataから画像URLを抽出
 */
export function extractImageUrls(contentData: Record<string, string | number | boolean>): Record<string, string> {
  const imageUrls: Record<string, string> = {};

  Object.entries(contentData).forEach(([key, value]) => {
    if (isImageUrl(value as string) && isImagePlaceholder(key)) {
      imageUrls[key] = value as string;
    }
  });

  return imageUrls;
}

/**
 * プレースホルダー名から表示用の名前を生成
 */
export function getCleanPlaceholderName(placeholder: string): string {
  return placeholder.replace(/\{\{|\}\}/g, '').trim();
}
