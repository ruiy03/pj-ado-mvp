import { render } from '@testing-library/react';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import ProtectedPage from '@/components/ProtectedPage';

// Mock next/navigation - redirect throws an error to stop execution
jest.mock('next/navigation', () => ({
  redirect: jest.fn().mockImplementation((url: string) => {
    throw new Error(`NEXT_REDIRECT: ${url}`);
  }),
}));

// Mock auth
jest.mock('@/auth', () => ({
  auth: jest.fn(),
}));

const mockRedirect = redirect as jest.MockedFunction<typeof redirect>;
const mockAuth = auth as jest.MockedFunction<typeof auth>;

describe('ProtectedPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset redirect mock to its default behavior
    mockRedirect.mockImplementation((url: string) => {
      throw new Error(`NEXT_REDIRECT: ${url}`);
    });
  });

  it('renders children when user is authenticated', async () => {
    mockAuth.mockResolvedValue({
      user: { id: '1', email: 'test@example.com', role: 'admin' },
    } as any);

    const TestComponent = () => <div>Protected Content</div>;
    
    const result = await ProtectedPage({ children: <TestComponent /> });
    const { container } = render(result);
    
    expect(container.textContent).toBe('Protected Content');
    expect(mockRedirect).not.toHaveBeenCalled();
  });

  it('redirects to login when user is not authenticated', async () => {
    mockAuth.mockResolvedValue(null);

    const TestComponent = () => <div>Protected Content</div>;
    
    await expect(async () => {
      await ProtectedPage({ children: <TestComponent /> });
    }).rejects.toThrow('NEXT_REDIRECT: /login');
    
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('redirects to login when session exists but user is null', async () => {
    mockAuth.mockResolvedValue({ user: null } as any);

    const TestComponent = () => <div>Protected Content</div>;
    
    await expect(async () => {
      await ProtectedPage({ children: <TestComponent /> });
    }).rejects.toThrow('NEXT_REDIRECT: /login');
    
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });

  it('redirects to login when session exists but user is undefined', async () => {
    mockAuth.mockResolvedValue({ user: undefined } as any);

    const TestComponent = () => <div>Protected Content</div>;
    
    await expect(async () => {
      await ProtectedPage({ children: <TestComponent /> });
    }).rejects.toThrow('NEXT_REDIRECT: /login');
    
    expect(mockRedirect).toHaveBeenCalledWith('/login');
  });
});