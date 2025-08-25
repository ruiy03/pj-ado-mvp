'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useState} from 'react';
import {logout} from '@/lib/actions';
import {useSession} from 'next-auth/react';

export default function Sidebar() {
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const {data: session} = useSession();

  useEffect(() => {
    setIsHydrated(true);
    // localStorage からサイドバーの状態を復元
    const savedCollapsedState = localStorage.getItem('sidebar-collapsed');
    if (savedCollapsedState !== null) {
      setIsCollapsed(JSON.parse(savedCollapsedState));
    }
  }, []);

  // サイドバーの開閉状態をlocalStorageに保存
  const toggleSidebar = () => {
    const newCollapsedState = !isCollapsed;
    setIsCollapsed(newCollapsedState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newCollapsedState));
    // カスタムイベントを発火してClientLayoutに通知
    window.dispatchEvent(new CustomEvent('sidebar-toggle', {detail: newCollapsedState}));
  };

  // 役割に応じたメニューフィルタリング
  const getMainMenuItems = () => {
    const baseItems = [
      {href: '/dashboard', label: 'ダッシュボード', icon: '📊'},
    ];

    // 編集者以上の権限が必要なメニュー
    if (session?.user?.role === 'editor' || session?.user?.role === 'admin') {
      baseItems.push(
        {href: '/ad-templates', label: '広告テンプレート', icon: '📝'},
        {href: '/url-templates', label: 'URLテンプレート', icon: '🔗'},
        {href: '/ads', label: '広告管理', icon: '🎨'},
        {href: '/article-ad-mapping', label: '記事広告マッピング', icon: '🔗'}
      );
    }

    return baseItems;
  };

  const getAccountMenuItems = () => {
    const accountItems = [];

    // 管理者のみアクセス可能なメニュー
    if (session?.user?.role === 'admin') {
      accountItems.push(
        {href: '/accounts', label: 'アカウント管理', icon: '👥'}
      );
    }

    return accountItems;
  };

  const getRoleDisplayName = (role?: string) => {
    if (role === 'admin') return '管理者';
    if (role === 'editor') return '編集者';
    return '不明';
  };

  const mainMenuItems = getMainMenuItems();
  const accountMenuItems = getAccountMenuItems();

  return (
    <aside
      className={`${isCollapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white h-screen fixed left-0 top-0 transition-all duration-300 ease-in-out z-50`}>
      <div className="flex flex-col h-full">
        {/* Header with toggle button */}
        <div className={`${isCollapsed ? 'p-4' : 'p-6'} border-b border-gray-800`}>
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div>
                <h1 className="text-xl font-bold">広告管理システム</h1>
                <div className="text-sm text-gray-400 mt-2">
                  {session?.user?.name} ({getRoleDisplayName(session?.user?.role)})
                </div>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
              title={isCollapsed ? 'サイドバーを展開' : 'サイドバーを折りたたむ'}
            >
              <span className="text-lg">
                {isCollapsed ? '☰' : '‹'}
              </span>
            </button>
          </div>
        </div>

        {/* Main navigation */}
        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-2">
            {mainMenuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 p-3'} rounded-lg transition-colors group ${
                    isHydrated && pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  title={isCollapsed ? item.label : ''}
                >
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Account management section */}
        {accountMenuItems.length > 0 && (
          <div className="px-3 py-2 border-t border-gray-800">
            <ul className="space-y-2">
              {accountMenuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 p-3'} rounded-lg transition-colors group ${
                      isHydrated && pathname === item.href
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }`}
                    title={isCollapsed ? item.label : ''}
                  >
                    <span className="text-lg flex-shrink-0">{item.icon}</span>
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Logout button */}
        <div className="px-3 py-4 border-t border-gray-800">
          <form action={logout}>
            <button
              className={`flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 p-3'} rounded-lg transition-colors text-gray-300 hover:bg-gray-800 hover:text-white w-full cursor-pointer`}
              title={isCollapsed ? 'ログアウト' : ''}
            >
              <span className="text-lg flex-shrink-0">🚪</span>
              {!isCollapsed && <span className="truncate">ログアウト</span>}
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
