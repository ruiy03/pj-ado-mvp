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
    
    expect(screen.getByRole('heading', { level: 4 })).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls setShowNamingGuide when toggle button is clicked', () => {
    render(<ValidationGuide {...defaultProps} />);
    
    fireEvent.click(screen.getByRole('button'));
    
    expect(mockSetShowNamingGuide).toHaveBeenCalledWith(true);
  });

  it('calls setShowNamingGuide when header is clicked', () => {
    render(<ValidationGuide {...defaultProps} />);
    
    const header = screen.getByRole('heading', { level: 4 }).closest('div');
    fireEvent.click(header!);
    
    expect(mockSetShowNamingGuide).toHaveBeenCalledWith(true);
  });

  it('shows hide button when guide is visible', () => {
    const propsWithVisibleGuide = {
      ...defaultProps,
      showNamingGuide: true,
    };
    
    render(<ValidationGuide {...propsWithVisibleGuide} />);
    
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('shows and hides guide content based on showNamingGuide prop', () => {
    // Test when guide is hidden
    const { rerender } = render(<ValidationGuide {...defaultProps} />);
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    
    // Test when guide is visible
    rerender(<ValidationGuide {...defaultProps} showNamingGuide={true} />);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('has proper styling classes for blue theme', () => {
    const propsWithVisibleGuide = {
      ...defaultProps,
      showNamingGuide: true,
    };
    
    render(<ValidationGuide {...propsWithVisibleGuide} />);
    
    const headers = screen.getAllByRole('heading', { level: 4 });
    expect(headers[0]).toHaveClass('text-blue-900');
    
    const toggleButton = screen.getByRole('button');
    expect(toggleButton).toHaveClass('text-blue-600');
  });
});
