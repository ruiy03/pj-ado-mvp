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

    const { container } = render(<Sidebar />);
    
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(container.querySelector('form[action]')).toBeInTheDocument(); // logout form
  });

  it('displays user name and role for admin', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: '管理者太郎', role: 'admin' },
      },
      status: 'authenticated',
    });

    const { container } = render(<Sidebar />);
    
    expect(container.textContent).toContain('管理者太郎');
    expect(container.textContent).toContain('管理者');
  });

  it('displays user name and role for editor', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: '編集者花子', role: 'editor' },
      },
      status: 'authenticated',
    });

    const { container } = render(<Sidebar />);
    
    expect(container.textContent).toContain('編集者花子');
    expect(container.textContent).toContain('編集者');
  });

  it('shows all menu items for admin user', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Admin User', role: 'admin' },
      },
      status: 'authenticated',
    });

    render(<Sidebar />);
    
    expect(screen.getByRole('link', { name: /ダッシュボード/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /広告テンプレート/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /URLテンプレート/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /広告管理/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /記事と広告の紐付け/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /アカウント管理/ })).toBeInTheDocument();
  });

  it('shows limited menu items for editor user', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Editor User', role: 'editor' },
      },
      status: 'authenticated',
    });

    render(<Sidebar />);
    
    expect(screen.getByRole('link', { name: /ダッシュボード/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /広告テンプレート/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /URLテンプレート/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /広告管理/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /記事と広告の紐付け/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /アカウント管理/ })).not.toBeInTheDocument();
  });

  it('shows only dashboard for users without editor/admin role', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Regular User', role: 'user' },
      },
      status: 'authenticated',
    });

    render(<Sidebar />);
    
    expect(screen.getByRole('link', { name: /ダッシュボード/ })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /広告テンプレート/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /アカウント管理/ })).not.toBeInTheDocument();
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
    
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ダッシュボード/ })).toBeInTheDocument();
  });

  it('displays unknown role when role is undefined', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'Test User' }, // role is undefined
      },
      status: 'authenticated',
    });

    const { container } = render(<Sidebar />);
    
    expect(container.textContent).toContain('Test User');
    expect(container.textContent).toContain('不明');
  });
});
