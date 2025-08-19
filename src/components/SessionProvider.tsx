'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';
import { Session } from 'next-auth';

interface Props {
  children: ReactNode;
  session?: Session | null;
}

export default function NextAuthSessionProvider({ children, session }: Props) {
  return (
    <SessionProvider 
      session={session}
      refetchInterval={0} // 自動更新を無効化（手動更新を使用）
      refetchOnWindowFocus={true} // ウィンドウフォーカス時にセッション更新
    >
      {children}
    </SessionProvider>
  );
}
