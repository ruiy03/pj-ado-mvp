'use client';

import { useSession } from 'next-auth/react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {session?.user ? (
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 p-8 bg-gray-50 min-h-screen">
            {children}
          </main>
        </div>
      ) : (
        <div>
          <nav className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-center h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">LMG 広告管理</h1>
                </div>
              </div>
            </div>
          </nav>
          <main className="p-8 bg-gray-50 min-h-screen">
            {children}
          </main>
        </div>
      )}
    </>
  );
}
