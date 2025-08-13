import {addNofollowToLinks, removeNofollowFromLinks, sanitizeLinksForPreview} from '@/lib/template-utils';

describe('nofollow utilities', () => {
  describe('addNofollowToLinks', () => {
    it('should add nofollow to links without rel attribute', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = addNofollowToLinks(html);
      expect(result).toBe('<a href="https://example.com" rel="nofollow">Link</a>');
    });

    it('should add nofollow to existing rel attribute', () => {
      const html = '<a href="https://example.com" rel="external">Link</a>';
      const result = addNofollowToLinks(html);
      expect(result).toBe('<a href="https://example.com" rel="external nofollow">Link</a>');
    });

    it('should not duplicate nofollow if already present', () => {
      const html = '<a href="https://example.com" rel="nofollow">Link</a>';
      const result = addNofollowToLinks(html);
      expect(result).toBe('<a href="https://example.com" rel="nofollow">Link</a>');
    });

    it('should handle multiple links', () => {
      const html = '<a href="https://example.com">Link1</a> <a href="https://test.com" rel="external">Link2</a>';
      const result = addNofollowToLinks(html);
      expect(result).toBe('<a href="https://example.com" rel="nofollow">Link1</a> <a href="https://test.com" rel="external nofollow">Link2</a>');
    });

    it('should handle case insensitive attributes', () => {
      const html = '<A HREF="https://example.com" REL="external">Link</A>';
      const result = addNofollowToLinks(html);
      expect(result).toBe('<a HREF="https://example.com" rel="external nofollow">Link</A>');
    });
  });

  describe('removeNofollowFromLinks', () => {
    it('should remove nofollow from rel attribute', () => {
      const html = '<a href="https://example.com" rel="nofollow">Link</a>';
      const result = removeNofollowFromLinks(html);
      expect(result).toBe('<a href="https://example.com">Link</a>');
    });

    it('should remove nofollow but keep other rel values', () => {
      const html = '<a href="https://example.com" rel="external nofollow">Link</a>';
      const result = removeNofollowFromLinks(html);
      expect(result).toBe('<a href="https://example.com" rel="external">Link</a>');
    });

    it('should handle nofollow in middle of rel attribute', () => {
      const html = '<a href="https://example.com" rel="external nofollow sponsored">Link</a>';
      const result = removeNofollowFromLinks(html);
      expect(result).toBe('<a href="https://example.com" rel="external sponsored">Link</a>');
    });

    it('should not modify links without nofollow', () => {
      const html = '<a href="https://example.com" rel="external">Link</a>';
      const result = removeNofollowFromLinks(html);
      expect(result).toBe('<a href="https://example.com" rel="external">Link</a>');
    });
  });

  describe('sanitizeLinksForPreview', () => {
    it('should sanitize href and add nofollow', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = sanitizeLinksForPreview(html);
      expect(result).toBe('<a href="#" rel="nofollow">Link</a>');
    });

    it('should sanitize href and preserve existing rel with nofollow', () => {
      const html = '<a href="https://example.com" rel="external">Link</a>';
      const result = sanitizeLinksForPreview(html);
      expect(result).toBe('<a href="#" rel="external nofollow">Link</a>');
    });

    it('should handle multiple links', () => {
      const html = '<a href="https://example.com">Link1</a> <a href="mailto:test@example.com">Email</a>';
      const result = sanitizeLinksForPreview(html);
      expect(result).toBe('<a href="#" rel="nofollow">Link1</a> <a href="#" rel="nofollow">Email</a>');
    });
  });
});
