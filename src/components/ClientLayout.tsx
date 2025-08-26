'use client';

import {useSession} from 'next-auth/react';
import {useEffect, useState} from 'react';
import {usePathname} from 'next/navigation';
import Sidebar from './Sidebar';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({children}: ClientLayoutProps) {
  const {data: session, status} = useSession();
  const pathname = usePathname();
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // パス変更時の遷移状態管理
  useEffect(() => {
    if (pathname && pathname !== '/login') {
      setIsTransitioning(false);
    }
  }, [pathname]);

  // ログインページから認証済みページへの遷移を検知
  useEffect(() => {
    if (status === 'authenticated' && pathname === '/login') {
      setIsTransitioning(true);
    }
  }, [status, pathname]);

  // サイドバーの状態をlocalStorageから読み込み
  useEffect(() => {
    const savedCollapsedState = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsedState !== null) {
      setIsSidebarCollapsed(JSON.parse(savedCollapsedState));
    }

    // カスタムイベントでサイドバーの状態変更を監視
    const handleSidebarToggle = (event: CustomEvent) => {
      setIsSidebarCollapsed(event.detail);
    };

    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    return () => window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
  }, []);

  if (status === 'loading' || isTransitioning) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div data-testid="loading-spinner"
             className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      {session?.user ? (
        <div className="flex">
          <Sidebar/>
          <main
            className={`flex-1 ${isSidebarCollapsed ? 'ml-16' : 'ml-64'} p-8 bg-gray-100 min-h-screen transition-all duration-300 ease-in-out`}>
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
          <main className="p-8 bg-gray-100 min-h-screen">
            {children}
          </main>
        </div>
      )}
    </>
  );
}
