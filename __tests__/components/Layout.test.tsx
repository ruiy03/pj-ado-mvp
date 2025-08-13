import { render, screen } from '@testing-library/react';
import Layout from '@/components/Layout';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

import { useSession } from 'next-auth/react';
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

// Mock Sidebar component
jest.mock('@/components/Sidebar', () => {
  return function MockSidebar() {
    return <div data-testid="sidebar">Sidebar</div>;
  };
});

describe('Layout', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
      update: jest.fn(),
    });

    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders authenticated layout when user is logged in', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
        expires: '2024-01-01',
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('Test content').closest('main')).toHaveClass('ml-64');
  });

  it('renders unauthenticated layout when user is not logged in', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.getByText('LMG 広告管理')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
    expect(screen.getByText('Test content').closest('main')).not.toHaveClass('ml-64');
  });

  it('applies correct styling to authenticated main content', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '1', name: 'Test User', email: 'test@example.com' },
        expires: '2024-01-01',
      },
      status: 'authenticated',
      update: jest.fn(),
    });

    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    const mainElement = screen.getByText('Test content').closest('main');
    expect(mainElement).toHaveClass('flex-1', 'ml-64', 'p-8', 'bg-gray-50', 'min-h-screen');
  });

  it('applies correct styling to unauthenticated main content', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
      update: jest.fn(),
    });

    render(
      <Layout>
        <div>Test content</div>
      </Layout>
    );

    const mainElement = screen.getByText('Test content').closest('main');
    expect(mainElement).toHaveClass('p-8', 'bg-gray-50', 'min-h-screen');
    expect(mainElement).not.toHaveClass('ml-64');
  });
});
