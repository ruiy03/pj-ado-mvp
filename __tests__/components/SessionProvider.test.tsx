import { render, screen } from '@testing-library/react';
import NextAuthSessionProvider from '@/components/SessionProvider';

// Mock next-auth/react
jest.mock('next-auth/react', () => ({
  SessionProvider: ({ children, session }: any) => (
    <div data-testid="session-provider" data-session={JSON.stringify(session)}>
      {children}
    </div>
  ),
}));

describe('NextAuthSessionProvider', () => {
  it('renders children within SessionProvider', () => {
    render(
      <NextAuthSessionProvider>
        <div>Test child component</div>
      </NextAuthSessionProvider>
    );

    expect(screen.getByTestId('session-provider')).toBeInTheDocument();
    expect(screen.getByText('Test child component')).toBeInTheDocument();
  });

  it('passes session prop to SessionProvider', () => {
    const mockSession = {
      user: { id: '1', name: 'Test User', email: 'test@example.com' },
      expires: '2024-01-01',
    };

    render(
      <NextAuthSessionProvider session={mockSession}>
        <div>Test child component</div>
      </NextAuthSessionProvider>
    );

    expect(screen.getByTestId('session-provider')).toHaveAttribute(
      'data-session',
      JSON.stringify(mockSession)
    );
  });

  it('handles null session prop', () => {
    render(
      <NextAuthSessionProvider session={null}>
        <div>Test child component</div>
      </NextAuthSessionProvider>
    );

    expect(screen.getByTestId('session-provider')).toHaveAttribute(
      'data-session',
      'null'
    );
  });

  it('handles undefined session prop', () => {
    render(
      <NextAuthSessionProvider>
        <div>Test child component</div>
      </NextAuthSessionProvider>
    );

    const sessionProvider = screen.getByTestId('session-provider');
    const sessionData = sessionProvider.getAttribute('data-session');
    expect(sessionData === 'undefined' || sessionData === null).toBe(true);
  });
});
