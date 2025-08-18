import { render, screen, waitFor } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import ClientProtectedPage from '@/components/ClientProtectedPage';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
const mockPush = jest.fn();

describe('ClientProtectedPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRouter.mockReturnValue({
      push: mockPush,
    } as any);
  });

  it('renders children when user is authenticated', () => {
    mockUseSession.mockReturnValue({
      data: { user: { id: '1', email: 'test@example.com', role: 'admin' } },
      status: 'authenticated',
    } as any);

    render(
      <ClientProtectedPage>
        <div>Protected Content</div>
      </ClientProtectedPage>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('shows loading spinner when session is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    } as any);

    render(
      <ClientProtectedPage>
        <div>Protected Content</div>
      </ClientProtectedPage>
    );

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('redirects to login when user is not authenticated', async () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    } as any);

    render(
      <ClientProtectedPage>
        <div>Protected Content</div>
      </ClientProtectedPage>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to login when session exists but user is null', async () => {
    mockUseSession.mockReturnValue({
      data: { user: null },
      status: 'authenticated',
    } as any);

    render(
      <ClientProtectedPage>
        <div>Protected Content</div>
      </ClientProtectedPage>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects to login when session exists but user is undefined', async () => {
    mockUseSession.mockReturnValue({
      data: { user: undefined },
      status: 'authenticated',
    } as any);

    render(
      <ClientProtectedPage>
        <div>Protected Content</div>
      </ClientProtectedPage>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/login');
    });

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('returns null when not authenticated (before redirect)', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'unauthenticated',
    } as any);

    const { container } = render(
      <ClientProtectedPage>
        <div>Protected Content</div>
      </ClientProtectedPage>
    );

    expect(container.firstChild).toBeNull();
  });

  it('does not redirect when status is loading', () => {
    mockUseSession.mockReturnValue({
      data: null,
      status: 'loading',
    } as any);

    render(
      <ClientProtectedPage>
        <div>Protected Content</div>
      </ClientProtectedPage>
    );

    expect(mockPush).not.toHaveBeenCalled();
  });
});