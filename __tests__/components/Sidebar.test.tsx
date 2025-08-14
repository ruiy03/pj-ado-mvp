import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock lib/actions
jest.mock('@/lib/actions', () => ({
  logout: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('Sidebar', () => {
  beforeEach(() => {
    mockUsePathname.mockReturnValue('/dashboard');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders system title and logout button', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Test User', role: 'admin' },
      },
      status: 'authenticated',
    });

    render(<Sidebar />);
    
    expect(screen.getByText('広告管理システム')).toBeInTheDocument();
    expect(screen.getByText('ログアウト')).toBeInTheDocument();
  });

  it('displays user name and role for admin', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: '管理者太郎', role: 'admin' },
      },
      status: 'authenticated',
    });

    render(<Sidebar />);
    
    expect(screen.getByText('管理者太郎 (管理者)')).toBeInTheDocument();
  });

  it('displays user name and role for editor', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: '編集者花子', role: 'editor' },
      },
      status: 'authenticated',
    });

    render(<Sidebar />);
    
    expect(screen.getByText('編集者花子 (編集者)')).toBeInTheDocument();
  });

  it('shows all menu items for admin user', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Admin User', role: 'admin' },
      },
      status: 'authenticated',
    });

    render(<Sidebar />);
    
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('広告テンプレート')).toBeInTheDocument();
    expect(screen.getByText('URLテンプレート')).toBeInTheDocument();
    expect(screen.getByText('広告管理')).toBeInTheDocument();
    expect(screen.getByText('記事と広告の紐付け')).toBeInTheDocument();
    expect(screen.getByText('アカウント管理')).toBeInTheDocument();
  });

  it('shows limited menu items for editor user', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Editor User', role: 'editor' },
      },
      status: 'authenticated',
    });

    render(<Sidebar />);
    
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('広告テンプレート')).toBeInTheDocument();
    expect(screen.getByText('URLテンプレート')).toBeInTheDocument();
    expect(screen.getByText('広告管理')).toBeInTheDocument();
    expect(screen.getByText('記事と広告の紐付け')).toBeInTheDocument();
    expect(screen.queryByText('アカウント管理')).not.toBeInTheDocument();
  });

  it('shows only dashboard for users without editor/admin role', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Regular User', role: 'user' },
      },
      status: 'authenticated',
    });

    render(<Sidebar />);
    
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.queryByText('広告テンプレート')).not.toBeInTheDocument();
    expect(screen.queryByText('アカウント管理')).not.toBeInTheDocument();
  });

  it('highlights active menu item based on pathname', () => {
    mockUsePathname.mockReturnValue('/ad-templates');
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Test User', role: 'admin' },
      },
      status: 'authenticated',
    });

    render(<Sidebar />);
    
    const activeLink = screen.getByRole('link', { name: /広告テンプレート/ });
    expect(activeLink).toHaveClass('bg-blue-600', 'text-white');
  });

  it('handles missing session gracefully', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(<Sidebar />);
    
    expect(screen.getByText('広告管理システム')).toBeInTheDocument();
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
  });

  it('displays unknown role when role is undefined', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Test User' }, // role is undefined
      },
      status: 'authenticated',
    });

    render(<Sidebar />);
    
    expect(screen.getByText('Test User (不明)')).toBeInTheDocument();
  });
});