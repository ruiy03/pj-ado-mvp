import { extractPlaceholders, validatePlaceholders, validatePlaceholderNaming, getSampleValue } from '@/lib/template-utils';

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
      const html = '<div>{{title}}</div><img src="{{image}}" /><a href="{{link}}">Link</a>';
      const placeholders = ['title', 'image', 'link'];
      const result = validatePlaceholders(html, placeholders);
      expect(result).toEqual([]);
    });

    it('HTMLに存在するがリストにないプレースホルダーを検出する', () => {
      const html = '<div>{{title}}</div><img src="{{image}}" /><a href="{{invalidName}}">Link</a>';
      const placeholders = ['title', 'image'];
      const result = validatePlaceholders(html, placeholders);
      expect(result).toEqual(['HTMLに存在するがリストにないプレースホルダー: invalidName']);
    });

    it('リストにあるがHTMLで使用されていないプレースホルダーを検出する', () => {
      const html = '<div>{{title}}</div><a href="{{link}}">Link</a>';
      const placeholders = ['title', 'link', 'image', 'text'];
      const result = validatePlaceholders(html, placeholders);
      expect(result).toEqual(['リストにあるがHTMLで使用されていないプレースホルダー: image, text']);
    });

    it('両方の問題を同時に検出する', () => {
      const html = '<div>{{title}}</div><span>{{newField}}</span><a href="{{link}}">Link</a>';
      const placeholders = ['title', 'link', 'oldField'];
      const result = validatePlaceholders(html, placeholders);
      expect(result).toEqual([
        'HTMLに存在するがリストにないプレースホルダー: newField',
        'リストにあるがHTMLで使用されていないプレースホルダー: oldField',
        '命名規則に違反するプレースホルダー: oldField'
      ]);
    });

    it('空のHTMLと空のプレースホルダーリストでエラーなし', () => {
      const html = '<div>Static content</div>';
      const placeholders: string[] = [];
      const result = validatePlaceholders(html, placeholders);
      expect(result).toEqual([]);
    });

    it('命名規則違反と不整合の両方を検出する', () => {
      const html = '<div>{{title}}</div><span>{{invalidField}}</span><a href="{{link}}">Link</a>';
      const placeholders = ['title', 'link', 'wrongField'];
      const result = validatePlaceholders(html, placeholders);
      expect(result).toEqual([
        'HTMLに存在するがリストにないプレースホルダー: invalidField',
        'リストにあるがHTMLで使用されていないプレースホルダー: wrongField',
        '命名規則に違反するプレースホルダー: wrongField'
      ]);
    });
  });

  describe('validatePlaceholderNaming', () => {
    it('新しいシンプルルールで有効なプレースホルダーを認識する', () => {
      // 基本カテゴリ（7つ）
      expect(validatePlaceholderNaming('image')).toBe(true);
      expect(validatePlaceholderNaming('link')).toBe(true);
      expect(validatePlaceholderNaming('title')).toBe(true);
      expect(validatePlaceholderNaming('text')).toBe(true);
      expect(validatePlaceholderNaming('button')).toBe(true);
      expect(validatePlaceholderNaming('price')).toBe(true);
      expect(validatePlaceholderNaming('date')).toBe(true);
      
      // 就活関連カテゴリ（3つ）
      expect(validatePlaceholderNaming('service')).toBe(true);
      expect(validatePlaceholderNaming('benefit')).toBe(true);
      expect(validatePlaceholderNaming('rating')).toBe(true);
    });

    it('大文字小文字の違いがあっても認識する', () => {
      expect(validatePlaceholderNaming('IMAGE')).toBe(true);
      expect(validatePlaceholderNaming('Title')).toBe(true);
      expect(validatePlaceholderNaming('Button')).toBe(true);
    });

    it('古いキーワードベースのプレースホルダーを拒否する', () => {
      expect(validatePlaceholderNaming('productImage')).toBe(false);
      expect(validatePlaceholderNaming('ctaButton')).toBe(false);
      expect(validatePlaceholderNaming('imageUrl')).toBe(false);
      expect(validatePlaceholderNaming('linkUrl')).toBe(false);
      expect(validatePlaceholderNaming('description')).toBe(false);
    });

    it('無効なプレースホルダーを拒否する', () => {
      expect(validatePlaceholderNaming('invalidField')).toBe(false);
      expect(validatePlaceholderNaming('randomValue')).toBe(false);
      expect(validatePlaceholderNaming('xyz')).toBe(false);
      expect(validatePlaceholderNaming('')).toBe(false);
    });
  });

  describe('getSampleValue', () => {
    it('基本カテゴリ（完全一致）のテスト', () => {
      expect(getSampleValue('image')).toBe('/images/sample-ad.svg');
      expect(getSampleValue('link')).toBe('#');
      expect(getSampleValue('title')).toBe('サンプルタイトル');
      expect(getSampleValue('text')).toBe('サンプル説明文です。ここに実際のコンテンツが表示されます。');
      expect(getSampleValue('button')).toBe('今すぐ登録');
      expect(getSampleValue('price')).toBe('無料');
      expect(getSampleValue('date')).toBe('2025年12月31日');
    });

    it('就活関連カテゴリ（完全一致）のテスト', () => {
      expect(getSampleValue('service')).toBe('就活支援サービス');
      expect(getSampleValue('benefit')).toBe('内定獲得率95%');
      expect(getSampleValue('rating')).toBe('★★★★★ 4.8');
    });

    it('大文字小文字を区別しない', () => {
      expect(getSampleValue('IMAGE')).toBe('/images/sample-ad.svg');
      expect(getSampleValue('Link')).toBe('#');
      expect(getSampleValue('Title')).toBe('サンプルタイトル');
      expect(getSampleValue('TEXT')).toBe('サンプル説明文です。ここに実際のコンテンツが表示されます。');
      expect(getSampleValue('Button')).toBe('今すぐ登録');
      expect(getSampleValue('SERVICE')).toBe('就活支援サービス');
    });

    it('認識できないプレースホルダーに対してデフォルトサンプル値を返す', () => {
      expect(getSampleValue('unknownField')).toBe('サンプルunknownField');
      expect(getSampleValue('customValue')).toBe('サンプルcustomValue');
      expect(getSampleValue('specialProperty')).toBe('サンプルspecialProperty');
    });

    it('空文字列の場合もデフォルト値を返す', () => {
      expect(getSampleValue('')).toBe('サンプル');
    });

    it('複合的なプレースホルダー（旧式）はデフォルト値を返す', () => {
      expect(getSampleValue('imageUrl')).toBe('サンプルimageUrl');
      expect(getSampleValue('linkUrl')).toBe('サンプルlinkUrl');
      expect(getSampleValue('buttonText')).toBe('サンプルbuttonText');
      expect(getSampleValue('productImage')).toBe('サンプルproductImage');
    });
  });
});
