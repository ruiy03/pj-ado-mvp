import {
  addNofollowToLinks,
  removeNofollowFromLinks,
  sanitizeLinksForPreview,
} from '@/lib/template-utils/link-processing';

describe('link-processing', () => {
  describe('addNofollowToLinks', () => {
    it('rel属性がないリンクにnofollowを追加する', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = addNofollowToLinks(html);
      expect(result).toBe('<a href="https://example.com" rel="nofollow">Link</a>');
    });

    it('空のrel属性にnofollowを設定する', () => {
      const html = '<a href="https://example.com" rel="">Link</a>';
      const result = addNofollowToLinks(html);
      expect(result).toBe('<a href="https://example.com" rel="nofollow">Link</a>');
    });

    it('既存のrel属性にnofollowを追加する', () => {
      const html = '<a href="https://example.com" rel="external">Link</a>';
      const result = addNofollowToLinks(html);
      expect(result).toBe('<a href="https://example.com" rel="external nofollow">Link</a>');
    });

    it('nofollowが既に含まれている場合は変更しない', () => {
      const html = '<a href="https://example.com" rel="nofollow">Link</a>';
      const result = addNofollowToLinks(html);
      expect(result).toBe('<a href="https://example.com" rel="nofollow">Link</a>');
    });

    it('複数のrel値の中にnofollowが含まれている場合は変更しない', () => {
      const html = '<a href="https://example.com" rel="external nofollow sponsored">Link</a>';
      const result = addNofollowToLinks(html);
      expect(result).toBe('<a href="https://example.com" rel="external nofollow sponsored">Link</a>');
    });

    it('複数のリンクを処理する', () => {
      const html = `
        <a href="https://example1.com">Link1</a>
        <a href="https://example2.com" rel="external">Link2</a>
        <a href="https://example3.com" rel="nofollow">Link3</a>
      `;
      const result = addNofollowToLinks(html);
      expect(result).toContain('rel="nofollow"');
      expect(result).toContain('rel="external nofollow"');
      expect(result.match(/rel="[^"]*nofollow[^"]*"/g)).toHaveLength(3);
    });

    it('大文字小文字を区別しない属性名を処理する', () => {
      const html = '<A HREF="https://example.com" REL="EXTERNAL">Link</A>';
      const result = addNofollowToLinks(html);
      expect(result).toBe('<a HREF="https://example.com" rel="EXTERNAL nofollow">Link</A>');
    });

    it('様々なクォート形式を処理する', () => {
      const html1 = `<a href="https://example.com" rel='external'>Link</a>`;
      const result1 = addNofollowToLinks(html1);
      expect(result1).toBe(`<a href="https://example.com" rel="external nofollow">Link</a>`);

      const html2 = `<a href='https://example.com' rel="external">Link</a>`;
      const result2 = addNofollowToLinks(html2);
      expect(result2).toBe(`<a href='https://example.com' rel="external nofollow">Link</a>`);
    });

    it('空白が多い属性も正しく処理する', () => {
      const html = '<a  href="https://example.com"   rel="external"  >Link</a>';
      const result = addNofollowToLinks(html);
      expect(result).toBe('<a href="https://example.com"   rel="external nofollow"  >Link</a>');
    });

    it('aタグ以外の要素は変更しない', () => {
      const html = '<div rel="something">Content</div><a href="https://example.com">Link</a>';
      const result = addNofollowToLinks(html);
      expect(result).toBe('<div rel="something">Content</div><a href="https://example.com" rel="nofollow">Link</a>');
    });
  });

  describe('removeNofollowFromLinks', () => {
    it('nofollowのみのrel属性を削除する', () => {
      const html = '<a href="https://example.com" rel="nofollow">Link</a>';
      const result = removeNofollowFromLinks(html);
      expect(result).toBe('<a href="https://example.com">Link</a>');
    });

    it('複数のrel値からnofollowのみを削除する', () => {
      const html = '<a href="https://example.com" rel="external nofollow sponsored">Link</a>';
      const result = removeNofollowFromLinks(html);
      expect(result).toBe('<a href="https://example.com" rel="external sponsored">Link</a>');
    });

    it('nofollowが含まれていない場合は変更しない', () => {
      const html = '<a href="https://example.com" rel="external">Link</a>';
      const result = removeNofollowFromLinks(html);
      expect(result).toBe('<a href="https://example.com" rel="external">Link</a>');
    });

    it('rel属性がない場合は変更しない', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = removeNofollowFromLinks(html);
      expect(result).toBe('<a href="https://example.com">Link</a>');
    });

    it('大文字のNOFOLLOWも削除する', () => {
      const html = '<a href="https://example.com" rel="EXTERNAL NOFOLLOW">Link</a>';
      const result = removeNofollowFromLinks(html);
      expect(result).toBe('<a href="https://example.com" rel="EXTERNAL">Link</a>');
    });

    it('複数のリンクからnofollowを削除する', () => {
      const html = `
        <a href="https://example1.com" rel="nofollow">Link1</a>
        <a href="https://example2.com" rel="external nofollow">Link2</a>
        <a href="https://example3.com" rel="sponsored">Link3</a>
      `;
      const result = removeNofollowFromLinks(html);
      expect(result).not.toContain('nofollow');
      expect(result).toContain('rel="external"');
      expect(result).toContain('rel="sponsored"');
    });

    it('余分な空白を正規化する', () => {
      const html = '<a href="https://example.com" rel="  external    nofollow   sponsored  ">Link</a>';
      const result = removeNofollowFromLinks(html);
      expect(result).toBe('<a href="https://example.com" rel="external sponsored">Link</a>');
    });
  });

  describe('sanitizeLinksForPreview', () => {
    it('外部URLにnofollowとtarget="_blank"を追加する', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = sanitizeLinksForPreview(html);
      expect(result).toBe('<a href="https://example.com" target="_blank" rel="nofollow">Link</a>');
    });

    it('既存のrel属性がある場合はnofollowを追加する', () => {
      const html = '<a href="https://example.com" rel="external">Link</a>';
      const result = sanitizeLinksForPreview(html);
      expect(result).toBe('<a href="https://example.com" rel="external nofollow" target="_blank">Link</a>');
    });

    it('既存のtarget属性がある場合は上書きしない', () => {
      const html = '<a href="https://example.com" target="_self">Link</a>';
      const result = sanitizeLinksForPreview(html);
      expect(result).toBe('<a href="https://example.com" target="_self" rel="nofollow">Link</a>');
    });

    it('複数のリンクを処理する', () => {
      const html = `
        <a href="https://example1.com">Link1</a>
        <a href="https://example2.com" rel="external">Link2</a>
      `;
      const result = sanitizeLinksForPreview(html);
      expect(result).toContain('href="https://example1.com"');
      expect(result).toContain('href="https://example2.com"');
      expect(result).toContain('rel="nofollow"');
      expect(result).toContain('rel="external nofollow"');
      expect(result.match(/target="_blank"/g)).toHaveLength(2);
    });

    it('様々なhref形式を処理する', () => {
      const html = `
        <a href="https://example.com">HTTPS Link</a>
        <a href='http://example.com'>HTTP Link</a>
        <a href="mailto:test@example.com">Email Link</a>
        <a href="tel:123-456-7890">Phone Link</a>
        <a href="/relative/path">Relative Link</a>
      `;
      const result = sanitizeLinksForPreview(html);
      // 外部リンク（https/http）のみがtarget="_blank"を持つ
      expect(result.match(/target="_blank"/g)).toHaveLength(2);
      // 全てのリンクがnofollowを持つ
      expect(result.match(/rel="[^"]*nofollow[^"]*"/g)).toHaveLength(5);
      // hrefは保持される
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('href="mailto:test@example.com"');
      expect(result).toContain('href="/relative/path"');
    });

    it('他の属性は保持する', () => {
      const html = '<a href="https://example.com" class="btn" id="link1">Link</a>';
      const result = sanitizeLinksForPreview(html);
      expect(result).toContain('class="btn"');
      expect(result).toContain('id="link1"');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('rel="nofollow"');
    });

    it('ネストしたHTMLも正しく処理する', () => {
      const html = `
        <div>
          <a href="https://example.com" rel="external">
            <img src="image.jpg" alt="Image" />
            <span>Link Text</span>
          </a>
        </div>
      `;
      const result = sanitizeLinksForPreview(html);
      expect(result).toContain('href="https://example.com"');
      expect(result).toContain('target="_blank"');
      expect(result).toContain('rel="external nofollow"');
      expect(result).toContain('<img src="image.jpg" alt="Image" />');
      expect(result).toContain('<span>Link Text</span>');
    });
  });
});
