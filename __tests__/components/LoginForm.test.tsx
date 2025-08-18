import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {signIn} from 'next-auth/react';
import LoginForm from '@/components/LoginForm';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
}));

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;

// Mock window.location.href
delete (window as any).location;
window.location = {href: ''} as any;

describe('LoginForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.location.href = '';
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

    const form = screen.getByRole('form');
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    fireEvent.submit(form);

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

  it('clears error message on new submission attempt', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce({error: 'CredentialsSignin'})
      .mockResolvedValueOnce(undefined);

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

    // Second successful attempt
    await user.clear(emailInput);
    await user.clear(passwordInput);
    await user.type(emailInput, 'valid@example.com');
    await user.type(passwordInput, 'correctpassword');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText('メールアドレスまたはパスワードが正しくありません。')).not.toBeInTheDocument();
    });
  });
});
