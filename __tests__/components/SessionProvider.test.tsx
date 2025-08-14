import { render, screen } from '@testing-library/react';
import NextAuthSessionProvider from '@/components/SessionProvider';
import { Session } from 'next-auth';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children, session }: { children: React.ReactNode; session?: Session | null }) => (
    <div data-testid="session-provider" data-session={JSON.stringify(session)}>
      {children}
    </div>
  ),
}));

describe('NextAuthSessionProvider', () => {
  it('renders children without session', () => {
    render(
      <NextAuthSessionProvider>
        <div>Test Child Component</div>
      </NextAuthSessionProvider>
    );
    
    expect(screen.getByText('Test Child Component')).toBeInTheDocument();
    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
  });

  it('renders children with session', () => {
    const mockSession: Session = {
      user: {
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
        role: 'admin',
      },
      expires: '2025-12-31',
    };

    render(
      <NextAuthSessionProvider session={mockSession}>
        <div>Test Child Component</div>
      </NextAuthSessionProvider>
    );
    
    expect(screen.getByText('Test Child Component')).toBeInTheDocument();
    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    
    const sessionProvider = screen.getByTestId('session-provider');
    expect(sessionProvider).toHaveAttribute('data-session', JSON.stringify(mockSession));
  });

  it('renders children with null session', () => {
    render(
      <NextAuthSessionProvider session={null}>
        <div>Test Child Component</div>
      </NextAuthSessionProvider>
    );
    
    expect(screen.getByText('Test Child Component')).toBeInTheDocument();
    
    const sessionProvider = screen.getByTestId('session-provider');
    expect(sessionProvider).toHaveAttribute('data-session', 'null');
  });

  it('passes session prop to SessionProvider', () => {
    const mockSession: Session = {
      user: {
        id: '2',
        email: 'user@example.com',
        name: 'Another User',
        role: 'editor',
      },
      expires: '2025-06-30',
    };

    render(
      <NextAuthSessionProvider session={mockSession}>
        <span>Child content</span>
      </NextAuthSessionProvider>
    );
    
    const sessionProvider = screen.getByTestId('session-provider');
    const sessionData = JSON.parse(sessionProvider.getAttribute('data-session') || '{}');
    
    expect(sessionData.user.email).toBe('user@example.com');
    expect(sessionData.user.role).toBe('editor');
  });

  it('handles multiple children', () => {
    render(
      <NextAuthSessionProvider>
        <div>First Child</div>
        <div>Second Child</div>
        <span>Third Child</span>
      </NextAuthSessionProvider>
    );
    
    expect(screen.getByText('First Child')).toBeInTheDocument();
    expect(screen.getByText('Second Child')).toBeInTheDocument();
    expect(screen.getByText('Third Child')).toBeInTheDocument();
  });
});