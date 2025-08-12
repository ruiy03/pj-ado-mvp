import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { signIn } from 'next-auth/react';
import LoginForm from '@/components/LoginForm';

// next-auth/reactのsignInをモック
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('フォーム要素が正しくレンダリングされる', () => {
    render(<LoginForm />);
    
    expect(screen.getByRole('heading', { name: 'ログイン' })).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'ログイン' })).toBeInTheDocument();
  });

  it('メールアドレスとパスワードを入力できる', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123456');
    
    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('123456');
  });

  it('フォーム送信時にsignInが呼ばれる', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({ ok: true } as any);
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123456');
    await user.click(submitButton);
    
    expect(mockSignIn).toHaveBeenCalledWith('credentials', {
      email: 'test@example.com',
      password: '123456',
      redirectTo: '/dashboard',
    });
  });

  it('送信中はローディング状態が表示される', async () => {
    const user = userEvent.setup();
    mockSignIn.mockImplementation(() => new Promise(() => {})); // Promise that never resolves
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    
    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, '123456');
    await user.click(submitButton);
    
    expect(screen.getByText('ログイン中...')).toBeInTheDocument();
    expect(screen.getByRole('button')).toHaveAttribute('aria-disabled', 'true');
  });

  it('エラー時にエラーメッセージが表示される', async () => {
    const user = userEvent.setup();
    
    mockSignIn.mockRejectedValueOnce(new Error('認証エラー'));
    
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', { name: 'ログイン' });
    
    await user.type(emailInput, 'wrong@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('メールアドレスまたはパスワードが正しくありません。')).toBeInTheDocument();
    });
  });

  it('必須フィールドのvalidationが動作する', () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(passwordInput).toHaveAttribute('minLength', '8');
  });

  it('正しいinput typeが設定されている', () => {
    render(<LoginForm />);
    
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
