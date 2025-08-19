import {
  getAdContents,
  getAdContentById,
  createAdContent,
  updateAdContent,
  deleteAdContent,
  getAdImagesByContentId,
  createAdImage,
  updateAdImage,
  deleteAdImage,
  associateImagesWithAdContent,
} from '@/lib/ad-content-actions';
import {auth} from '@/auth';
import {sql} from '@/lib/db';
import {del} from '@vercel/blob';
import {revalidatePath} from 'next/cache';
import type {
  CreateAdContentRequest,
  UpdateAdContentRequest,
  CreateAdImageRequest,
  UpdateAdImageRequest
} from '@/lib/definitions';

// Mock dependencies
jest.mock('@/auth');
jest.mock('@/lib/db');
jest.mock('@vercel/blob');
jest.mock('next/cache');

const mockAuth = auth as jest.MockedFunction<typeof auth>;
const mockSql = sql as jest.MockedFunction<typeof sql>;
const mockDel = del as jest.MockedFunction<typeof del>;
const mockRevalidatePath = revalidatePath as jest.MockedFunction<typeof revalidatePath>;

// Helper to reset all mocks completely
const resetMocks = () => {
  jest.clearAllMocks();
  jest.resetAllMocks();

  // Reset SQL mock to return empty arrays by default
  mockSql.mockReset();
  mockAuth.mockReset();
  mockDel.mockReset();
  mockRevalidatePath.mockReset();
};

describe('ad-content-actions', () => {
  beforeEach(() => {
    resetMocks();
  });

  describe('getAdContents', () => {
    it('should return ad contents with related data', async () => {
      const mockResults = [
        {
          id: 1,
          name: 'Test Ad 1',
          template_id: 1,
          url_template_id: 1,
          content_data: JSON.stringify({title: 'Test Title'}),
          status: 'active',
          created_by: 1,
          created_at: new Date(),
          updated_at: new Date(),
          template_name: 'Test Template',
          template_html: '<div>{{title}}</div>',
          template_placeholders: JSON.stringify(['title']),
          url_template_name: 'Test URL Template',
          url_template_url: 'https://example.com?utm_source={{source}}',
          url_template_parameters: JSON.stringify({source: 'test'}),
          created_by_name: 'Test User',
          created_by_email: 'test@example.com',
        },
      ];

      mockSql.mockResolvedValueOnce(mockResults as any);
      mockSql.mockResolvedValueOnce([]); // getAdImagesByContentId

      const result = await getAdContents();

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        name: 'Test Ad 1',
        content_data: {title: 'Test Title'},
        status: 'active',
        template: {
          id: 1,
          name: 'Test Template',
          html: '<div>{{title}}</div>',
          placeholders: ['title'],
        },
        url_template: {
          id: 1,
          name: 'Test URL Template',
          url_template: 'https://example.com?utm_source={{source}}',
          parameters: {source: 'test'},
        },
        created_by_user: {
          id: 1,
          name: 'Test User',
          email: 'test@example.com',
        },
        images: [],
      });
    });

    it('should handle invalid JSON gracefully', async () => {
      const mockResults = [
        {
          id: 1,
          name: 'Test Ad',
          content_data: 'invalid json',
          status: 'draft',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockSql.mockResolvedValueOnce(mockResults as any);
      mockSql.mockResolvedValueOnce([]);

      const result = await getAdContents();

      expect(result[0].content_data).toEqual({});
    });

    it('should throw error when database query fails', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      await expect(getAdContents()).rejects.toThrow('広告コンテンツの取得に失敗しました');
    });
  });

  describe('getAdContentById', () => {
    it('should return ad content by id', async () => {
      const mockResult = [
        {
          id: 1,
          name: 'Test Ad',
          content_data: JSON.stringify({title: 'Test'}),
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockSql.mockResolvedValueOnce(mockResult as any);
      mockSql.mockResolvedValueOnce([]); // getAdImagesByContentId

      const result = await getAdContentById(1);

      expect(result).toMatchObject({
        id: 1,
        name: 'Test Ad',
        content_data: {title: 'Test'},
        status: 'active',
      });
    });

    it('should return null when content not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const result = await getAdContentById(999);

      expect(result).toBeNull();
    });

    it('should throw error when database query fails', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      await expect(getAdContentById(1)).rejects.toThrow('広告コンテンツの取得に失敗しました');
    });
  });

  describe('createAdContent', () => {
    const mockCreateRequest: CreateAdContentRequest = {
      name: 'New Ad Content',
      template_id: 1,
      url_template_id: 1,
      content_data: {title: 'New Title'},
      status: 'draft',
    };

    beforeEach(() => {
      mockAuth.mockResolvedValue({
        user: {id: '1', email: 'user@example.com'},
      } as any);
    });

    it('should create ad content successfully', async () => {
      const mockResult = [
        {
          id: 1,
          name: 'New Ad Content',
          template_id: 1,
          url_template_id: 1,
          content_data: JSON.stringify({title: 'New Title'}),
          status: 'draft',
          created_by: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockSql.mockResolvedValueOnce(mockResult as any);

      const result = await createAdContent(mockCreateRequest);

      expect(result).toMatchObject({
        id: 1,
        name: 'New Ad Content',
        content_data: {title: 'New Title'},
        status: 'draft',
        images: [],
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith('/ads');
    });

    it('should throw error when user not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      await expect(createAdContent(mockCreateRequest)).rejects.toThrow();
    });

    it('should throw validation error for invalid data', async () => {
      const invalidRequest = {...mockCreateRequest, name: ''};

      await expect(createAdContent(invalidRequest)).rejects.toThrow('広告名は必須です');
    });

    it('should handle default values', async () => {
      const minimalRequest = {name: 'Minimal Ad'};
      const mockResult = [
        {
          id: 1,
          name: 'Minimal Ad',
          template_id: null,
          url_template_id: null,
          content_data: '{}',
          status: 'draft',
          created_by: 1,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockSql.mockResolvedValueOnce(mockResult as any);

      const result = await createAdContent(minimalRequest);

      expect(result.content_data).toEqual({});
      expect(result.status).toBe('draft');
    });
  });

  describe('updateAdContent', () => {
    const mockUpdateRequest: UpdateAdContentRequest = {
      id: 1,
      name: 'Updated Ad Content',
      content_data: {title: 'Updated Title'},
    };

    it('should update ad content successfully', async () => {
      const mockResult = [
        {
          id: 1,
          name: 'Updated Ad Content',
          content_data: JSON.stringify({title: 'Updated Title'}),
          status: 'active',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockSql.mockResolvedValueOnce(mockResult as any);
      mockSql.mockResolvedValueOnce([]); // getAdImagesByContentId

      const result = await updateAdContent(mockUpdateRequest);

      expect(result).toMatchObject({
        id: 1,
        name: 'Updated Ad Content',
        content_data: {title: 'Updated Title'},
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith('/ads');
    });

    it('should throw error when content not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      await expect(updateAdContent(mockUpdateRequest)).rejects.toThrow();
    });

    it('should handle partial updates', async () => {
      const partialUpdate = {id: 1, name: 'New Name Only'};
      const mockResult = [
        {
          id: 1,
          name: 'New Name Only',
          content_data: '{}',
          status: 'draft',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ];

      mockSql.mockResolvedValueOnce(mockResult as any);
      mockSql.mockResolvedValueOnce([]);

      const result = await updateAdContent(partialUpdate);

      expect(result.name).toBe('New Name Only');
    });
  });

  describe('deleteAdContent', () => {
    it('should delete ad content and related images', async () => {
      const mockImages = [
        {
          id: 1,
          blob_url: 'https://blob.vercel-storage.com/image1.jpg',
          ad_content_id: 1,
          created_at: new Date(),
        },
      ];

      mockSql
        .mockResolvedValueOnce(mockImages as any) // getAdImagesByContentId
        .mockResolvedValueOnce([{id: 1}] as any) // DELETE ad_contents
        .mockResolvedValueOnce([{id: 1}] as any); // DELETE ad_images

      mockDel.mockResolvedValueOnce(undefined);

      await deleteAdContent(1);

      expect(mockDel).toHaveBeenCalledWith('https://blob.vercel-storage.com/image1.jpg');
      expect(mockRevalidatePath).toHaveBeenCalledWith('/ads');
    });

    it('should throw error when content not found', async () => {
      mockSql
        .mockResolvedValueOnce([]) // getAdImagesByContentId
        .mockResolvedValueOnce([]); // DELETE ad_contents

      await expect(deleteAdContent(999)).rejects.toThrow();
    });

    it('should continue deletion even if image deletion fails', async () => {
      const mockImages = [
        {
          id: 1,
          blob_url: 'https://blob.vercel-storage.com/image1.jpg',
          ad_content_id: 1,
          created_at: new Date(),
        },
      ];

      mockSql
        .mockResolvedValueOnce(mockImages as any)
        .mockResolvedValueOnce([{id: 1}] as any)
        .mockResolvedValueOnce([{id: 1}] as any);

      mockDel.mockRejectedValueOnce(new Error('Blob deletion failed'));

      await deleteAdContent(1);

      expect(mockRevalidatePath).toHaveBeenCalledWith('/ads');
    });
  });

  describe('getAdImagesByContentId', () => {
    beforeEach(() => {
      resetMocks();
    });

    it('should return images for content', async () => {
      const mockImages = [
        {
          id: 1,
          ad_content_id: 1,
          blob_url: 'https://example.com/image.jpg',
          original_filename: 'image.jpg',
          file_size: 1024,
          mime_type: 'image/jpeg',
          alt_text: 'Test image',
          placeholder_name: 'image',
          created_at: new Date(),
        },
      ];

      mockSql.mockResolvedValueOnce(mockImages as any);

      const result = await getAdImagesByContentId(1);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        ad_content_id: 1,
        blob_url: 'https://example.com/image.jpg',
        original_filename: 'image.jpg',
      });
    });

    it('should return empty array on error', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const result = await getAdImagesByContentId(1);

      expect(result).toEqual([]);
    });
  });

  describe('createAdImage', () => {
    const mockCreateImageRequest: CreateAdImageRequest = {
      ad_content_id: 1,
      blob_url: 'https://example.com/image.jpg',
      original_filename: 'image.jpg',
      file_size: 1024,
      mime_type: 'image/jpeg',
    };

    beforeEach(() => {
      resetMocks();
    });

    it('should create ad image successfully', async () => {
      const mockResult = [
        {
          id: 1,
          ad_content_id: mockCreateImageRequest.ad_content_id,
          blob_url: mockCreateImageRequest.blob_url,
          original_filename: mockCreateImageRequest.original_filename,
          file_size: mockCreateImageRequest.file_size,
          mime_type: mockCreateImageRequest.mime_type,
          alt_text: null,
          placeholder_name: null,
          created_at: new Date(),
        },
      ];

      mockSql.mockResolvedValueOnce(mockResult as any);

      const result = await createAdImage(mockCreateImageRequest);

      expect(result).toMatchObject({
        id: 1,
        ad_content_id: 1,
        blob_url: 'https://example.com/image.jpg',
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith('/ads');
    });

    it('should throw validation error for invalid URL', async () => {
      const invalidRequest = {...mockCreateImageRequest, blob_url: 'invalid-url'};

      await expect(createAdImage(invalidRequest)).rejects.toThrow('有効なURLが必要です');
    });
  });

  describe('updateAdImage', () => {
    const mockUpdateImageRequest: UpdateAdImageRequest = {
      id: 1,
      alt_text: 'Updated alt text',
      placeholder_name: 'updated_image',
    };

    beforeEach(() => {
      resetMocks();
    });

    it('should update ad image successfully', async () => {
      const mockResult = [
        {
          id: mockUpdateImageRequest.id,
          ad_content_id: 1,
          blob_url: 'https://example.com/image.jpg',
          original_filename: 'image.jpg',
          file_size: 1024,
          mime_type: 'image/jpeg',
          alt_text: mockUpdateImageRequest.alt_text,
          placeholder_name: mockUpdateImageRequest.placeholder_name,
          created_at: new Date(),
        },
      ];

      mockSql.mockResolvedValueOnce(mockResult as any);

      const result = await updateAdImage(mockUpdateImageRequest);

      expect(result).toMatchObject({
        id: 1,
        alt_text: 'Updated alt text',
        placeholder_name: 'updated_image',
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith('/ads');
    });

    it('should throw error when image not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      await expect(updateAdImage(mockUpdateImageRequest)).rejects.toThrow();
    });
  });

  describe('deleteAdImage', () => {
    beforeEach(() => {
      resetMocks();
    });

    it('should delete ad image successfully', async () => {
      mockSql.mockResolvedValueOnce([{id: 1}] as any);

      await deleteAdImage(1);

      expect(mockRevalidatePath).toHaveBeenCalledWith('/ads');
    });

    it('should throw error when image not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      await expect(deleteAdImage(999)).rejects.toThrow();
    });
  });

  describe('associateImagesWithAdContent', () => {
    it('should associate new images with content', async () => {
      const imageUrls = {
        'image1': 'https://example.com/image1.jpg',
        'image2': 'https://example.com/image2.jpg',
      };

      mockSql
        .mockResolvedValueOnce([]) // Check existing image1
        .mockResolvedValueOnce([{id: 1}] as any) // Insert image1
        .mockResolvedValueOnce([]) // Check existing image2
        .mockResolvedValueOnce([{id: 2}] as any); // Insert image2

      await associateImagesWithAdContent(1, imageUrls);

      expect(mockRevalidatePath).toHaveBeenCalledWith('/ads');
    });

    it('should update existing images', async () => {
      const imageUrls = {
        'existing_image': 'https://example.com/new-image.jpg',
      };

      mockSql
        .mockResolvedValueOnce([{id: 1}] as any) // Check existing image
        .mockResolvedValueOnce([{id: 1}] as any); // Update existing image

      await associateImagesWithAdContent(1, imageUrls);

      expect(mockRevalidatePath).toHaveBeenCalledWith('/ads');
    });

    it('should throw error on database failure', async () => {
      const imageUrls = {'image1': 'https://example.com/image1.jpg'};

      mockSql.mockRejectedValueOnce(new Error('Database error'));

      await expect(associateImagesWithAdContent(1, imageUrls)).rejects.toThrow();
    });
  });
});
