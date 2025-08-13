import { extractPlaceholders, validatePlaceholders, validatePlaceholderNaming } from '@/lib/template-utils';

describe('template-utils', () => {
  describe('extractPlaceholders', () => {
    it('HTMLから基本的なプレースホルダーを抽出する', () => {
      const html = '<div>{{title}}</div><img src="{{imageUrl}}" />';
      const result = extractPlaceholders(html);
      expect(result).toEqual(['imageUrl', 'title']);
    });

    it('重複するプレースホルダーを排除する', () => {
      const html = '<div>{{title}}</div><h1>{{title}}</h1>';
      const result = extractPlaceholders(html);
      expect(result).toEqual(['title']);
    });

    it('空白を含むプレースホルダーを正しく処理する', () => {
      const html = '<div>{{ title }}</div><p>{{  description  }}</p>';
      const result = extractPlaceholders(html);
      expect(result).toEqual(['description', 'title']);
    });

    it('プレースホルダーがない場合は空配列を返す', () => {
      const html = '<div>Static content</div>';
      const result = extractPlaceholders(html);
      expect(result).toEqual([]);
    });

    it('複雑なHTMLから複数のプレースホルダーを抽出する', () => {
      const html = `
        <div class="ad-banner">
          <h2>{{title}}</h2>
          <img src="{{imageUrl}}" alt="{{altText}}" />
          <p>{{description}}</p>
          <a href="{{linkUrl}}" class="btn">{{buttonText}}</a>
          <span class="price">{{price}}</span>
        </div>
      `;
      const result = extractPlaceholders(html);
      expect(result).toEqual([
        'altText',
        'buttonText', 
        'description',
        'imageUrl',
        'linkUrl',
        'price',
        'title'
      ]);
    });

    it('無効な形式のプレースホルダーは無視する', () => {
      const html = '<div>{title}</div><p>{{valid}}</p><span>{invalid}</span>';
      const result = extractPlaceholders(html);
      expect(result).toEqual(['valid']);
    });
  });

  describe('validatePlaceholders', () => {
    it('HTMLとプレースホルダーリストが一致する場合はエラーなし', () => {
      const html = '<div>{{title}}</div><img src="{{imageUrl}}" /><a href="{{linkUrl}}">Link</a>';
      const placeholders = ['title', 'imageUrl', 'linkUrl'];
      const result = validatePlaceholders(html, placeholders);
      expect(result).toEqual([]);
    });

    it('HTMLに存在するがリストにないプレースホルダーを検出する', () => {
      const html = '<div>{{title}}</div><img src="{{imageUrl}}" /><a href="{{linkUrl}}">Link</a>';
      const placeholders = ['title', 'linkUrl'];
      const result = validatePlaceholders(html, placeholders);
      expect(result).toEqual(['HTMLに存在するがリストにないプレースホルダー: imageUrl']);
    });

    it('リストにあるがHTMLで使用されていないプレースホルダーを検出する', () => {
      const html = '<div>{{title}}</div><a href="{{linkUrl}}">Link</a>';
      const placeholders = ['title', 'linkUrl', 'imageUrl', 'description'];
      const result = validatePlaceholders(html, placeholders);
      expect(result).toEqual(['リストにあるがHTMLで使用されていないプレースホルダー: imageUrl, description']);
    });

    it('両方の問題を同時に検出する', () => {
      const html = '<div>{{title}}</div><span>{{newField}}</span><a href="{{linkUrl}}">Link</a>';
      const placeholders = ['title', 'linkUrl', 'oldField'];
      const result = validatePlaceholders(html, placeholders);
      expect(result).toEqual([
        'HTMLに存在するがリストにないプレースホルダー: newField',
        'リストにあるがHTMLで使用されていないプレースホルダー: oldField',
        '命名規則に違反するプレースホルダー: oldField'
      ]);
    });

    it('空のHTMLと空のプレースホルダーリストで必須エラーのみ', () => {
      const html = '<div>Static content</div>';
      const placeholders: string[] = [];
      const result = validatePlaceholders(html, placeholders);
      expect(result).toEqual(['必須プレースホルダーが不足: linkUrl']);
    });

    it('命名規則違反と不整合の両方を検出する', () => {
      const html = '<div>{{title}}</div><span>{{invalidField}}</span><a href="{{linkUrl}}">Link</a>';
      const placeholders = ['title', 'linkUrl', 'wrongField'];
      const result = validatePlaceholders(html, placeholders);
      expect(result).toEqual([
        'HTMLに存在するがリストにないプレースホルダー: invalidField',
        'リストにあるがHTMLで使用されていないプレースホルダー: wrongField',
        '命名規則に違反するプレースホルダー: wrongField'
      ]);
    });
  });

  describe('validatePlaceholderNaming', () => {
    it('有効な画像系プレースホルダーを認識する', () => {
      expect(validatePlaceholderNaming('productImage')).toBe(true);
      expect(validatePlaceholderNaming('bannerImg')).toBe(true);
      expect(validatePlaceholderNaming('heroPicture')).toBe(true);
    });

    it('有効なURL系プレースホルダーを認識する', () => {
      expect(validatePlaceholderNaming('productUrl')).toBe(true);
      expect(validatePlaceholderNaming('ctaLink')).toBe(true);
      expect(validatePlaceholderNaming('buttonHref')).toBe(true);
    });

    it('有効なタイトル系プレースホルダーを認識する', () => {
      expect(validatePlaceholderNaming('productTitle')).toBe(true);
      expect(validatePlaceholderNaming('mainHeadline')).toBe(true);
      expect(validatePlaceholderNaming('pageHeader')).toBe(true);
    });

    it('有効な説明文系プレースホルダーを認識する', () => {
      expect(validatePlaceholderNaming('productDescription')).toBe(true);
      expect(validatePlaceholderNaming('bodyText')).toBe(true);
      expect(validatePlaceholderNaming('mainContent')).toBe(true);
    });

    it('無効なプレースホルダーを拒否する', () => {
      expect(validatePlaceholderNaming('invalidField')).toBe(false);
      expect(validatePlaceholderNaming('randomValue')).toBe(false);
      expect(validatePlaceholderNaming('xyz')).toBe(false);
      expect(validatePlaceholderNaming('')).toBe(false);
    });

    it('大文字小文字を区別しない', () => {
      expect(validatePlaceholderNaming('PRODUCTTITLE')).toBe(true);
      expect(validatePlaceholderNaming('ProductImage')).toBe(true);
      expect(validatePlaceholderNaming('button_text')).toBe(true);
    });
  });
});
