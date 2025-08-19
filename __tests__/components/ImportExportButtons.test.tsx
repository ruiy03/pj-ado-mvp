import { render, screen, fireEvent } from '@testing-library/react';
import ImportExportButtons from '@/app/ad-templates/components/ImportExportButtons';
import type { ImportResult } from '@/lib/definitions';

describe('ImportExportButtons', () => {
  const mockOnImport = jest.fn();
  const mockOnExport = jest.fn();
  const mockOnCreateClick = jest.fn();
  const mockOnImportCancel = jest.fn();
  const mockOnImportResultClose = jest.fn();
  const mockHandleImport = jest.fn();

  const defaultProps = {
    onImport: mockOnImport,
    onExport: mockOnExport,
    onCreateClick: mockOnCreateClick,
    onImportCancel: mockOnImportCancel,
    onImportResultClose: mockOnImportResultClose,
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
      createdItems: [
        { id: 1, name: 'テンプレート1' },
        { id: 2, name: 'テンプレート2' }
      ],
      updatedItems: [],
      skippedItems: []
    };
    
    const propsWithSuccessResult = {
      ...defaultProps,
      showImportForm: true,
      importResult: successResult,
    };
    
    render(<ImportExportButtons {...propsWithSuccessResult} />);
    
    expect(screen.getByText('インポート結果')).toBeInTheDocument();
    expect(screen.getByText('処理総数')).toBeInTheDocument();
    expect(screen.getByText('成功')).toBeInTheDocument();
    expect(screen.getByText('新規作成')).toBeInTheDocument();
    expect(screen.getByText('更新')).toBeInTheDocument();
    expect(screen.getByText('スキップ')).toBeInTheDocument();
    expect(screen.getByText('エラー')).toBeInTheDocument();
    // 統計カードの中身をチェック
    expect(screen.getAllByText('5')).toHaveLength(2); // total と success の両方
    expect(screen.getByText('2')).toBeInTheDocument(); // 新規作成数
    expect(screen.getAllByText('0')).toHaveLength(3); // 更新数、スキップ数、エラー数
    expect(screen.getByText('新規作成されたテンプレート (2件)')).toBeInTheDocument();
    expect(screen.getByText('テンプレート1')).toBeInTheDocument();
    expect(screen.getByText('テンプレート2')).toBeInTheDocument();
  });

  it('displays import result with errors', () => {
    const resultWithErrors: ImportResult = {
      success: 3,
      errors: [
        { row: 1, name: 'エラーテンプレート1', message: 'Error 1' },
        { row: 3, name: 'エラーテンプレート2', message: 'Error 2' }
      ],
      total: 5,
      createdItems: [
        { id: 1, name: 'テンプレート1' }
      ],
      updatedItems: [],
      skippedItems: []
    };
    
    const propsWithErrorResult = {
      ...defaultProps,
      showImportForm: true,
      importResult: resultWithErrors,
    };
    
    render(<ImportExportButtons {...propsWithErrorResult} />);
    
    expect(screen.getByText('インポート結果')).toBeInTheDocument();
    expect(screen.getByText('処理総数')).toBeInTheDocument();
    expect(screen.getByText('成功')).toBeInTheDocument();
    expect(screen.getByText('エラー')).toBeInTheDocument();
    // 統計カードの中身をチェック
    expect(screen.getByText('5')).toBeInTheDocument(); // total
    expect(screen.getByText('3')).toBeInTheDocument(); // success
    expect(screen.getByText('2')).toBeInTheDocument(); // errors count
    expect(screen.getByText('新規作成されたテンプレート (1件)')).toBeInTheDocument();
    expect(screen.getByText('テンプレート1')).toBeInTheDocument();
    expect(screen.getByText('エラー詳細 (2件)')).toBeInTheDocument();
    expect(screen.getByText('行 1')).toBeInTheDocument();
    expect(screen.getByText('行 3')).toBeInTheDocument();
    expect(screen.getByText('"エラーテンプレート1"')).toBeInTheDocument();
    expect(screen.getByText('"エラーテンプレート2"')).toBeInTheDocument();
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

  it('calls onImportResultClose when close button is clicked in import result', () => {
    const successResult: ImportResult = {
      success: 2,
      errors: [],
      total: 2,
      createdItems: [
        { id: 1, name: 'テンプレート1' }
      ],
      updatedItems: []
    };
    
    const propsWithResult = {
      ...defaultProps,
      importResult: successResult,
    };
    
    render(<ImportExportButtons {...propsWithResult} />);
    
    const closeButton = screen.getByLabelText('結果を閉じる');
    fireEvent.click(closeButton);
    
    expect(mockOnImportResultClose).toHaveBeenCalledTimes(1);
  });

  it('displays import result as independent section when result exists', () => {
    const successResult: ImportResult = {
      success: 2,
      errors: [],
      total: 2,
      createdItems: [
        { id: 1, name: 'テンプレート1' }
      ],
      updatedItems: []
    };
    
    const propsWithResult = {
      ...defaultProps,
      importResult: successResult,
      showImportForm: false, // フォームは非表示
    };
    
    render(<ImportExportButtons {...propsWithResult} />);
    
    // インポート結果は表示されている
    expect(screen.getByText('インポート結果')).toBeInTheDocument();
    expect(screen.getByText('新規作成されたテンプレート (1件)')).toBeInTheDocument();
    expect(screen.getByLabelText('結果を閉じる')).toBeInTheDocument();
    
    // フォームは表示されていない
    expect(screen.queryByText('CSVファイルからインポート')).not.toBeInTheDocument();
  });

  it('displays import result with updated and skipped items', () => {
    const resultWithMixedActions: ImportResult = {
      success: 4,
      errors: [],
      total: 4,
      createdItems: [
        { id: 1, name: '新しいテンプレート' }
      ],
      updatedItems: [
        { id: 2, name: '更新されたテンプレート' }
      ],
      skippedItems: [
        { id: 3, name: 'スキップされたテンプレート1' },
        { id: 4, name: 'スキップされたテンプレート2' }
      ]
    };
    
    const propsWithMixedResult = {
      ...defaultProps,
      showImportForm: true,
      importResult: resultWithMixedActions,
    };
    
    render(<ImportExportButtons {...propsWithMixedResult} />);
    
    expect(screen.getByText('インポート結果')).toBeInTheDocument();
    expect(screen.getAllByText('4')).toHaveLength(2); // 処理総数と成功総数
    expect(screen.getAllByText('1')).toHaveLength(2); // 新規作成数と更新数（それぞれ1つずつ）
    expect(screen.getByText('2')).toBeInTheDocument(); // スキップ数（1つだけ）
    
    // 各セクションが表示される
    expect(screen.getByText('新規作成されたテンプレート (1件)')).toBeInTheDocument();
    expect(screen.getByText('新しいテンプレート')).toBeInTheDocument();
    
    expect(screen.getByText('更新されたテンプレート (1件)')).toBeInTheDocument();
    expect(screen.getByText('更新されたテンプレート')).toBeInTheDocument();
    
    expect(screen.getByText('スキップされたテンプレート (2件)')).toBeInTheDocument();
    expect(screen.getByText('スキップされたテンプレート1')).toBeInTheDocument();
    expect(screen.getByText('スキップされたテンプレート2')).toBeInTheDocument();
    expect(screen.getAllByText('(内容が同一のため)')).toHaveLength(2);
  });
});
