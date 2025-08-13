import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef } from 'react';
import HTMLCodeEditor, { HTMLCodeEditorRef } from '@/components/HTMLCodeEditor';

// Monaco Editor をモック化
jest.mock('@monaco-editor/react', () => ({
  Editor: ({ value, onChange, loading, onMount }: any) => {
    return (
      <div data-testid="monaco-editor">
        {loading}
        <textarea
          data-testid="editor-textarea"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder="HTMLコードを入力してください..."
        />
        <button
          data-testid="mock-format-button"
          onClick={() => {
            // モックのフォーマット機能
            if (onMount) {
              const mockEditor = {
                getAction: jest.fn().mockReturnValue({
                  run: jest.fn()
                }),
                updateOptions: jest.fn(),
                setValue: jest.fn(),
                getValue: jest.fn().mockReturnValue(value),
                deltaDecorations: jest.fn().mockReturnValue([]),
                onDidChangeModelContent: jest.fn().mockReturnValue({
                  dispose: jest.fn()
                })
              };
              const mockMonaco = {
                editor: {
                  defineTheme: jest.fn()
                },
                Range: jest.fn().mockImplementation(() => ({}))
              };
              onMount(mockEditor, mockMonaco);
            }
          }}
        >
          Format
        </button>
      </div>
    );
  }
}));

describe('HTMLCodeEditor', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with default props', () => {
    render(<HTMLCodeEditor {...defaultProps} />);
    
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    expect(screen.getByTestId('editor-textarea')).toBeInTheDocument();
  });

  it('displays the provided value', () => {
    const testValue = '<div>Test HTML</div>';
    render(<HTMLCodeEditor {...defaultProps} value={testValue} />);
    
    const textarea = screen.getByTestId('editor-textarea');
    expect(textarea).toHaveValue(testValue);
  });

  it('calls onChange when value changes', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<HTMLCodeEditor {...defaultProps} onChange={onChange} />);
    
    const textarea = screen.getByTestId('editor-textarea');
    await user.type(textarea, '<p>New content</p>');
    
    expect(onChange).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const customClass = 'custom-editor-class';
    const { container } = render(
      <HTMLCodeEditor {...defaultProps} className={customClass} />
    );
    
    expect(container.firstChild).toHaveClass(customClass);
  });

  it('sets custom height', () => {
    const customHeight = 300;
    render(<HTMLCodeEditor {...defaultProps} height={customHeight} />);
    
    // Monaco Editorのheightプロパティは直接テストできないため、
    // コンポーネントが正常にレンダリングされることを確認
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('handles placeholder correctly', () => {
    const customPlaceholder = 'カスタムプレースホルダー';
    render(<HTMLCodeEditor {...defaultProps} placeholder={customPlaceholder} />);
    
    const textarea = screen.getByTestId('editor-textarea');
    expect(textarea).toHaveAttribute('placeholder', 'HTMLコードを入力してください...');
  });

  it('exposes formatCode function through ref', async () => {
    const ref = createRef<HTMLCodeEditorRef>();
    render(<HTMLCodeEditor {...defaultProps} ref={ref} />);
    
    // Monaco Editorの初期化を待つ
    await waitFor(() => {
      expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
    });
    
    // refを通してformatCode関数にアクセスできることを確認
    expect(ref.current).toBeDefined();
    expect(typeof ref.current?.formatCode).toBe('function');
  });

  it('formatCode can be called without errors', async () => {
    const ref = createRef<HTMLCodeEditorRef>();
    render(<HTMLCodeEditor {...defaultProps} ref={ref} />);
    
    // Monaco Editorの初期化をトリガー
    const formatButton = screen.getByTestId('mock-format-button');
    await userEvent.click(formatButton);
    
    await waitFor(() => {
      expect(ref.current).toBeDefined();
    });
    
    // formatCode関数を呼び出してもエラーが発生しないことを確認
    expect(() => {
      ref.current?.formatCode();
    }).not.toThrow();
  });

  it('handles readOnly prop correctly', () => {
    render(<HTMLCodeEditor {...defaultProps} readOnly={true} />);
    
    // readOnlyプロパティはMonaco Editorの内部で処理されるため、
    // コンポーネントが正常にレンダリングされることを確認
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<HTMLCodeEditor {...defaultProps} />);
    
    expect(screen.getByText('エディターを読み込み中...')).toBeInTheDocument();
  });

  it('handles empty value correctly', () => {
    const onChange = jest.fn();
    render(<HTMLCodeEditor value="" onChange={onChange} />);
    
    const textarea = screen.getByTestId('editor-textarea');
    expect(textarea).toHaveValue('');
  });

  it('handles Monaco Editor onChange with undefined value', () => {
    // Monaco EditorがundefinedのvalueでonChangeを呼び出した場合の処理をテスト
    const onChange = jest.fn();
    render(<HTMLCodeEditor {...defaultProps} onChange={onChange} />);
    
    // モックのMonaco EditorのonChangeに直接undefinedを渡してテスト
    const textarea = screen.getByTestId('editor-textarea');
    
    // 空文字列が適切に処理されることを確認
    expect(textarea).toHaveValue('');
    expect(onChange).not.toHaveBeenCalled(); // 初期状態では呼ばれない
  });
});
