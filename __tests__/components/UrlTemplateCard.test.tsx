import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import UrlTemplateCard from '@/app/url-templates/components/UrlTemplateCard';
import type {UrlTemplate} from '@/lib/definitions';

const mockTemplate: UrlTemplate = {
  id: 1,
  name: 'Test URL Template',
  description: 'Test description',
  url_template: 'https://example.com/page?utm_source={{source}}&utm_medium={{medium}}&utm_campaign={{campaign}}',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-02T00:00:00Z',
};

const mockHandlers = {
  onEdit: jest.fn(),
  onDelete: jest.fn(),
};

describe('UrlTemplateCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render template information correctly', () => {
    render(<UrlTemplateCard template={mockTemplate} {...mockHandlers} />);

    expect(screen.getByText('Test URL Template')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
    expect(screen.getByText('https://example.com/page?utm_source={{source}}&utm_medium={{medium}}&utm_campaign={{campaign}}')).toBeInTheDocument();
  });

  it('should render without description when not provided', () => {
    const templateWithoutDescription = {...mockTemplate, description: undefined};
    render(<UrlTemplateCard template={templateWithoutDescription} {...mockHandlers} />);

    expect(screen.getByText('Test URL Template')).toBeInTheDocument();
    expect(screen.queryByText('Test description')).not.toBeInTheDocument();
  });

  it('should extract and display tracking parameters', () => {
    render(<UrlTemplateCard template={mockTemplate} {...mockHandlers} />);

    expect(screen.getByText('計測パラメータ')).toBeInTheDocument();
    expect(screen.getByText('utm_source')).toBeInTheDocument();
    expect(screen.getByText('utm_medium')).toBeInTheDocument();
    expect(screen.getByText('utm_campaign')).toBeInTheDocument();
  });

  it('should not display tracking parameters section when none exist', () => {
    const templateWithoutParams = {
      ...mockTemplate,
      url_template: 'https://example.com/page',
    };
    render(<UrlTemplateCard template={templateWithoutParams} {...mockHandlers} />);

    expect(screen.queryByText('計測パラメータ')).not.toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<UrlTemplateCard template={mockTemplate} {...mockHandlers} />);

    const editButton = screen.getByTitle('編集');
    fireEvent.click(editButton);

    expect(mockHandlers.onEdit).toHaveBeenCalledWith(mockTemplate);
  });

  it('should call onDelete when delete button is clicked', async () => {
    mockHandlers.onDelete.mockResolvedValue(undefined);
    render(<UrlTemplateCard template={mockTemplate} {...mockHandlers} />);

    const deleteButton = screen.getByTitle('削除');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockTemplate.id);
    });
  });

  it('should disable delete button during deletion', async () => {
    let resolveDelete: () => void;
    const deletePromise = new Promise<void>((resolve) => {
      resolveDelete = resolve;
    });
    mockHandlers.onDelete.mockReturnValue(deletePromise);

    render(<UrlTemplateCard template={mockTemplate} {...mockHandlers} />);

    const deleteButton = screen.getByTitle('削除');
    fireEvent.click(deleteButton);

    expect(deleteButton).toBeDisabled();
    expect(deleteButton).toHaveClass('disabled:opacity-50');

    resolveDelete!();
    await waitFor(() => {
      expect(deleteButton).not.toBeDisabled();
    });
  });

  it('should format dates correctly', () => {
    render(<UrlTemplateCard template={mockTemplate} {...mockHandlers} />);

    expect(screen.getByText(/作成:/)).toBeInTheDocument();
    expect(screen.getByText(/更新:/)).toBeInTheDocument();
  });

  it('should handle missing dates gracefully', () => {
    const templateWithoutDates = {
      ...mockTemplate,
      created_at: undefined,
      updated_at: undefined,
    };
    render(<UrlTemplateCard template={templateWithoutDates} {...mockHandlers} />);

    expect(screen.getByText('作成:')).toBeInTheDocument();
    expect(screen.queryByText(/更新:/)).not.toBeInTheDocument();
  });

  it('should not show update date when same as creation date', () => {
    const templateSameDates = {
      ...mockTemplate,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };
    render(<UrlTemplateCard template={templateSameDates} {...mockHandlers} />);

    expect(screen.getByText(/作成:/)).toBeInTheDocument();
    expect(screen.queryByText(/更新:/)).not.toBeInTheDocument();
  });

  it('should handle URL template without query parameters', () => {
    const templateWithoutQuery = {
      ...mockTemplate,
      url_template: 'https://example.com/page',
    };
    render(<UrlTemplateCard template={templateWithoutQuery} {...mockHandlers} />);

    expect(screen.getByText('https://example.com/page')).toBeInTheDocument();
    expect(screen.queryByText('計測パラメータ')).not.toBeInTheDocument();
  });

  it('should extract non-utm tracking parameters', () => {
    const templateWithCustomParams = {
      ...mockTemplate,
      url_template: 'https://example.com/page?source=test&medium=email&campaign=test',
    };
    render(<UrlTemplateCard template={templateWithCustomParams} {...mockHandlers} />);

    expect(screen.getByText('計測パラメータ')).toBeInTheDocument();
    expect(screen.getByText('source')).toBeInTheDocument();
    expect(screen.getByText('medium')).toBeInTheDocument();
    expect(screen.getByText('campaign')).toBeInTheDocument();
  });

  it('should have hover effects on the card', () => {
    render(<UrlTemplateCard template={mockTemplate} {...mockHandlers} />);

    const card = screen.getByText('Test URL Template').closest('.bg-white');
    expect(card).toHaveClass('hover:shadow-md', 'transition-shadow');
  });

  it('should have proper accessibility attributes on buttons', () => {
    render(<UrlTemplateCard template={mockTemplate} {...mockHandlers} />);

    const editButton = screen.getByTitle('編集');
    const deleteButton = screen.getByTitle('削除');

    expect(editButton).toHaveAttribute('title', '編集');
    expect(deleteButton).toHaveAttribute('title', '削除');
  });


  it('should break long URL templates correctly', () => {
    const templateWithLongUrl = {
      ...mockTemplate,
      url_template: 'https://very-long-domain-name.example.com/very/long/path/with/many/segments?utm_source=very_long_source_name&utm_medium=very_long_medium_name',
    };
    render(<UrlTemplateCard template={templateWithLongUrl} {...mockHandlers} />);

    const urlElement = screen.getByText(templateWithLongUrl.url_template);
    expect(urlElement).toHaveClass('break-all');
  });
});
