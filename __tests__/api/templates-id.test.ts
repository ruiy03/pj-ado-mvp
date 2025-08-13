import { NextRequest } from 'next/server';
import { GET, PUT, DELETE } from '@/app/api/templates/[id]/route';

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
  getAdTemplateById: jest.fn(),
  updateAdTemplate: jest.fn(),
  deleteAdTemplate: jest.fn(),
}));

// authorization を直接モック
jest.mock('@/lib/authorization', () => ({
  hasMinimumRole: jest.fn(),
}));

const { neon } = require('@neondatabase/serverless');
const { auth } = require('@/auth');
const { getAdTemplateById, updateAdTemplate, deleteAdTemplate } = require('@/lib/template-actions');
const { hasMinimumRole } = require('@/lib/authorization');

const mockSql = jest.fn();
neon.mockReturnValue(mockSql);

describe('/api/templates/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // デフォルトで認証済みユーザーを設定
    auth.mockResolvedValue({
      user: { email: 'test@example.com', role: 'editor' },
    });
    // デフォルトでエディター権限を設定
    hasMinimumRole.mockResolvedValue(true);
  });

  describe('GET /api/templates/[id]', () => {
    it('指定されたテンプレートが正常に取得できる', async () => {
      const mockTemplate = {
        id: 1,
        name: 'テストテンプレート',
        html: '<div>{{title}}</div>',
        placeholders: ['title'],
        description: 'テスト用',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      getAdTemplateById.mockResolvedValueOnce(mockTemplate);

      const request = new NextRequest('http://localhost:3000/api/templates/1');
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(mockTemplate);
      expect(getAdTemplateById).toHaveBeenCalledWith(1);
    });

    it('存在しないテンプレートの場合は404エラーが返される', async () => {
      getAdTemplateById.mockResolvedValueOnce(null);

      const request = new NextRequest('http://localhost:3000/api/templates/999');
      const response = await GET(request, { params: Promise.resolve({ id: '999' }) });

      expect(response.status).toBe(404);
      const data = await response.json();
      expect(data).toEqual({ error: 'テンプレートが見つかりません' });
    });

    it('認証されていない場合は401エラーが返される', async () => {
      auth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/templates/1');
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('無効なIDの場合は400エラーが返される', async () => {
      const request = new NextRequest('http://localhost:3000/api/templates/invalid');
      const response = await GET(request, { params: Promise.resolve({ id: 'invalid' }) });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({ error: '無効なIDです' });
    });
  });

  describe('PUT /api/templates/[id]', () => {
    it('テンプレートが正常に更新できる', async () => {
      const updateData = {
        name: '更新されたテンプレート',
        html: '<div>{{updatedTitle}}</div>',
        placeholders: ['updatedTitle'],
        description: '更新後の説明',
      };

      const updatedTemplate = {
        id: 1,
        ...updateData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      updateAdTemplate.mockResolvedValueOnce(updatedTemplate);

      const request = new NextRequest('http://localhost:3000/api/templates/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual(updatedTemplate);
      expect(updateAdTemplate).toHaveBeenCalledWith({ ...updateData, id: 1 });
    });

    it('存在しないテンプレートの更新時は404エラーが返される', async () => {
      updateAdTemplate.mockRejectedValueOnce(new Error('テンプレートが見つかりません'));

      const updateData = {
        name: '更新されたテンプレート',
        html: '<div>{{updatedTitle}}</div>',
        placeholders: ['updatedTitle'],
        description: '更新後の説明',
      };

      const request = new NextRequest('http://localhost:3000/api/templates/999', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: Promise.resolve({ id: '999' }) });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: 'テンプレートが見つかりません' });
    });

    it('認証されていない場合は401エラーが返される', async () => {
      auth.mockResolvedValue(null);

      const updateData = {
        name: '更新されたテンプレート',
        html: '<div>{{updatedTitle}}</div>',
        placeholders: ['updatedTitle'],
        description: '更新後の説明',
      };

      const request = new NextRequest('http://localhost:3000/api/templates/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('不正なリクエストボディの場合は500エラーが返される', async () => {
      updateAdTemplate.mockRejectedValueOnce(new Error('テンプレート名は必須です'));

      const invalidUpdateData = {
        // nameが不足している
        html: '<div>{{updatedTitle}}</div>',
        placeholders: ['updatedTitle'],
        description: '更新後の説明',
      };

      const request = new NextRequest('http://localhost:3000/api/templates/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidUpdateData),
      });

      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });

  describe('DELETE /api/templates/[id]', () => {
    it('テンプレートが正常に削除できる', async () => {
      deleteAdTemplate.mockResolvedValueOnce(undefined);

      const request = new NextRequest('http://localhost:3000/api/templates/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ message: '広告テンプレートを削除しました' });
      expect(deleteAdTemplate).toHaveBeenCalledWith(1);
    });

    it('存在しないテンプレートの削除時は500エラーが返される', async () => {
      deleteAdTemplate.mockRejectedValueOnce(new Error('テンプレートが見つかりません'));

      const request = new NextRequest('http://localhost:3000/api/templates/999', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: '999' }) });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: 'テンプレートが見つかりません' });
    });

    it('認証されていない場合は401エラーが返される', async () => {
      auth.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/templates/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data).toEqual({ error: '認証が必要です' });
    });

    it('無効なIDの場合は400エラーが返される', async () => {
      const request = new NextRequest('http://localhost:3000/api/templates/invalid', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: 'invalid' }) });

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toEqual({ error: '無効なIDです' });
    });
  });

  describe('データベースエラーハンドリング', () => {
    it('GETでデータベースエラー時は500エラーが返される', async () => {
      getAdTemplateById.mockRejectedValueOnce(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/templates/1');
      const response = await GET(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: '広告テンプレートの取得に失敗しました' });
    });

    it('PUTでデータベースエラー時は500エラーが返される', async () => {
      updateAdTemplate.mockRejectedValueOnce(new Error('Database connection failed'));

      const updateData = {
        name: '更新されたテンプレート',
        html: '<div>{{updatedTitle}}</div>',
        placeholders: ['updatedTitle'],
        description: '更新後の説明',
      };

      const request = new NextRequest('http://localhost:3000/api/templates/1', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const response = await PUT(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: 'Database connection failed' });
    });

    it('DELETEでデータベースエラー時は500エラーが返される', async () => {
      deleteAdTemplate.mockRejectedValueOnce(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/templates/1', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: Promise.resolve({ id: '1' }) });

      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data).toEqual({ error: 'Database connection failed' });
    });
  });
});
