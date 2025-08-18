import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ImageUpload from '@/components/ImageUpload';

// Next.js Image コンポーネントのモック
jest.mock('next/image', () => {
  return function MockedImage({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />;
  };
});

// fetch API のモック
global.fetch = jest.fn();
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('ImageUpload', () => {
  const mockOnUpload = jest.fn();
  const mockOnRemove = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('初期状態で正しくレンダリングされる', () => {
    render(<ImageUpload onUpload={mockOnUpload} />);
    
    expect(screen.getByText('画像をドラッグ&ドロップまたはクリックして選択')).toBeInTheDocument();
    expect(screen.getByText('最大5MB・JPEG、PNG、GIF、WebP')).toBeInTheDocument();
    expect(screen.getByText('📁')).toBeInTheDocument();
  });

  it('カスタムプレースホルダーと最大サイズが正しく表示される', () => {
    render(
      <ImageUpload 
        onUpload={mockOnUpload} 
        placeholder="カスタムプレースホルダー" 
        maxSizeMB={10}
      />
    );
    
    expect(screen.getByText('カスタムプレースホルダー')).toBeInTheDocument();
    expect(screen.getByText('最大10MB・JPEG、PNG、GIF、WebP')).toBeInTheDocument();
  });

  it('現在の画像がある場合、画像が表示される', () => {
    render(
      <ImageUpload 
        onUpload={mockOnUpload} 
        onRemove={mockOnRemove}
        currentImageUrl="/test-image.jpg" 
      />
    );
    
    expect(screen.getByAltText('アップロード済み画像')).toBeInTheDocument();
    expect(screen.getByText('画像を変更')).toBeInTheDocument();
    expect(screen.getByText('削除')).toBeInTheDocument();
  });

  it('削除ボタンが正しく動作する', async () => {
    const user = userEvent.setup();
    
    render(
      <ImageUpload 
        onUpload={mockOnUpload} 
        onRemove={mockOnRemove}
        currentImageUrl="/test-image.jpg" 
      />
    );
    
    const deleteButton = screen.getByText('削除');
    await user.click(deleteButton);
    
    expect(mockOnRemove).toHaveBeenCalledTimes(1);
  });

  it('ファイル選択が正しく動作する', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        url: '/uploaded/test.jpg',
        filename: 'test.jpg',
        size: 1024,
        mimeType: 'image/jpeg'
      })
    } as Response);

    render(<ImageUpload onUpload={mockOnUpload} />);
    
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    
    await user.upload(hiddenInput, mockFile);
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/upload?filename=test.jpg',
        expect.objectContaining({
          method: 'POST',
          body: mockFile
        })
      );
    });

    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith({
        url: '/uploaded/test.jpg',
        filename: 'test.jpg',
        size: 1024,
        mimeType: 'image/jpeg'
      });
    });
  });

  it('ファイルサイズエラーが正しく処理される', async () => {
    const user = userEvent.setup();
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    
    render(<ImageUpload onUpload={mockOnUpload} maxSizeMB={5} />);
    
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(hiddenInput, largeFile);
    
    // エラーが発生することを確認（onUploadが呼ばれないことで確認）
    await waitFor(() => {
      expect(mockOnUpload).not.toHaveBeenCalled();
    });
  });

  it('対応していないファイル形式エラーが正しく処理される', async () => {
    const user = userEvent.setup();
    const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    render(<ImageUpload onUpload={mockOnUpload} />);
    
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(hiddenInput, textFile);
    
    // エラーが発生することを確認（onUploadが呼ばれないことで確認）
    await waitFor(() => {
      expect(mockOnUpload).not.toHaveBeenCalled();
    });
  });

  it('アップロードAPIエラーが正しく処理される', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    render(<ImageUpload onUpload={mockOnUpload} />);
    
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(hiddenInput, mockFile);
    
    // エラーが発生することを確認（onUploadが呼ばれないことで確認）
    await waitFor(() => {
      expect(mockOnUpload).not.toHaveBeenCalled();
    });
  });

  it('ドラッグ&ドロップが正しく動作する', async () => {
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        url: '/uploaded/test.jpg',
        filename: 'test.jpg',
        size: 1024,
        mimeType: 'image/jpeg'
      })
    } as Response);

    render(<ImageUpload onUpload={mockOnUpload} />);
    
    // ドロップゾーンを正確に取得
    const dropZone = document.querySelector('.w-full.h-40.border-2.border-dashed') as HTMLElement;
    expect(dropZone).toBeInTheDocument();
    
    // ドラッグオーバー
    fireEvent.dragOver(dropZone);
    expect(dropZone).toHaveClass('border-blue-400', 'bg-blue-50');
    
    // ドロップ
    fireEvent.drop(dropZone, {
      dataTransfer: {
        files: [mockFile]
      }
    });
    
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalled();
    });
  });

  it('無効化状態で正しく動作する', () => {
    render(<ImageUpload onUpload={mockOnUpload} disabled={true} />);
    
    const dropZone = document.querySelector('.w-full.h-40.border-2.border-dashed') as HTMLElement;
    expect(dropZone).toHaveClass('border-gray-200', 'bg-gray-50', 'cursor-not-allowed');
  });

  it('ファイルアップロードが正しく動作する', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        url: '/uploaded/test.jpg',
        filename: 'test.jpg',
        size: 1024,
        mimeType: 'image/jpeg'
      })
    } as Response);

    render(<ImageUpload onUpload={mockOnUpload} />);
    
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(hiddenInput, mockFile);
    
    // アップロードが完了することを確認
    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith({
        url: '/uploaded/test.jpg',
        filename: 'test.jpg',
        size: 1024,
        mimeType: 'image/jpeg'
      });
    });
  });

  it('現在の画像がある状態でファイル変更が正しく動作する', async () => {
    const user = userEvent.setup();
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        url: '/uploaded/test.jpg',
        filename: 'test.jpg',
        size: 1024,
        mimeType: 'image/jpeg'
      })
    } as Response);

    render(
      <ImageUpload 
        onUpload={mockOnUpload} 
        onRemove={mockOnRemove}
        currentImageUrl="/current-image.jpg" 
      />
    );
    
    const changeButton = screen.getByText('画像を変更');
    await user.click(changeButton);
    
    const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    await user.upload(hiddenInput, mockFile);
    
    // アップロードが完了することを確認
    await waitFor(() => {
      expect(mockOnUpload).toHaveBeenCalledWith({
        url: '/uploaded/test.jpg',
        filename: 'test.jpg',
        size: 1024,
        mimeType: 'image/jpeg'
      });
    });
  });

  it('許可されている画像形式が正しく処理される', async () => {
    const user = userEvent.setup();
    const allowedFormats = [
      { name: 'test.jpg', type: 'image/jpeg' },
      { name: 'test.jpeg', type: 'image/jpeg' },
      { name: 'test.png', type: 'image/png' },
      { name: 'test.gif', type: 'image/gif' },
      { name: 'test.webp', type: 'image/webp' }
    ];
    
    for (const format of allowedFormats) {
      const mockFile = new File(['test'], format.name, { type: format.type });
      
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          url: `/uploaded/${format.name}`,
          filename: format.name,
          size: 1024,
          mimeType: format.type
        })
      } as Response);

      render(<ImageUpload onUpload={mockOnUpload} />);
      
      const hiddenInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      await user.upload(hiddenInput, mockFile);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });
      
      // 各テスト後にクリーンアップ
      mockFetch.mockClear();
      document.body.innerHTML = '';
    }
  });
});
