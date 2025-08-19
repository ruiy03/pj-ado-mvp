import {GET, POST} from '@/app/api/url-templates/route';
import {GET as getById, PUT, DELETE} from '@/app/api/url-templates/[id]/route';
import {NextRequest} from 'next/server';

// Mock auth
jest.mock('@/auth', () => ({
  auth: jest.fn()
}));

// Mock URL template actions
jest.mock('@/lib/url-template-actions', () => ({
  getUrlTemplates: jest.fn(),
  createUrlTemplate: jest.fn(),
  getUrlTemplateById: jest.fn(),
  updateUrlTemplate: jest.fn(),
  deleteUrlTemplate: jest.fn()
}));

const mockAuth = require('@/auth').auth;
const mockActions = require('@/lib/url-template-actions');

describe('/api/url-templates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/url-templates', () => {
    it('should return templates for authenticated user', async () => {
      mockAuth.mockResolvedValueOnce({
        user: {id: '1', email: 'test@example.com', role: 'admin'}
      });

      const mockTemplates = [
        {
          id: 1,
          name: 'Test Template',
          url: 'https://example.com',
            description: 'Test description'
        }
      ];

      mockActions.getUrlTemplates.mockResolvedValueOnce(mockTemplates);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.templates).toEqual(mockTemplates);
      expect(mockActions.getUrlTemplates).toHaveBeenCalledTimes(1);
    });

    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValueOnce(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle server errors', async () => {
      mockAuth.mockResolvedValueOnce({
        user: {id: '1', email: 'test@example.com', role: 'admin'}
      });
      mockActions.getUrlTemplates.mockRejectedValueOnce(new Error('Database error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('URLテンプレートの取得に失敗しました');
    });
  });

  describe('POST /api/url-templates', () => {
    it('should create template for authenticated user', async () => {
      mockAuth.mockResolvedValueOnce({
        user: {id: '1', email: 'test@example.com', role: 'admin'}
      });

      const mockTemplate = {
        id: 1,
        name: 'New Template',
        url: 'https://example.com',
        description: 'New description'
      };

      mockActions.createUrlTemplate.mockResolvedValueOnce(mockTemplate);

      const requestBody = {
        name: 'New Template',
        url: 'https://example.com',
        description: 'New description'
      };

      const request = new NextRequest('http://localhost:3000/api/url-templates', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: {'Content-Type': 'application/json'}
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.template).toEqual(mockTemplate);
      expect(mockActions.createUrlTemplate).toHaveBeenCalledWith(requestBody);
    });

    it('should return 401 for unauthenticated user', async () => {
      mockAuth.mockResolvedValueOnce(null);

      const request = new NextRequest('http://localhost:3000/api/url-templates', {
        method: 'POST',
        body: JSON.stringify({name: 'Test'})
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return 400 for validation errors', async () => {
      mockAuth.mockResolvedValueOnce({
        user: {id: '1', email: 'test@example.com', role: 'admin'}
      });

      mockActions.createUrlTemplate.mockRejectedValueOnce(new Error('テンプレート名は必須です'));

      const request = new NextRequest('http://localhost:3000/api/url-templates', {
        method: 'POST',
        body: JSON.stringify({name: '', url: 'invalid'}),
        headers: {'Content-Type': 'application/json'}
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('テンプレート名は必須です');
    });
  });

  describe('GET /api/url-templates/[id]', () => {
    it('should return specific template for authenticated user', async () => {
      mockAuth.mockResolvedValueOnce({
        user: {id: '1', email: 'test@example.com', role: 'admin'}
      });

      const mockTemplate = {
        id: 1,
        name: 'Test Template',
        url: 'https://example.com',
        description: 'Test description'
      };

      mockActions.getUrlTemplateById.mockResolvedValueOnce(mockTemplate);

      const request = new NextRequest('http://localhost:3000/api/url-templates/1');
      const params = Promise.resolve({id: '1'});

      const response = await getById(request, {params});
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.template).toEqual(mockTemplate);
      expect(mockActions.getUrlTemplateById).toHaveBeenCalledWith(1);
    });

    it('should return 404 if template not found', async () => {
      mockAuth.mockResolvedValueOnce({
        user: {id: '1', email: 'test@example.com', role: 'admin'}
      });

      mockActions.getUrlTemplateById.mockResolvedValueOnce(null);

      const request = new NextRequest('http://localhost:3000/api/url-templates/999');
      const params = Promise.resolve({id: '999'});

      const response = await getById(request, {params});
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('URLテンプレートが見つかりません');
    });

    it('should return 400 for invalid ID', async () => {
      mockAuth.mockResolvedValueOnce({
        user: {id: '1', email: 'test@example.com', role: 'admin'}
      });

      const request = new NextRequest('http://localhost:3000/api/url-templates/invalid');
      const params = Promise.resolve({id: 'invalid'});

      const response = await getById(request, {params});
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid ID');
    });
  });

  describe('PUT /api/url-templates/[id]', () => {
    it('should update template for authenticated user', async () => {
      mockAuth.mockResolvedValueOnce({
        user: {id: '1', email: 'test@example.com', role: 'admin'}
      });

      const mockUpdatedTemplate = {
        id: 1,
        name: 'Updated Template',
        url: 'https://updated.com',
        description: 'Updated description'
      };

      mockActions.updateUrlTemplate.mockResolvedValueOnce(mockUpdatedTemplate);

      const requestBody = {
        name: 'Updated Template',
        url: 'https://updated.com',
        description: 'Updated description'
      };

      const request = new NextRequest('http://localhost:3000/api/url-templates/1', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: {'Content-Type': 'application/json'}
      });
      const params = Promise.resolve({id: '1'});

      const response = await PUT(request, {params});
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.template).toEqual(mockUpdatedTemplate);
      expect(mockActions.updateUrlTemplate).toHaveBeenCalledWith({
        id: 1,
        ...requestBody
      });
    });

    it('should return 404 if template not found for update', async () => {
      mockAuth.mockResolvedValueOnce({
        user: {id: '1', email: 'test@example.com', role: 'admin'}
      });

      mockActions.updateUrlTemplate.mockRejectedValueOnce(new Error('URLテンプレートが見つかりません'));

      const request = new NextRequest('http://localhost:3000/api/url-templates/999', {
        method: 'PUT',
        body: JSON.stringify({name: 'Updated'}),
        headers: {'Content-Type': 'application/json'}
      });
      const params = Promise.resolve({id: '999'});

      const response = await PUT(request, {params});
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('URLテンプレートが見つかりません');
    });
  });

  describe('DELETE /api/url-templates/[id]', () => {
    it('should delete template for authenticated user', async () => {
      mockAuth.mockResolvedValueOnce({
        user: {id: '1', email: 'test@example.com', role: 'admin'}
      });

      mockActions.deleteUrlTemplate.mockResolvedValueOnce(undefined);

      const request = new NextRequest('http://localhost:3000/api/url-templates/1', {
        method: 'DELETE'
      });
      const params = Promise.resolve({id: '1'});

      const response = await DELETE(request, {params});
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(mockActions.deleteUrlTemplate).toHaveBeenCalledWith(1);
    });

    it('should return 404 if template not found for delete', async () => {
      mockAuth.mockResolvedValueOnce({
        user: {id: '1', email: 'test@example.com', role: 'admin'}
      });

      mockActions.deleteUrlTemplate.mockRejectedValueOnce(new Error('URLテンプレートが見つかりません'));

      const request = new NextRequest('http://localhost:3000/api/url-templates/999', {
        method: 'DELETE'
      });
      const params = Promise.resolve({id: '999'});

      const response = await DELETE(request, {params});
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('URLテンプレートが見つかりません');
    });
  });
});
