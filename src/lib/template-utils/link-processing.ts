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
