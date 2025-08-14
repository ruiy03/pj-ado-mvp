import { render, screen, fireEvent } from '@testing-library/react';
import UserList from '@/app/accounts/components/UserList';
import type { User } from '@/lib/definitions';

describe('UserList', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnAddUser = jest.fn();

  const mockUsers: User[] = [
    {
      id: 1,
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'hashedpassword',
      role: 'admin',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'Editor User',
      email: 'editor@example.com',
      password: 'hashedpassword',
      role: 'editor',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z',
    },
  ];

  const defaultProps = {
    users: mockUsers,
    loading: false,
    currentUserId: 1,
    onEdit: mockOnEdit,
    onDelete: mockOnDelete,
    onAddUser: mockOnAddUser,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders user list with header and add button', () => {
    render(<UserList {...defaultProps} />);
    
    expect(screen.getByText('アカウント管理')).toBeInTheDocument();
    expect(screen.getByText('新しいアカウントを追加')).toBeInTheDocument();
  });

  it('calls onAddUser when add button is clicked', () => {
    render(<UserList {...defaultProps} />);
    
    fireEvent.click(screen.getByText('新しいアカウントを追加'));
    
    expect(mockOnAddUser).toHaveBeenCalledTimes(1);
  });

  it('displays loading state', () => {
    const propsWithLoading = {
      ...defaultProps,
      loading: true,
    };
    
    render(<UserList {...propsWithLoading} />);
    
    expect(screen.getByText('読み込み中...')).toBeInTheDocument();
  });

  it('displays empty state when no users', () => {
    const propsWithEmptyList = {
      ...defaultProps,
      users: [],
    };
    
    render(<UserList {...propsWithEmptyList} />);
    
    expect(screen.getByText('ユーザーがいません')).toBeInTheDocument();
    expect(screen.getByText('新しいアカウントを追加してください')).toBeInTheDocument();
  });

  it('renders user information correctly', () => {
    render(<UserList {...defaultProps} />);
    
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.getByText('admin@example.com')).toBeInTheDocument();
    expect(screen.getByText('Editor User')).toBeInTheDocument();
    expect(screen.getByText('editor@example.com')).toBeInTheDocument();
  });

  it('displays role badges with correct colors', () => {
    render(<UserList {...defaultProps} />);
    
    const adminBadge = screen.getByText('管理者');
    const editorBadge = screen.getByText('編集者');
    
    expect(adminBadge).toHaveClass('bg-red-100', 'text-red-800');
    expect(editorBadge).toHaveClass('bg-blue-100', 'text-blue-800');
  });

  it('calls onEdit when edit button is clicked', () => {
    render(<UserList {...defaultProps} />);
    
    const editButtons = screen.getAllByText('編集');
    fireEvent.click(editButtons[0]);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockUsers[0]);
  });

  it('calls onDelete when delete button is clicked', () => {
    render(<UserList {...defaultProps} />);
    
    const deleteButtons = screen.getAllByText('削除');
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnDelete).toHaveBeenCalledWith(2);
  });

  it('hides delete button for current admin user', () => {
    render(<UserList {...defaultProps} />);
    
    const deleteButtons = screen.getAllByText('削除');
    
    // Only one delete button should be visible since first user is admin and current user
    expect(deleteButtons).toHaveLength(1);
  });

  it('shows delete button for non-current users', () => {
    render(<UserList {...defaultProps} />);
    
    // Second user (editor, not current user) should have delete button
    const deleteButtons = screen.getAllByText('削除');
    expect(deleteButtons).toHaveLength(1);
  });

  it('displays creation dates correctly', () => {
    render(<UserList {...defaultProps} />);
    
    expect(screen.getByText('2024/1/1')).toBeInTheDocument();
    expect(screen.getByText('2024/1/2')).toBeInTheDocument();
  });

  it('handles users with undefined dates gracefully', () => {
    const usersWithUndefinedDates = [
      {
        ...mockUsers[0],
        created_at: undefined,
      },
    ];
    
    const propsWithUndefinedDates = {
      ...defaultProps,
      users: usersWithUndefinedDates,
    };
    
    render(<UserList {...propsWithUndefinedDates} />);
    
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    // Should not crash when date is undefined
  });

  it('shows table headers correctly', () => {
    render(<UserList {...defaultProps} />);
    
    expect(screen.getByText('ユーザー')).toBeInTheDocument();
    expect(screen.getByText('役割')).toBeInTheDocument();
    expect(screen.getByText('作成日')).toBeInTheDocument();
    expect(screen.getByText('操作')).toBeInTheDocument();
  });

  it('renders correct number of user rows', () => {
    render(<UserList {...defaultProps} />);
    
    // Should have 2 user rows plus header row
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(3); // 1 header + 2 data rows
  });

  it('handles single user correctly', () => {
    const propsWithSingleUser = {
      ...defaultProps,
      users: [mockUsers[0]],
    };
    
    render(<UserList {...propsWithSingleUser} />);
    
    expect(screen.getByText('Admin User')).toBeInTheDocument();
    expect(screen.queryByText('Editor User')).not.toBeInTheDocument();
    
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(2); // 1 header + 1 data row
  });
});