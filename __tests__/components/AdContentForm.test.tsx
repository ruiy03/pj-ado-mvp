import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import AdContentForm from '@/app/ads/components/AdContentForm';
import type {AdContent, AdTemplate, UrlTemplate, CreateAdContentRequest} from '@/lib/definitions';

// Mock dependencies
jest.mock('@/lib/image-utils', () => ({
  isImagePlaceholder: jest.fn((placeholder: string) => placeholder.includes('image')),
  getCleanPlaceholderName: jest.fn((placeholder: string) => placeholder.replace(/\{\{|\}\}/g, '').trim()),
}));

jest.mock('@/components/ImageUpload', () => {
  return function MockImageUpload({onUpload, onRemove, currentImageUrl, placeholder}: any) {
    return (
      <div data-testid="image-upload">
        <span>Image Upload: {placeholder}</span>
        {currentImageUrl && <span>Current: {currentImageUrl}</span>}
        <button
          onClick={() => onUpload({url: 'test-image.jpg', filename: 'test.jpg', size: 1024, mimeType: 'image/jpeg'})}>
          Upload
        </button>
        <button onClick={onRemove}>Remove</button>
      </div>
    );
  };
});

jest.mock('@/app/ads/components/AdPreview', () => {
  return function MockAdPreview({template, contentData}: any) {
    return (
      <div data-testid="ad-preview">
        <span>Preview for: {template?.name || 'No template'}</span>
        <span>Content: {JSON.stringify(contentData)}</span>
      </div>
    );
  };
});

const mockTemplates: AdTemplate[] = [
  {
    id: 1,
    name: 'Test Template',
    html: '<div>{{title}} - {{image}}</div>',
    placeholders: ['{{title}}', '{{image}}'],
    description: 'Test template',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockUrlTemplates: UrlTemplate[] = [
  {
    id: 1,
    name: 'Test URL Template',
    url_template: '{{baseUrl}}?utm_source={{source}}',
    parameters: {source: 'test'},
    description: 'Test URL template',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

const mockHandlers = {
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
};

describe('AdContentForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render create form correctly', () => {
    render(
      <AdContentForm
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('新しい広告コンテンツを作成')).toBeInTheDocument();
    expect(screen.getByText('作成する')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('例: PORTキャリア春のキャンペーン')).toBeInTheDocument();
  });

  it('should render edit form correctly', () => {
    const mockAdContent: AdContent = {
      id: 1,
      name: 'Test Ad Content',
      template_id: 1,
      url_template_id: 1,
      content_data: {title: 'Test Title'},
      status: 'draft',
      created_by: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      images: [],
    };

    render(
      <AdContentForm
        adContent={mockAdContent}
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        isEdit={true}
        {...mockHandlers}
      />
    );

    expect(screen.getByText('広告コンテンツを編集')).toBeInTheDocument();
    expect(screen.getByText('更新する')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Ad Content')).toBeInTheDocument();
  });

  it('should handle form input changes', () => {
    render(
      <AdContentForm
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        {...mockHandlers}
      />
    );

    const nameInput = screen.getByPlaceholderText('例: PORTキャリア春のキャンペーン');
    fireEvent.change(nameInput, {target: {value: 'New Ad Name'}});

    expect(nameInput).toHaveValue('New Ad Name');
  });

  it('should handle template selection', () => {
    render(
      <AdContentForm
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        {...mockHandlers}
      />
    );

    const templateSelect = screen.getByDisplayValue('テンプレートを選択...');
    fireEvent.change(templateSelect, {target: {value: '1'}});

    expect(templateSelect).toHaveValue('1');
    expect(screen.getByText('コンテンツ入力')).toBeInTheDocument();
  });

  it('should handle URL template selection', () => {
    render(
      <AdContentForm
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        {...mockHandlers}
      />
    );

    const urlTemplateSelect = screen.getByDisplayValue('URLテンプレートを選択...');
    fireEvent.change(urlTemplateSelect, {target: {value: '1'}});

    expect(urlTemplateSelect).toHaveValue('1');
    expect(screen.getByText('リンクURLプレビュー')).toBeInTheDocument();
  });

  it('should show placeholder inputs when template is selected', () => {
    render(
      <AdContentForm
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        {...mockHandlers}
      />
    );

    const templateSelect = screen.getByDisplayValue('テンプレートを選択...');
    fireEvent.change(templateSelect, {target: {value: '1'}});

    expect(screen.getByText('title')).toBeInTheDocument();
    expect(screen.getByText('image')).toBeInTheDocument();
  });

  it('should handle placeholder value updates', () => {
    render(
      <AdContentForm
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        {...mockHandlers}
      />
    );

    const templateSelect = screen.getByDisplayValue('テンプレートを選択...');
    fireEvent.change(templateSelect, {target: {value: '1'}});

    const titleInput = screen.getByPlaceholderText('titleを入力...');
    fireEvent.change(titleInput, {target: {value: 'Test Title'}});

    expect(titleInput).toHaveValue('Test Title');
  });

  it('should handle image upload', () => {
    render(
      <AdContentForm
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        {...mockHandlers}
      />
    );

    const templateSelect = screen.getByDisplayValue('テンプレートを選択...');
    fireEvent.change(templateSelect, {target: {value: '1'}});

    const uploadButton = screen.getByText('Upload');
    fireEvent.click(uploadButton);

    expect(screen.getByText('Current: test-image.jpg')).toBeInTheDocument();
  });

  it('should handle image removal', () => {
    render(
      <AdContentForm
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        {...mockHandlers}
      />
    );

    const templateSelect = screen.getByDisplayValue('テンプレートを選択...');
    fireEvent.change(templateSelect, {target: {value: '1'}});

    const uploadButton = screen.getByText('Upload');
    fireEvent.click(uploadButton);

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    expect(screen.queryByText('Current: test-image.jpg')).not.toBeInTheDocument();
  });

  it('should validate required fields', async () => {
    render(
      <AdContentForm
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        {...mockHandlers}
      />
    );

    const submitButton = screen.getByText('作成する');
    fireEvent.click(submitButton);

    // The form validates but button is disabled when name is empty
    expect(submitButton).toBeDisabled();
    expect(mockHandlers.onSubmit).not.toHaveBeenCalled();
  });

  it('should prevent submission with short name', async () => {
    const mockOnSubmit = jest.fn();
    
    render(
      <AdContentForm
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        onSubmit={mockOnSubmit}
        onCancel={() => {}}
      />
    );

    const nameInput = screen.getByPlaceholderText('例: PORTキャリア春のキャンペーン');
    fireEvent.change(nameInput, {target: {value: 'a'}});

    const submitButton = screen.getByText('作成する');
    fireEvent.click(submitButton);

    // Should not call onSubmit due to validation error
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should prevent submission with missing required fields', async () => {
    const mockOnSubmit = jest.fn();
    
    render(
      <AdContentForm
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        onSubmit={mockOnSubmit}
        onCancel={() => {}}
      />
    );

    const nameInput = screen.getByPlaceholderText('例: PORTキャリア春のキャンペーン');
    fireEvent.change(nameInput, {target: {value: 'Valid Name'}});

    const templateSelect = screen.getByDisplayValue('テンプレートを選択...');
    fireEvent.change(templateSelect, {target: {value: '1'}});

    const submitButton = screen.getByText('作成する');
    fireEvent.click(submitButton);

    // Should not call onSubmit due to missing URL template and placeholder fields
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should submit form with valid data', async () => {
    mockHandlers.onSubmit.mockResolvedValue(undefined);
    render(
      <AdContentForm
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        {...mockHandlers}
      />
    );

    const nameInput = screen.getByPlaceholderText('例: PORTキャリア春のキャンペーン');
    fireEvent.change(nameInput, {target: {value: 'Valid Name'}});

    const templateSelect = screen.getByDisplayValue('テンプレートを選択...');
    fireEvent.change(templateSelect, {target: {value: '1'}});

    const urlTemplateSelect = screen.getByDisplayValue('URLテンプレートを選択...');
    fireEvent.change(urlTemplateSelect, {target: {value: '1'}});

    const titleInput = screen.getByPlaceholderText('titleを入力...');
    fireEvent.change(titleInput, {target: {value: 'Test Title'}});

    const uploadButton = screen.getByText('Upload');
    fireEvent.click(uploadButton);

    const submitButton = screen.getByText('作成する');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockHandlers.onSubmit).toHaveBeenCalledWith({
        name: 'Valid Name',
        template_id: 1,
        url_template_id: 1,
        content_data: {
          '{{title}}': 'Test Title',
          '{{image}}': 'test-image.jpg',
        },
        status: 'draft',
      });
    });
  });

  it('should handle cancel button', () => {
    render(
      <AdContentForm
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        {...mockHandlers}
      />
    );

    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);

    expect(mockHandlers.onCancel).toHaveBeenCalled();
  });

  it('should show submitting state', async () => {
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    mockHandlers.onSubmit.mockReturnValue(submitPromise);

    render(
      <AdContentForm
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        {...mockHandlers}
      />
    );

    const nameInput = screen.getByPlaceholderText('例: PORTキャリア春のキャンペーン');
    fireEvent.change(nameInput, {target: {value: 'Valid Name'}});

    const templateSelect = screen.getByDisplayValue('テンプレートを選択...');
    fireEvent.change(templateSelect, {target: {value: '1'}});

    const urlTemplateSelect = screen.getByDisplayValue('URLテンプレートを選択...');
    fireEvent.change(urlTemplateSelect, {target: {value: '1'}});

    const titleInput = screen.getByPlaceholderText('titleを入力...');
    fireEvent.change(titleInput, {target: {value: 'Test Title'}});

    const uploadButton = screen.getByText('Upload');
    fireEvent.click(uploadButton);

    const submitButton = screen.getByText('作成する');
    fireEvent.click(submitButton);

    expect(screen.getByText('保存中...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    resolveSubmit!();
    await waitFor(() => {
      expect(screen.getByText('作成する')).toBeInTheDocument();
    });
  });

  it('should handle status change', () => {
    render(
      <AdContentForm
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        {...mockHandlers}
      />
    );

    const statusSelect = screen.getByDisplayValue('下書き');
    fireEvent.change(statusSelect, {target: {value: 'active'}});

    expect(statusSelect).toHaveValue('active');
  });

  it('should display URL preview when URL template is selected', () => {
    render(
      <AdContentForm
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        {...mockHandlers}
      />
    );

    const urlTemplateSelect = screen.getByDisplayValue('URLテンプレートを選択...');
    fireEvent.change(urlTemplateSelect, {target: {value: '1'}});

    expect(screen.getByText('リンクURLプレビュー')).toBeInTheDocument();
    expect(screen.getByText('{{baseUrl}}?utm_source=test')).toBeInTheDocument();
  });

  it('should preserve content data when editing', () => {
    const mockAdContent: AdContent = {
      id: 1,
      name: 'Test Ad Content',
      template_id: 1,
      url_template_id: 1,
      content_data: {'{{title}}': 'Existing Title'},
      status: 'active',
      created_by: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
      images: [],
    };

    render(
      <AdContentForm
        adContent={mockAdContent}
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        isEdit={true}
        {...mockHandlers}
      />
    );

    expect(screen.getByDisplayValue('Existing Title')).toBeInTheDocument();

    // Status select is using Japanese text values
    const statusSelect = screen.getByDisplayValue('アクティブ');
    expect(statusSelect).toBeInTheDocument();
  });

  it('should prevent submission with short name', async () => {
    const mockOnSubmit = jest.fn();
    
    render(
      <AdContentForm
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        onSubmit={mockOnSubmit}
        onCancel={() => {}}
      />
    );

    const nameInput = screen.getByPlaceholderText('例: PORTキャリア春のキャンペーン');
    const submitButton = screen.getByText('作成する');

    // Test short name validation - should prevent submission
    fireEvent.change(nameInput, {target: {value: 'a'}});
    fireEvent.click(submitButton);

    // Wait a bit to see if onSubmit gets called
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should prevent submission without templates', async () => {
    const mockOnSubmit = jest.fn();
    
    render(
      <AdContentForm
        templates={mockTemplates}
        urlTemplates={mockUrlTemplates}
        onSubmit={mockOnSubmit}
        onCancel={() => {}}
      />
    );

    const nameInput = screen.getByPlaceholderText('例: PORTキャリア春のキャンペーン');
    const submitButton = screen.getByText('作成する');

    // Test with valid name but no templates - should prevent submission
    fireEvent.change(nameInput, {target: {value: 'Valid Test Name'}});
    fireEvent.click(submitButton);

    // Wait a bit to see if onSubmit gets called
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
