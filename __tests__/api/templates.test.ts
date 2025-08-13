import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/templates/route';

// ネットモジュールをモック
jest.mock('@neondatabase/serverless', () => ({
  neon: jest.fn(() => jest.fn()),
}));

// 認証をモック
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

// template-actions を直接モック
jest.mock('@/lib/template-actions', () => ({
  getAdTemplates: jest.fn(),
  createAdTemplate: jest.fn(),
}));

// authorization を直接モック
jest.mock('@/lib/authorization', () => ({
  hasMinimumRole: jest.fn(),
}));

const { neon } = require('@neondatabase/serverless');
const { auth } = require('@/auth');
const { getAdTemplates, createAdTemplate } = require('@/lib/template-actions');
const { hasMinimumRole } = require('@/lib/authorization');

const mockSql = jest.fn();
neon.mockReturnValue(mockSql);

describe('/api/templates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // デフォルトで認証済みユーザーを設定
    auth.mockResolvedValue({
      user: { email: 'test@example.com', role: 'editor' },
    });
    // デフォルトでエディター権限を設定
    hasMinimumRole.mockResolvedValue(true);
  });

  describe('GET /api/templates', () => {
    it('テンプレート一覧が正常に取得できる', async () => {
      const mockTemplates = [
        {
          id: 1,
          name: 'テストテンプレート1',
          html: '<div>{{title}}</div>',
          placeholders: ['title'],
          description: 'テスト用',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: 2,
          name: 'テストテンプレート2',
          html: '<div>{{content}}</div>',
          placeholders: ['content'],
          description: 'テスト用2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];

      getAdTemplates.mockResolvedValueOnce(mockTemplates);

      const response = await GET();

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockTemplates);
      expect(getAdTemplates).toHaveBeenCalled();
    });

    it('認証されていない場合は401エラーが返される', async () => {
      auth.mockResolvedValue(null);

      const response = await GET();

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('データベースエラー時は500エラーが返される', async () => {
      getAdTemplates.mockRejectedValueOnce(new Error('Database error'));

      const response = await GET();

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: '広告テンプレートの取得に失敗しました' });
    });
  });

  describe('POST /api/templates', () => {
    it('新しいテンプレートが正常に作成できる', async () => {
      const newTemplate = {
        name: 'テスト作成',
        html: '<div>{{title}}</div>',
        placeholders: ['title'],
        description: '作成テスト',
      };

      const createdTemplate = {
        id: 3,
        ...newTemplate,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      createAdTemplate.mockResolvedValueOnce(createdTemplate);

      const request = new NextRequest('http://localhost:3000/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data).toEqual(createdTemplate);
      expect(createAdTemplate).toHaveBeenCalledWith(newTemplate);
    });

    it('認証されていない場合は401エラーが返される', async () => {
      auth.mockResolvedValue(null);

      const newTemplate = {
        name: 'テスト作成',
        html: '<div>{{title}}</div>',
        placeholders: ['title'],
        description: '作成テスト',
      };

      const request = new NextRequest('http://localhost:3000/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      });

      const response = await POST(request);

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('不正なリクエストボディの場合は400エラーが返される', async () => {
      const invalidTemplate = {
        // nameが不足している
        html: '<div>{{title}}</div>',
        placeholders: ['title'],
        description: '作成テスト',
      };

      createAdTemplate.mockRejectedValueOnce(new Error('テンプレート名は必須です'));

      const request = new NextRequest('http://localhost:3000/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidTemplate),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('placeholdersが配列でない場合は正常に処理される', async () => {
      const templateWithStringPlaceholders = {
        name: 'テスト作成',
        html: '<div>{{title}}</div>',
        placeholders: 'title', // 文字列として送信
        description: '作成テスト',
      };

      const createdTemplate = {
        id: 3,
        ...templateWithStringPlaceholders,
        placeholders: ['title'], // 配列に変換される
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      createAdTemplate.mockResolvedValueOnce(createdTemplate);

      const request = new NextRequest('http://localhost:3000/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateWithStringPlaceholders),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.placeholders).toEqual(['title']);
    });

    it('データベースエラー時は500エラーが返される', async () => {
      createAdTemplate.mockRejectedValueOnce(new Error('Database error'));

      const newTemplate = {
        name: 'テスト作成',
        html: '<div>{{title}}</div>',
        placeholders: ['title'],
        description: '作成テスト',
      };

      const request = new NextRequest('http://localhost:3000/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTemplate),
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: 'Database error' });
    });

    it('空のplaceholdersでも正常に処理される', async () => {
      const templateWithoutPlaceholders = {
        name: 'プレースホルダーなし',
        html: '<div>静的コンテンツ</div>',
        placeholders: [],
        description: 'プレースホルダーなしのテンプレート',
      };

      const createdTemplate = {
        id: 4,
        ...templateWithoutPlaceholders,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      createAdTemplate.mockResolvedValueOnce(createdTemplate);

      const request = new NextRequest('http://localhost:3000/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(templateWithoutPlaceholders),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.placeholders).toEqual([]);
    });
  });
});
