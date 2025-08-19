import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdContentCard from '@/app/ads/components/AdContentCard';
import type { AdContent } from '@/lib/definitions';

// Next.js Image コンポーネントのモック
jest.mock('next/image', () => {
  return function MockedImage({ src, alt, width, height, ...props }: any) {
    return <img src={src} alt={alt} width={width} height={height} {...props} />;
  };
});

describe('AdContentCard', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnStatusChange = jest.fn();

  const mockAdContent: AdContent = {
    id: 1,
    name: 'テスト広告コンテンツ',
    status: 'active',
    template_id: 1,
    url_template_id: 1,
    content_data: {
      title: 'テストタイトル',
      description: 'テスト説明文'
    },
    created_by: 1,
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-02T00:00:00.000Z',
    template: {
      id: 1,
      name: 'テストテンプレート',
      html: '<div><h2>{{title}}</h2><p>{{description}}</p></div>',
      placeholders: ['title', 'description'],
      description: 'テスト用テンプレート',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z'
    },
    url_template: {
      id: 1,
      name: 'テストURLテンプレート',
      url_template: 'https://example.com',
      description: 'テスト用URLテンプレート',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z'
    },
    created_by_user: {
      id: 1,
      name: 'テストユーザー',
      email: 'test@example.com',
      role: 'admin',
      created_at: '2023-01-01T00:00:00.000Z',
      updated_at: '2023-01-01T00:00:00.000Z'
    },
    images: [
      {
        id: 1,
        filename: 'test1.jpg',
        blob_url: '/images/test1.jpg',
        size: 1024,
        mime_type: 'image/jpeg',
        ad_content_id: 1,
        created_at: '2023-01-01T00:00:00.000Z'
      },
      {
        id: 2,
        filename: 'test2.jpg',
        blob_url: '/images/test2.jpg',
        size: 2048,
        mime_type: 'image/jpeg',
        ad_content_id: 1,
        created_at: '2023-01-01T00:00:00.000Z'
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('基本情報が正しく表示される', () => {
    render(
      <AdContentCard
        content={mockAdContent}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('テスト広告コンテンツ')).toBeInTheDocument();
    const statusElements = screen.getAllByText('アクティブ');
    const statusBadge = statusElements.find(el => el.className.includes('px-2 py-1 rounded-full'));
    expect(statusBadge).toBeInTheDocument();
    expect(screen.getByText('テストテンプレート')).toBeInTheDocument();
    expect(screen.getByText('テストURLテンプレート')).toBeInTheDocument();
    expect(screen.getByText('作成者: テストユーザー')).toBeInTheDocument();
  });

  it('各ステータスの色とテキストが正しく表示される', () => {
    const statuses: Array<{ status: string; text: string; className: string }> = [
      { status: 'active', text: 'アクティブ', className: 'bg-green-100 text-green-800' },
      { status: 'paused', text: '停止中', className: 'bg-yellow-100 text-yellow-800' },
      { status: 'draft', text: '下書き', className: 'bg-gray-100 text-gray-800' },
      { status: 'archived', text: 'アーカイブ', className: 'bg-red-100 text-red-800' }
    ];

    statuses.forEach(({ status, text, className }) => {
      const { rerender } = render(
        <AdContentCard
          content={{ ...mockAdContent, status }}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onStatusChange={mockOnStatusChange}
        />
      );

      const statusElements = screen.getAllByText(text);
      const statusBadge = statusElements.find(el => el.className.includes('px-2 py-1 rounded-full'));
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass(...className.split(' '));

      // 次のテストのためにクリーンアップ
      rerender(<div />);
    });
  });

  it('日付が正しくフォーマットされて表示される', () => {
    render(
      <AdContentCard
        content={mockAdContent}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText(/作成: 2023/)).toBeInTheDocument();
    expect(screen.getByText(/更新: 2023/)).toBeInTheDocument();
  });

  it('プレビューボタンが正しく動作する', async () => {
    const user = userEvent.setup();
    
    render(
      <AdContentCard
        content={mockAdContent}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const previewButton = screen.getByText('プレビュー');
    await user.click(previewButton);

    expect(screen.getByText('広告プレビュー')).toBeInTheDocument();
    expect(screen.getByText('テストタイトル')).toBeInTheDocument();
    expect(screen.getByText('テスト説明文')).toBeInTheDocument();
    expect(screen.getByText('非表示')).toBeInTheDocument();

    // 再度クリックして非表示にする
    const hideButton = screen.getByText('非表示');
    await user.click(hideButton);

    expect(screen.queryByText('広告プレビュー')).not.toBeInTheDocument();
    expect(screen.getByText('プレビュー')).toBeInTheDocument();
  });

  it('編集ボタンが正しく動作する', async () => {
    const user = userEvent.setup();
    
    render(
      <AdContentCard
        content={mockAdContent}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const editButton = screen.getByText('編集');
    await user.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledTimes(1);
    expect(mockOnEdit).toHaveBeenCalledWith(mockAdContent);
  });

  it('削除ボタンが正しく動作する', async () => {
    const user = userEvent.setup();
    
    render(
      <AdContentCard
        content={mockAdContent}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const deleteButton = screen.getByText('削除');
    await user.click(deleteButton);

    expect(mockOnDelete).toHaveBeenCalledTimes(1);
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });

  it('ステータス変更セレクトが正しく動作する', async () => {
    const user = userEvent.setup();
    
    render(
      <AdContentCard
        content={mockAdContent}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const statusSelect = screen.getByDisplayValue('アクティブ');
    await user.selectOptions(statusSelect, 'paused');

    expect(mockOnStatusChange).toHaveBeenCalledTimes(1);
    expect(mockOnStatusChange).toHaveBeenCalledWith(1, 'paused');
  });

  it('アーカイブ状態ではステータス変更セレクトが表示されない', () => {
    render(
      <AdContentCard
        content={{ ...mockAdContent, status: 'archived' }}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.queryByText('ステータス変更:')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('アーカイブ')).not.toBeInTheDocument();
  });

  it('画像プレビューが正しく表示される', () => {
    render(
      <AdContentCard
        content={mockAdContent}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByAltText('Preview 1')).toBeInTheDocument();
    expect(screen.getByAltText('Preview 2')).toBeInTheDocument();
  });

  it('画像が3枚以上ある場合、追加数が表示される', () => {
    const contentWithManyImages = {
      ...mockAdContent,
      images: [
        ...mockAdContent.images!,
        {
          id: 3,
          filename: 'test3.jpg',
          blob_url: '/images/test3.jpg',
          size: 1024,
          mime_type: 'image/jpeg',
          ad_content_id: 1,
          created_at: '2023-01-01T00:00:00.000Z'
        },
        {
          id: 4,
          filename: 'test4.jpg',
          blob_url: '/images/test4.jpg',
          size: 1024,
          mime_type: 'image/jpeg',
          ad_content_id: 1,
          created_at: '2023-01-01T00:00:00.000Z'
        }
      ]
    };

    render(
      <AdContentCard
        content={contentWithManyImages}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('+1')).toBeInTheDocument();
  });

  it('画像がない場合、画像プレビューが表示されない', () => {
    const contentWithoutImages = {
      ...mockAdContent,
      images: []
    };

    render(
      <AdContentCard
        content={contentWithoutImages}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.queryByAltText(/Preview/)).not.toBeInTheDocument();
  });

  it('テンプレートがない場合でも正しく表示される', () => {
    const contentWithoutTemplate = {
      ...mockAdContent,
      template: undefined,
      template_id: undefined
    };

    render(
      <AdContentCard
        content={contentWithoutTemplate}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('テスト広告コンテンツ')).toBeInTheDocument();
    expect(screen.queryByText('テストテンプレート')).not.toBeInTheDocument();
  });

  it('URLテンプレートがない場合でも正しく表示される', () => {
    const contentWithoutUrlTemplate = {
      ...mockAdContent,
      url_template: undefined,
      url_template_id: undefined
    };

    render(
      <AdContentCard
        content={contentWithoutUrlTemplate}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('テスト広告コンテンツ')).toBeInTheDocument();
    expect(screen.queryByText('テストURLテンプレート')).not.toBeInTheDocument();
  });

  it('プレースホルダーが空の値でも正しく置換される', async () => {
    const user = userEvent.setup();
    const contentWithEmptyData = {
      ...mockAdContent,
      content_data: {
        title: '',
        description: 'テスト説明文のみ'
      }
    };

    render(
      <AdContentCard
        content={contentWithEmptyData}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    const previewButton = screen.getByText('プレビュー');
    await user.click(previewButton);

    expect(screen.getByText('テスト説明文のみ')).toBeInTheDocument();
  });

  it('更新日時がない場合、更新日時が表示されない', () => {
    const contentWithoutUpdate = {
      ...mockAdContent,
      updated_at: mockAdContent.created_at
    };

    render(
      <AdContentCard
        content={contentWithoutUpdate}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText(/作成: 2023/)).toBeInTheDocument();
    expect(screen.queryByText(/更新: 2023/)).not.toBeInTheDocument();
  });

  it('作成者情報がない場合、"不明"と表示される', () => {
    const contentWithoutUser = {
      ...mockAdContent,
      created_by_user: undefined
    };

    render(
      <AdContentCard
        content={contentWithoutUser}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onStatusChange={mockOnStatusChange}
      />
    );

    expect(screen.getByText('作成者: 不明')).toBeInTheDocument();
  });
});
