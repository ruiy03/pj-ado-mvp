import { render, screen, fireEvent } from '@testing-library/react';
import TemplatePreview from '@/app/ad-templates/components/TemplatePreview';
import type { CreateAdTemplateRequest } from '@/lib/definitions';

// Mock template utils
jest.mock('@/lib/template-utils', () => ({
  getSampleValue: jest.fn((placeholder) => `Sample ${placeholder}`),
  sanitizeLinksForPreview: jest.fn((html) => html),
}));

describe('TemplatePreview', () => {
  const mockSetPreviewMode = jest.fn();
  const mockSetPreviewSize = jest.fn();
  const mockUpdateCustomValue = jest.fn();

  const defaultFormData: CreateAdTemplateRequest = {
    name: 'Test Template',
    html: '<div class="ad-banner"><h2>{{title}}</h2><img src="{{imageUrl}}" /></div>',
    placeholders: ['title', 'imageUrl'],
    description: 'Test description',
  };

  const defaultProps = {
    formData: defaultFormData,
    previewMode: 'sample' as const,
    customValues: {},
    previewSize: 'desktop' as const,
    setPreviewMode: mockSetPreviewMode,
    setPreviewSize: mockSetPreviewSize,
    updateCustomValue: mockUpdateCustomValue,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders preview section', () => {
    render(<TemplatePreview {...defaultProps} />);
    
    expect(screen.getByText('プレビュー')).toBeInTheDocument();
  });

  it('shows empty state when no HTML provided', () => {
    const propsWithEmptyHTML = {
      ...defaultProps,
      formData: { ...defaultFormData, html: '' },
    };
    
    render(<TemplatePreview {...propsWithEmptyHTML} />);
    
    expect(screen.getByText('HTMLコードを入力するとプレビューが表示されます')).toBeInTheDocument();
  });

  it('renders preview mode toggle buttons', () => {
    render(<TemplatePreview {...defaultProps} />);
    
    expect(screen.getByText('サンプル値')).toBeInTheDocument();
    expect(screen.getByText('カスタム値')).toBeInTheDocument();
  });

  it('renders preview size toggle buttons', () => {
    render(<TemplatePreview {...defaultProps} />);
    
    expect(screen.getByText('🖥️')).toBeInTheDocument(); // Desktop
    expect(screen.getByText('📱')).toBeInTheDocument(); // Mobile
  });

  it('calls setPreviewMode when mode button is clicked', () => {
    render(<TemplatePreview {...defaultProps} />);
    
    fireEvent.click(screen.getByText('カスタム値'));
    
    expect(mockSetPreviewMode).toHaveBeenCalledWith('custom');
  });

  it('calls setPreviewSize when size button is clicked', () => {
    render(<TemplatePreview {...defaultProps} />);
    
    fireEvent.click(screen.getByText('📱'));
    
    expect(mockSetPreviewSize).toHaveBeenCalledWith('mobile');
  });

  it('shows custom value inputs when in custom mode', () => {
    const propsWithCustomMode = {
      ...defaultProps,
      previewMode: 'custom' as const,
    };
    
    render(<TemplatePreview {...propsWithCustomMode} />);
    
    expect(screen.getByText('カスタム値を入力')).toBeInTheDocument();
    expect(screen.getByLabelText('title')).toBeInTheDocument();
    expect(screen.getByLabelText('imageUrl')).toBeInTheDocument();
  });

  it('calls updateCustomValue when custom input changes', () => {
    const propsWithCustomMode = {
      ...defaultProps,
      previewMode: 'custom' as const,
    };
    
    render(<TemplatePreview {...propsWithCustomMode} />);
    
    const titleInput = screen.getByLabelText('title');
    fireEvent.change(titleInput, { target: { value: 'Custom Title' } });
    
    expect(mockUpdateCustomValue).toHaveBeenCalledWith('title', 'Custom Title');
  });

  it('highlights active preview mode button', () => {
    render(<TemplatePreview {...defaultProps} />);
    
    const sampleButton = screen.getByText('サンプル値');
    expect(sampleButton).toHaveClass('bg-blue-600', 'text-white');
    
    const customButton = screen.getByText('カスタム値');
    expect(customButton).toHaveClass('bg-gray-100');
  });

  it('highlights active preview size button', () => {
    render(<TemplatePreview {...defaultProps} />);
    
    const desktopButton = screen.getByText('🖥️');
    expect(desktopButton).toHaveClass('bg-green-600', 'text-white');
  });

  it('applies correct size classes for mobile preview', () => {
    const propsWithMobileSize = {
      ...defaultProps,
      previewSize: 'mobile' as const,
    };
    
    render(<TemplatePreview {...propsWithMobileSize} />);
    
    // Check that the mobile button is active
    const mobileButton = screen.getByRole('button', { name: '📱' });
    expect(mobileButton).toHaveClass('bg-green-600', 'text-white');
    
    // Check that desktop button is not active 
    const desktopButton = screen.getByRole('button', { name: '🖥️' });
    expect(desktopButton).toHaveClass('bg-gray-100', 'text-gray-700');
  });

  it('shows placeholder values in custom inputs', () => {
    const propsWithCustomMode = {
      ...defaultProps,
      previewMode: 'custom' as const,
    };
    
    render(<TemplatePreview {...propsWithCustomMode} />);
    
    const titleInput = screen.getByLabelText('title');
    expect(titleInput).toHaveAttribute('placeholder', 'Sample title');
    
    const imageUrlInput = screen.getByLabelText('imageUrl');
    expect(imageUrlInput).toHaveAttribute('placeholder', 'Sample imageUrl');
  });

  it('displays custom values in inputs when provided', () => {
    const propsWithCustomValues = {
      ...defaultProps,
      previewMode: 'custom' as const,
      customValues: {
        title: 'My Custom Title',
        imageUrl: 'custom-image.jpg',
      },
    };
    
    render(<TemplatePreview {...propsWithCustomValues} />);
    
    const titleInput = screen.getByDisplayValue('My Custom Title');
    expect(titleInput).toBeInTheDocument();
    
    const imageUrlInput = screen.getByDisplayValue('custom-image.jpg');
    expect(imageUrlInput).toBeInTheDocument();
  });

  it('does not show custom inputs when no placeholders exist', () => {
    const propsWithNoPlaceholders = {
      ...defaultProps,
      previewMode: 'custom' as const,
      formData: { ...defaultFormData, placeholders: [] },
    };
    
    render(<TemplatePreview {...propsWithNoPlaceholders} />);
    
    expect(screen.queryByText('カスタム値を入力')).not.toBeInTheDocument();
  });
});