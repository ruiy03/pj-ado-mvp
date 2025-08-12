import React from 'react';
import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Sidebar from '@/components/Sidebar';

// Next.jsとnext-authのフックをモック
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// actionsをモック
jest.mock('@/lib/actions', () => ({
  logout: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;
const mockUseSession = useSession as jest.MockedFunction<typeof useSession>;

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePathname.mockReturnValue('/dashboard');
  });

  it('基本メニューがレンダリングされる', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'テストユーザー', role: 'admin' }
      }
    } as any);

    render(<Sidebar />);
    
    expect(screen.getByText('広告管理システム')).toBeInTheDocument();
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
  });

  it('管理者の場合は全メニューが表示される', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'admin', role: 'admin' }
      }
    } as any);

    render(<Sidebar />);
    
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('広告テンプレート')).toBeInTheDocument();
    expect(screen.getByText('URLテンプレート')).toBeInTheDocument();
    expect(screen.getByText('広告管理')).toBeInTheDocument();
    expect(screen.getByText('記事と広告の紐付け')).toBeInTheDocument();
    expect(screen.getByText('アカウント管理')).toBeInTheDocument();
  });

  it('編集者の場合はアカウント管理が非表示', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'editor', role: 'editor' }
      }
    } as any);

    render(<Sidebar />);
    
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.getByText('広告テンプレート')).toBeInTheDocument();
    expect(screen.getByText('URLテンプレート')).toBeInTheDocument();
    expect(screen.getByText('広告管理')).toBeInTheDocument();
    expect(screen.getByText('記事と広告の紐付け')).toBeInTheDocument();
    expect(screen.queryByText('アカウント管理')).not.toBeInTheDocument();
  });

  it('権限なしの場合はダッシュボードのみ表示', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'viewer', role: 'viewer' }
      }
    } as any);

    render(<Sidebar />);
    
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
    expect(screen.queryByText('広告テンプレート')).not.toBeInTheDocument();
    expect(screen.queryByText('アカウント管理')).not.toBeInTheDocument();
  });

  it('アクティブなページが正しくハイライトされる', () => {
    mockUsePathname.mockReturnValue('/ads');
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'admin', role: 'admin' }
      }
    } as any);

    render(<Sidebar />);
    
    const activeLink = screen.getByText('広告管理').closest('a');
    expect(activeLink).toHaveClass('bg-blue-600');
  });

  it('ユーザー情報と役割が表示される', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'テストユーザー', role: 'admin' }
      }
    } as any);

    render(<Sidebar />);
    
    expect(screen.getByText('テストユーザー (管理者)')).toBeInTheDocument();
  });

  it('ログアウトボタンが表示される', () => {
    mockUseSession.mockReturnValue({
      data: {
        user: { name: 'テストユーザー', role: 'admin' }
      }
    } as any);

    render(<Sidebar />);
    
    expect(screen.getByText('ログアウト')).toBeInTheDocument();
  });

  it('セッションがない場合も正常に動作する', () => {
    mockUseSession.mockReturnValue({
      data: null
    } as any);

    render(<Sidebar />);
    
    expect(screen.getByText('広告管理システム')).toBeInTheDocument();
    expect(screen.getByText('ダッシュボード')).toBeInTheDocument();
  });
});
