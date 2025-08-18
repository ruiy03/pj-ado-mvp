import {renderHook, act, waitFor} from '@testing-library/react';
import {useUrlTemplates} from '@/app/url-templates/hooks/useUrlTemplates';
import type {UrlTemplate, CreateUrlTemplateRequest} from '@/lib/definitions';

// Mock fetch
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});

afterAll(() => {
  console.error = originalConsoleError;
});

describe('useUrlTemplates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchTemplates', () => {
    it('should fetch and sort templates by updated_at', async () => {
      const mockTemplates: UrlTemplate[] = [
        {
          id: 1,
          name: 'Template 1',
          url: 'https://example1.com',
          parameters: {utm_campaign: 'test1'},
          description: 'Description 1',
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'Template 2',
          url: 'https://example2.com',
          parameters: {utm_campaign: 'test2'},
          description: 'Description 2',
          created_at: '2023-01-02T00:00:00Z',
          updated_at: '2023-01-03T00:00:00Z'
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({templates: mockTemplates})
      } as Response);

      const {result} = renderHook(() => useUrlTemplates());

      // Wait for initial fetch to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.templates).toHaveLength(2);
      // Should be sorted by updated_at DESC (Template 2 first)
      expect(result.current.templates[0].id).toBe(2);
      expect(result.current.templates[1].id).toBe(1);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response);

      const {result} = renderHook(() => useUrlTemplates());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.templates).toEqual([]);
      expect(result.current.error).toBe('URLテンプレートの取得に失敗しました');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const {result} = renderHook(() => useUrlTemplates());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.templates).toEqual([]);
      expect(result.current.error).toBe('Network error');
    });
  });

  describe('createTemplate', () => {
    it('should create template and add to list', async () => {
      const existingTemplates: UrlTemplate[] = [
        {
          id: 1,
          name: 'Existing Template',
          url: 'https://existing.com',
          parameters: {},
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        }
      ];

      const newTemplate: UrlTemplate = {
        id: 2,
        name: 'New Template',
        url: 'https://new.com',
        parameters: {utm_campaign: 'new'},
        description: 'New description',
        created_at: '2023-01-02T00:00:00Z',
        updated_at: '2023-01-02T00:00:00Z'
      };

      // Initial fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({templates: existingTemplates})
      } as Response);

      const {result} = renderHook(() => useUrlTemplates());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Create template request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({template: newTemplate})
      } as Response);

      const createData: CreateUrlTemplateRequest = {
        name: 'New Template',
        url: 'https://new.com',
        parameters: {utm_campaign: 'new'},
        description: 'New description'
      };

      await act(async () => {
        await result.current.createTemplate(createData);
      });

      expect(mockFetch).toHaveBeenLastCalledWith('/api/url-templates', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(createData)
      });

      expect(result.current.templates).toHaveLength(2);
      expect(result.current.templates[0]).toEqual(newTemplate); // New template should be first
      expect(result.current.templates[1]).toEqual(existingTemplates[0]);
    });

    it('should handle create errors', async () => {
      // Initial fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({templates: []})
      } as Response);

      const {result} = renderHook(() => useUrlTemplates());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Create template error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({error: 'Creation failed'})
      } as Response);

      const createData: CreateUrlTemplateRequest = {
        name: 'Test',
        url: 'https://test.com',
        parameters: {}
      };

      await expect(act(async () => {
        await result.current.createTemplate(createData);
      })).rejects.toThrow('Creation failed');
    });
  });

  describe('updateTemplate', () => {
    it('should update template and move to top of list', async () => {
      const initialTemplates: UrlTemplate[] = [
        {
          id: 1,
          name: 'Template 1',
          url: 'https://example1.com',
          parameters: {},
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'Template 2',
          url: 'https://example2.com',
          parameters: {},
          created_at: '2023-01-02T00:00:00Z',
          updated_at: '2023-01-02T00:00:00Z'
        }
      ];

      const updatedTemplate: UrlTemplate = {
        ...initialTemplates[1],
        name: 'Updated Template 2',
        updated_at: '2023-01-03T00:00:00Z'
      };

      // Initial fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({templates: initialTemplates})
      } as Response);

      const {result} = renderHook(() => useUrlTemplates());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Update template request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({template: updatedTemplate})
      } as Response);

      const updateData: CreateUrlTemplateRequest = {
        name: 'Updated Template 2',
        url: 'https://example2.com',
        parameters: {}
      };

      await act(async () => {
        await result.current.updateTemplate(2, updateData);
      });

      expect(mockFetch).toHaveBeenLastCalledWith('/api/url-templates/2', {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(updateData)
      });

      expect(result.current.templates).toHaveLength(2);
      expect(result.current.templates[0]).toEqual(updatedTemplate); // Updated template should be first
      expect(result.current.templates[1]).toEqual(initialTemplates[1]);
    });

    it('should handle update errors', async () => {
      // Initial fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({templates: []})
      } as Response);

      const {result} = renderHook(() => useUrlTemplates());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Update template error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({error: 'Update failed'})
      } as Response);

      const updateData: CreateUrlTemplateRequest = {
        name: 'Test',
        url: 'https://test.com',
        parameters: {}
      };

      await expect(act(async () => {
        await result.current.updateTemplate(1, updateData);
      })).rejects.toThrow('Update failed');
    });
  });

  describe('deleteTemplate', () => {
    it('should delete template and remove from list', async () => {
      const initialTemplates: UrlTemplate[] = [
        {
          id: 1,
          name: 'Template 1',
          url: 'https://example1.com',
          parameters: {},
          created_at: '2023-01-01T00:00:00Z',
          updated_at: '2023-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'Template 2',
          url: 'https://example2.com',
          parameters: {},
          created_at: '2023-01-02T00:00:00Z',
          updated_at: '2023-01-02T00:00:00Z'
        }
      ];

      // Initial fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({templates: initialTemplates})
      } as Response);

      const {result} = renderHook(() => useUrlTemplates());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mock confirm dialog
      global.confirm = jest.fn().mockReturnValueOnce(true);

      // Delete template request
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({success: true})
      } as Response);

      await act(async () => {
        await result.current.deleteTemplate(1);
      });

      expect(mockFetch).toHaveBeenLastCalledWith('/api/url-templates/1', {
        method: 'DELETE'
      });

      expect(result.current.templates).toHaveLength(1);
      expect(result.current.templates[0]).toEqual(initialTemplates[0]); // Template 2 remains
    });

    it('should not delete if user cancels', async () => {
      // Initial fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({templates: [{id: 1, name: 'Test', url: 'https://test.com', parameters: {}}]})
      } as Response);

      const {result} = renderHook(() => useUrlTemplates());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mock confirm dialog to return false
      global.confirm = jest.fn().mockReturnValueOnce(false);

      await act(async () => {
        await result.current.deleteTemplate(1);
      });

      // Should not make delete request
      expect(mockFetch).toHaveBeenCalledTimes(1); // Only initial fetch
      expect(result.current.templates).toHaveLength(1);
    });

    it('should handle delete errors', async () => {
      // Initial fetch
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({templates: [{id: 1, name: 'Test', url: 'https://test.com', parameters: {}}]})
      } as Response);

      const {result} = renderHook(() => useUrlTemplates());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      global.confirm = jest.fn().mockReturnValueOnce(true);

      // Delete template error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({error: 'Delete failed'})
      } as Response);

      await expect(act(async () => {
        await result.current.deleteTemplate(1);
      })).rejects.toThrow('Delete failed');
    });
  });

  describe('error management', () => {
    it('should allow clearing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500
      } as Response);

      const {result} = renderHook(() => useUrlTemplates());

      await waitFor(() => {
        expect(result.current.error).toBe('URLテンプレートの取得に失敗しました');
      });

      act(() => {
        result.current.setError(null);
      });

      expect(result.current.error).toBeNull();
    });

    it('should allow setting custom errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({templates: []})
      } as Response);

      const {result} = renderHook(() => useUrlTemplates());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      act(() => {
        result.current.setError('Custom error message');
      });

      expect(result.current.error).toBe('Custom error message');
    });
  });
});