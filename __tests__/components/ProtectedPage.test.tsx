import { render, screen } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import ProtectedPage from '@/components/ProtectedPage';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock auth
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('ProtectedPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when user is authenticated', async () => {
    mockAuth.mockResolvedValue({
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
      expires: '2024-01-01',
    });

    const ProtectedPageComponent = await ProtectedPage({
      children: <div>Protected content</div>,
    });

    render(ProtectedPageComponent);

    expect(screen.getByText('Protected content')).toBeInTheDocument();
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('redirects to login when user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    await ProtectedPage({
      children: <div>Protected content</div>,
    });

    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('redirects to login when session exists but user is undefined', async () => {
    mockAuth.mockResolvedValue({
      user: undefined,
      expires: '2024-01-01',
    });

    await ProtectedPage({
      children: <div>Protected content</div>,
    });

    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('redirects to login when session user is null', async () => {
    mockAuth.mockResolvedValue({
      user: null,
      expires: '2024-01-01',
    });

    await ProtectedPage({
      children: <div>Protected content</div>,
    });

    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('handles auth function rejection gracefully', async () => {
    mockAuth.mockRejectedValue(new Error('Auth error'));

    await expect(
      ProtectedPage({
        children: <div>Protected content</div>,
      })
    ).rejects.toThrow('Auth error');

    expect(mockRedirect).not.toHaveBeenCalled();
  });
});
