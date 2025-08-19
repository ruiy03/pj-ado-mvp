import {GET, PUT, DELETE} from '@/app/api/ad-contents/[id]/route';
import {auth} from '@/auth';
import {
  getAdContentById,
  updateAdContent,
  deleteAdContent,
  associateImagesWithAdContent
} from '@/lib/ad-content-actions';
import {hasMinimumRole} from '@/lib/authorization';
import {extractImageUrls} from '@/lib/image-utils';
import type {UpdateAdContentRequest} from '@/lib/definitions';

// Mock dependencies
jest.mock('@/auth');
jest.mock('@/lib/ad-content-actions');
jest.mock('@/lib/authorization');
jest.mock('@/lib/image-utils');

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockGetAdContentById = getAdContentById as jest.MockedFunction<typeof getAdContentById>;
const mockUpdateAdContent = updateAdContent as jest.MockedFunction<typeof updateAdContent>;
const mockDeleteAdContent = deleteAdContent as jest.MockedFunction<typeof deleteAdContent>;
const mockAssociateImagesWithAdContent = associateImagesWithAdContent as jest.MockedFunction<typeof associateImagesWithAdContent>;
const mockHasMinimumRole = hasMinimumRole as jest.MockedFunction<typeof hasMinimumRole>;
const mockExtractImageUrls = extractImageUrls as jest.MockedFunction<typeof extractImageUrls>;

describe('/api/ad-contents/[id]', () => {
  const mockParams = {params: Promise.resolve({id: '1'})};
  const mockRequest = {} as any;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return ad content by id for authenticated user', async () => {
      const mockContent = {
        id: 1,
        name: 'Test Ad Content',
        status: 'active',
        content_data: {title: 'Test Title'},
      };

      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'user@example.com'},
      } as any);
      mockGetAdContentById.mockResolvedValue(mockContent as any);

      const response = await GET(mockRequest, mockParams);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(mockContent);
      expect(mockGetAdContentById).toHaveBeenCalledWith(1);
    });

    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue(null);

      const response = await GET(mockRequest, mockParams);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('認証が必要です');
      expect(mockGetAdContentById).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid id', async () => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'user@example.com'},
      } as any);

      const invalidParams = {params: Promise.resolve({id: 'invalid'})};
      const response = await GET(mockRequest, invalidParams);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('無効なIDです');
      expect(mockGetAdContentById).not.toHaveBeenCalled();
    });

    it('should return 404 when ad content not found', async () => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'user@example.com'},
      } as any);
      mockGetAdContentById.mockResolvedValue(null);

      const response = await GET(mockRequest, mockParams);
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.error).toBe('広告コンテンツが見つかりません');
    });

    it('should return 500 on database error', async () => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'user@example.com'},
      } as any);
      mockGetAdContentById.mockRejectedValue(new Error('Database error'));

      const response = await GET(mockRequest, mockParams);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('広告コンテンツの取得に失敗しました');
    });
  });

  describe('PUT', () => {
    const mockUpdateData = {
      name: 'Updated Ad Content',
      content_data: {title: 'Updated Title'},
    };

    const mockRequestWithBody = {
      json: jest.fn().mockResolvedValue(mockUpdateData),
    } as any;

    const mockUpdatedContent = {
      id: 1,
      ...mockUpdateData,
      updated_at: '2025-08-19T03:07:09.178Z',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should update ad content for authorized user', async () => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'editor@example.com'},
      } as any);
      mockHasMinimumRole.mockResolvedValue(true);
      mockUpdateAdContent.mockResolvedValue(mockUpdatedContent as any);
      mockExtractImageUrls.mockReturnValue({});

      const response = await PUT(mockRequestWithBody, mockParams);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result).toEqual(mockUpdatedContent);
      expect(mockUpdateAdContent).toHaveBeenCalledWith({id: 1, ...mockUpdateData});
    });

    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue(null);

      const response = await PUT(mockRequestWithBody, mockParams);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('認証が必要です');
      expect(mockUpdateAdContent).not.toHaveBeenCalled();
    });

    it('should return 403 for unauthorized user', async () => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'user@example.com'},
      } as any);
      mockHasMinimumRole.mockResolvedValue(false);

      const response = await PUT(mockRequestWithBody, mockParams);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error).toBe('権限がありません');
      expect(mockUpdateAdContent).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid id', async () => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'editor@example.com'},
      } as any);
      mockHasMinimumRole.mockResolvedValue(true);

      const invalidParams = {params: Promise.resolve({id: 'invalid'})};
      const response = await PUT(mockRequestWithBody, invalidParams);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('無効なIDです');
      expect(mockUpdateAdContent).not.toHaveBeenCalled();
    });

    it('should associate images when content_data contains image URLs', async () => {
      const mockUpdateDataWithImages = {
        ...mockUpdateData,
        content_data: {
          title: 'Updated Title',
          image: 'https://example.com/image.jpg'
        },
      };

      const mockRequestWithImages = {
        json: jest.fn().mockResolvedValue(mockUpdateDataWithImages),
      } as any;

      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'editor@example.com'},
      } as any);
      mockHasMinimumRole.mockResolvedValue(true);
      mockUpdateAdContent.mockResolvedValue(mockUpdatedContent as any);
      mockExtractImageUrls.mockReturnValue({image: 'https://example.com/image.jpg'});
      mockAssociateImagesWithAdContent.mockResolvedValue(undefined);

      const response = await PUT(mockRequestWithImages, mockParams);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(mockExtractImageUrls).toHaveBeenCalledWith(mockUpdatedContent.content_data);
      expect(mockAssociateImagesWithAdContent).toHaveBeenCalledWith(
        mockUpdatedContent.id,
        {image: 'https://example.com/image.jpg'}
      );
    });

    it('should return 500 on update error', async () => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'editor@example.com'},
      } as any);
      mockHasMinimumRole.mockResolvedValue(true);
      mockUpdateAdContent.mockRejectedValue(new Error('Update failed'));

      const response = await PUT(mockRequestWithBody, mockParams);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Update failed');
    });
  });

  describe('DELETE', () => {
    it('should delete ad content for authorized user', async () => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'editor@example.com'},
      } as any);
      mockHasMinimumRole.mockResolvedValue(true);
      mockDeleteAdContent.mockResolvedValue(undefined);

      const response = await DELETE(mockRequest, mockParams);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(mockDeleteAdContent).toHaveBeenCalledWith(1);
    });

    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValue(null);

      const response = await DELETE(mockRequest, mockParams);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error).toBe('認証が必要です');
      expect(mockDeleteAdContent).not.toHaveBeenCalled();
    });

    it('should return 403 for unauthorized user', async () => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'user@example.com'},
      } as any);
      mockHasMinimumRole.mockResolvedValue(false);

      const response = await DELETE(mockRequest, mockParams);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error).toBe('権限がありません');
      expect(mockDeleteAdContent).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid id', async () => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'editor@example.com'},
      } as any);
      mockHasMinimumRole.mockResolvedValue(true);

      const invalidParams = {params: Promise.resolve({id: 'invalid'})};
      const response = await DELETE(mockRequest, invalidParams);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error).toBe('無効なIDです');
      expect(mockDeleteAdContent).not.toHaveBeenCalled();
    });

    it('should return 500 on deletion error', async () => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'editor@example.com'},
      } as any);
      mockHasMinimumRole.mockResolvedValue(true);
      mockDeleteAdContent.mockRejectedValue(new Error('Deletion failed'));

      const response = await DELETE(mockRequest, mockParams);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.error).toBe('Deletion failed');
    });
  });
});
