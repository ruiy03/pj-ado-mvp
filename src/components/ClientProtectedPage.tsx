'use client';

import {useSession} from 'next-auth/react';
import {useRouter} from 'next/navigation';
import {useEffect} from 'react';

interface ClientProtectedPageProps {
  children: React.ReactNode;
}

export default function ClientProtectedPage({children}: ClientProtectedPageProps) {
  const {data: session, status} = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // Still loading

    if (!session?.user) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" data-testid="loading-spinner"></div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect
  }

  return <>{children}</>;
}
