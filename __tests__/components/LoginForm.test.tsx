import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {signIn} from 'next-auth/react';
import {useRouter} from 'next/navigation';
import LoginForm from '@/components/LoginForm';

// Mock next-auth/react
const mockUpdate = jest.fn();
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  useSession: jest.fn(),
}));

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockUseSession = require('next-auth/react').useSession as jest.MockedFunction<any>;

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);
    mockUseSession.mockReturnValue({
      update: mockUpdate,
    });
  });

  it('renders login form with all required fields', () => {
    render(<LoginForm/>);

    expect(screen.getByRole('heading', {name: 'ログイン'})).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    expect(screen.getByRole('button', {name: 'ログイン'})).toBeInTheDocument();
  });

  it('has proper form field attributes', () => {
    render(<LoginForm/>);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');

    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('name', 'email');
    expect(emailInput).toBeRequired();

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('name', 'password');
    expect(passwordInput).toBeRequired();
    expect(passwordInput).toHaveAttribute('minLength', '8');
  });

  it('calls signIn when form is submitted', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue(undefined);

    render(<LoginForm/>);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', {name: 'ログイン'});

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', expect.objectContaining({
        redirect: false,
      }));
    });

    // signInが呼ばれたことを確認
    expect(mockSignIn).toHaveBeenCalledTimes(1);
  });

  it('shows loading state during authentication', async () => {
    const user = userEvent.setup();
    mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<LoginForm/>);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', {name: 'ログイン'});

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');
    await user.click(submitButton);

    expect(screen.getByText('ログイン中...')).toBeInTheDocument();
    expect(submitButton).toHaveAttribute('aria-disabled', 'true');
  });

  it('shows redirect overlay when authentication succeeds', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ok: true});
    mockUpdate.mockResolvedValue(undefined);

    render(<LoginForm/>);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', {name: 'ログイン'});

    await user.type(emailInput, 'valid@example.com');
    await user.type(passwordInput, 'correctpassword');
    await user.click(submitButton);

    // リダイレクトオーバーレイが表示されることを確認
    await waitFor(() => {
      const overlays = screen.getAllByText('ダッシュボードに移動中...');
      expect(overlays.length).toBeGreaterThan(0);
    });
  });

  it('displays error message when authentication fails', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({error: 'CredentialsSignin'});

    render(<LoginForm/>);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', {name: 'ログイン'});

    await user.type(emailInput, 'invalid@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('メールアドレスまたはパスワードが正しくありません。')).toBeInTheDocument();
    });
  });

  it('redirects to dashboard when authentication succeeds', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValue({ok: true});
    mockUpdate.mockResolvedValue(undefined);

    render(<LoginForm/>);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', {name: 'ログイン'});

    await user.type(emailInput, 'valid@example.com');
    await user.type(passwordInput, 'correctpassword');
    await user.click(submitButton);

    // セッション更新が呼ばれることを確認
    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalled();
    });

    // リダイレクトが呼ばれることを確認（setTimeoutのため少し待つ）
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    }, { timeout: 300 });
  });

  it('clears error message on form interaction after error', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({error: 'CredentialsSignin'})
      .mockResolvedValueOnce({ok: true});

    render(<LoginForm/>);

    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    const submitButton = screen.getByRole('button', {name: 'ログイン'});

    // First failed attempt
    await user.type(emailInput, 'invalid@example.com');
    await user.type(passwordInput, 'wrongpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('メールアドレスまたはパスワードが正しくありません。')).toBeInTheDocument();
    });

    // Clear inputs and type new values - error should be cleared on form submission
    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.type(emailInput, 'valid@example.com');
    await user.type(passwordInput, 'correctpassword');
    
    // Start new submission - error message should be cleared before API call
    fireEvent.submit(screen.getByRole('form'));

    // Error message should be cleared immediately when new submission starts
    expect(screen.queryByText('メールアドレスまたはパスワードが正しくありません。')).not.toBeInTheDocument();
  });
});
