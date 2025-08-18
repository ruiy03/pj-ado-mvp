import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '@/app/dashboard/page';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

global.fetch = jest.fn();

describe('Dashboard', () => {
  const mockSession = {
    user: { 
      id: '1',
      name: 'テストユーザー', 
      email: 'test@example.com',
      role: 'admin'
    },
    expires: '2025-12-31T23:59:59.999Z'
  };

  const mockPush = jest.fn();

  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: mockSession,
      status: 'authenticated',
    });

    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });

    (fetch as jest.Mock).mockClear();
    mockPush.mockClear();
  });

  it('ダッシュボードが正しくレンダリングされる', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            id: 1,
            name: 'テストテンプレート1',
            created_at: '2025-01-01T00:00:00.000Z'
          },
          {
            id: 2,
            name: 'テストテンプレート2',
            created_at: '2025-01-02T00:00:00.000Z'
          }
        ])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          templates: [
            {
              id: 1,
              name: 'テストURLテンプレート1',
              created_at: '2025-01-01T00:00:00.000Z'
            }
          ]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            id: 1,
            name: 'テスト広告コンテンツ1',
            created_at: '2025-01-03T00:00:00.000Z'
          }
        ])
      });

    render(<Dashboard />);

    expect(screen.getByText('読み込み中...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    });

    expect(screen.getByText('総広告数')).toBeInTheDocument();
    expect(screen.getByText('広告テンプレート数')).toBeInTheDocument();
    expect(screen.getByText('URLテンプレート数')).toBeInTheDocument();
    expect(screen.getByText('広告なし記事数')).toBeInTheDocument();
    expect(screen.getByText('最近の活動')).toBeInTheDocument();
  });

  it('統計データが正しく表示される', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { id: 1, name: 'テンプレート1', created_at: '2025-01-01T00:00:00.000Z' },
          { id: 2, name: 'テンプレート2', created_at: '2025-01-02T00:00:00.000Z' }
        ])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          templates: [
            { id: 1, name: 'URLテンプレート1', created_at: '2025-01-01T00:00:00.000Z' }
          ]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          { id: 1, name: '広告コンテンツ1', created_at: '2025-01-01T00:00:00.000Z' },
          { id: 2, name: '広告コンテンツ2', created_at: '2025-01-02T00:00:00.000Z' },
          { id: 3, name: '広告コンテンツ3', created_at: '2025-01-03T00:00:00.000Z' }
        ])
      });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument(); // 総広告数
      expect(screen.getByText('2')).toBeInTheDocument(); // 広告テンプレート数
      expect(screen.getByText('1')).toBeInTheDocument(); // URLテンプレート数
    });
  });

  it('活動履歴が正しく表示される', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            id: 1,
            name: 'テストテンプレート',
            created_at: '2025-01-01T00:00:00.000Z'
          }
        ])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          templates: [
            {
              id: 1,
              name: 'テストURLテンプレート',
              created_at: '2025-01-02T00:00:00.000Z'
            }
          ]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            id: 1,
            name: 'テスト広告コンテンツ',
            created_at: '2025-01-03T00:00:00.000Z'
          }
        ])
      });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('広告テンプレート「テストテンプレート」が作成されました')).toBeInTheDocument();
      expect(screen.getByText('URLテンプレート「テストURLテンプレート」が作成されました')).toBeInTheDocument();
      expect(screen.getByText('広告コンテンツ「テスト広告コンテンツ」が作成されました')).toBeInTheDocument();
    });
  });

  it('データ取得エラー時にエラーメッセージが表示される', async () => {
    (fetch as jest.Mock).mockRejectedValue(new Error('Fetch error'));

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('データの取得に失敗しました')).toBeInTheDocument();
    });
  });

  it('データがない場合にデフォルトの活動が表示される', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([])
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ templates: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ([])
      });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText('システム初期化完了')).toBeInTheDocument();
    });
  });

  it('APIエラー時も適切に処理される', async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: false,
        status: 500
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500
      });

    render(<Dashboard />);

    await waitFor(() => {
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
    });
  });
});
