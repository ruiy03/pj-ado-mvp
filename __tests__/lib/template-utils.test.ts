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

    it('空のHTMLと空のプレースホルダーリストでエラーなし', () => {
      const html = '<div>Static content</div>';
      const placeholders: string[] = [];
      const result = validatePlaceholders(html, placeholders);
      expect(result).toEqual([]);
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

  describe('getSampleValue', () => {
    it('画像関連のプレースホルダーに対してサンプル画像パスを返す', () => {
      expect(getSampleValue('productImage')).toBe('/images/sample-ad.svg');
      expect(getSampleValue('bannerImg')).toBe('/images/sample-ad.svg');
      expect(getSampleValue('mainPicture')).toBe('/images/sample-ad.svg');
      expect(getSampleValue('heroPhoto')).toBe('/images/sample-ad.svg');
    });

    it('URL関連のプレースホルダーに対してサンプルURLを返す', () => {
      expect(getSampleValue('linkUrl')).toBe('#');
      expect(getSampleValue('buttonHref')).toBe('#');
      expect(getSampleValue('redirectPath')).toBe('#');
    });

    it('タイトル関連のプレースホルダーに対してサンプルタイトルを返す', () => {
      expect(getSampleValue('productTitle')).toBe('サンプルタイトル');
      expect(getSampleValue('mainHeadline')).toBe('サンプルタイトル');
      expect(getSampleValue('pageHeader')).toBe('サンプルタイトル');
      expect(getSampleValue('articleSubject')).toBe('サンプルタイトル');
    });

    it('説明文関連のプレースホルダーに対してサンプル説明文を返す', () => {
      expect(getSampleValue('productDescription')).toBe('サンプル説明文です。ここに実際のコンテンツが表示されます。');
      expect(getSampleValue('bodyText')).toBe('サンプル説明文です。ここに実際のコンテンツが表示されます。');
      expect(getSampleValue('mainContent')).toBe('サンプル説明文です。ここに実際のコンテンツが表示されます。');
      expect(getSampleValue('messageBody')).toBe('サンプル説明文です。ここに実際のコンテンツが表示されます。');
    });

    it('価格関連のプレースホルダーに対してサンプル価格を返す', () => {
      expect(getSampleValue('productPrice')).toBe('無料');
      expect(getSampleValue('serviceCost')).toBe('無料');
      expect(getSampleValue('registrationFee')).toBe('無料');
      expect(getSampleValue('totalAmount')).toBe('無料');
    });

    it('ボタンテキスト関連のプレースホルダーに対してサンプルテキストを返す', () => {
      expect(getSampleValue('buttonText')).toBe('サンプル説明文です。ここに実際のコンテンツが表示されます。');
      expect(getSampleValue('ctaLabel')).toBe('今すぐ登録');
      expect(getSampleValue('actionButton')).toBe('今すぐ登録');
    });

    it('日付関連のプレースホルダーに対してサンプル日付を返す', () => {
      expect(getSampleValue('eventDate')).toBe('2025年12月31日');
      expect(getSampleValue('deadlineTime')).toBe('2025年12月31日');
      expect(getSampleValue('campaignPeriod')).toBe('2025年12月31日');
      expect(getSampleValue('contractDuration')).toBe('2025年12月31日');
    });

    it('名前関連のプレースホルダーに対してサンプル名前を返す', () => {
      expect(getSampleValue('companyName')).toBe('サンプル名');
      expect(getSampleValue('authorName')).toBe('サンプル名');
      expect(getSampleValue('brandName')).toBe('サンプル名');
    });

    it('アイコン関連のプレースホルダーに対してサンプル絵文字を返す', () => {
      expect(getSampleValue('featureIcon')).toBe('🚀');
      expect(getSampleValue('statusSymbol')).toBe('🚀');
      expect(getSampleValue('categoryMark')).toBe('🚀');
    });

    it('就活サービス関連のプレースホルダーに対してサンプルサービス名を返す', () => {
      expect(getSampleValue('platformService')).toBe('就活支援サービス');
      expect(getSampleValue('supportTool')).toBe('就活支援サービス');
      expect(getSampleValue('careerApp')).toBe('就活支援サービス');
      expect(getSampleValue('managementSystem')).toBe('就活支援サービス');
    });

    it('求人・職種関連のプレースホルダーに対してサンプル職種を返す', () => {
      expect(getSampleValue('targetJob')).toBe('新卒採用');
      expect(getSampleValue('availablePosition')).toBe('新卒採用');
      expect(getSampleValue('careerPath')).toBe('#');
      expect(getSampleValue('workRole')).toBe('新卒採用');
    });

    it('業界関連のプレースホルダーに対してサンプル業界名を返す', () => {
      expect(getSampleValue('targetIndustry')).toBe('IT・Web業界');
      expect(getSampleValue('businessField')).toBe('IT・Web業界');
      expect(getSampleValue('marketSector')).toBe('🚀');
    });

    it('特典・メリット関連のプレースホルダーに対してサンプル特典を返す', () => {
      expect(getSampleValue('serviceBenefit')).toBe('就活支援サービス');
      expect(getSampleValue('keyFeature')).toBe('内定獲得率95%');
      expect(getSampleValue('specialAdvantage')).toBe('内定獲得率95%');
      expect(getSampleValue('exclusiveOffer')).toBe('内定獲得率95%');
      expect(getSampleValue('mainMerit')).toBe('内定獲得率95%');
    });

    it('評価・実績関連のプレースホルダーに対してサンプル評価を返す', () => {
      expect(getSampleValue('userRating')).toBe('★★★★★ 4.8');
      expect(getSampleValue('serviceReview')).toBe('就活支援サービス');
      expect(getSampleValue('qualityScore')).toBe('★★★★★ 4.8');
      expect(getSampleValue('successResult')).toBe('★★★★★ 4.8');
      expect(getSampleValue('performanceAchievement')).toBe('★★★★★ 4.8');
    });

    it('ロゴ・パートナー関連のプレースホルダーに対してサンプル名を返す', () => {
      expect(getSampleValue('companyLogo')).toBe('サンプル名');
      expect(getSampleValue('mainSponsor')).toBe('PORTキャリア');
      expect(getSampleValue('businessPartner')).toBe('PORTキャリア');
    });

    it('カテゴリ・タグ関連のプレースホルダーに対してサンプルカテゴリを返す', () => {
      expect(getSampleValue('serviceCategory')).toBe('就活支援サービス');
      expect(getSampleValue('contentTag')).toBe('サンプル説明文です。ここに実際のコンテンツが表示されます。');
      expect(getSampleValue('itemType')).toBe('就活ツール');
      expect(getSampleValue('contentKind')).toBe('サンプル説明文です。ここに実際のコンテンツが表示されます。');
      expect(getSampleValue('articleGenre')).toBe('就活ツール');
    });

    it('認識できないプレースホルダーに対してデフォルトサンプル値を返す', () => {
      expect(getSampleValue('unknownField')).toBe('IT・Web業界');
      expect(getSampleValue('customValue')).toBe('サンプルcustomValue');
      expect(getSampleValue('specialProperty')).toBe('サンプルspecialProperty');
    });

    it('空文字列の場合もデフォルト値を返す', () => {
      expect(getSampleValue('')).toBe('サンプル');
    });

    it('大文字小文字を区別しない', () => {
      expect(getSampleValue('PRODUCTIMAGE')).toBe('/images/sample-ad.svg');
      expect(getSampleValue('ProductTitle')).toBe('サンプルタイトル');
      expect(getSampleValue('BUTTON_TEXT')).toBe('サンプル説明文です。ここに実際のコンテンツが表示されます。');
    });
  });
});
