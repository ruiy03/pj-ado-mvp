# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js project bootstrapped with `create-next-app`, using the App Router and TypeScript. The project uses Tailwind CSS for styling and is configured to use Turbopack for development.

## Development Commands

- **Development server**: `npm run dev` - Runs Next.js development server with Turbopack
- **Build**: `npm run build` - Creates production build
- **Start production**: `npm start` - Starts production server
- **Lint**: `npm run lint` - Runs ESLint with Next.js TypeScript rules

## Project Structure

- `src/app/` - Next.js App Router directory containing:
  - `layout.tsx` - Root layout with Geist font configuration
  - `page.tsx` - Home page component
  - `globals.css` - Global Tailwind CSS styles
- `public/` - Static assets (SVG icons, images)
- TypeScript configuration with path alias `@/*` mapping to `./src/*`

## Key Technologies

- **Next.js 15.4.5** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Utility-first CSS framework with PostCSS
- **ESLint** - Code linting with Next.js and TypeScript rules
- **Geist fonts** - Typography (sans and mono variants)

## Development Notes

- Uses Turbopack for faster development builds
- Configured with strict TypeScript settings
- ESLint extends `next/core-web-vitals` and `next/typescript`
- Tailwind CSS v4 uses PostCSS for processing
- App Router pattern with server components by default