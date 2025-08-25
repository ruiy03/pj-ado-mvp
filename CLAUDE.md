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
- **Database setup**: `node scripts/seed.js` - Creates database tables and seeds test data (users, templates, URL
  templates)
- **TypeScript compilation**: `npx tsc` - Type checking and compilation
- **Image cleanup**: Image cleanup runs automatically via Vercel Cron Jobs (Sundays at 2 AM UTC)

## Architecture Overview

### Authentication & Authorization System

The application uses NextAuth.js v5 (beta) with credential-based authentication and role-based authorization:

- **Authentication config**: `auth.config.ts` and `auth.ts` handle NextAuth setup
- **Middleware**: `middleware.ts` protects routes except public files and login
- **Database**: Uses Neon PostgreSQL with bcrypt for password hashing
- **WordPress sync actions**: `src/lib/wordpress-sync-actions.ts` handles WordPress API integration and mapping data
  synchronization
- **Session management**: Client-side session checking with `SessionProvider.tsx` and `ClientLayout.tsx` for conditional
  UI
- **Protected components**: `ProtectedPage.tsx` and `ClientProtectedPage.tsx` redirect unauthenticated users to `/login`
- **Role-based access**: Two-tier system with `admin` (level 2) and `editor` (level 1) roles
- **Authorization helpers**: `src/lib/authorization.ts` provides role checking utilities (`hasMinimumRole`, `isAdmin`,
  `canEdit`, `withAuthorization`)
- **User management**: Full CRUD operations restricted to admin users only

### Application Structure

- **Conditional layout**: Authenticated users see sidebar + main content (`ml-64` offset), unauthenticated users see
  centered login
- **Authentication flow**: Client layout checks session and conditionally renders sidebar navigation vs login-only
  header
- **Navigation**: Six main sections accessible via fixed sidebar when authenticated
- **Styling**: Consistent gray/blue design system using Tailwind CSS

### Key Components & Files

- `src/app/layout.tsx` - Root layout with conditional authentication-based rendering
- `src/components/Sidebar.tsx` - Fixed sidebar with menu items, active state, and logout functionality
- `src/components/ProtectedPage.tsx` - Server-side wrapper component for route protection
- `src/components/ClientProtectedPage.tsx` - Client-side wrapper component for route protection
- `src/components/SessionProvider.tsx` - NextAuth session provider wrapper
- `src/components/ClientLayout.tsx` - Client-side layout with session management
- `src/components/LoginForm.tsx` - Authentication form component
- `src/components/HTMLCodeEditor.tsx` - Monaco-based HTML code editor with validation
- `src/lib/definitions.ts` - TypeScript interfaces (User model with role field, AdTemplate models)
- `src/lib/actions.ts` - Server actions for authentication operations
- `src/lib/user-actions.ts` - Server actions for user CRUD operations with role-based authorization
- `src/lib/template-actions.ts` - Server actions for ad template CRUD operations with validation
- `src/lib/authorization.ts` - Role checking utilities and permission helpers
- `src/lib/template-utils.ts` - Utility functions for template processing and validation
- `src/lib/image-cleanup.ts` - Automated image cleanup utilities for orphaned and old unused images
- `src/lib/image-utils.ts` - Common helper functions for image processing and content_data manipulation
- `src/lib/consistency-checker.ts` - Template consistency analysis and integrity monitoring system
- `src/lib/logger.ts` - Structured logging system with environment-aware configuration
- `auth.ts` & `auth.config.ts` - NextAuth.js configuration with Credentials provider
- `middleware.ts` - Route protection middleware

### Database Schema

Uses Neon PostgreSQL with the following structure:

- **users table**: `id` (serial), `name`, `email` (unique), `password` (bcrypt hashed), `role` (admin/editor),
  `created_at`, `updated_at`
- **ad_templates table**: `id` (serial), `name`, `html`, `placeholders` (JSON array), `description`, `created_at`,
  `updated_at`
- **url_templates table**: `id` (serial), `name`, `url_template`, `parameters` (JSON), `description`, `created_at`,
  `updated_at`
- **ad_contents table**: `id` (serial), `name`, `template_id` (FK), `url_template_id` (FK), `content_data` (JSON),
  `status` (enum), `created_by` (FK), `impressions` (INTEGER DEFAULT 0), `clicks` (INTEGER DEFAULT 0),
  `last_accessed_at` (TIMESTAMP), `created_at`, `updated_at`
- **ad_images table**: `id` (serial), `ad_content_id` (FK), `blob_url`, `original_filename`, `file_size`, `mime_type`,
  `alt_text`, `placeholder_name`, `created_at`
- **article_ad_mappings table**: `id` (serial), `post_id`, `post_title`, `post_url`, `ad_id`, `synced_at`, `created_at`,
  `updated_at` - WordPress mapping data
- **Test credentials**: admin@example.com / password123 (admin), editor@example.com / password123 (editor) - seeded via
  `scripts/seed.js`

### Page Structure

Each main feature has its own page directory under `src/app/`:

- `/login` - Authentication page (accessible without login)
- `/dashboard` - Overview dashboard with metrics cards and activity feed
- `/ad-templates` - Advertisement template management with full CRUD operations, import/export functionality
- `/url-templates` - URL template management with UTM parameter tracking and custom parameters
- `/ads` - Advertisement management with search/filter table
- `/article-ad-mapping` - Article to advertisement mapping management
- `/accounts` - Account management system with full CRUD operations (admin only)

**API Routes**:

- `/api/templates` - REST API for ad template CRUD operations (GET, POST)
- `/api/templates/[id]` - Individual template operations (GET, PUT, DELETE)
- `/api/templates/import` - Template import functionality (POST)
- `/api/templates/export` - Template export functionality (GET)
- `/api/url-templates` - REST API for URL template CRUD operations (GET, POST)
- `/api/url-templates/[id]` - Individual URL template operations (GET, PUT, DELETE)
- `/api/url-templates/import` - URL template import functionality (POST)
- `/api/url-templates/export` - URL template export functionality (GET)
- `/api/ad-contents` - REST API for ad content CRUD operations (GET, POST)
- `/api/ad-contents/[id]` - Individual ad content operations (GET, PUT, DELETE)
- `/api/upload` - File upload handling for ad images using Vercel Blob storage
- `/api/admin/cleanup-images` - Automated image cleanup API for removing orphaned and old unused images (Cron job)
- `/api/integrity-check` - Template consistency validation API (GET)
- `/api/templates/[id]/analyze-changes` - Template change impact analysis API (POST)
- `/api/delivery/[id]` - Ad delivery API with impression tracking and CORS support (GET)
- `/api/delivery/[id]/click` - Click tracking and redirect API (GET)
- `/api/templates/[id]/sync-content` - Template change synchronization API (POST)
- `/api/url-templates/[id]/sync-content` - URL template change synchronization API (POST)
- `/api/article-mappings/export` - Article-ad mapping data export API (GET)

Most pages are implemented with full functionality. Some protected pages show placeholder/empty state UI with Japanese
text and icons.

## Key Technologies

- **Next.js 15.4.5** - React framework with App Router
- **React 19** - UI library with client-side navigation
- **NextAuth.js 5.0.0-beta.29** - Authentication with Credentials provider
- **Neon Database** - PostgreSQL serverless database
- **Vercel Blob** - File storage service for ad images
- **bcrypt** - Password hashing
- **Zod 4.0.15** - Schema validation for authentication and user management
- **TypeScript 5** - Strict type safety configuration with path aliases (@/*)
- **Tailwind CSS v4** - Utility-first styling with PostCSS
- **Monaco Editor** - Code editor for HTML template editing
- **Geist fonts** - Typography (sans and mono variants)

## Development Notes

- Uses Turbopack for faster development builds
- Japanese language interface throughout (`lang="ja"` in layout)
- Path alias `@/*` maps to `./src/*` (configured in tsconfig.json)
- Server components by default with selective client components (`'use client'` in Sidebar, LoginForm, ClientLayout,
  SessionProvider, etc.)
- ESLint uses flat config format (`eslint.config.mjs`) with Next.js TypeScript rules
- Environment variables required: `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `WORDPRESS_API_URL` (for article-ad
  mapping sync), `BLOB_READ_WRITE_TOKEN`, `CRON_SECRET`
- Authentication state determines entire application layout and available routes
- **No test framework**: Currently no test scripts configured in package.json - testing strategy not implemented

## Template System Architecture

The ad template system is a core feature with several important components:

- **Template validation**: `src/lib/template-utils/validation.ts` validates HTML structure and placeholders
- **Placeholder extraction**: `src/lib/template-utils/placeholder-extraction.ts` extracts `{{variable}}` placeholders
  from HTML
- **Link processing**: `src/lib/template-utils/link-processing.ts` handles `rel="nofollow"` attributes for SEO
- **Template actions**: `src/lib/template-actions.ts` provides server actions for template CRUD with authorization
  checks
- **HTML Editor**: `src/components/HTMLCodeEditor.tsx` uses Monaco Editor with HTML syntax highlighting
- **Template hooks**: `src/app/ad-templates/hooks/useTemplates.tsx` manages template state and operations

Templates support dynamic placeholders in `{{variableName}}` format and automatically enforce `rel="nofollow"` on
external links for SEO compliance.

### CSV Import/Export System

The application features comprehensive CSV import/export functionality for batch operations:

- **CSV utilities**: `src/lib/csv-utils.ts` provides robust CSV parsing with support for quoted fields and multiline
  values
- **Import/export hooks**: `src/hooks/useImportExport.tsx` manages import/export state and operations
- **Shared components**: `src/components/ImportExportButtons.tsx` provides consistent UI for import/export operations
- **Result handling**: `ImportResult` interface provides detailed feedback including success count, errors, and
  item-level results
- **Batch operations**: Support for creating, updating, and skipping items during import with detailed error reporting
- **File format validation**: CSV format validation with helpful error messages and format guidance

CSV functionality is available for ad templates and URL templates, enabling efficient bulk management operations.

## URL Template System Architecture

The URL template system provides comprehensive tracking parameter management for advertisement campaigns:

- **URL template management**: `src/lib/url-template-actions.ts` provides server actions for URL template CRUD with
  authorization checks
- **UTM parameter support**: Comprehensive UTM tracking (source, medium, campaign, term, content)
- **Custom parameters**: JSON-based custom parameter storage for advanced tracking
- **Template validation**: URL format validation and parameter consistency checks
- **URL template hooks**: `src/app/url-templates/hooks/useUrlTemplates.tsx` manages URL template state and operations
- **UI components**: `UrlTemplateCard.tsx`, `UrlTemplateForm.tsx`, and `UrlTemplateClient.tsx` for complete CRUD
  interface
- **Template activation**: Boolean flag system for enabling/disabling URL templates

URL templates support standard UTM parameters and custom JSON parameters for flexible campaign tracking and analytics
integration.

## Ad Content Management System

The ad content management system provides comprehensive advertisement creation and management with image handling:

- **Ad content management**: `src/lib/ad-content-actions.ts` provides server actions for ad content CRUD with
  authorization checks
- **Image upload system**: `src/components/ImageUpload.tsx` handles file uploads with drag-and-drop support and Vercel
  Blob integration
- **Content data structure**: JSON-based content storage linking to templates and URL templates with dynamic placeholder
  support
- **Status management**: Four-state workflow (draft, active, paused, archived) for ad lifecycle management
- **Image association**: Links uploaded images to specific placeholder names in ad templates for dynamic content
  insertion
- **Ad content hooks**: `src/app/ads/hooks/useAdContents.tsx` manages ad content state and operations
- **UI components**: `AdContentCard.tsx`, `AdContentForm.tsx`, `AdPreview.tsx`, and `AdContentClient.tsx` for complete
  CRUD interface
- **File storage**: Vercel Blob storage integration for scalable image hosting with metadata tracking
- **Image cleanup system**: `src/lib/image-cleanup.ts` provides automated cleanup of orphaned and old unused images
- **Image utilities**: `src/lib/image-utils.ts` contains common helper functions for image processing and content_data
  manipulation

Ad contents combine templates, URL templates, and user-uploaded images to create complete advertisement instances with
comprehensive tracking and preview capabilities. The system includes automated image cleanup to prevent storage bloat.

## Ad Delivery and Serving System

The application includes a sophisticated ad delivery system for external integration, primarily designed for WordPress
sites using custom shortcodes.

### Delivery API

- **Delivery endpoint**: `/api/delivery/[id]` - Serves processed ad HTML with impression tracking
- **Click tracking**: `/api/delivery/[id]/click` - Handles click tracking and redirects to original URLs
- **CORS enabled**: Full cross-origin support for WordPress integration with appropriate headers
- **Caching**: 5-minute cache headers for performance optimization
- **Automatic link conversion**: External links automatically converted to tracking URLs for analytics

### WordPress Integration

- **Shortcode system**: `[lmg_ad id="123"]` format for easy embedding in WordPress content
- **Flexible attributes**: Support for cache time, CSS classes, dimensions, and styling options
- **DeliveryCodeModal component**: Provides copy-paste shortcode generation interface with WordPress integration guide
- **Debug mode**: Built-in debugging capabilities for troubleshooting delivery issues

### Analytics Tracking

- **Impression tracking**: Automatic view counting on ad delivery with database persistence
- **Click tracking**: Transparent redirect tracking for all external links with referrer preservation
- **Performance metrics**: Track impressions, clicks, and last access times for comprehensive analytics
- **Database fields**: `impressions`, `clicks`, `last_accessed_at` columns in ad_contents table for tracking

### Template Synchronization System

Advanced system for maintaining data consistency when templates are modified:

- **Change detection**: Automatic placeholder difference analysis between old and new template versions
- **Content migration**: Automatic removal of orphaned placeholder data from ad_contents when templates change
- **Integrity warnings**: Pre-modification impact analysis and user warnings via dedicated UI components
- **Sync APIs**: Template and URL template synchronization endpoints for batch content updates
- **Warning components**: `TemplateChangeWarning.tsx` and `UrlTemplateChangeWarning.tsx` for user notifications

## Template Consistency System

The application includes a sophisticated template consistency monitoring system to ensure data integrity:

- **Consistency checker**: `src/lib/consistency-checker.ts` provides comprehensive analysis of template changes and
  their impact on existing content
- **Change analysis**: `analyzeTemplateChanges()` detects placeholder differences and identifies affected ad contents
- **URL template analysis**: `analyzeUrlTemplateChanges()` tracks URL parameter changes and content dependencies
- **Integrity monitoring**: `getSystemIntegrityStatus()` provides system-wide health checks with severity classification
- **API endpoint**: `/api/integrity-check` - REST API for template consistency validation
- **Dashboard integration**: `IntegrityMonitor.tsx` component provides real-time consistency status in the dashboard
- **Template change warnings**: `TemplateChangeWarning.tsx` and `UrlTemplateChangeWarning.tsx` alert users of potential
  breaking changes before template updates
- **Shared components**: `ImportExportButtons.tsx` provides consistent import/export UI across features
- **Delivery integration**: `DeliveryCodeModal.tsx` generates WordPress shortcodes for ad delivery

The consistency system categorizes issues by severity (critical, warning, info) and provides detailed impact analysis
including:

- Placeholder mismatches between templates and content
- Orphaned content with deleted templates
- Missing or unused placeholders
- Parameter mapping conflicts between ad templates and URL templates

## Article-Ad Mapping System

The application includes a WordPress integration system for managing article-advertisement relationships:

- **WordPress sync**: `src/lib/wordpress-sync-actions.ts` provides server actions for fetching mapping data from
  WordPress sites via custom API endpoints
- **Mapping management**: `ArticleAdMappingClient.tsx` main interface with real-time data synchronization and usage
  statistics
- **Data visualization**: `MappingsTable.tsx` displays post-advertisement relationships, `UsageStatsCard.tsx` shows
  usage analytics
- **Sync functionality**: `SyncButton.tsx` triggers manual WordPress data synchronization with progress feedback
- **Data export**: `ExportButtons.tsx` enables CSV export of mapping data for analysis
- **Articles without ads tracking**: `ArticlesWithoutAdsTable.tsx` displays WordPress articles that don't have associated advertisements with filtering and sorting capabilities
- **Enhanced usage statistics**: Usage stats now include ad names and enhanced UI for better data visualization
- **WordPress API integration**: Custom endpoint `/wp-json/lmg-ad-manager/v1/shortcode-usage` for retrieving shortcode
  usage data, plus `/wp-json/wp/v2/posts` for comprehensive article retrieval
- **Database schema**: `article_ad_mappings` table stores WordPress post relationships with ad IDs and sync timestamps
- **Authorization**: Admin and editor roles can perform sync operations and view mapping data

## Feature Structure & Routing

The application follows a consistent page structure pattern with dedicated create/edit routes:

### Ad Templates (`/ad-templates`)

- **Main page**: List view with search/filter capabilities
- **Create route**: `/ad-templates/create` - Dedicated template creation page with `TemplateCreateForm.tsx`
- **Edit route**: `/ad-templates/[id]/edit` - Template editing page with `TemplateEditForm.tsx`
- **Import/Export**: CSV functionality with detailed result reporting

### URL Templates (`/url-templates`)

- **Main page**: Grid view with UTM parameter management
- **Create route**: `/url-templates/create` - URL template creation with `UrlTemplateCreateForm.tsx`
- **Edit route**: `/url-templates/[id]/edit` - URL template editing with `UrlTemplateEditForm.tsx`
- **Preview component**: `UrlTemplatePreview.tsx` for real-time URL generation preview

### Ad Contents (`/ads`)

- **Main page**: Content management with status-based filtering
- **Create route**: `/ads/create` - Ad content creation with `AdContentCreateForm.tsx`
- **Edit route**: `/ads/[id]/edit` - Content editing with `AdContentEditForm.tsx`
- **List component**: `AdContentList.tsx` for organized content display

### Article-Ad Mapping (`/article-ad-mapping`)

- **Main page**: WordPress integration management with mapping table and usage statistics
- **Components**: `ArticleAdMappingClient.tsx` (main interface), `MappingsTable.tsx` (mapping display),
  `UsageStatsCard.tsx` (analytics), `SyncButton.tsx` (WordPress sync), `ExportButtons.tsx` (data export)
- **WordPress sync**: Real-time synchronization with WordPress sites using custom API endpoints
