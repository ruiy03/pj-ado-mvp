import type {NextAuthConfig} from 'next-auth';
import { NextResponse } from 'next/server';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({auth, request: {nextUrl}}) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith('/login');
      const isOnRoot = nextUrl.pathname === '/';
      
      // Protected routes
      const protectedPaths = [
        '/dashboard',
        '/ads', 
        '/ad-templates',
        '/url-templates',
        '/article-ad-mapping', 
        '/accounts'
      ];
      
      const isOnProtectedRoute = protectedPaths.some(path => 
        nextUrl.pathname.startsWith(path)
      );

      // If on protected route and not logged in, deny access (will redirect to login)
      if (isOnProtectedRoute && !isLoggedIn) {
        return false;
      }
      
      // If logged in and trying to access login page or root page, redirect to dashboard
      if (isLoggedIn && (isOnLogin || isOnRoot)) {
        return NextResponse.redirect(new URL('/dashboard', nextUrl.origin));
      }
      
      // Allow access
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now
} satisfies NextAuthConfig;
