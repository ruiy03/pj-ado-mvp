import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import ClientLayout from '@/components/ClientLayout';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock Sidebar component
jest.mock('@/components/Sidebar', () => {
  return jest.fn(() => <div data-testid="sidebar">Sidebar Component</div>);
});

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('ClientLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    });

    render(
      <ClientLayout>
        <div>Test Content</div>
      </ClientLayout>
    );

    expect(screen.getByTestId('loading-spinner')).toHaveClass('animate-spin');
    expect(screen.queryByText('Test Content')).not.toBeInTheDocument();
  });

  it('renders authenticated layout when user is logged in', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '1', email: 'test@example.com', role: 'admin' },
      },
      status: 'authenticated',
    });

    render(
      <ClientLayout>
        <div>Test Content</div>
      </ClientLayout>
    );

    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    
    // Check that main content has the authenticated layout classes
    const mainContent = screen.getByText('Test Content').closest('main');
    expect(mainContent).toHaveClass('ml-64');
  });

  it('renders unauthenticated layout when user is not logged in', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(
      <ClientLayout>
        <div>Test Content</div>
      </ClientLayout>
    );

    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.getByText('LMG 広告管理')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
    
    // Check that main content does not have the ml-64 class
    const mainContent = screen.getByText('Test Content').closest('main');
    expect(mainContent).not.toHaveClass('ml-64');
  });

  it('renders unauthenticated layout when session data is null', () => {
    mockUseSession.mockReturnValue({
      data: { user: null },
      status: 'unauthenticated',
    });

    render(
      <ClientLayout>
        <div>Test Content</div>
      </ClientLayout>
    );

    expect(screen.queryByTestId('sidebar')).not.toBeInTheDocument();
    expect(screen.getByText('LMG 広告管理')).toBeInTheDocument();
  });

  it('renders multiple children correctly in authenticated layout', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '1', email: 'test@example.com', role: 'admin' },
      },
      status: 'authenticated',
    });

    render(
      <ClientLayout>
        <div>First Child</div>
        <div>Second Child</div>
      </ClientLayout>
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
  });

  it('renders multiple children correctly in unauthenticated layout', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(
      <ClientLayout>
        <div>First Child</div>
        <div>Second Child</div>
      </ClientLayout>
    );

    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
    expect(screen.getByText('LMG 広告管理')).toBeInTheDocument();
  });

  it('has proper styling for authenticated main content', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { id: '1', email: 'test@example.com', role: 'admin' },
      },
      status: 'authenticated',
    });

    render(
      <ClientLayout>
        <div>Test Content</div>
      </ClientLayout>
    );

    const mainContent = screen.getByText('Test Content').closest('main');
    expect(mainContent).toHaveClass('flex-1', 'ml-64', 'p-8', 'bg-gray-50', 'min-h-screen');
  });

  it('has proper styling for unauthenticated main content', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    });

    render(
      <ClientLayout>
        <div>Test Content</div>
      </ClientLayout>
    );

    const mainContent = screen.getByText('Test Content').closest('main');
    expect(mainContent).toHaveClass('p-8', 'bg-gray-50', 'min-h-screen');
    expect(mainContent).not.toHaveClass('ml-64');
  });
});