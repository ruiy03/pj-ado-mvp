'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useState} from 'react';
import {logout} from '@/lib/actions';

const menuItems = [
  {href: '/dashboard', label: 'ダッシュボード', icon: '📊'},
  {href: '/ad-templates', label: '広告テンプレート', icon: '📝'},
  {href: '/url-templates', label: 'URLテンプレート', icon: '🔗'},
  {href: '/ads', label: '広告管理', icon: '🎨'},
  {href: '/article-ad-mapping', label: '記事と広告の紐付け', icon: '🔗'},
  {href: '/accounts', label: 'アカウント管理', icon: '👥'},
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  return (
    <aside className="w-64 bg-gray-900 text-white h-screen fixed left-0 top-0">
      <div className="p-6 flex flex-col h-full">
        <h1 className="text-xl font-bold mb-8">広告管理システム</h1>
        <nav className="flex-1">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    isHydrated && pathname === item.href
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-4">
          <form action={logout}>
            <button
              className="flex items-center gap-3 p-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-800 hover:text-white w-full cursor-pointer">
              <span className="text-lg">🚪</span>
              <span>ログアウト</span>
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
