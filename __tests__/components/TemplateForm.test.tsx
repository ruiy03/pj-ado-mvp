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
  const mockAutoExtractPlaceholders = jest.fn();

  const defaultFormData: CreateAdTemplateRequest = {
    name: 'Test Template',
    html: '<div>{{title}}</div>',
    placeholders: ['title'],
    description: 'Test description',
  };

  const defaultProps = {
    formData: defaultFormData,
    setFormData: mockSetFormData,
    validationErrors: [],
    autoNofollow: false,
    setAutoNofollow: mockSetAutoNofollow,
    showNamingGuide: false,
    setShowNamingGuide: mockSetShowNamingGuide,
    editingTemplate: null,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    autoExtractPlaceholders: mockAutoExtractPlaceholders,
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
    
    expect(screen.getByText('テンプレートを編集')).toBeInTheDocument();
    expect(screen.getByText('更新')).toBeInTheDocument();
  });

  it('calls onSubmit when form is submitted', () => {
    render(<TemplateForm {...defaultProps} />);
    
    const form = screen.getByRole('button', { name: '作成' }).closest('form');
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

  it('adds new placeholder when add button is clicked', () => {
    render(<TemplateForm {...defaultProps} />);
    
    fireEvent.click(screen.getByText('プレースホルダーを追加'));
    
    expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
  });

  it('removes placeholder when delete button is clicked', () => {
    render(<TemplateForm {...defaultProps} />);
    
    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
  });

  it('toggles autoNofollow when checkbox is clicked', () => {
    render(<TemplateForm {...defaultProps} />);
    
    const checkbox = screen.getByLabelText('自動nofollow追加');
    fireEvent.click(checkbox);
    
    expect(mockSetAutoNofollow).toHaveBeenCalledWith(true);
  });

  it('shows validation errors when present', () => {
    const propsWithErrors = {
      ...defaultProps,
      validationErrors: ['Error 1', 'Error 2'],
    };
    
    render(<TemplateForm {...propsWithErrors} />);
    
    expect(screen.getByText('Error 1')).toBeInTheDocument();
    expect(screen.getByText('Error 2')).toBeInTheDocument();
  });

  it('disables submit button when validation errors exist', () => {
    const propsWithErrors = {
      ...defaultProps,
      validationErrors: ['Error 1'],
    };
    
    render(<TemplateForm {...propsWithErrors} />);
    
    const submitButton = screen.getByText('作成');
    expect(submitButton).toBeDisabled();
  });

  it('calls autoExtractPlaceholders when auto-fix button is clicked', () => {
    const propsWithErrors = {
      ...defaultProps,
      validationErrors: ['Error 1'],
    };
    
    render(<TemplateForm {...propsWithErrors} />);
    
    fireEvent.click(screen.getByText('自動修正'));
    
    expect(mockAutoExtractPlaceholders).toHaveBeenCalledTimes(1);
  });

  it('updates description when textarea changes', () => {
    render(<TemplateForm {...defaultProps} />);
    
    const descriptionTextarea = screen.getByDisplayValue('Test description');
    fireEvent.change(descriptionTextarea, { target: { value: 'New description' } });
    
    expect(mockSetFormData).toHaveBeenCalledWith(expect.any(Function));
  });
});