# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Japanese advertisement management system (広告管理システム) built as an MVP for LMG to manage ads on their internal media platforms like PORTキャリア. The project is a Next.js application using TypeScript and Tailwind CSS.

## Development Commands

- **Development server**: `npm run dev` - Runs Next.js development server with Turbopack
- **Build**: `npm run build` - Creates production build
- **Start production**: `npm start` - Starts production server
- **Lint**: `npm run lint` - Runs ESLint with Next.js TypeScript rules

## Architecture Overview

### Application Structure
- **Layout Pattern**: Fixed sidebar navigation with main content area (ml-64 offset for sidebar)
- **Internationalization**: Japanese language interface (`lang="ja"` in layout)
- **Navigation**: Six main sections accessible via sidebar menu
- **Styling**: Consistent design with gray/blue color scheme using Tailwind CSS

### Key Components
- `src/components/Sidebar.tsx` - Fixed sidebar navigation with menu items and active state management
- `src/app/layout.tsx` - Root layout defining the sidebar + main content structure

### Page Structure
Each main feature has its own page directory under `src/app/`:
- `/dashboard` - Overview dashboard with metrics cards and activity feed
- `/ad-templates` - Advertisement template management
- `/url-templates` - URL template management (for tracking parameters)
- `/ads` - Advertisement management with search/filter table
- `/article-ad-mapping` - Article to advertisement mapping management
- `/accounts` - Account management system

### Current Implementation Status
All pages currently show placeholder/empty state UI with Japanese text and icons. The MVP is in early development stage with basic navigation structure in place.

## Key Technologies

- **Next.js 15.4.5** - React framework with App Router
- **React 19** - UI library with client-side navigation
- **TypeScript** - Strict type safety configuration
- **Tailwind CSS v4** - Utility-first styling with PostCSS
- **Geist fonts** - Typography (sans and mono variants)

## Development Notes

- Uses Turbopack for faster development builds
- Japanese language interface throughout
- Path alias `@/*` maps to `./src/*`
- Server components by default with selective client components
- ESLint configured with Next.js and TypeScript rules
