import {GET, POST} from '@/app/api/ad-contents/route';
import {auth} from '@/auth';
import {getAdContents, createAdContent, associateImagesWithAdContent} from '@/lib/ad-content-actions';
import {hasMinimumRole} from '@/lib/authorization';
import {extractImageUrls} from '@/lib/image-utils';
import type {CreateAdContentRequest} from '@/lib/definitions';

// Mock dependencies
jest.mock('@/auth');
jest.mock('@/lib/ad-content-actions');
jest.mock('@/lib/authorization');
jest.mock('@/lib/image-utils');

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockGetAdContents = getAdContents as jest.MockedFunction<typeof getAdContents>;
const mockCreateAdContent = createAdContent as jest.MockedFunction<typeof createAdContent>;
const mockAssociateImagesWithAdContent = associateImagesWithAdContent as jest.MockedFunction<typeof associateImagesWithAdContent>;
const mockHasMinimumRole = hasMinimumRole as jest.MockedFunction<typeof hasMinimumRole>;
const mockExtractImageUrls = extractImageUrls as jest.MockedFunction<typeof extractImageUrls>;

describe('/api/ad-contents', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return ad contents for authenticated user', async () => {
      const mockContents = [
        {id: 1, name: 'Test Ad 1', status: 'active'},
        {id: 2, name: 'Test Ad 2', status: 'draft'},
      ];

      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'user@example.com'},
      } as any);
      mockGetAdContents.mockResolvedValue(mockContents as any);

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(mockContents);
      expect(mockGetAdContents).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue(null);

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('認証が必要です');
      expect(mockGetAdContents).not.toHaveBeenCalled();
    });

    it('should return 500 on database error', async () => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'user@example.com'},
      } as any);
      mockGetAdContents.mockRejectedValue(new Error('Database error'));

      const response = await GET();
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('広告コンテンツの取得に失敗しました');
    });
  });

  describe('POST', () => {
    const mockRequestBody: CreateAdContentRequest = {
      name: 'Test Ad Content',
      template_id: 1,
      url_template_id: 1,
      content_data: {title: 'Test Title', description: 'Test Description'},
      status: 'draft',
    };

    const mockRequest = {
      json: jest.fn().mockResolvedValue(mockRequestBody),
    } as any;

    const mockCreatedContent = {
      id: 1,
      ...mockRequestBody,
      created_by: 1,
      created_at: '2025-08-19T03:03:26.165Z',
      updated_at: '2025-08-19T03:03:26.165Z',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create ad content for authorized user', async () => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'editor@example.com'},
      } as any);
      mockHasMinimumRole.mockResolvedValue(true);
      mockCreateAdContent.mockResolvedValue(mockCreatedContent as any);
      mockExtractImageUrls.mockReturnValue({});

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result).toEqual(mockCreatedContent);
      expect(mockCreateAdContent).toHaveBeenCalledWith(mockRequestBody);
    });

    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue(null);

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('認証が必要です');
      expect(mockCreateAdContent).not.toHaveBeenCalled();
    });

    it('should return 403 for unauthorized user', async () => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'user@example.com'},
      } as any);
      mockHasMinimumRole.mockResolvedValue(false);

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error).toBe('権限がありません');
      expect(mockCreateAdContent).not.toHaveBeenCalled();
    });

    it('should associate images when content_data contains image URLs', async () => {
      const mockContentWithImages = {
        ...mockRequestBody,
        content_data: {
          title: 'Test Title',
          image: 'https://example.com/image.jpg'
        },
      };

      const mockRequestWithImages = {
        json: jest.fn().mockResolvedValue(mockContentWithImages),
      } as any;

      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'editor@example.com'},
      } as any);
      mockHasMinimumRole.mockResolvedValue(true);
      mockCreateAdContent.mockResolvedValue(mockCreatedContent as any);
      mockExtractImageUrls.mockReturnValue({image: 'https://example.com/image.jpg'});
      mockAssociateImagesWithAdContent.mockResolvedValue(undefined);

      const response = await POST(mockRequestWithImages);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(mockExtractImageUrls).toHaveBeenCalledWith(mockCreatedContent.content_data);
      expect(mockAssociateImagesWithAdContent).toHaveBeenCalledWith(
        mockCreatedContent.id,
        {image: 'https://example.com/image.jpg'}
      );
    });

    it('should continue even if image association fails', async () => {
      const mockContentWithImages = {
        ...mockRequestBody,
        content_data: {
          title: 'Test Title',
          image: 'https://example.com/image.jpg'
        },
      };

      const mockRequestWithImages = {
        json: jest.fn().mockResolvedValue(mockContentWithImages),
      } as any;

      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'editor@example.com'},
      } as any);
      mockHasMinimumRole.mockResolvedValue(true);
      mockCreateAdContent.mockResolvedValue(mockCreatedContent as any);
      mockExtractImageUrls.mockReturnValue({image: 'https://example.com/image.jpg'});
      mockAssociateImagesWithAdContent.mockRejectedValue(new Error('Association failed'));

      const response = await POST(mockRequestWithImages);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result).toEqual(mockCreatedContent);
    });

    it('should return 500 on creation error', async () => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'editor@example.com'},
      } as any);
      mockHasMinimumRole.mockResolvedValue(true);
      mockCreateAdContent.mockRejectedValue(new Error('Creation failed'));

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Creation failed');
    });

    it('should return generic error message for unknown errors', async () => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'editor@example.com'},
      } as any);
      mockHasMinimumRole.mockResolvedValue(true);
      mockCreateAdContent.mockRejectedValue('Unknown error');

      const response = await POST(mockRequest);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('広告コンテンツの作成に失敗しました');
    });
  });
});
