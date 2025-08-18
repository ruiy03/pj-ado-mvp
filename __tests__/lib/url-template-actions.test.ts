import {
  getUrlTemplates,
  getUrlTemplateById,
  createUrlTemplate,
  updateUrlTemplate,
  deleteUrlTemplate
} from '@/lib/url-template-actions';
import type {CreateUrlTemplateRequest, UpdateUrlTemplateRequest} from '@/lib/definitions';

// Mock the database
jest.mock('@/lib/db', () => ({
  sql: jest.fn()
}));

// Mock revalidatePath
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn()
}));

const mockSql = require('@/lib/db').sql;

describe('URL Template Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUrlTemplates', () => {
    it('should return all URL templates sorted by created_at DESC', async () => {
      const mockData = [
        {
          id: 1,
          name: 'Test Template 1',
          url: 'https://example.com',
          parameters: '{"utm_campaign": "test1"}',
          description: 'Test description 1',
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-01')
        },
        {
          id: 2,
          name: 'Test Template 2',
          url: 'https://example2.com',
          parameters: '{"utm_campaign": "test2"}',
          description: 'Test description 2',
          created_at: new Date('2023-01-02'),
          updated_at: new Date('2023-01-02')
        }
      ];

      mockSql.mockResolvedValueOnce(mockData);

      const result = await getUrlTemplates();

      expect(mockSql).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(2);
      expect(result[0].parameters).toEqual({utm_campaign: 'test1'});
      expect(result[1].parameters).toEqual({utm_campaign: 'test2'});
    });

    it('should handle database errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      await expect(getUrlTemplates()).rejects.toThrow('URLテンプレートの取得に失敗しました');
    });
  });

  describe('getUrlTemplateById', () => {
    it('should return a specific URL template by ID', async () => {
      const mockData = [{
        id: 1,
        name: 'Test Template',
        url: 'https://example.com',
        parameters: '{"utm_campaign": "test", "utm_source": "web"}',
        description: 'Test description',
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01')
      }];

      mockSql.mockResolvedValueOnce(mockData);

      const result = await getUrlTemplateById(1);

      expect(mockSql).toHaveBeenCalledTimes(1);
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.parameters).toEqual({utm_campaign: 'test', utm_source: 'web'});
    });

    it('should return null if template not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const result = await getUrlTemplateById(999);

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      await expect(getUrlTemplateById(1)).rejects.toThrow('URLテンプレートの取得に失敗しました');
    });
  });

  describe('createUrlTemplate', () => {
    it('should create a new URL template successfully', async () => {
      const mockData = [{
        id: 1,
        name: 'New Template',
        url: 'https://example.com',
        parameters: '{"utm_campaign": "new"}',
        description: 'New description',
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-01')
      }];

      mockSql.mockResolvedValueOnce(mockData);

      const createData: CreateUrlTemplateRequest = {
        name: 'New Template',
        url: 'https://example.com',
        parameters: {utm_campaign: 'new'},
        description: 'New description'
      };

      const result = await createUrlTemplate(createData);

      expect(mockSql).toHaveBeenCalledTimes(1);
      expect(result.id).toBe(1);
      expect(result.name).toBe('New Template');
      expect(result.parameters).toEqual({utm_campaign: 'new'});
    });

    it('should validate required fields', async () => {
      const invalidData: CreateUrlTemplateRequest = {
        name: '',
        url: 'https://example.com',
        parameters: {},
        description: ''
      };

      await expect(createUrlTemplate(invalidData)).rejects.toThrow('テンプレート名は必須です');
    });

    it('should validate URL format', async () => {
      const invalidData: CreateUrlTemplateRequest = {
        name: 'Test',
        url: 'invalid-url',
        parameters: {},
        description: ''
      };

      await expect(createUrlTemplate(invalidData)).rejects.toThrow('有効なURLを入力してください');
    });

    it('should handle database errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const createData: CreateUrlTemplateRequest = {
        name: 'Test Template',
        url: 'https://example.com',
        parameters: {},
        description: ''
      };

      await expect(createUrlTemplate(createData)).rejects.toThrow('URLテンプレートの作成に失敗しました');
    });
  });

  describe('updateUrlTemplate', () => {
    it('should update URL template successfully', async () => {
      const mockData = [{
        id: 1,
        name: 'Updated Template',
        url: 'https://updated.com',
        parameters: '{"utm_campaign": "updated"}',
        description: 'Updated description',
        created_at: new Date('2023-01-01'),
        updated_at: new Date('2023-01-02')
      }];

      mockSql.mockResolvedValueOnce(mockData);

      const updateData: UpdateUrlTemplateRequest = {
        id: 1,
        name: 'Updated Template',
        url: 'https://updated.com',
        parameters: {utm_campaign: 'updated'},
        description: 'Updated description'
      };

      const result = await updateUrlTemplate(updateData);

      expect(mockSql).toHaveBeenCalledTimes(1);
      expect(result.name).toBe('Updated Template');
      expect(result.parameters).toEqual({utm_campaign: 'updated'});
    });

    it('should throw error if template not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      const updateData: UpdateUrlTemplateRequest = {
        id: 999,
        name: 'Updated Template'
      };

      await expect(updateUrlTemplate(updateData)).rejects.toThrow();
    });

    it('should validate URL format when updating', async () => {
      const invalidData: UpdateUrlTemplateRequest = {
        id: 1,
        url: 'invalid-url'
      };

      await expect(updateUrlTemplate(invalidData)).rejects.toThrow('有効なURLを入力してください');
    });

    it('should handle database errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      const updateData: UpdateUrlTemplateRequest = {
        id: 1,
        name: 'Test'
      };

      await expect(updateUrlTemplate(updateData)).rejects.toThrow('URLテンプレートの更新に失敗しました');
    });
  });

  describe('deleteUrlTemplate', () => {
    it('should delete URL template successfully', async () => {
      const mockData = [{id: 1}];
      mockSql.mockResolvedValueOnce(mockData);

      await deleteUrlTemplate(1);

      expect(mockSql).toHaveBeenCalledTimes(1);
    });

    it('should throw error if template not found', async () => {
      mockSql.mockResolvedValueOnce([]);

      await expect(deleteUrlTemplate(999)).rejects.toThrow();
    });

    it('should handle database errors', async () => {
      mockSql.mockRejectedValueOnce(new Error('Database error'));

      await expect(deleteUrlTemplate(1)).rejects.toThrow('URLテンプレートの削除に失敗しました');
    });
  });
});