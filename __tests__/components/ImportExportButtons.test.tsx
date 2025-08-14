import { render, screen, fireEvent } from '@testing-library/react';
import ImportExportButtons from '@/app/ad-templates/components/ImportExportButtons';

interface ImportResult {
  success: number;
  errors: string[];
  total: number;
}

describe('ImportExportButtons', () => {
  const mockOnImport = jest.fn();
  const mockOnExport = jest.fn();
  const mockOnCreateClick = jest.fn();
  const mockOnImportCancel = jest.fn();
  const mockHandleImport = jest.fn();

  const defaultProps = {
    onImport: mockOnImport,
    onExport: mockOnExport,
    onCreateClick: mockOnCreateClick,
    onImportCancel: mockOnImportCancel,
    exportLoading: false,
    showImportForm: false,
    importLoading: false,
    importResult: null,
    handleImport: mockHandleImport,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all buttons correctly', () => {
    render(<ImportExportButtons {...defaultProps} />);
    
    expect(screen.getByText('広告テンプレート管理')).toBeInTheDocument();
    expect(screen.getByText('CSVインポート')).toBeInTheDocument();
    expect(screen.getByText('CSVエクスポート')).toBeInTheDocument();
    expect(screen.getByText('新しいテンプレートを作成')).toBeInTheDocument();
  });

  it('calls onImport when import button is clicked', () => {
    render(<ImportExportButtons {...defaultProps} />);
    
    fireEvent.click(screen.getByText('CSVインポート'));
    
    expect(mockOnImport).toHaveBeenCalledTimes(1);
  });

  it('calls onExport when export button is clicked', () => {
    render(<ImportExportButtons {...defaultProps} />);
    
    fireEvent.click(screen.getByText('CSVエクスポート'));
    
    expect(mockOnExport).toHaveBeenCalledTimes(1);
  });

  it('calls onCreateClick when create button is clicked', () => {
    render(<ImportExportButtons {...defaultProps} />);
    
    fireEvent.click(screen.getByText('新しいテンプレートを作成'));
    
    expect(mockOnCreateClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state for export button', () => {
    const propsWithExportLoading = {
      ...defaultProps,
      exportLoading: true,
    };
    
    render(<ImportExportButtons {...propsWithExportLoading} />);
    
    expect(screen.getByText('エクスポート中...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'エクスポート中...' })).toBeDisabled();
  });

  it('shows import form when showImportForm is true', () => {
    const propsWithImportForm = {
      ...defaultProps,
      showImportForm: true,
    };
    
    render(<ImportExportButtons {...propsWithImportForm} />);
    
    expect(screen.getByText('CSVファイルからインポート')).toBeInTheDocument();
    expect(screen.getByText('CSVファイルを選択')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
  });

  it('calls onImportCancel when cancel button is clicked', () => {
    const propsWithImportForm = {
      ...defaultProps,
      showImportForm: true,
    };
    
    render(<ImportExportButtons {...propsWithImportForm} />);
    
    fireEvent.click(screen.getByText('キャンセル'));
    
    expect(mockOnImportCancel).toHaveBeenCalledTimes(1);
  });

  it('shows import loading state', () => {
    const propsWithImportLoading = {
      ...defaultProps,
      showImportForm: true,
      importLoading: true,
    };
    
    render(<ImportExportButtons {...propsWithImportLoading} />);
    
    expect(screen.getByText('インポート中...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'インポート中...' })).toBeDisabled();
  });

  it('displays successful import result', () => {
    const successResult: ImportResult = {
      success: 5,
      errors: [],
      total: 5,
    };
    
    const propsWithSuccessResult = {
      ...defaultProps,
      showImportForm: true,
      importResult: successResult,
    };
    
    render(<ImportExportButtons {...propsWithSuccessResult} />);
    
    expect(screen.getByText('インポート結果')).toBeInTheDocument();
    expect(screen.getByText('処理総数:')).toBeInTheDocument();
    expect(screen.getByText('成功:')).toBeInTheDocument();
  });

  it('displays import result with errors', () => {
    const resultWithErrors: ImportResult = {
      success: 3,
      errors: ['Error 1', 'Error 2'],
      total: 5,
    };
    
    const propsWithErrorResult = {
      ...defaultProps,
      showImportForm: true,
      importResult: resultWithErrors,
    };
    
    render(<ImportExportButtons {...propsWithErrorResult} />);
    
    expect(screen.getByText('インポート結果')).toBeInTheDocument();
    expect(screen.getByText('処理総数:')).toBeInTheDocument();
    expect(screen.getByText('成功:')).toBeInTheDocument();
    expect(screen.getByText('エラー:')).toBeInTheDocument();
    expect(screen.getByText('Error 1')).toBeInTheDocument();
    expect(screen.getByText('Error 2')).toBeInTheDocument();
  });

  it('calls handleImport when import form is submitted', () => {
    const propsWithImportForm = {
      ...defaultProps,
      showImportForm: true,
    };
    
    render(<ImportExportButtons {...propsWithImportForm} />);
    
    const form = screen.getByRole('button', { name: 'インポート実行' }).closest('form');
    fireEvent.submit(form!);
    
    expect(mockHandleImport).toHaveBeenCalledTimes(1);
  });

  it('shows CSV format guide in import form', () => {
    const propsWithImportForm = {
      ...defaultProps,
      showImportForm: true,
    };
    
    render(<ImportExportButtons {...propsWithImportForm} />);
    
    expect(screen.getByText('以下の形式でCSVファイルを作成してください（1行目はヘッダー行です）')).toBeInTheDocument();
    expect(screen.getByText('name,html,placeholders,description')).toBeInTheDocument();
  });

  it('has proper file input attributes', () => {
    const propsWithImportForm = {
      ...defaultProps,
      showImportForm: true,
    };
    
    render(<ImportExportButtons {...propsWithImportForm} />);
    
    const fileInput = screen.getByLabelText('CSVファイルを選択');
    expect(fileInput).toHaveAttribute('type', 'file');
    expect(fileInput).toHaveAttribute('accept', '.csv');
    expect(fileInput).toHaveAttribute('name', 'file');
    expect(fileInput).toBeRequired();
  });

  it('disables import form when loading', () => {
    const propsWithImportLoading = {
      ...defaultProps,
      showImportForm: true,
      importLoading: true,
    };
    
    render(<ImportExportButtons {...propsWithImportLoading} />);
    
    const fileInput = screen.getByLabelText('CSVファイルを選択');
    expect(fileInput).toBeDisabled();
    
    const cancelButton = screen.getByText('キャンセル');
    expect(cancelButton).toBeDisabled();
  });
});