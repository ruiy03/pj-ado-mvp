import {
  getAdTemplates,
  getAdTemplateById,
  createAdTemplate,
  updateAdTemplate,
  deleteAdTemplate,
} from '@/lib/template-actions';
import {sql} from '@/lib/db';

// Mock dependencies
jest.mock('@/lib/db');
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

const mockSql = sql as jest.MockedFunction<typeof sql>;

describe('template-actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAdTemplates', () => {
    it('広告テンプレート一覧を正しく取得する', async () => {
      const mockTemplates = [
        {
          id: 1,
          name: 'Test Template 1',
          html: '<div>{{title}}</div>',
          placeholders: '["title"]',
          description: 'Test description',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-02'),
        },
        {
          id: 2,
          name: 'Test Template 2',
          html: '<div>{{content}}</div>',
          placeholders: '["content"]',
          description: null,
          created_at: new Date('2024-01-03'),
          updated_at: new Date('2024-01-04'),
        },
      ];

      mockSql.mockResolvedValue(mockTemplates as any);

      const result = await getAdTemplates();

      expect(result).toHaveLength(2);
      expect(result[0].placeholders).toEqual(['title']);
      expect(result[1].placeholders).toEqual(['content']);
      expect(result[0].created_at).toBe('2024-01-01T00:00:00.000Z');
      expect(mockSql).toHaveBeenCalledTimes(1);
    });

    it('プレースホルダーが配列の場合も正しく処理する', async () => {
      const mockTemplates = [
        {
          id: 1,
          name: 'Test Template',
          html: '<div>{{title}}</div>',
          placeholders: ['title'],
          description: 'Test description',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-02'),
        },
      ];

      mockSql.mockResolvedValue(mockTemplates as any);

      const result = await getAdTemplates();

      expect(result[0].placeholders).toEqual(['title']);
    });

    it('データベースエラー時に適切なエラーを投げる', async () => {
      mockSql.mockRejectedValue(new Error('Database error'));

      await expect(getAdTemplates()).rejects.toThrow('広告テンプレートの取得に失敗しました');
    });
  });

  describe('getAdTemplateById', () => {
    it('指定されたIDのテンプレートを取得する', async () => {
      const mockTemplate = {
        id: 1,
        name: 'Test Template',
        html: '<div>{{title}}</div>',
        placeholders: '["title", "description"]',
        description: 'Test description',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      };

      mockSql.mockResolvedValue([mockTemplate] as any);

      const result = await getAdTemplateById(1);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(1);
      expect(result!.name).toBe('Test Template');
      expect(result!.placeholders).toEqual(['title', 'description']);
    });

    it('存在しないIDの場合はnullを返す', async () => {
      mockSql.mockResolvedValue([] as any);

      const result = await getAdTemplateById(999);

      expect(result).toBeNull();
    });

    it('データベースエラー時に適切なエラーを投げる', async () => {
      mockSql.mockRejectedValue(new Error('Database error'));

      await expect(getAdTemplateById(1)).rejects.toThrow('広告テンプレートの取得に失敗しました');
    });
  });

  describe('createAdTemplate', () => {
    it('有効なデータで新しいテンプレートを作成する', async () => {
      const createData = {
        name: 'New Template',
        html: '<div>{{title}}</div><p>{{description}}</p>',
        placeholders: ['title', 'description'],
        description: 'New template description',
      };

      const mockCreatedTemplate = {
        id: 1,
        name: 'New Template',
        html: '<div>{{title}}</div><p>{{description}}</p>',
        placeholders: '["title", "description"]',
        description: 'New template description',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      mockSql.mockResolvedValue([mockCreatedTemplate] as any);

      const result = await createAdTemplate(createData);

      expect(result.id).toBe(1);
      expect(result.name).toBe('New Template');
      expect(result.placeholders).toEqual(['title', 'description']);
      expect(mockSql).toHaveBeenCalledWith(
        expect.anything(),
        'New Template',
        '<div>{{title}}</div><p>{{description}}</p>',
        '["title","description"]',
        'New template description'
      );
    });

    it('バリデーションエラー時に適切なエラーを投げる', async () => {
      const invalidData = {
        name: '', // 空の名前
        html: '<div>{{title}}</div>',
        placeholders: ['title'],
      };

      await expect(createAdTemplate(invalidData)).rejects.toThrow();
    });

    it('データベースエラー時に適切なエラーを投げる', async () => {
      const createData = {
        name: 'New Template',
        html: '<div>{{title}}</div>',
        placeholders: ['title'],
      };

      mockSql.mockRejectedValue(new Error('Database error'));

      await expect(createAdTemplate(createData)).rejects.toThrow('広告テンプレートの作成に失敗しました');
    });
  });

  describe('updateAdTemplate', () => {
    it('有効なデータでテンプレートを更新する', async () => {
      const updateData = {
        id: 1,
        name: 'Updated Template',
        html: '<div>{{newTitle}}</div>',
        placeholders: ['newTitle'],
        description: 'Updated description',
      };

      const mockUpdatedTemplate = {
        id: 1,
        name: 'Updated Template',
        html: '<div>{{newTitle}}</div>',
        placeholders: '["newTitle"]',
        description: 'Updated description',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      };

      mockSql.mockResolvedValue([mockUpdatedTemplate] as any);

      const result = await updateAdTemplate(updateData);

      expect(result.id).toBe(1);
      expect(result.name).toBe('Updated Template');
      expect(result.placeholders).toEqual(['newTitle']);
    });

    it('部分更新で一部のフィールドのみ更新する', async () => {
      const updateData = {
        id: 1,
        name: 'Updated Name Only',
      };

      const mockUpdatedTemplate = {
        id: 1,
        name: 'Updated Name Only',
        html: '<div>{{title}}</div>',
        placeholders: '["title"]',
        description: 'Original description',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      };

      mockSql.mockResolvedValue([mockUpdatedTemplate] as any);

      const result = await updateAdTemplate(updateData);

      expect(result.name).toBe('Updated Name Only');
    });

    it('存在しないテンプレートの更新でエラーを投げる', async () => {
      const updateData = {
        id: 999,
        name: 'Updated Template',
      };

      mockSql.mockResolvedValue([] as any);

      await expect(updateAdTemplate(updateData)).rejects.toThrow();
    });

    it('バリデーションエラー時に適切なエラーを投げる', async () => {
      const invalidData = {
        id: 1,
        name: '', // 空の名前
      };

      await expect(updateAdTemplate(invalidData)).rejects.toThrow();
    });
  });

  describe('deleteAdTemplate', () => {
    it('指定されたIDのテンプレートを削除する', async () => {
      mockSql.mockResolvedValue([{id: 1}] as any);

      await expect(deleteAdTemplate(1)).resolves.not.toThrow();
      expect(mockSql).toHaveBeenCalledTimes(1);
    });

    it('存在しないテンプレートの削除でエラーを投げる', async () => {
      mockSql.mockResolvedValue([] as any);

      await expect(deleteAdTemplate(999)).rejects.toThrow();
    });

    it('データベースエラー時に適切なエラーを投げる', async () => {
      mockSql.mockRejectedValue(new Error('Database error'));

      await expect(deleteAdTemplate(1)).rejects.toThrow('広告テンプレートの削除に失敗しました');
    });
  });
});
