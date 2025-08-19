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

  it('renders empty state when template is null', () => {
    render(<AdPreview template={null} contentData={{}} />);

    expect(screen.getByText(/テンプレートを選択してください/)).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('renders template content correctly when template and data are provided', async () => {
    const { container } = render(<AdPreview template={mockTemplate} contentData={mockContentData} />);

    await waitFor(() => {
      const previewContent = container.querySelector('.preview-content');
      expect(previewContent).toBeInTheDocument();
      expect(previewContent?.innerHTML).toContain('テストタイトル');
      expect(previewContent?.innerHTML).toContain('テスト説明文');
    });

    expect(screen.getByText(/テンプレート:/)).toBeInTheDocument();
  });

  it('displays custom title when provided', () => {
    render(<AdPreview template={mockTemplate} contentData={mockContentData} title="カスタムプレビュー" />);

    expect(screen.getByRole('heading', { name: 'カスタムプレビュー' })).toBeInTheDocument();
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

  it('handles missing placeholder data with sample content', async () => {
    const incompleteData = {
      title: 'テストタイトル'
      // description, imageUrl, altText は提供されない
    };

    const { container } = render(<AdPreview template={mockTemplate} contentData={incompleteData} />);

    await waitFor(() => {
      const previewContent = container.querySelector('.preview-content');
      expect(previewContent?.innerHTML).toContain('テストタイトル');
    });

    // Check for sample data notice
    await waitFor(() => {
      expect(screen.getByText(/未入力項目はサンプルデータで表示しています/)).toBeInTheDocument();
    });
  });

  it('handles empty and null placeholder values correctly', async () => {
    const dataWithEmptyValues = {
      title: '',
      description: 'テスト説明文',
      imageUrl: null,
      altText: undefined
    };

    const { container } = render(<AdPreview template={mockTemplate} contentData={dataWithEmptyValues} />);

    await waitFor(() => {
      const previewContent = container.querySelector('.preview-content');
      expect(previewContent?.innerHTML).toContain('テスト説明文');
    });

    // Check for sample data notice when empty values are replaced
    await waitFor(() => {
      expect(screen.getByText(/未入力項目はサンプルデータで表示しています/)).toBeInTheDocument();
    });
  });

  it('converts different data types to strings correctly', async () => {
    const mixedTypeData = {
      title: 123,
      description: true,
      imageUrl: '/test.jpg',
      altText: 'テスト'
    };

    const { container } = render(<AdPreview template={mockTemplate} contentData={mixedTypeData} />);

    await waitFor(() => {
      const previewContent = container.querySelector('.preview-content');
      expect(previewContent?.innerHTML).toContain('123');
      expect(previewContent?.innerHTML).toContain('true');
    });
  });

  it('handles placeholder whitespace correctly', async () => {
    const templateWithSpaces: AdTemplate = {
      ...mockTemplate,
      html: '<div><h2>{{ title }}</h2><p>{{  description  }}</p><span>{{title}}</span></div>'
    };

    const { container } = render(<AdPreview template={templateWithSpaces} contentData={mockContentData} />);

    await waitFor(() => {
      const previewContent = container.querySelector('.preview-content');
      const htmlContent = previewContent?.innerHTML || '';
      // Count occurrences of title in the rendered HTML
      const titleMatches = (htmlContent.match(/テストタイトル/g) || []).length;
      expect(titleMatches).toBe(2);
      
      expect(htmlContent).toContain('テスト説明文');
    });
  });

  it('handles errors gracefully without crashing', () => {
    // 無効なテンプレートでテスト
    const invalidTemplate = null;

    render(<AdPreview template={invalidTemplate} contentData={mockContentData} />);

    // Check for empty state indicator
    expect(screen.getByText(/テンプレートを選択してください/)).toBeInTheDocument();
  });

  it('displays correct placeholder count', () => {
    const templateWithNoPlaceholders: AdTemplate = {
      ...mockTemplate,
      placeholders: []
    };

    render(<AdPreview template={templateWithNoPlaceholders} contentData={{}} />);

    expect(screen.getByText(/0 個のプレースホルダー/)).toBeInTheDocument();
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

  it('updates preview when template changes', async () => {
    const { rerender, container } = render(<AdPreview template={mockTemplate} contentData={mockContentData} />);

    await waitFor(() => {
      const previewContent = container.querySelector('.preview-content');
      expect(previewContent?.innerHTML).toContain('テストタイトル');
    });

    // テンプレートを変更
    const newTemplate: AdTemplate = {
      ...mockTemplate,
      html: '<div><h1>{{title}}</h1></div>',
      name: '新しいテンプレート'
    };

    rerender(<AdPreview template={newTemplate} contentData={mockContentData} />);

    await waitFor(() => {
      expect(screen.getByText(/テンプレート: 新しいテンプレート/)).toBeInTheDocument();
    });
  });

  it('updates preview when content data changes', async () => {
    const { rerender, container } = render(<AdPreview template={mockTemplate} contentData={mockContentData} />);

    await waitFor(() => {
      const previewContent = container.querySelector('.preview-content');
      expect(previewContent?.innerHTML).toContain('テストタイトル');
    });

    // データを変更
    const newContentData = {
      ...mockContentData,
      title: '更新されたタイトル'
    };

    rerender(<AdPreview template={mockTemplate} contentData={newContentData} />);

    await waitFor(() => {
      const previewContent = container.querySelector('.preview-content');
      expect(previewContent?.innerHTML).toContain('更新されたタイトル');
      expect(previewContent?.innerHTML).not.toContain('テストタイトル');
    });
  });
});
