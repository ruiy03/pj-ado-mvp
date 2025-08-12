import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/Button';

describe('Button', () => {
  it('テキストが正しくレンダリングされる', () => {
    render(<Button>テストボタン</Button>);
    
    const button = screen.getByRole('button', { name: 'テストボタン' });
    expect(button).toBeInTheDocument();
  });

  it('classNameが正しく適用される', () => {
    render(<Button className="custom-class">ボタン</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('disabled状態が正しく動作する', () => {
    render(<Button disabled>無効ボタン</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
  });

  it('aria-disabled属性が正しく適用される', () => {
    render(<Button aria-disabled={true}>無効ボタン</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('その他のpropsが正しく渡される', () => {
    render(<Button type="submit" id="test-button">送信</Button>);
    
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
    expect(button).toHaveAttribute('id', 'test-button');
  });

  it('refが正しく転送される', () => {
    const ref = React.createRef<HTMLButtonElement>();
    render(<Button ref={ref}>ボタン</Button>);
    
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });
});
