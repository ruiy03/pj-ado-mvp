import { renderHook, waitFor } from '@testing-library/react';
import { useTemplates } from '@/app/ad-templates/hooks/useTemplates';
import type { AdTemplate, CreateAdTemplateRequest } from '@/lib/definitions';

// Mock fetch
global.fetch = jest.fn();

// Mock addNofollowToLinks
jest.mock('@/lib/template-utils', () => ({
  addNofollowToLinks: jest.fn((html) => `${html} with nofollow`),
}));

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('useTemplates', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTemplates: AdTemplate[] = [
    {
      id: 1,
      name: 'Template 1',
      html: '<div>Test 1</div>',
      placeholders: ['title'],
      description: 'Description 1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Template 2',
      html: '<div>Test 2</div>',
      placeholders: ['title', 'content'],
      description: 'Description 2',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ];

  it('fetches templates on mount and sorts by updated_at', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTemplates),
    } as Response);

    const { result } = renderHook(() => useTemplates());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.templates).toHaveLength(2);
    expect(result.current.templates[0].id).toBe(2); // Template 2 is more recent
    expect(result.current.templates[1].id).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it('handles fetch error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useTemplates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
    expect(result.current.templates).toEqual([]);
  });

  it('creates new template and adds to top of list', async () => {
    const newTemplate: AdTemplate = {
      id: 3,
      name: 'New Template',
      html: '<div>New</div>',
      placeholders: ['title'],
      description: 'New Description',
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    };

    // Initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTemplates),
    } as Response);

    const { result } = renderHook(() => useTemplates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.templates).toHaveLength(2);

    // Create template
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(newTemplate),
    } as Response);

    const formData: CreateAdTemplateRequest = {
      name: 'New Template',
      html: '<div>New</div>',
      placeholders: ['title'],
      description: 'New Description',
    };

    await result.current.createTemplate(formData, false);

    await waitFor(() => {
      expect(result.current.templates).toHaveLength(3);
    });
    expect(result.current.templates[0]).toEqual(newTemplate);
  });

  it('calls updateTemplate API with correct parameters', async () => {
    // Initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTemplates),
    } as Response);

    const { result } = renderHook(() => useTemplates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Update template
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTemplates[1]),
    } as Response);

    const formData: CreateAdTemplateRequest = {
      name: 'Updated Template',
      html: '<div>Updated</div>',
      placeholders: ['title'],
      description: 'Updated Description',
    };

    await result.current.updateTemplate(2, formData, false);

    expect(mockFetch).toHaveBeenLastCalledWith('/api/templates/2', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
  });

  it('deletes template and removes from list', async () => {
    // Mock window.confirm
    Object.defineProperty(window, 'confirm', {
      writable: true,
      value: jest.fn(() => true),
    });

    // Initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTemplates),
    } as Response);

    const { result } = renderHook(() => useTemplates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Delete template
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    } as Response);

    await result.current.deleteTemplate(1);

    await waitFor(() => {
      expect(result.current.templates).toHaveLength(1);
    });
    expect(result.current.templates[0].id).toBe(2);
  });

  it('cancels delete when user clicks cancel', async () => {
    // Mock window.confirm to return false
    Object.defineProperty(window, 'confirm', {
      writable: true,
      value: jest.fn(() => false),
    });

    // Initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTemplates),
    } as Response);

    const { result } = renderHook(() => useTemplates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.deleteTemplate(1);

    // Templates should remain unchanged
    expect(result.current.templates).toHaveLength(2);
    expect(mockFetch).toHaveBeenCalledTimes(1); // Only initial fetch
  });

  it('handles templates without updated_at during sorting', async () => {
    const templatesWithoutDates = [
      { ...mockTemplates[0], updated_at: undefined },
      { ...mockTemplates[1], updated_at: undefined },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(templatesWithoutDates),
    } as Response);

    const { result } = renderHook(() => useTemplates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.templates).toHaveLength(2);
    expect(result.current.error).toBeNull();
  });

  it('applies nofollow when autoNofollow is true', async () => {
    const newTemplate: AdTemplate = {
      id: 3,
      name: 'New Template',
      html: '<div>New</div> with nofollow',
      placeholders: ['title'],
      description: 'New Description',
      created_at: '2024-01-03T00:00:00Z',
      updated_at: '2024-01-03T00:00:00Z',
    };

    // Initial fetch
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    } as Response);

    const { result } = renderHook(() => useTemplates());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Create template with autoNofollow
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(newTemplate),
    } as Response);

    const formData: CreateAdTemplateRequest = {
      name: 'New Template',
      html: '<div>New</div>',
      placeholders: ['title'],
      description: 'New Description',
    };

    await result.current.createTemplate(formData, true);

    expect(mockFetch).toHaveBeenLastCalledWith('/api/templates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        html: '<div>New</div> with nofollow',
      }),
    });
  });
});