import '@testing-library/jest-dom';
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '@/app/dashboard/page';

// fetchをモック
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('Dashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('ローディング状態が表示される', () => {
    mockFetch.mockImplementation(() => 
      new Promise(() => {}) // 永続的にペンディング状態
    );

    render(<Dashboard />);
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('テンプレートデータが正常に表示される', async () => {
    const mockTemplates = [
      { id: 1, name: 'テスト広告1', created_at: '2024-01-01T00:00:00Z' },
      { id: 2, name: 'テスト広告2', created_at: '2024-01-02T00:00:00Z' },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTemplates,
    } as Response);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    });

    // 統計情報の確認
    expect(screen.getByText('総広告数')).toBeInTheDocument();
    expect(screen.getByText('広告テンプレート数')).toBeInTheDocument();
    expect(screen.getByText('URLテンプレート数')).toBeInTheDocument();
    expect(screen.getByText('広告なし記事数')).toBeInTheDocument();

    // テンプレート数が正しく表示される
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // 最近の活動の確認
    expect(screen.getByText('最近の活動')).toBeInTheDocument();
    expect(screen.getByText('広告テンプレート「テスト広告1」が作成されました')).toBeInTheDocument();
    expect(screen.getByText('広告テンプレート「テスト広告2」が作成されました')).toBeInTheDocument();
  });

  it('テンプレートが空の場合はデフォルト活動が表示される', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    });

    // テンプレート数が0（カード内の数値を特定）
    const adTemplateCard = screen.getByText('広告テンプレート数').closest('div');
    expect(adTemplateCard).toHaveTextContent('0');
    
    // デフォルトの活動が表示される
    expect(screen.getByText('システム初期化完了')).toBeInTheDocument();
    expect(screen.getByText('今日')).toBeInTheDocument();
  });

  it('APIエラー時にエラーメッセージが表示される', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument();
    });
  });

  it('APIレスポンスがokでない場合のハンドリング', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    } as Response);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    });

    // エラー時は空配列として扱われ、テンプレート数は0
    const adTemplateCard = screen.getByText('広告テンプレート数').closest('div');
    expect(adTemplateCard).toHaveTextContent('0');
  });

  it('日付フォーマットが正しく表示される', async () => {
    const mockTemplates = [
      { 
        id: 1, 
        name: 'テスト広告', 
        created_at: '2024-01-15T10:30:00Z' 
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTemplates,
    } as Response);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('2024/1/15')).toBeInTheDocument();
    });
  });

  it('created_atがない場合は"最近"と表示される', async () => {
    const mockTemplates = [
      { 
        id: 1, 
        name: 'テスト広告',
        // created_atなし
      },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTemplates,
    } as Response);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('最近')).toBeInTheDocument();
    });
  });

  it('最大5件の活動のみ表示される', async () => {
    const mockTemplates = Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `テスト広告${i + 1}`,
      created_at: '2024-01-01T00:00:00Z',
    }));

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockTemplates,
    } as Response);

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    });

    // テンプレート数は10
    expect(screen.getByText('10')).toBeInTheDocument();
    
    // 活動は最初の5件のみ表示される
    expect(screen.getByText('広告テンプレート「テスト広告1」が作成されました')).toBeInTheDocument();
    expect(screen.getByText('広告テンプレート「テスト広告5」が作成されました')).toBeInTheDocument();
    expect(screen.queryByText('広告テンプレート「テスト広告6」が作成されました')).not.toBeInTheDocument();
  });

  it('正しいAPIエンドポイントが呼ばれる', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<Dashboard />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/templates');
    });
  });
});
