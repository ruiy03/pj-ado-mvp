import { render, screen, fireEvent } from '@testing-library/react';
import UserForm from '@/app/accounts/components/UserForm';
import type { User } from '@/lib/definitions';

// Mock user actions
jest.mock('@/lib/user-actions', () => ({
  createUser: jest.fn(),
  updateUser: jest.fn(),
}));

// Mock useActionState
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useActionState: jest.fn((action, initialState) => [initialState, action]),
}));

describe('UserForm', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  const defaultProps = {
    onClose: mockOnClose,
    onSuccess: mockOnSuccess,
  };

  const mockUser: User = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'hashedpassword',
    role: 'editor' as const,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders create user form when no user is provided', () => {
    render(<UserForm {...defaultProps} />);
    
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByLabelText('名前')).toBeInTheDocument();
    expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
    expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
    // Role is a hidden field in the component
    expect(screen.getByText('作成')).toBeInTheDocument();
    expect(screen.getByText('キャンセル')).toBeInTheDocument();
  });

  it('renders edit user form when user is provided', () => {
    const propsWithUser = {
      ...defaultProps,
      user: mockUser,
    };
    
    render(<UserForm {...propsWithUser} />);
    
    expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('更新')).toBeInTheDocument();
  });

  it('has proper form field attributes', () => {
    render(<UserForm {...defaultProps} />);
    
    const nameInput = screen.getByLabelText('名前');
    const emailInput = screen.getByLabelText('メールアドレス');
    const passwordInput = screen.getByLabelText('パスワード');
    
    expect(nameInput).toHaveAttribute('type', 'text');
    expect(nameInput).toHaveAttribute('name', 'name');
    expect(nameInput).toBeRequired();
    
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('name', 'email');
    expect(emailInput).toBeRequired();
    
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('name', 'password');
    expect(passwordInput).toBeRequired();
  });

  it('has hidden role field set to editor', () => {
    render(<UserForm {...defaultProps} />);
    
    const roleInput = screen.getByDisplayValue('editor');
    expect(roleInput).toHaveAttribute('type', 'hidden');
    expect(roleInput).toHaveAttribute('name', 'role');
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<UserForm {...defaultProps} />);
    
    fireEvent.click(screen.getByText('キャンセル'));
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('updates form values when inputs change', () => {
    render(<UserForm {...defaultProps} />);
    
    const nameInput = screen.getByLabelText('名前');
    const emailInput = screen.getByLabelText('メールアドレス');
    
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
    
    expect(nameInput).toHaveValue('New Name');
    expect(emailInput).toHaveValue('new@example.com');
  });

  it('includes hidden id field when editing user', () => {
    const propsWithUser = {
      ...defaultProps,
      user: mockUser,
    };
    
    render(<UserForm {...propsWithUser} />);
    
    const hiddenIdInput = screen.getByDisplayValue('1');
    expect(hiddenIdInput).toHaveAttribute('type', 'hidden');
    expect(hiddenIdInput).toHaveAttribute('name', 'id');
  });

  it('shows password as optional when editing user', () => {
    const propsWithUser = {
      ...defaultProps,
      user: mockUser,
    };
    
    render(<UserForm {...propsWithUser} />);
    
    const passwordInput = screen.getByLabelText(/パスワード.*変更する場合のみ/);
    expect(passwordInput).not.toBeRequired();
  });

  it('has modal overlay styling', () => {
    render(<UserForm {...defaultProps} />);
    
    const modalOverlay = screen.getByText('新しいユーザーを追加').closest('div')?.parentElement;
    expect(modalOverlay).toHaveClass('fixed', 'inset-0', 'bg-black', 'bg-opacity-50');
  });

  it('displays form validation state correctly', () => {
    // Mock useActionState to return an error state
    const mockUseActionState = jest.requireMock('react').useActionState;
    mockUseActionState.mockReturnValue([
      { message: 'Email already exists', success: false },
      jest.fn()
    ]);
    
    render(<UserForm {...defaultProps} />);
    
    expect(screen.getByText('Email already exists')).toBeInTheDocument();
  });

  it('always sets role to editor in hidden field', () => {
    const propsWithUser = {
      ...defaultProps,
      user: mockUser,
    };
    
    render(<UserForm {...propsWithUser} />);
    
    // Role is always set to 'editor' via hidden input
    const roleInput = screen.getByDisplayValue('editor');
    expect(roleInput).toHaveAttribute('type', 'hidden');
    expect(roleInput).toHaveAttribute('name', 'role');
  });
});
