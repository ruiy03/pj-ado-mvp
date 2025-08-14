import { render, screen, fireEvent } from '@testing-library/react';
import TemplateList from '@/app/ad-templates/components/TemplateList';
import type { AdTemplate } from '@/lib/definitions';

// Mock template utils
jest.mock('@/lib/template-utils', () => ({
  getSampleValue: jest.fn((placeholder) => `Sample ${placeholder}`),
}));

describe('TemplateList', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnCreateClick = jest.fn();

  const mockTemplates: AdTemplate[] = [
    {
      id: 1,
      name: 'Template 1',
      html: '<div>{{title}}</div>',
      placeholders: ['title'],
      description: 'Description 1',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Template 2',
      html: '<div><h2>{{title}}</h2><img src="{{imageUrl}}" /></div>',
      placeholders: ['title', 'imageUrl'],
      description: 'Description 2',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ];

  const defaultProps = {
    templates: mockTemplates,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    onCreateClick: mockOnCreateClick,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders empty state when no templates', () => {
    const propsWithEmptyList = {
      ...defaultProps,
      templates: [],
    };
    
    render(<TemplateList {...propsWithEmptyList} />);
    
    expect(screen.getByText('テンプレートがありません')).toBeInTheDocument();
    expect(screen.getByText('広告テンプレートを作成して始めましょう')).toBeInTheDocument();
    expect(screen.getByText('最初のテンプレートを作成')).toBeInTheDocument();
  });

  it('calls onCreateClick when create button is clicked in empty state', () => {
    const propsWithEmptyList = {
      ...defaultProps,
      templates: [],
    };
    
    render(<TemplateList {...propsWithEmptyList} />);
    
    fireEvent.click(screen.getByText('最初のテンプレートを作成'));
    
    expect(mockOnCreateClick).toHaveBeenCalledTimes(1);
  });

  it('renders list of templates', () => {
    render(<TemplateList {...defaultProps} />);
    
    expect(screen.getByText('Template 1')).toBeInTheDocument();
    expect(screen.getByText('Template 2')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('displays placeholders for each template', () => {
    render(<TemplateList {...defaultProps} />);
    
    // Template 1 has 'title' placeholder
    expect(screen.getByText('プレースホルダー: title')).toBeInTheDocument();
    
    // Template 2 has 'title' and 'imageUrl' placeholders
    expect(screen.getByText('プレースホルダー: title, imageUrl')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<TemplateList {...defaultProps} />);
    
    const editButtons = screen.getAllByText('編集');
    fireEvent.click(editButtons[0]);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockTemplates[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<TemplateList {...defaultProps} />);
    
    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('displays basic template information', () => {
    render(<TemplateList {...defaultProps} />);
    
    // Just check that templates and their basic info are displayed
    expect(screen.getByText('Template 1')).toBeInTheDocument();
    expect(screen.getByText('Template 2')).toBeInTheDocument();
    expect(screen.getByText('Description 1')).toBeInTheDocument();
    expect(screen.getByText('Description 2')).toBeInTheDocument();
  });

  it('renders template previews with sample values', () => {
    render(<TemplateList {...defaultProps} />);
    
    // The preview should contain replaced placeholder values
    expect(screen.getAllByText('Sample title')).toHaveLength(2);
    // Sample imageUrl appears as img src attribute, not as text content
    const images = document.querySelectorAll('img[src="Sample imageUrl"]');
    expect(images.length).toBeGreaterThan(0);
  });

  it('handles templates without description', () => {
    const templatesWithoutDescription = [
      {
        ...mockTemplates[0],
        description: '',
      },
    ];
    
    const propsWithoutDescription = {
      ...defaultProps,
      templates: templatesWithoutDescription,
    };
    
    render(<TemplateList {...propsWithoutDescription} />);
    
    expect(screen.getByText('Template 1')).toBeInTheDocument();
    // Should not crash when description is empty
  });

  it('handles templates without placeholders', () => {
    const templatesWithoutPlaceholders = [
      {
        ...mockTemplates[0],
        html: '<div>Static HTML</div>',
        placeholders: [],
      },
    ];
    
    const propsWithoutPlaceholders = {
      ...defaultProps,
      templates: templatesWithoutPlaceholders,
    };
    
    render(<TemplateList {...propsWithoutPlaceholders} />);
    
    expect(screen.getByText('Template 1')).toBeInTheDocument();
    // When no placeholders, just shows "プレースホルダー: " with empty string
    expect(screen.getByText('プレースホルダー:')).toBeInTheDocument();
  });

  it('shows proper action buttons for each template', () => {
    render(<TemplateList {...defaultProps} />);
    
    const editButtons = screen.getAllByText('編集');
    const deleteButtons = screen.getAllByText('削除');
    
    expect(editButtons).toHaveLength(2);
    expect(deleteButtons).toHaveLength(2);
  });

  it('handles templates with undefined dates gracefully', () => {
    const templatesWithUndefinedDates = [
      {
        ...mockTemplates[0],
        created_at: undefined,
        updated_at: undefined,
      },
    ];
    
    const propsWithUndefinedDates = {
      ...defaultProps,
      templates: templatesWithUndefinedDates,
    };
    
    render(<TemplateList {...propsWithUndefinedDates} />);
    
    expect(screen.getByText('Template 1')).toBeInTheDocument();
    // Should not crash when dates are undefined
  });
});