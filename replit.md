# ZND Platform (منصة زند)

## Overview

ZND Platform is a bilingual (Arabic-first, RTL) digital marketplace for selling programming tools, software, gaming cards, and gaming accounts. The platform features an ultra-dark minimalist design with electric blue accents, user authentication with email verification, digital product management, secure vault for purchased items, and comprehensive admin dashboard with real-time statistics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state, React Context for auth and language
- **Styling**: Tailwind CSS with shadcn/ui component library (New York style)
- **Internationalization**: Custom language context supporting Arabic (RTL) and English (LTR) with runtime switching
- **Design System**: Ultra-dark theme (#000000 background) with electric blue accents, Tajawal font for Arabic, Inter for English

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **API Design**: RESTful endpoints under `/api` prefix
- **Session Management**: Express-session with MemoryStore (development) or connect-pg-simple (production)
- **Authentication**: Custom password hashing using Node.js crypto (scrypt), session-based auth
- **Build**: esbuild for server bundling, Vite for client bundling

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` - shared between client and server
- **Migrations**: Drizzle Kit with push-based migrations (`db:push` command)
- **Tables**: users, categories, products, orders, digitalItems, siteStats

### Key Design Patterns
- **Monorepo Structure**: Client (`client/`), server (`server/`), and shared code (`shared/`) in single repository
- **Shared Types**: Schema definitions and Zod validators shared between frontend and backend via `@shared/*` path alias
- **Storage Interface**: Abstract `IStorage` interface in `server/storage.ts` for database operations
- **API Request Helper**: Centralized `apiRequest` function in `client/src/lib/queryClient.ts` for consistent error handling

### Authentication Flow
1. User registers with name, username, email, password
2. Password hashed using scrypt with random salt
3. Session created and stored server-side
4. `/api/auth/me` endpoint for session validation on page load
5. Admin privileges controlled via `isAdmin` boolean on user record
6. Ban enforcement across all authenticated routes with automatic session destruction

### Security Features
- **User Ban System**: Admins can ban/unban users; banned users are blocked from all authenticated routes
- **Zod Validation**: All admin endpoints validated with Zod schemas (adminBanUserSchema, adminToggleAdminSchema, adminOrderStatusSchema)
- **Order Idempotency**: Prevents re-processing of completed/cancelled orders
- **Stock Validation**: Ensures stock > 0 before order completion

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries with PostgreSQL dialect

### UI Component Libraries
- **shadcn/ui**: Complete component library based on Radix UI primitives
- **Radix UI**: Accessible, unstyled UI primitives for dialogs, dropdowns, forms, etc.
- **Lucide React**: Icon library

### Form & Validation
- **React Hook Form**: Form state management
- **Zod**: Schema validation, integrated with Drizzle via drizzle-zod
- **@hookform/resolvers**: Zod resolver for React Hook Form

### Styling
- **Tailwind CSS**: Utility-first CSS framework
- **class-variance-authority**: For component variant management
- **tailwind-merge**: For merging Tailwind classes

### Development Tools
- **Vite**: Frontend build tool with HMR
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast JavaScript bundler for production server build

### Fonts (External CDN)
- **Google Fonts**: Tajawal (Arabic), Inter (English), JetBrains Mono (code)

## Recent Changes (January 2026)

### Pages Added
- `/category/:slug` - Category browsing page with filtered products
- `/about` - About Us page with company information
- `/contact` - Contact page with form
- `/faq` - FAQ page with accordion
- `/settings` - User settings with profile and password management

### API Endpoints Added
- `PATCH /api/auth/profile` - Update user profile (validated with Zod)
- `POST /api/auth/change-password` - Change password (validated with Zod)

### Database Seeding
- 4 categories: programming-tools, software, gaming-cards, gaming-accounts
- 12 products with real images from Unsplash and professional descriptions

### Security Improvements
- Added `updateProfileSchema` and `changePasswordSchema` in shared/schema.ts
- Server-side validation for profile and password endpoints using Zod safeParse

### Stripe Payment Integration
- **Stripe Checkout**: Credit card payments via Stripe Checkout Sessions with webhook-based fulfillment
- **Security Model**:
  - Card payments MUST go through Stripe checkout - /api/orders blocks card payments
  - Order fulfillment happens EXCLUSIVELY via Stripe webhook (checkout.session.completed)
  - /api/checkout/complete is read-only status check, NOT fulfillment
  - Key reservation prevents overselling during checkout
  - Idempotency via orders.stripeSessionId prevents duplicate fulfillment
- **Endpoints**:
  - `POST /api/checkout/create-session` - Creates checkout session, reserves product key
  - `POST /api/checkout/complete` - Status check only (no order creation)
  - `GET /api/checkout/status/:sessionId` - Polling endpoint for order status
  - `GET /api/stripe/config` - Returns Stripe publishable key
  - `POST /api/stripe/webhook` - Handles Stripe events for order fulfillment
- **Flow**: User selects product → Creates checkout session (key reserved) → Redirects to Stripe → Pays → Webhook processes checkout.session.completed → Order created & fulfilled → Key marked used → Digital item in vault
- **Product Keys**: Stored in `productKeys` table with reservation system (isReserved, reservedSessionId, reservedAt)
- **USDT Option**: Alternative manual payment via USDT TRC20 - orders stay pending until admin confirms

### Dynamic Statistics System
- `/api/public/stats` - Returns real-time statistics (product count, customer count, satisfaction rate)
- Satisfaction rate calculated from approved reviews in database

### Customer Reviews System
- `reviews` table with approval workflow
- `/api/public/reviews` - Returns approved testimonials for homepage
- Admin can approve/manage reviews via dashboard

### Shopping Cart System
- **CartContext**: React context for managing cart state in localStorage
- **CartSheet**: Slide-out cart preview from header
- **Cart Page**: Full cart management at `/cart` with quantity controls
- **Add to Cart**: ProductCard and ProductDetail support adding items to cart

### Mobile Navigation
- **Mobile Menu**: Hamburger menu with Sheet component for mobile devices
- **ScrollToTop**: Automatic scroll to top on route change

### Legal Pages
- `/privacy` - Privacy Policy page with bilingual content
- `/terms` - Terms of Service page with bilingual content

### Footer Improvements
- Newsletter subscription form
- Trust badges (security, speed, payments)
- Social media links (Twitter, GitHub, Discord, Email)

### Admin Dashboard Enhancements (January 28, 2026)
- **Categories Management**: Full CRUD operations for product categories
  - Add new categories with Arabic/English names, slug, and icon
  - Edit existing categories
  - Delete categories
  - API endpoints: `POST/PATCH/DELETE /api/admin/categories`
- **Reviews Moderation**: Complete review approval workflow
  - View all reviews with user and product details
  - Approve pending reviews
  - Reject approved reviews
  - Delete reviews
  - API endpoints: `GET /api/admin/reviews`, `PATCH /api/admin/reviews/:id/approve`, `PATCH /api/admin/reviews/:id/reject`, `DELETE /api/admin/reviews/:id`
- **Product Keys Inventory**: Digital product key management
  - Add new product keys (auto-updates stock)
  - View all keys with status (Available/Reserved/Used)
  - Delete unused keys
  - API endpoints: `GET /api/admin/product-keys`, `POST /api/admin/product-keys`, `DELETE /api/admin/product-keys/:id`
- **Admin Dashboard Tabs**: Products, Categories, Users, Orders, Reviews, Keys

### OAuth Social Login (January 28, 2026)
- **Google OAuth**: Login/register via Google account
  - Endpoints: `GET /api/auth/google`, `GET /api/auth/google/callback`
  - Environment variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- **Discord OAuth**: Login/register via Discord account
  - Endpoints: `GET /api/auth/discord`, `GET /api/auth/discord/callback`
  - Environment variables: `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`
- **OAuth Config Endpoint**: `GET /api/auth/oauth-config` - Returns which OAuth providers are enabled
- **User Schema Updates**: Added `googleId` and `discordId` fields to users table
- **Account Linking**: Existing users can link OAuth accounts via email matching

### Email System (January 29, 2026)
- **Email Service**: Resend API integration for transactional emails
  - Environment variable: `RESEND_API_KEY`
- **Email Verification**: 
  - `POST /api/auth/send-verification` - Sends 6-digit verification code
  - `POST /api/auth/verify-email` - Verifies email with code
  - Frontend page: `/verify-email`
- **Password Reset**:
  - `POST /api/auth/forgot-password` - Sends password reset email with token
  - `POST /api/auth/reset-password` - Resets password with token
  - Frontend pages: `/forgot-password`, `/reset-password`
- **Email Change**:
  - `POST /api/auth/request-email-change` - Sends verification to new email
  - `POST /api/auth/verify-email-change` - Confirms email change
- **MFA Notification**:
  - `POST /api/auth/notify-mfa-enrolled` - Sends notification when MFA is enabled
- **Database Tables**: `password_reset_tokens`, `email_change_requests`