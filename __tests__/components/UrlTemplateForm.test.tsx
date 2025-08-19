import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import UrlTemplateForm from '@/app/url-templates/components/UrlTemplateForm';
import type {UrlTemplate, CreateUrlTemplateRequest} from '@/lib/definitions';

const mockTemplate: UrlTemplate = {
  id: 1,
  name: 'Test URL Template',
  description: 'Test description',
  url_template: 'https://example.com/page?utm_source={{source}}&utm_medium={{medium}}',
  parameters: {},
  active: true,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

const mockHandlers = {
  onSubmit: jest.fn(),
  onCancel: jest.fn(),
};

describe('UrlTemplateForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render create form correctly', () => {
    render(<UrlTemplateForm {...mockHandlers} />);

    expect(screen.getByText('新しいURLテンプレートを作成')).toBeInTheDocument();
    expect(screen.getByText('作成する')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('例: PORTキャリア記事内キャンペーン')).toBeInTheDocument();
  });

  it('should render edit form correctly', () => {
    render(<UrlTemplateForm template={mockTemplate} isEdit={true} {...mockHandlers} />);

    expect(screen.getByText('URLテンプレートを編集')).toBeInTheDocument();
    expect(screen.getByText('更新する')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test URL Template')).toBeInTheDocument();
  });

  it('should populate form fields when editing', () => {
    render(<UrlTemplateForm template={mockTemplate} isEdit={true} {...mockHandlers} />);

    expect(screen.getByDisplayValue('Test URL Template')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com/page?utm_source={{source}}&utm_medium={{medium}}')).toBeInTheDocument();
  });

  it('should handle input changes', () => {
    render(<UrlTemplateForm {...mockHandlers} />);

    const nameInput = screen.getByPlaceholderText('例: PORTキャリア記事内キャンペーン');
    const urlInput = screen.getByPlaceholderText('{{baseUrl}}?utm_source=kijinaka&utm_medium=mirai&utm_campaign=03');
    const descriptionInput = screen.getByPlaceholderText('このURLテンプレートの用途や説明を入力');

    fireEvent.change(nameInput, {target: {value: 'New Template Name'}});
    fireEvent.change(urlInput, {target: {value: 'https://example.com?utm_source=test'}});
    fireEvent.change(descriptionInput, {target: {value: 'New description'}});

    expect(nameInput).toHaveValue('New Template Name');
    expect(urlInput).toHaveValue('https://example.com?utm_source=test');
    expect(descriptionInput).toHaveValue('New description');
  });

  it('should submit form with correct data', async () => {
    mockHandlers.onSubmit.mockResolvedValue(undefined);
    render(<UrlTemplateForm {...mockHandlers} />);

    const nameInput = screen.getByPlaceholderText('例: PORTキャリア記事内キャンペーン');
    const urlInput = screen.getByPlaceholderText('{{baseUrl}}?utm_source=kijinaka&utm_medium=mirai&utm_campaign=03');
    const descriptionInput = screen.getByPlaceholderText('このURLテンプレートの用途や説明を入力');
    const submitButton = screen.getByText('作成する');

    fireEvent.change(nameInput, {target: {value: 'Test Template'}});
    fireEvent.change(urlInput, {target: {value: 'https://test.com?utm_source=test'}});
    fireEvent.change(descriptionInput, {target: {value: 'Test description'}});

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockHandlers.onSubmit).toHaveBeenCalledWith({
        name: 'Test Template',
        url_template: 'https://test.com?utm_source=test',
        parameters: {},
        description: 'Test description',
      });
    });
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(<UrlTemplateForm {...mockHandlers} />);

    const cancelButton = screen.getByText('キャンセル');
    fireEvent.click(cancelButton);

    expect(mockHandlers.onCancel).toHaveBeenCalled();
  });

  it('should disable submit button when required fields are empty', () => {
    render(<UrlTemplateForm {...mockHandlers} />);

    const submitButton = screen.getByText('作成する');
    expect(submitButton).toBeDisabled();
  });

  it('should enable submit button when required fields are filled', () => {
    render(<UrlTemplateForm {...mockHandlers} />);

    const nameInput = screen.getByPlaceholderText('例: PORTキャリア記事内キャンペーン');
    const urlInput = screen.getByPlaceholderText('{{baseUrl}}?utm_source=kijinaka&utm_medium=mirai&utm_campaign=03');
    const submitButton = screen.getByText('作成する');

    fireEvent.change(nameInput, {target: {value: 'Test Template'}});
    fireEvent.change(urlInput, {target: {value: 'https://test.com'}});

    expect(submitButton).not.toBeDisabled();
  });

  it('should show submitting state during form submission', async () => {
    let resolveSubmit: () => void;
    const submitPromise = new Promise<void>((resolve) => {
      resolveSubmit = resolve;
    });
    mockHandlers.onSubmit.mockReturnValue(submitPromise);

    render(<UrlTemplateForm {...mockHandlers} />);

    const nameInput = screen.getByPlaceholderText('例: PORTキャリア記事内キャンペーン');
    const urlInput = screen.getByPlaceholderText('{{baseUrl}}?utm_source=kijinaka&utm_medium=mirai&utm_campaign=03');
    const submitButton = screen.getByText('作成する');

    fireEvent.change(nameInput, {target: {value: 'Test Template'}});
    fireEvent.change(urlInput, {target: {value: 'https://test.com'}});
    fireEvent.click(submitButton);

    expect(screen.getByText('保存中...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
    expect(screen.getByText('キャンセル')).toBeDisabled();

    resolveSubmit!();
    await waitFor(() => {
      expect(screen.getByText('作成する')).toBeInTheDocument();
    });
  });

  it('should prevent double submission', async () => {
    mockHandlers.onSubmit.mockResolvedValue(undefined);
    render(<UrlTemplateForm {...mockHandlers} />);

    const nameInput = screen.getByPlaceholderText('例: PORTキャリア記事内キャンペーン');
    const urlInput = screen.getByPlaceholderText('{{baseUrl}}?utm_source=kijinaka&utm_medium=mirai&utm_campaign=03');
    const submitButton = screen.getByText('作成する');

    fireEvent.change(nameInput, {target: {value: 'Test Template'}});
    fireEvent.change(urlInput, {target: {value: 'https://test.com'}});

    // Submit multiple times quickly
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockHandlers.onSubmit).toHaveBeenCalledTimes(1);
    });
  });

  it('should show help text for URL template field', () => {
    render(<UrlTemplateForm {...mockHandlers} />);

    expect(screen.getByText(/ベースURLは.*を使用してください。/)).toBeInTheDocument();
  });

  it('should handle template without description', () => {
    const templateWithoutDescription = {...mockTemplate, description: undefined};
    render(<UrlTemplateForm template={templateWithoutDescription} isEdit={true} {...mockHandlers} />);

    const descriptionInput = screen.getByPlaceholderText('このURLテンプレートの用途や説明を入力');
    expect(descriptionInput).toHaveValue('');
  });

  it('should have proper modal styling', () => {
    render(<UrlTemplateForm {...mockHandlers} />);

    const modalBackground = screen.getByText('新しいURLテンプレートを作成').closest('div')?.parentElement?.parentElement;
    expect(modalBackground).toHaveClass('fixed', 'inset-0', 'bg-black', 'bg-opacity-50');
  });

  it('should have proper form validation attributes', () => {
    render(<UrlTemplateForm {...mockHandlers} />);

    const nameInput = screen.getByPlaceholderText('例: PORTキャリア記事内キャンペーン');
    const urlInput = screen.getByPlaceholderText('{{baseUrl}}?utm_source=kijinaka&utm_medium=mirai&utm_campaign=03');

    expect(nameInput).toHaveAttribute('required');
    expect(urlInput).toHaveAttribute('required');
  });


  it('should clear submitting state after successful submission', async () => {
    mockHandlers.onSubmit.mockResolvedValue(undefined);
    render(<UrlTemplateForm {...mockHandlers} />);

    const nameInput = screen.getByPlaceholderText('例: PORTキャリア記事内キャンペーン');
    const urlInput = screen.getByPlaceholderText('{{baseUrl}}?utm_source=kijinaka&utm_medium=mirai&utm_campaign=03');
    const submitButton = screen.getByText('作成する');

    fireEvent.change(nameInput, {target: {value: 'Test Template'}});
    fireEvent.change(urlInput, {target: {value: 'https://test.com'}});
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('作成する')).toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
    });
  });
});
