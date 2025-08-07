# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Japanese advertisement management system (広告管理システム) built as an MVP for LMG to manage ads on their
internal media platforms like PORTキャリア. The project is a Next.js application using TypeScript, Tailwind CSS, and
NextAuth.js for authentication.

## Development Commands

- **Development server**: `npm run dev` - Runs Next.js development server with Turbopack
- **Build**: `npm run build` - Creates production build
- **Start production**: `npm start` - Starts production server
- **Lint**: `npm run lint` - Runs ESLint with Next.js TypeScript rules
- **Database setup**: `node scripts/seed.js` - Creates users table and seeds test user (test@example.com / 123456)

## Architecture Overview

### Authentication System

The application uses NextAuth.js v5 (beta) with credential-based authentication:

- **Authentication config**: `auth.config.ts` and `auth.ts` handle NextAuth setup
- **Middleware**: `middleware.ts` protects routes except public files and login
- **Database**: Uses Neon PostgreSQL with bcrypt for password hashing
- **Session management**: Server-side session checking in layout for conditional UI
- **Protected components**: `ProtectedPage.tsx` redirects unauthenticated users to `/login`

### Application Structure

- **Conditional layout**: Authenticated users see sidebar + main content (`ml-64` offset), unauthenticated users see
  centered login
- **Authentication flow**: Layout checks session and conditionally renders sidebar navigation vs login-only header
- **Navigation**: Six main sections accessible via fixed sidebar when authenticated
- **Styling**: Consistent gray/blue design system using Tailwind CSS

### Key Components & Files

- `src/app/layout.tsx` - Root layout with conditional authentication-based rendering
- `src/components/Sidebar.tsx` - Fixed sidebar with menu items, active state, and logout functionality
- `src/components/ProtectedPage.tsx` - Wrapper component for route protection
- `src/components/LoginForm.tsx` - Authentication form component
- `src/lib/definitions.ts` - TypeScript interfaces (User model)
- `src/lib/actions.ts` - Server actions for authentication operations
- `auth.ts` & `auth.config.ts` - NextAuth.js configuration with Credentials provider
- `middleware.ts` - Route protection middleware

### Database Schema

Uses Neon PostgreSQL with the following structure:

- **users table**: `id` (serial), `name`, `email` (unique), `password` (bcrypt hashed), `created_at`
- **Test credentials**: test@example.com / 123456 (seeded via `scripts/seed.js`)

### Page Structure

Each main feature has its own page directory under `src/app/`:

- `/login` - Authentication page (accessible without login)
- `/dashboard` - Overview dashboard with metrics cards and activity feed
- `/ad-templates` - Advertisement template management
- `/url-templates` - URL template management (for tracking parameters)
- `/ads` - Advertisement management with search/filter table
- `/article-ad-mapping` - Article to advertisement mapping management
- `/accounts` - Account management system

All protected pages currently show placeholder/empty state UI with Japanese text and icons.

## Key Technologies

- **Next.js 15.4.5** - React framework with App Router
- **React 19** - UI library with client-side navigation
- **NextAuth.js 5.0.0-beta.29** - Authentication with Credentials provider
- **Neon Database** - PostgreSQL serverless database
- **bcrypt** - Password hashing
- **Zod** - Schema validation for authentication
- **TypeScript** - Strict type safety configuration
- **Tailwind CSS v4** - Utility-first styling with PostCSS
- **Geist fonts** - Typography (sans and mono variants)

## Development Notes

- Uses Turbopack for faster development builds
- Japanese language interface throughout (`lang="ja"` in layout)
- Path alias `@/*` maps to `./src/*`
- Server components by default with selective client components (`'use client'` in Sidebar)
- Environment variable required: `DATABASE_URL` for Neon connection
- Authentication state determines entire application layout and available routes
