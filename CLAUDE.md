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
- **Test**: `npm test` - Runs Jest test suites for components and utilities
- **Test (watch mode)**: `npm run test:watch` - Runs tests in watch mode for development
- **Run single test**: `npm test -- --testNamePattern="test name"` or `npm test Button.test.tsx`
- **Database setup**: `node scripts/seed.js` - Creates users table and seeds test users (admin@example.com/password123, editor@example.com/password123)

## Architecture Overview

### Authentication & Authorization System

The application uses NextAuth.js v5 (beta) with credential-based authentication and role-based authorization:

- **Authentication config**: `auth.config.ts` and `auth.ts` handle NextAuth setup
- **Middleware**: `middleware.ts` protects routes except public files and login
- **Database**: Uses Neon PostgreSQL with bcrypt for password hashing
- **Session management**: Server-side session checking in layout for conditional UI
- **Protected components**: `ProtectedPage.tsx` redirects unauthenticated users to `/login`
- **Role-based access**: Two-tier system with `admin` (level 2) and `editor` (level 1) roles
- **Authorization helpers**: `src/lib/authorization.ts` provides role checking utilities (`hasMinimumRole`, `isAdmin`, `canEdit`, `withAuthorization`)
- **User management**: Full CRUD operations restricted to admin users only

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
- `src/lib/definitions.ts` - TypeScript interfaces (User model with role field, AdTemplate models)
- `src/lib/actions.ts` - Server actions for authentication operations
- `src/lib/user-actions.ts` - Server actions for user CRUD operations with role-based authorization
- `src/lib/template-actions.ts` - Server actions for ad template CRUD operations with validation
- `src/lib/authorization.ts` - Role checking utilities and permission helpers
- `src/lib/template-utils.ts` - Utility functions for template processing and validation
- `auth.ts` & `auth.config.ts` - NextAuth.js configuration with Credentials provider
- `middleware.ts` - Route protection middleware

### Database Schema

Uses Neon PostgreSQL with the following structure:

- **users table**: `id` (serial), `name`, `email` (unique), `password` (bcrypt hashed), `role` (admin/editor), `created_at`, `updated_at`
- **ad_templates table**: `id` (serial), `name`, `html`, `placeholders` (JSON array), `description`, `created_at`, `updated_at`
- **Test credentials**: admin@example.com / password123 (admin), editor@example.com / password123 (editor) - seeded via `scripts/seed.js`

### Testing Setup

The application uses Jest with React Testing Library for unit and component testing:

- **Jest configuration**: `jest.config.js` with Next.js integration and path mapping
- **Setup file**: `jest.setup.js` for global test configuration
- **Test environment**: jsdom for DOM testing with React components  
- **Test location**: `__tests__/` directory with component and utility tests
- **Coverage**: Tests for components (Button, LoginForm, Sidebar, AdTemplates, Dashboard, etc.) and utility functions (authorization, template-utils)

### Page Structure

Each main feature has its own page directory under `src/app/`:

- `/login` - Authentication page (accessible without login)
- `/dashboard` - Overview dashboard with metrics cards and activity feed
- `/ad-templates` - Advertisement template management with full CRUD operations, import/export functionality
- `/url-templates` - URL template management (for tracking parameters)
- `/ads` - Advertisement management with search/filter table
- `/article-ad-mapping` - Article to advertisement mapping management
- `/accounts` - Account management system with full CRUD operations (admin only)

**API Routes**:
- `/api/templates` - REST API for ad template CRUD operations (GET, POST)
- `/api/templates/[id]` - Individual template operations (GET, PUT, DELETE)
- `/api/templates/import` - Template import functionality (POST)
- `/api/templates/export` - Template export functionality (GET)

Most pages are implemented with full functionality. Some protected pages show placeholder/empty state UI with Japanese text and icons.

## Key Technologies

- **Next.js 15.4.5** - React framework with App Router
- **React 19** - UI library with client-side navigation
- **NextAuth.js 5.0.0-beta.29** - Authentication with Credentials provider
- **Neon Database** - PostgreSQL serverless database
- **bcrypt** - Password hashing
- **Zod 4.0.15** - Schema validation for authentication and user management
- **TypeScript 5** - Strict type safety configuration with path aliases (@/*)
- **Tailwind CSS v4** - Utility-first styling with PostCSS
- **Jest 29.7.0 & React Testing Library** - Unit testing framework with jsdom environment
- **Geist fonts** - Typography (sans and mono variants)

## Development Notes

- Uses Turbopack for faster development builds
- Japanese language interface throughout (`lang="ja"` in layout)
- Path alias `@/*` maps to `./src/*` (configured in tsconfig.json)
- Server components by default with selective client components (`'use client'` in Sidebar, LoginForm, etc.)
- Environment variables required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Authentication state determines entire application layout and available routes
- Tests are located in `__tests__/` directory with `.test.tsx` and `.test.ts` extensions
- Jest configuration includes Next.js integration and path mapping for imports
