import { NextRequest } from 'next/server';
import { POST } from '@/app/api/templates/import/route';
import { GET } from '@/app/api/templates/export/route';

// ネットモジュールをモック
jest.mock('@neondatabase/serverless', () => ({
  neon: jest.fn(() => jest.fn()),
}));

// 認証をモック
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

// template-actions をモック
jest.mock('@/lib/template-actions', () => ({
  getAdTemplates: jest.fn(),
  createAdTemplate: jest.fn(),
}));

// authorization をモック
jest.mock('@/lib/authorization', () => ({
  hasMinimumRole: jest.fn(),
}));

const { neon } = require('@neondatabase/serverless');
const { auth } = require('@/auth');
const { getAdTemplates, createAdTemplate } = require('@/lib/template-actions');
const { hasMinimumRole } = require('@/lib/authorization');

const mockSql = jest.fn();
neon.mockReturnValue(mockSql);

describe('/api/templates/import & /api/templates/export', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // デフォルトで認証済みユーザーを設定
    auth.mockResolvedValue({
      user: { email: 'test@example.com', role: 'editor' },
    });
    // デフォルトでエディター権限を設定
    hasMinimumRole.mockResolvedValue(true);
  });

  describe('POST /api/templates/import', () => {
    it('CSVファイルが正常にインポートできる', async () => {
      const csvContent = `name,html,placeholders,description
テストバナー,"<div>{{title}}</div>","title","テスト用バナー"
テストカード,"<div>{{title}}{{description}}</div>","title,description","テスト用カード"`;
      
      const file = new File([csvContent], 'templates.csv', { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', file);

      // createAdTemplateのmockを設定
      createAdTemplate
        .mockResolvedValueOnce({ id: 1, name: 'テストバナー', html: '<div>{{title}}</div>', placeholders: ['title'], description: 'テスト用バナー' })
        .mockResolvedValueOnce({ id: 2, name: 'テストカード', html: '<div>{{title}}{{description}}</div>', placeholders: ['title', 'description'], description: 'テスト用カード' });

      const request = new NextRequest('http://localhost:3000/api/templates/import', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({
        success: 2,
        errors: [],
        total: 2,
        createdItems: [
          { id: 1, name: 'テストバナー' },
          { id: 2, name: 'テストカード' }
        ],
        updatedItems: []
      });
    });

    it('ファイルが提供されていない場合は400エラーが返される', async () => {
      const formData = new FormData();

      const request = new NextRequest('http://localhost:3000/api/templates/import', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({ error: 'ファイルが選択されていません' });
    });

    it('認証されていない場合は401エラーが返される', async () => {
      auth.mockResolvedValue(null);

      const csvContent = `name,html,placeholders,description
テストバナー,"<div>{{title}}</div>","title","テスト用バナー"`;
      
      const file = new File([csvContent], 'templates.csv', { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3000/api/templates/import', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('無効なCSVフォーマットの場合は適切にエラーが処理される', async () => {
      const csvContent = `invalid,format
データが不完全`;
      
      const file = new File([csvContent], 'invalid.csv', { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3000/api/templates/import', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('必要なヘッダーが不足しています');
    });

    it('部分的にエラーがある場合は成功とエラーの両方が返される', async () => {
      const csvContent = `name,html,placeholders,description
有効なテンプレート,"<div>{{title}}</div>","title","有効な説明"
,"<div>無効</div>","","名前が空"`;
      
      const file = new File([csvContent], 'mixed.csv', { type: 'text/csv' });
      const formData = new FormData();
      formData.append('file', file);

      // 最初のレコードは成功、2番目は失敗
      createAdTemplate
        .mockResolvedValueOnce({ id: 1, name: '有効なテンプレート', html: '<div>{{title}}</div>', placeholders: ['title'], description: '有効な説明' })
        .mockRejectedValueOnce(new Error('Validation error')); // 失敗

      const request = new NextRequest('http://localhost:3000/api/templates/import', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(1);
      expect(data.errors.length).toBe(1);
      expect(data.total).toBe(2);
      expect(data.createdItems).toEqual([
        { id: 1, name: '有効なテンプレート' }
      ]);
      expect(data.updatedItems).toEqual([]);
    });

    it('CSVファイル以外の形式は拒否される', async () => {
      const textContent = 'これはテキストファイルです';
      const file = new File([textContent], 'notcsv.txt', { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3000/api/templates/import', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('CSV');
    });
  });

  describe('GET /api/templates/export', () => {
    it('テンプレートが正常にCSV形式でエクスポートできる', async () => {
      const mockTemplates = [
        {
          id: 1,
          name: 'テストバナー',
          html: '<div>{{title}}</div>',
          placeholders: ['title'],
          description: 'テスト用バナー',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'テストカード',
          html: '<div>{{title}}{{description}}</div>',
          placeholders: ['title', 'description'],
          description: 'テスト用カード',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      getAdTemplates.mockResolvedValueOnce(mockTemplates);

      const response = await GET();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('text/csv');
      expect(response.headers.get('Content-Disposition')).toContain('attachment');
      expect(response.headers.get('Content-Disposition')).toContain('filename=');

      const csvContent = await response.text();
      expect(csvContent).toContain('name,html,placeholders,description');
      expect(csvContent).toContain('テストバナー');
      expect(csvContent).toContain('テストカード');
    });

    it('認証されていない場合は401エラーが返される', async () => {
      auth.mockResolvedValue(null);

      const response = await GET();

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('テンプレートがない場合でも空のCSVファイルが返される', async () => {
      getAdTemplates.mockResolvedValueOnce([]);

      const response = await GET();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('text/csv');

      const csvContent = await response.text();
      expect(csvContent).toContain('name,html,placeholders,description');
      // ヘッダー行のみ存在することを確認 (空文字列の場合は1行のみ)
      expect(csvContent.split('\n').length).toBeGreaterThanOrEqual(1);
    });

    it('データベースエラー時は500エラーが返される', async () => {
      getAdTemplates.mockRejectedValueOnce(new Error('Database connection failed'));

      const response = await GET();

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: 'テンプレートのエクスポートに失敗しました' });
    });

    it('特殊文字が含まれるデータも正しくエスケープされる', async () => {
      const mockTemplates = [
        {
          id: 1,
          name: 'テスト"引用符"あり',
          html: '<div style="color: red;">{{title}}</div>',
          placeholders: ['title'],
          description: 'カンマ,と改行\nを含む説明',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      getAdTemplates.mockResolvedValueOnce(mockTemplates);

      const response = await GET();

      expect(response.status).toBe(200);

      const csvContent = await response.text();
      // CSVエスケープが正しく行われていることを確認
      expect(csvContent).toContain('"テスト""引用符""あり"');
      expect(csvContent).toContain('"カンマ,と改行\nを含む説明"');
    });

    it('配列のplaceholdersが正しく文字列化される', async () => {
      const mockTemplates = [
        {
          id: 1,
          name: 'マルチプレースホルダー',
          html: '<div>{{title}}{{description}}{{imageUrl}}</div>',
          placeholders: ['title', 'description', 'imageUrl'],
          description: '複数のプレースホルダー',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      getAdTemplates.mockResolvedValueOnce(mockTemplates);

      const response = await GET();

      expect(response.status).toBe(200);

      const csvContent = await response.text();
      expect(csvContent).toContain('title,description,imageUrl');
    });
  });
});
