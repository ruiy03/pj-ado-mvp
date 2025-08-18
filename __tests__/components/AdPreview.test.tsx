import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AdPreview from '@/app/ads/components/AdPreview';
import type { AdTemplate } from '@/lib/definitions';

describe('AdPreview', () => {
  const mockTemplate: AdTemplate = {
    id: 1,
    name: 'テストテンプレート',
    html: '<div><h2>{{title}}</h2><p>{{description}}</p><img src="{{imageUrl}}" alt="{{altText}}" /></div>',
    placeholders: ['title', 'description', 'imageUrl', 'altText'],
    description: 'テスト用テンプレート',
    created_at: '2023-01-01T00:00:00.000Z',
    updated_at: '2023-01-01T00:00:00.000Z'
  };

  const mockContentData = {
    title: 'テストタイトル',
    description: 'テスト説明文',
    imageUrl: '/test-image.jpg',
    altText: 'テスト画像'
  };

  it('テンプレートがない場合、適切なメッセージが表示される', () => {
    render(<AdPreview template={null} contentData={{}} />);

    expect(screen.getByText('テンプレートを選択してください')).toBeInTheDocument();
    expect(screen.getByText('選択したテンプレートのプレビューが表示されます')).toBeInTheDocument();
    expect(screen.getByText('プレビュー')).toBeInTheDocument();
  });

  it('テンプレートとデータがある場合、正しくレンダリングされる', async () => {
    render(<AdPreview template={mockTemplate} contentData={mockContentData} />);

    await waitFor(() => {
      expect(screen.getByText('テストタイトル')).toBeInTheDocument();
      expect(screen.getByText('テスト説明文')).toBeInTheDocument();
    });

    expect(screen.getByText('テンプレート: テストテンプレート')).toBeInTheDocument();
    expect(screen.getByText('4 個のプレースホルダー')).toBeInTheDocument();
  });

  it('カスタムタイトルが正しく表示される', () => {
    render(<AdPreview template={mockTemplate} contentData={mockContentData} title="カスタムプレビュー" />);

    expect(screen.getByText('カスタムプレビュー')).toBeInTheDocument();
  });

  it('ビューポート切り替えが正しく動作する', async () => {
    const user = userEvent.setup();
    
    render(<AdPreview template={mockTemplate} contentData={mockContentData} />);

    // デスクトップビューがデフォルトで選択されている
    const desktopButton = screen.getByTitle('デスクトップ');
    expect(desktopButton).toHaveClass('bg-white', 'text-gray-900', 'shadow-sm');

    // モバイルビューに切り替え
    const mobileButton = screen.getByTitle('モバイル');
    await user.click(mobileButton);

    expect(mobileButton).toHaveClass('bg-white', 'text-gray-900', 'shadow-sm');
    expect(desktopButton).toHaveClass('text-gray-600');
  });

  it('ビューポート切り替えを非表示にできる', () => {
    render(<AdPreview template={mockTemplate} contentData={mockContentData} showViewportToggle={false} />);

    expect(screen.queryByTitle('デスクトップ')).not.toBeInTheDocument();
    expect(screen.queryByTitle('モバイル')).not.toBeInTheDocument();
  });

  it('未置換のプレースホルダーが適切に表示される', async () => {
    const incompleteData = {
      title: 'テストタイトル'
      // description, imageUrl, altText は提供されない
    };

    render(<AdPreview template={mockTemplate} contentData={incompleteData} />);

    await waitFor(() => {
      expect(screen.getByText('テストタイトル')).toBeInTheDocument();
    });

    // 未入力項目はサンプルデータで置換される
    await waitFor(() => {
      expect(screen.getByText('サンプル説明文です。ここに実際のコンテンツが表示されます。')).toBeInTheDocument();
      expect(screen.getByText('未入力項目はサンプルデータで表示しています')).toBeInTheDocument();
    });
  });

  it('空の値を持つプレースホルダーが正しく処理される', async () => {
    const dataWithEmptyValues = {
      title: '',
      description: 'テスト説明文',
      imageUrl: null,
      altText: undefined
    };

    render(<AdPreview template={mockTemplate} contentData={dataWithEmptyValues} />);

    await waitFor(() => {
      expect(screen.getByText('テスト説明文')).toBeInTheDocument();
    });

    // 空文字列、null、undefined は全てサンプル値で置換される
    await waitFor(() => {
      expect(screen.getByText('未入力項目はサンプルデータで表示しています')).toBeInTheDocument();
    });
  });

  it('異なるデータ型の値が正しく文字列に変換される', async () => {
    const mixedTypeData = {
      title: 123,
      description: true,
      imageUrl: '/test.jpg',
      altText: 'テスト'
    };

    render(<AdPreview template={mockTemplate} contentData={mixedTypeData} />);

    await waitFor(() => {
      expect(screen.getByText('123')).toBeInTheDocument();
      expect(screen.getByText('true')).toBeInTheDocument();
    });
  });

  it('プレースホルダーの空白が正しく処理される', async () => {
    const templateWithSpaces: AdTemplate = {
      ...mockTemplate,
      html: '<div><h2>{{ title }}</h2><p>{{  description  }}</p><span>{{title}}</span></div>'
    };

    render(<AdPreview template={templateWithSpaces} contentData={mockContentData} />);

    await waitFor(() => {
      // 全てのtitleプレースホルダーが置換される
      const titleElements = screen.getAllByText('テストタイトル');
      expect(titleElements).toHaveLength(2);
      
      expect(screen.getByText('テスト説明文')).toBeInTheDocument();
    });
  });

  it('エラーが発生した場合でもコンポーネントがクラッシュしない', () => {
    // 無効なテンプレートでテスト
    const invalidTemplate = null;

    render(<AdPreview template={invalidTemplate} contentData={mockContentData} />);

    // テンプレートがない場合のメッセージが表示される
    expect(screen.getByText('テンプレートを選択してください')).toBeInTheDocument();
  });

  it('プレースホルダー数が正しく表示される', () => {
    const templateWithNoPlaceholders: AdTemplate = {
      ...mockTemplate,
      placeholders: []
    };

    render(<AdPreview template={templateWithNoPlaceholders} contentData={{}} />);

    expect(screen.getByText('0 個のプレースホルダー')).toBeInTheDocument();
  });

  it('ビューポート情報が正しく表示される', async () => {
    const user = userEvent.setup();
    
    render(<AdPreview template={mockTemplate} contentData={mockContentData} />);

    // モバイルに切り替え
    const mobileButton = screen.getByTitle('モバイル');
    await user.click(mobileButton);
  });

  it('ビューポート切り替えが無効の場合、ビューポート情報が表示されない', () => {
    render(<AdPreview template={mockTemplate} contentData={mockContentData} showViewportToggle={false} />);

    expect(screen.queryByTitle('デスクトップ')).not.toBeInTheDocument();
    expect(screen.queryByTitle('モバイル')).not.toBeInTheDocument();
  });

  it('カスタムクラス名が適用される', () => {
    const { container } = render(
      <AdPreview 
        template={mockTemplate} 
        contentData={mockContentData} 
        className="custom-class" 
      />
    );

    const previewElement = container.firstChild as HTMLElement;
    expect(previewElement).toHaveClass('custom-class');
  });

  it('テンプレートが変更された時、プレビューが更新される', async () => {
    const { rerender } = render(<AdPreview template={mockTemplate} contentData={mockContentData} />);

    await waitFor(() => {
      expect(screen.getByText('テストタイトル')).toBeInTheDocument();
    });

    // テンプレートを変更
    const newTemplate: AdTemplate = {
      ...mockTemplate,
      html: '<div><h1>{{title}}</h1></div>',
      name: '新しいテンプレート'
    };

    rerender(<AdPreview template={newTemplate} contentData={mockContentData} />);

    await waitFor(() => {
      expect(screen.getByText('テンプレート: 新しいテンプレート')).toBeInTheDocument();
    });
  });

  it('コンテンツデータが変更された時、プレビューが更新される', async () => {
    const { rerender } = render(<AdPreview template={mockTemplate} contentData={mockContentData} />);

    await waitFor(() => {
      expect(screen.getByText('テストタイトル')).toBeInTheDocument();
    });

    // データを変更
    const newContentData = {
      ...mockContentData,
      title: '更新されたタイトル'
    };

    rerender(<AdPreview template={mockTemplate} contentData={newContentData} />);

    await waitFor(() => {
      expect(screen.getByText('更新されたタイトル')).toBeInTheDocument();
      expect(screen.queryByText('テストタイトル')).not.toBeInTheDocument();
    });
  });
});
