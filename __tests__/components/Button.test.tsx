import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('renders button with children', () => {
    render(<Button>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = { current: null };
    render(<Button ref={ref}>Test</Button>);
    
    expect(ref.current).not.toBeNull();
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it('applies custom className along with default styles', () => {
    render(<Button className="custom-class">Test</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
    expect(button).toHaveClass('bg-blue-600');
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('passes through button props', () => {
    render(
      <Button type="submit" disabled aria-label="Submit form">
        Submit
      </Button>
    );
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-label', 'Submit form');
  });

  it('applies disabled styling when aria-disabled is true', () => {
    render(<Button aria-disabled="true">Disabled</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('aria-disabled:cursor-not-allowed');
    expect(button).toHaveClass('aria-disabled:opacity-50');
  });
});