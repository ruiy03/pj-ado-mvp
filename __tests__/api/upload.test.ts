import {POST, DELETE} from '@/app/api/upload/route';
import {put} from '@vercel/blob';
import {auth} from '@/auth';
import {hasMinimumRole} from '@/lib/authorization';
import {createAdImage} from '@/lib/ad-content-actions';
import mime from 'mime-types';

// Mock dependencies
jest.mock('@vercel/blob');
jest.mock('@/auth');
jest.mock('@/lib/authorization');
jest.mock('@/lib/ad-content-actions');
jest.mock('mime-types', () => ({
  lookup: jest.fn(),
}));

const mockPut = put as jest.MockedFunction<typeof put>;
const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockHasMinimumRole = hasMinimumRole as jest.MockedFunction<typeof hasMinimumRole>;
const mockCreateAdImage = createAdImage as jest.MockedFunction<typeof createAdImage>;
const mockMimeLookup = mime.lookup as jest.MockedFunction<typeof mime.lookup>;

// Mock URL constructor
const originalURL = global.URL;
const mockURL = jest.fn((url: string) => ({
  searchParams: new URLSearchParams(url.split('?')[1]),
}));
global.URL = mockURL as any;

describe('/api/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    global.URL = originalURL;
  });

  describe('POST', () => {
    const mockImageBuffer = new ArrayBuffer(1024);
    const mockRequest = {
      url: 'http://localhost/api/upload?filename=test.jpg&ad_content_id=1&placeholder_name=image&alt_text=Test Image',
      arrayBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
    } as any;

    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'editor@example.com'},
      } as any);
      mockHasMinimumRole.mockResolvedValue(true);
      mockMimeLookup.mockReturnValue('image/jpeg');
      mockPut.mockResolvedValue({url: 'https://blob.vercel-storage.com/test.jpg'} as any);
      mockCreateAdImage.mockResolvedValue({id: 1} as any);
    });

    it('should upload image successfully', async () => {
      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.url).toBe('https://blob.vercel-storage.com/test.jpg');
      expect(result.filename).toBe('test.jpg');
      expect(result.size).toBe(1024);
      expect(result.mimeType).toBe('image/jpeg');
      expect(result.imageId).toBe(1);
      expect(mockPut).toHaveBeenCalledWith(
        expect.stringMatching(/^ad-images\/\d+-test\.jpg$/),
        Buffer.from(mockImageBuffer),
        {access: 'public'}
      );
    });

    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue(null);

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('認証が必要です');
      expect(mockPut).not.toHaveBeenCalled();
    });

    it('should return 403 for unauthorized user', async () => {
      mockHasMinimumRole.mockResolvedValue(false);

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error).toBe('権限がありません');
      expect(mockPut).not.toHaveBeenCalled();
    });

    it('should return 400 when filename is missing', async () => {
      const requestWithoutFilename = {
        url: 'http://localhost/api/upload',
        arrayBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
      } as any;

      const response = await POST(requestWithoutFilename);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('ファイル名が指定されていません');
      expect(mockPut).not.toHaveBeenCalled();
    });

    it('should return 400 when file buffer is empty', async () => {
      const requestWithEmptyBuffer = {
        url: mockRequest.url,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(0)),
      } as any;

      const response = await POST(requestWithEmptyBuffer);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('ファイルが選択されていません');
      expect(mockPut).not.toHaveBeenCalled();
    });

    it('should return 400 when file size exceeds limit', async () => {
      const largeBuffer = new ArrayBuffer(6 * 1024 * 1024); // 6MB
      const requestWithLargeFile = {
        url: mockRequest.url,
        arrayBuffer: jest.fn().mockResolvedValue(largeBuffer),
      } as any;

      const response = await POST(requestWithLargeFile);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('ファイルサイズが大きすぎます。最大5MBまでです');
      expect(mockPut).not.toHaveBeenCalled();
    });

    it('should return 400 for unsupported file type', async () => {
      mockMimeLookup.mockReturnValue('application/pdf');

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('対応していないファイル形式です。JPEG、PNG、GIF、WebP、SVGのみアップロード可能です');
      expect(mockPut).not.toHaveBeenCalled();
    });

    it('should return 400 when mime type detection fails', async () => {
      mockMimeLookup.mockReturnValue(false);

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('対応していないファイル形式です。JPEG、PNG、GIF、WebP、SVGのみアップロード可能です');
      expect(mockPut).not.toHaveBeenCalled();
    });

    it('should upload without ad_content_id', async () => {
      const requestWithoutAdContentId = {
        url: 'http://localhost/api/upload?filename=test.jpg',
        arrayBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
      } as any;

      const response = await POST(requestWithoutAdContentId);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.imageId).toBeNull();
      expect(mockCreateAdImage).not.toHaveBeenCalled();
    });

    it('should continue upload even if createAdImage fails', async () => {
      mockCreateAdImage.mockRejectedValue(new Error('Database error'));

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.url).toBe('https://blob.vercel-storage.com/test.jpg');
      expect(result.imageId).toBeNull();
    });

    it('should support all allowed image types', async () => {
      const allowedTypes = [
        {extension: 'jpg', mimeType: 'image/jpeg'},
        {extension: 'png', mimeType: 'image/png'},
        {extension: 'gif', mimeType: 'image/gif'},
        {extension: 'webp', mimeType: 'image/webp'},
        {extension: 'svg', mimeType: 'image/svg+xml'},
      ];

      for (const type of allowedTypes) {
        mockMimeLookup.mockReturnValue(type.mimeType);

        const requestWithType = {
          url: `http://localhost/api/upload?filename=test.${type.extension}`,
          arrayBuffer: jest.fn().mockResolvedValue(mockImageBuffer),
        } as any;

        const response = await POST(requestWithType);
        const result = await response.json();

        expect(response.status).toBe(200);
        expect(result.mimeType).toBe(type.mimeType);
      }
    });

    it('should return 500 on blob upload error', async () => {
      mockPut.mockRejectedValue(new Error('Blob upload failed'));

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('アップロードに失敗しました');
    });
  });

  describe('DELETE', () => {
    const mockRequest = {
      url: 'http://localhost/api/upload?url=https://blob.vercel-storage.com/test.jpg',
    } as any;

    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'editor@example.com'},
      } as any);
      mockHasMinimumRole.mockResolvedValue(true);
    });

    it('should delete image successfully', async () => {
      const response = await DELETE(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
    });

    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue(null);

      const response = await DELETE(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('認証が必要です');
    });

    it('should return 403 for unauthorized user', async () => {
      mockHasMinimumRole.mockResolvedValue(false);

      const response = await DELETE(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error).toBe('権限がありません');
    });

    it('should return 400 when URL is missing', async () => {
      const requestWithoutUrl = {
        url: 'http://localhost/api/upload',
      } as any;

      const response = await DELETE(requestWithoutUrl);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('URLが指定されていません');
    });

    it('should return 500 on deletion error', async () => {
      // Force an error by making URL constructor throw
      mockURL.mockImplementationOnce(() => {
        throw new Error('URL parsing failed');
      });

      const response = await DELETE(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('削除に失敗しました');
    });
  });
});
