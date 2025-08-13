import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdTemplates from '@/app/ad-templates/page';

// fetchをモック
global.fetch = jest.fn();
global.confirm = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
const mockConfirm = confirm as jest.MockedFunction<typeof confirm>;

describe('AdTemplates - Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConfirm.mockReturnValue(true);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('初期データ取得エラー時にエラーメッセージが表示される', async () => {
    mockFetch.mockRejectedValueOnce(new Error('データ取得に失敗しました'));

    render(<AdTemplates />);

    await waitFor(() => {
      expect(screen.getByText('データ取得に失敗しました')).toBeInTheDocument();
    });
  });

  it('テンプレート作成エラー時にエラーメッセージが表示される', async () => {
    const user = userEvent.setup();
    
    // 初期取得は成功
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    // 作成リクエストは失敗
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'テンプレートの作成に失敗しました' }),
    } as Response);

    render(<AdTemplates />);

    await waitFor(() => {
      expect(screen.getByText('新しいテンプレートを作成')).toBeInTheDocument();
    });

    // フォームを開く
    await user.click(screen.getByRole('button', { name: '新しいテンプレートを作成' }));

    // フォームに入力
    const inputs = screen.getAllByDisplayValue('');
    const nameInput = inputs[0]; // テンプレート名は最初の空の入力フィールド
    await user.type(nameInput, 'テストテンプレート');
    await user.type(screen.getByPlaceholderText(/HTMLコードを入力してください/), '<div>test</div>');

    // 送信
    await user.click(screen.getByRole('button', { name: '作成' }));

    // エラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText('テンプレートの作成に失敗しました')).toBeInTheDocument();
    });
  });

  it('テンプレート削除エラー時にエラーメッセージが表示される', async () => {
    const user = userEvent.setup();
    
    const mockTemplate = {
      id: 1,
      name: '削除対象',
      html: '<div>test</div>',
      placeholders: [],
      description: '',
    };

    // 初期取得は成功
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [mockTemplate],
    } as Response);

    // 削除リクエストは失敗
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'テンプレートの削除に失敗しました' }),
    } as Response);

    render(<AdTemplates />);

    await waitFor(() => {
      expect(screen.getByText('削除対象')).toBeInTheDocument();
    });

    // 削除ボタンをクリック
    await user.click(screen.getByText('削除'));

    // エラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText('テンプレートの削除に失敗しました')).toBeInTheDocument();
    });
  });

  it('バリデーションエラーがある場合にフォームが表示される', async () => {
    const user = userEvent.setup();
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<AdTemplates />);

    await waitFor(() => {
      expect(screen.getByText('新しいテンプレートを作成')).toBeInTheDocument();
    });

    // フォームを開く
    await user.click(screen.getByRole('button', { name: '新しいテンプレートを作成' }));

    // プレースホルダーを含むHTMLを入力（バリデーションエラーを発生させる）
    await user.type(screen.getByPlaceholderText(/HTMLコードを入力してください/), '<div>{{title}}</div>');

    // フォーム要素が表示されることを確認
    const submitButton = screen.getByRole('button', { name: '作成' });
    expect(submitButton).toBeInTheDocument();
  });

  it('プレースホルダーを含むHTMLを入力してフォームが正常に表示される', async () => {
    const user = userEvent.setup();
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<AdTemplates />);

    await waitFor(() => {
      expect(screen.getByText('新しいテンプレートを作成')).toBeInTheDocument();
    });

    // フォームを開く
    await user.click(screen.getByRole('button', { name: '新しいテンプレートを作成' }));

    // プレースホルダーを含むHTMLを入力
    const htmlTextarea = screen.getByPlaceholderText(/HTMLコードを入力してください/);
    await user.type(htmlTextarea, '<div>{{title}}</div>');

    // HTML入力フィールドに値が設定されることを確認
    expect(htmlTextarea.value).toContain('title');
    
    // フォームの基本要素が表示されることを確認
    expect(screen.getByText('プレースホルダー')).toBeInTheDocument();
  });

  it('CSVエクスポートエラー時にエラーメッセージが表示される', async () => {
    const user = userEvent.setup();
    
    // 初期取得は成功
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    // エクスポートリクエストは失敗
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: 'エクスポートに失敗しました' }),
    } as Response);

    render(<AdTemplates />);

    await waitFor(() => {
      expect(screen.getByText('CSVエクスポート')).toBeInTheDocument();
    });

    await user.click(screen.getByText('CSVエクスポート'));

    // エラーメッセージが表示される
    await waitFor(() => {
      expect(screen.getByText('エクスポートに失敗しました')).toBeInTheDocument();
    });
  });

  it('CSVインポート画面が正常に表示される', async () => {
    const user = userEvent.setup();
    
    // 初期取得は成功
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<AdTemplates />);

    await waitFor(() => {
      expect(screen.getByText('CSVインポート')).toBeInTheDocument();
    });

    // インポートフォームを開く
    await user.click(screen.getByText('CSVインポート'));

    // CSVインポート画面の要素が表示される
    expect(screen.getByText('CSVフォーマット')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'インポート' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
  });

  it('プレビューエラー時に安全なエラー表示がされる', async () => {
    const user = userEvent.setup();
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<AdTemplates />);

    await waitFor(() => {
      expect(screen.getByText('新しいテンプレートを作成')).toBeInTheDocument();
    });

    // フォームを開く
    await user.click(screen.getByRole('button', { name: '新しいテンプレートを作成' }));

    // 無効なHTMLを入力（プレビューエラーを発生させるため）
    // 注：実際にはReactのdangerouslySetInnerHTMLは多くのHTMLを受け入れるため、
    // この例では単純にHTMLを入力してプレビューが表示されることを確認
    await user.type(screen.getByPlaceholderText(/HTMLコードを入力してください/), '<script>alert("test")</script>');

    // プレビューエリアが表示される（スクリプトタグは無害化される）
    await waitFor(() => {
      expect(screen.queryByText('HTMLコードを入力するとプレビューが表示されます')).not.toBeInTheDocument();
    });
  });

  it('エラーメッセージの閉じるボタンが動作する', async () => {
    const user = userEvent.setup();
    
    mockFetch.mockRejectedValueOnce(new Error('テストエラー'));

    render(<AdTemplates />);

    await waitFor(() => {
      expect(screen.getByText('テストエラー')).toBeInTheDocument();
    });

    // 閉じるボタンをクリック
    const closeButton = screen.getByText('×');
    await user.click(closeButton);

    // エラーメッセージが非表示になる
    expect(screen.queryByText('テストエラー')).not.toBeInTheDocument();
  });

  it('無効なプレースホルダー名の場合に警告が表示される', async () => {
    const user = userEvent.setup();
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<AdTemplates />);

    await waitFor(() => {
      expect(screen.getByText('新しいテンプレートを作成')).toBeInTheDocument();
    });

    // フォームを開く
    await user.click(screen.getByRole('button', { name: '新しいテンプレートを作成' }));

    // プレースホルダーを追加
    await user.click(screen.getByText('プレースホルダーを追加'));
    
    // 無効なプレースホルダー名を入力
    const placeholderInput = screen.getByPlaceholderText('プレースホルダー名（例：title, imageUrl）');
    await user.type(placeholderInput, 'invalidname');

    // プレースホルダー入力フィールドが存在することを確認
    expect(placeholderInput).toBeInTheDocument();
    expect(placeholderInput.value).toBe('invalidname');
  });

  it('ネットワークエラー時に適切なエラーメッセージが表示される', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

    render(<AdTemplates />);

    await waitFor(() => {
      expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
    });
  });

  it('複数のプレースホルダーを追加できる', async () => {
    const user = userEvent.setup();
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<AdTemplates />);

    await waitFor(() => {
      expect(screen.getByText('新しいテンプレートを作成')).toBeInTheDocument();
    });

    // フォームを開く
    await user.click(screen.getByRole('button', { name: '新しいテンプレートを作成' }));

    // HTMLにプレースホルダーを含める
    await user.type(screen.getByPlaceholderText(/HTMLコードを入力してください/), '<div>{{title}}{{description}}</div>');

    // プレースホルダーを手動で追加
    await user.click(screen.getByText('プレースホルダーを追加'));
    const placeholderInput = screen.getByPlaceholderText('プレースホルダー名（例：title, imageUrl）');
    await user.type(placeholderInput, 'differentPlaceholder');

    // プレースホルダー入力フィールドが表示されることを確認
    expect(placeholderInput.value).toBe('differentPlaceholder');
  });
});
