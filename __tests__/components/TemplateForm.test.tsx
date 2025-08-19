import { render, screen, fireEvent } from '@testing-library/react';
import TemplateForm from '@/app/ad-templates/components/TemplateForm';
import type { CreateAdTemplateRequest, AdTemplate } from '@/lib/definitions';

// Mock HTMLCodeEditor
jest.mock('@/components/HTMLCodeEditor', () => {
  return jest.fn().mockImplementation(({ value, onChange, ...props }) => (
    <textarea
      data-testid="html-editor"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      {...props}
    />
  ));
});

// Mock ValidationGuide
jest.mock('@/app/ad-templates/components/ValidationGuide', () => {
  return jest.fn().mockImplementation(({ showNamingGuide, setShowNamingGuide }) => (
    <div data-testid="validation-guide">
      <button onClick={() => setShowNamingGuide(!showNamingGuide)}>
        Toggle Guide
      </button>
    </div>
  ));
});

// Mock template utils
jest.mock('@/lib/template-utils', () => ({
  extractPlaceholders: jest.fn(() => ['title']),
  validatePlaceholderNaming: jest.fn(() => true),
  addNofollowToLinks: jest.fn((html) => `${html} [with nofollow]`),
  removeNofollowFromLinks: jest.fn((html) => html.replace(' [with nofollow]', '')),
}));

describe('TemplateForm', () => {
  const mockSetFormData = jest.fn();
  const mockSetAutoNofollow = jest.fn();
  const mockSetShowNamingGuide = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultFormData: CreateAdTemplateRequest = {
    name: 'Test Template',
    html: '<div>{{title}}</div>',
    placeholders: ['title'],
    description: 'Test description',
  };

  const defaultProps = {
    formData: defaultFormData,
    setFormData: mockSetFormData,
    autoNofollow: false,
    setAutoNofollow: mockSetAutoNofollow,
    showNamingGuide: false,
    setShowNamingGuide: mockSetShowNamingGuide,
    editingTemplate: null,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly', () => {
    render(<TemplateForm {...defaultProps} />);
    
    expect(screen.getByDisplayValue('Test Template')).toBeInTheDocument();
    expect(screen.getByTestId('html-editor')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByText('作成')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
  });

  it('shows edit mode when editing template', () => {
    const editingTemplate: AdTemplate = {
      id: 1,
      name: 'Existing Template',
      html: '<div>existing</div>',
      placeholders: [],
      description: 'Existing description',
    };

    render(<TemplateForm {...defaultProps} editingTemplate={editingTemplate} />);
    
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByText('更新')).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', () => {
    render(<TemplateForm {...defaultProps} />);
    
    const form = screen.getByText('作成').closest('form');
    fireEvent.submit(form!);
    
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<TemplateForm {...defaultProps} />);
    
    fireEvent.click(screen.getByText('キャンセル'));
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('updates template name when input changes', () => {
    render(<TemplateForm {...defaultProps} />);
    
    const nameInput = screen.getByDisplayValue('Test Template');
    fireEvent.change(nameInput, { target: { value: 'New Template Name' } });
    
    expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
  });

  it('updates HTML when editor changes', () => {
    render(<TemplateForm {...defaultProps} />);
    
    const htmlEditor = screen.getByTestId('html-editor');
    fireEvent.change(htmlEditor, { target: { value: '<div>New HTML</div>' } });
    
    expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
  });



  it('toggles autoNofollow when checkbox is clicked', () => {
    render(<TemplateForm {...defaultProps} />);
    
    const checkbox = screen.getByLabelText('自動nofollow追加');
    fireEvent.click(checkbox);
    
    expect(mockSetAutoNofollow).toHaveBeenCalledWith(true);
  });



  it('displays extracted placeholders in real-time', () => {
    const propsWithPlaceholders = {
      ...defaultProps,
      formData: {
        ...defaultFormData,
        html: '<div>{{title}}</div><img src="{{image}}" />',
      },
    };
    
    render(<TemplateForm {...propsWithPlaceholders} />);
    
    expect(screen.getByText('検出されたプレースホルダー')).toBeInTheDocument();
  });

  it('updates description when textarea changes', () => {
    render(<TemplateForm {...defaultProps} />);
    
    const descriptionTextarea = screen.getByDisplayValue('Test description');
    fireEvent.change(descriptionTextarea, { target: { value: 'New description' } });
    
    expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
  });
});
