import { render, screen, fireEvent } from '@testing-library/react';
import ValidationGuide from '@/app/ad-templates/components/ValidationGuide';

describe('ValidationGuide', () => {
  const mockSetShowNamingGuide = jest.fn();

  const defaultProps = {
    showNamingGuide: false,
    setShowNamingGuide: mockSetShowNamingGuide,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders validation guide header', () => {
    render(<ValidationGuide {...defaultProps} />);
    
    expect(screen.getByText('プレースホルダー命名規則')).toBeInTheDocument();
    expect(screen.getByText('表示する')).toBeInTheDocument();
  });

  it('calls setShowNamingGuide when toggle button is clicked', () => {
    render(<ValidationGuide {...defaultProps} />);
    
    fireEvent.click(screen.getByText('表示する'));
    
    expect(mockSetShowNamingGuide).toHaveBeenCalledWith(true);
  });

  it('calls setShowNamingGuide when header is clicked', () => {
    render(<ValidationGuide {...defaultProps} />);
    
    const header = screen.getByText('プレースホルダー命名規則').closest('div');
    fireEvent.click(header!);
    
    expect(mockSetShowNamingGuide).toHaveBeenCalledWith(true);
  });

  it('shows "非表示にする" when guide is visible', () => {
    const propsWithVisibleGuide = {
      ...defaultProps,
      showNamingGuide: true,
    };
    
    render(<ValidationGuide {...propsWithVisibleGuide} />);
    
    expect(screen.getByText('非表示にする')).toBeInTheDocument();
  });

  it('displays all category sections when guide is visible', () => {
    const propsWithVisibleGuide = {
      ...defaultProps,
      showNamingGuide: true,
    };
    
    render(<ValidationGuide {...propsWithVisibleGuide} />);
    
    // Check main sections are visible
    expect(screen.getByText('プレースホルダー命名規則')).toBeInTheDocument();
    expect(screen.getByText('プレースホルダー例とサンプル出力')).toBeInTheDocument();
    
    // Check for some key categories - using getAllByText since they appear multiple times
    expect(screen.getAllByText('画像').length).toBeGreaterThan(0);
    expect(screen.getAllByText('URL').length).toBeGreaterThan(0);
    expect(screen.getAllByText('タイトル').length).toBeGreaterThan(0);
    expect(screen.getAllByText('説明文').length).toBeGreaterThan(0);
  });

  it('displays keyword tags in each category when guide is visible', () => {
    const propsWithVisibleGuide = {
      ...defaultProps,
      showNamingGuide: true,
    };
    
    render(<ValidationGuide {...propsWithVisibleGuide} />);
    
    // Check some specific keyword tags
    expect(screen.getByText('Image')).toBeInTheDocument();
    expect(screen.getByText('Url')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
    expect(screen.getByText('Price')).toBeInTheDocument();
    expect(screen.getByText('Button')).toBeInTheDocument();
  });

  it('shows hint text when guide is visible', () => {
    const propsWithVisibleGuide = {
      ...defaultProps,
      showNamingGuide: true,
    };
    
    render(<ValidationGuide {...propsWithVisibleGuide} />);
    
    expect(screen.getByText('💡 ヒント:')).toBeInTheDocument();
    expect(screen.getByText(/これらのキーワードを含む名前を使用すると/)).toBeInTheDocument();
  });

  it('displays detailed examples table when guide is visible', () => {
    const propsWithVisibleGuide = {
      ...defaultProps,
      showNamingGuide: true,
    };
    
    render(<ValidationGuide {...propsWithVisibleGuide} />);
    
    expect(screen.getByText('プレースホルダー例とサンプル出力')).toBeInTheDocument();
    expect(screen.getByText('カテゴリ')).toBeInTheDocument();
    expect(screen.getByText('プレースホルダー例')).toBeInTheDocument();
    expect(screen.getByText('サンプル出力')).toBeInTheDocument();
  });

  it('shows specific placeholder examples in table when guide is visible', () => {
    const propsWithVisibleGuide = {
      ...defaultProps,
      showNamingGuide: true,
    };
    
    render(<ValidationGuide {...propsWithVisibleGuide} />);
    
    // Check some specific placeholder examples
    expect(screen.getByText('productImage')).toBeInTheDocument();
    expect(screen.getByText('productUrl')).toBeInTheDocument();
    expect(screen.getByText('productTitle')).toBeInTheDocument();
    expect(screen.getByText('ctaButton')).toBeInTheDocument();
  });

  it('shows sample output values in table when guide is visible', () => {
    const propsWithVisibleGuide = {
      ...defaultProps,
      showNamingGuide: true,
    };
    
    render(<ValidationGuide {...propsWithVisibleGuide} />);
    
    // Check sample output values - need to handle the exact URL
    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('サンプルタイトル')).toBeInTheDocument();
    expect(screen.getByText('無料')).toBeInTheDocument();
    expect(screen.getByText('今すぐ登録')).toBeInTheDocument();
    expect(screen.getByText('🚀')).toBeInTheDocument();
  });

  it('does not show guide content when showNamingGuide is false', () => {
    render(<ValidationGuide {...defaultProps} />);
    
    expect(screen.queryByText('画像')).not.toBeInTheDocument();
    expect(screen.queryByText('プレースホルダー例とサンプル出力')).not.toBeInTheDocument();
    expect(screen.queryByText('💡 ヒント:')).not.toBeInTheDocument();
  });

  it('has proper styling classes for blue theme', () => {
    const propsWithVisibleGuide = {
      ...defaultProps,
      showNamingGuide: true,
    };
    
    render(<ValidationGuide {...propsWithVisibleGuide} />);
    
    const header = screen.getByText('プレースホルダー命名規則');
    expect(header).toHaveClass('text-blue-900');
    
    const toggleButton = screen.getByText('非表示にする');
    expect(toggleButton).toHaveClass('text-blue-600');
  });
});