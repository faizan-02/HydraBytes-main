# CLAUDE.md - HydraBytes Project Guide

## What is this project?

HydraBytes is a Pakistan-based IT agency website and client management platform. It serves as both a marketing site (services, portfolio, pricing, blog, contact) and a client portal (auth, dashboard, invoicing, project tracking). Live at **https://www.hydrabytes.tech**.

Founded in 2024 by Faizan Jawad. The team includes co-founders Asad Ali Khan and Haris Munir (AI Lead), plus designers and developers. Team data lives in `src/app/about/page.tsx` (the `team` array).

## Tech Stack

| Layer | Technology | Version / Notes |
|-------|-----------|----------------|
| Framework | Next.js (App Router) | 16.x with React 19, TypeScript 5.9 |
| Styling | CSS Modules + Tailwind CSS | Tailwind v4, coexist side-by-side. Tokens in `globals.css` |
| Animations | Framer Motion | v12. Heavy use throughout all pages |
| Icons | `lucide-react` + `react-icons` | Lucide for UI icons, react-icons for brand/tech logos |
| UI Primitives | `@radix-ui/react-slot`, `class-variance-authority`, `clsx`, `tailwind-merge` | Utility-first component helpers |
| Number Animation | `@number-flow/react` | Animated number transitions |
| 3D / WebGL | `ogl` | Used in circular gallery and visual effects |
| Database | PostgreSQL via Prisma ORM | v5.22. Schema at `prisma/schema.prisma` |
| Auth | NextAuth v5 (beta) | Credentials + Google + GitHub. Config at `auth.ts` |
| Email | Resend API | `src/lib/mailer.ts`. See warning in Important Rules |
| Analytics | PostHog (client-side) | Consent-gated via `CookieBanner.tsx` |
| Error Tracking | Sentry | `@sentry/nextjs` v10. Configs: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` |
| Deployment | Vercel | Auto-deploys from `master` branch |
| Package Manager | npm | |

## Project Structure

```
src/
  app/
    page.tsx                    # Homepage (hero, 3D gallery, services, stats, tech logos, CTA)
    about/page.tsx              # Team, mission, values, company timeline
    portfolio/
      page.tsx                  # Projects grid with category filters + tech stack marquee
      projects.ts               # Centralized project data (type Project + array)
      [slug]/page.tsx           # Individual project detail pages (dynamic route)
    services/page.tsx           # Service cards with orbiting skills animation
    pricing/page.tsx            # Pricing tiers
    contact/page.tsx            # Contact form with service/budget dropdowns
    blog/page.tsx               # Blog listing (featured + grid, links to dev.to)
    admin/page.tsx              # Admin panel (protected, admin role only)
    dashboard/
      page.tsx                  # Client dashboard (protected)
      settings/page.tsx         # User profile settings (name, phone, company, email, password)
    auth/
      signin/page.tsx           # Sign in (credentials + OAuth)
      register/page.tsx         # Registration with OTP email verification
      verify/page.tsx           # OTP verification page
      forgot-password/page.tsx  # Password reset request
      reset-password/page.tsx   # Password reset with token
      complete-profile/page.tsx # Post-OAuth profile completion (phone, company)
      error/page.tsx            # Auth error page
    payment/
      local/[invoiceId]/page.tsx # Local bank payment (JazzCash, EasyPaisa, NayaPay)
      success/page.tsx           # Payment success confirmation
    legal/
      terms/page.tsx            # Terms of service
      privacy/page.tsx          # Privacy policy
      refund/page.tsx           # Refund policy
    unsubscribe/page.tsx        # Newsletter unsubscribe
    api/
      auth/[...nextauth]/route.ts   # NextAuth handler
      auth/register/route.ts        # User registration
      auth/verify-email/route.ts    # OTP email verification
      auth/resend-otp/route.ts      # Resend OTP
      auth/forgot-password/route.ts # Password reset request
      auth/reset-password/route.ts  # Password reset
      contact/route.ts              # Contact form submission
      newsletter/route.ts           # Newsletter subscribe
      newsletter/unsubscribe/route.ts # Newsletter unsubscribe
      dashboard/route.ts            # Dashboard data (protected)
      admin/route.ts                # Admin operations (protected, admin only)
      user/settings/route.ts        # User profile update (protected)
      payment/local/route.ts        # Local payment submission
      verify-submission/route.ts    # Contact submission verification
      verify-project/route.ts       # Project verification via token
      indexnow/route.ts             # IndexNow SEO ping
      cron/project-reminders/route.ts # Scheduled project reminder emails
    layout.tsx              # Root layout (fonts, metadata, JsonLd, FOUC-prevention script)
    ClientLayout.tsx        # Client-side providers (Session, Theme, Navbar, Footer, WhatsApp FAB)
    globals.css             # CSS custom properties, resets, utility classes
    loading.tsx             # Route-level loading screen (hexagon logo + progress bar)
    error.tsx               # Global error boundary
    not-found.tsx           # Custom 404 page
    robots.ts               # robots.txt generation (disallows /api, /admin, /dashboard, /payment)
    sitemap.ts              # sitemap.xml generation
    page.module.css         # Homepage styles

  components/
    Navbar.tsx              # Main navigation with cursor-following pill, mobile menu, user dropdown
    Footer.tsx              # Site footer with newsletter signup
    AnimatedSection.tsx     # Scroll-triggered fade/slide wrapper (Framer Motion + IntersectionObserver)
    SpotlightCard.tsx       # Card with mouse-following spotlight effect
    MagneticButton.tsx      # Button that magnetically follows cursor on hover
    FloatingParticles.tsx   # Ambient floating particle background for hero sections
    BlurFade.tsx            # Blur + fade-in animation wrapper
    AnimatedCounter.tsx     # Animated number counter
    AnimatedBeam.tsx        # Animated beam/line effect
    AnimatedGridDots.tsx    # Animated grid dot pattern
    ChipConnectorLines.tsx  # Connection lines between chip elements
    GlassChip.tsx           # Glassmorphism chip component
    GradientText.tsx        # Text with gradient fill
    LogoNetworkAnimation.tsx # Animated logo network (used in Navbar)
    Marquee.tsx             # Generic marquee/scroll component
    NoiseOverlay.tsx        # Noise texture overlay
    NumberTicker.tsx        # Number ticker animation
    Orb.tsx                 # Floating orb visual effect
    PageTransition.tsx      # Page transition wrapper (Framer Motion AnimatePresence)
    ProjectCarousel.tsx     # Project carousel component
    ScrollProgress.tsx      # Page scroll progress bar
    ScrollToTop.tsx         # Scroll-to-top floating button
    TextReveal.tsx          # Text reveal on scroll animation
    TechLogos.tsx           # Tech logo grid/display
    ServiceIcons.tsx        # Custom SVG service icons (Web, Mobile, AI/ML, Cloud)
    LoadingScreen.tsx       # Full-screen loading animation
    PostHogProvider.tsx     # PostHog analytics (consent-gated, manual pageview tracking)
    CookieBanner.tsx        # GDPR cookie consent banner (Accept/Decline)
    JsonLd.tsx              # JSON-LD structured data renderer (Server Component)
    ui/
      circular-gallery.tsx          # 3D rotating project carousel (homepage, uses OGL/WebGL)
      perspective-marquee.tsx        # 3D perspective text marquee (portfolio)
      text-scramble.tsx              # Text scramble/decode animation
      grid-glow-effect-purple-blue.tsx # Mouse-following animated glow border effect
      LogoLoop.tsx                   # Infinite scrolling logo strip
      orbiting-skills.tsx            # Orbiting tech icons animation (services page)
      fluid-dropdown.tsx             # Animated dropdown select
      pricing-section.tsx            # Pricing cards component
      spotlight-card.tsx             # Alternate spotlight card (ui version)
      card.tsx                       # Base card component
      container-scroll-animation.tsx # Scroll-linked container animation
      timeline-animation.tsx         # Timeline animation (about page)
      nav-header.tsx                 # Navigation header primitive
      glowing-shadow.tsx             # Glowing shadow effect
      vertical-cut-reveal.tsx        # Vertical cut text reveal
      liquid-glass-button.tsx        # Liquid glass button effect
      sparkles.tsx                   # Sparkle particle effect
      GlassIcons.tsx                 # Frosted glass icon component (multiple colors)

  lib/
    prisma.ts              # Prisma client singleton (prevents multiple instances in dev)
    ThemeContext.tsx        # Dark/light theme provider (React Context + data-theme attribute)
    mailer.ts              # Email sending via Resend API with branded HTML wrapper
    validate.ts            # Input validation + sanitization (stripTags, escapeHtml, field validators, timing-safe compare)
    rateLimit.ts           # In-memory API rate limiter with auto-sweep (IP-based buckets)
    useInactivityLogout.ts # Auto-logout after 30min inactivity (localStorage + visibility API)
    utils.ts               # Utility functions (cn = clsx + tailwind-merge)

auth.ts                    # NextAuth v5 config (JWT strategy, OAuth upsert, password-change invalidation)
src/middleware.ts          # Route protection (auth check) + CSP headers + admin role gate
prisma/schema.prisma       # Database schema
sentry.client.config.ts   # Sentry browser config
sentry.server.config.ts   # Sentry server config
sentry.edge.config.ts     # Sentry edge runtime config
next.config.mjs           # Next.js config (security headers, Sentry wrapper, non-www redirect)
tailwind.config.ts         # Tailwind config (brand colors, fonts, dark mode selector)
```

## Pages Overview

| Route | Purpose |
|-------|---------|
| `/` | Homepage: hero with workspace mockup, 3D circular gallery, service highlights, stats, tech logo marquee, CTA |
| `/services` | Four service categories (Web, Mobile, AI/ML, Cloud & DevOps) with orbiting skills animation and glowing cards |
| `/portfolio` | Filterable project grid (All/Web/Mobile/AI-ML) with tech stack marquee. Links to individual project pages |
| `/portfolio/[slug]` | Dynamic project detail page (challenge, solution, result, features, gallery, video) |
| `/about` | Team cards, company values with GlassIcons, company timeline |
| `/pricing` | Pricing tiers |
| `/blog` | Featured article + article grid. Articles link to dev.to. Uses TextScramble animation |
| `/contact` | Contact form with service/budget dropdowns, validated and rate-limited |
| `/auth/*` | Full auth flow: signin, register, OTP verify, forgot/reset password, complete profile, error |
| `/dashboard` | Client dashboard showing projects, invoices, stats (protected) |
| `/dashboard/settings` | User settings: name, phone, company, email change, password change (protected) |
| `/admin` | Admin panel for managing submissions, projects, invoices, users (protected, admin role) |
| `/payment/local/[invoiceId]` | Invoice payment via local Pakistani banks (JazzCash, EasyPaisa, NayaPay) |
| `/legal/*` | Terms, privacy policy, refund policy |
| `/unsubscribe` | Newsletter unsubscribe |

## Portfolio Projects

All project data is centralized in `src/app/portfolio/projects.ts`. The homepage `CircularGallery` shows a randomized subset. Current projects (10):

1. **NutraAI Health Coach** (AI/ML) - AI wellness assistant with personalized nutrition/fitness
2. **Traffic Detection using YOLO** (AI/ML) - Real-time vehicle detection from CCTV feeds
3. **OptiPro: Retinal Disease Detection** (AI/ML) - ResNet-101 retinal scan classifier with Grad-CAM
4. **AI Student Stress Management** (AI/ML) - ML-based mental health screening platform
5. **Lung Cancer Image Classifier** (AI/ML) - CNN histopathology classifier (3 classes)
6. **Inventra: Smart Inventory Management** (Web) - Inventory + order + margin analytics platform
7. **AI Voice Chat Agent** (AI/ML) - 104+ AI characters, real-time voice via WebRTC
8. **Safe-Sawar: Women-First Carpooling** (Mobile) - NADRA-verified carpooling, React Native, beta
9. **CPAi: Bank Statement Analysis** (Web) - AI credit profiling for 12 Malaysian bank formats
10. **Politian: Transparent Voting Platform** (Web) - Secure online voting for Pakistani elections

Project assets live in `public/` under project-specific folders (e.g., `public/Nutra_AI/`, `public/Opti_Pro/`). Portfolio thumbnails are in `public/portfolio/`.

## Theming System

- Uses `data-theme="dark"` / `data-theme="light"` attribute on `<html>`
- CSS custom properties defined in `globals.css` under `[data-theme='dark']` and `[data-theme='light']`
- Tailwind dark mode configured as `['selector', '[data-theme="dark"]']` in `tailwind.config.ts`
- Default: dark on mobile (<768px), light on desktop. User choice stored in `localStorage` key `hydrabytes-theme-manual`
- An inline `<script>` in `layout.tsx` prevents FOUC by applying the theme before paint
- Access theme in components via `useTheme()` from `src/lib/ThemeContext`

## Brand Colors

| Token | Dark | Light |
|-------|------|-------|
| Primary | `#0891b2` | `#0e7490` |
| Cyan accent | `#00e5ff` / `#00b4d8` | `#06b6d4` |
| Gradient | `linear-gradient(135deg, #1a6b7a, #00b4d8)` | `linear-gradient(135deg, #1e3a8a, #0891b2)` |
| BG scale | `#0a0a12` > `#12121e` > `#1a1a2e` | `#f8f8fc` > `#ffffff` > `#f0f0f8` |
| Text primary | `#f0f0f5` | `#1a1a2e` |
| Text secondary | `#a0a0b8` | `#4a4a65` |
| Border | `rgba(0,180,216,0.15)` | `rgba(14,116,144,0.1)` |
| Nav BG | `rgba(10,10,18,0.8)` | `rgba(248,248,252,0.85)` |

## Styling Conventions

- **CSS Modules** for page and component styles (e.g., `page.module.css`, `services.module.css`, `Navbar.module.css`)
- **Global utility classes** in `globals.css`: `.container`, `.section`, `.section-header`, `.section-label`, `.section-label-badge`, `.section-title`, `.section-subtitle`, `.gradient-text`, `.glass-card`, `.btn`, `.btn-primary`, `.btn-secondary`, `.grid-2/3/4`
- **CSS custom properties** for all color/spacing/shadow tokens. Components use `var(--token-name)` not raw values
- Responsive breakpoints: 1024px (tablet), 768px (mobile)
- Tailwind is available but most existing styles use CSS Modules + custom properties. Both approaches coexist
- Inline styles are used in some components (especially `circular-gallery.tsx`, `ClientLayout.tsx`, and error/not-found pages) for dynamic values
- Fonts: Inter (body, `--font-inter`) and Poppins (headings, `--font-poppins`), loaded via `next/font/google` with `display: 'swap'`

## Key Patterns

### Animation Components
- `AnimatedSection` wraps content for scroll-triggered fade/slide animations (IntersectionObserver)
- `SpotlightCard` adds interactive mouse-following spotlight to cards
- `GlowingEffect` adds animated glowing borders (uses direct `style.setProperty`, not framer-motion animate)
- `FloatingParticles` provides ambient background particles on hero sections
- `BlurFade` wraps elements with blur + fade-in entrance animation
- `PageTransition` wraps route content with AnimatePresence for page transitions
- `TextScramble` decodes text character-by-character on scroll
- `MagneticButton` follows cursor with spring physics on hover
- All animations respect `prefers-reduced-motion` via CSS media query in `globals.css`

### Performance Notes
- `GlowingEffect` was optimized to avoid framer-motion's `animate()` for the glow angle (caused memory leaks). Uses direct `style.setProperty` instead
- `backdrop-filter: blur()` was removed from `SpotlightCard` to reduce GPU compositing during scroll
- The circular gallery uses `requestAnimationFrame` + `IntersectionObserver` to pause when off-screen
- Hero workspace images use native `<img>` (not `next/image`) for theme opacity layering
- PostHog is only initialized after cookie consent (not loaded by default)
- Tilt animations disabled on pricing, contact, and auth cards for usability

### Auth Flow
- NextAuth v5 with JWT strategy (no database sessions for auth, but Session model exists for custom tracking)
- Providers: Credentials (email/password with bcrypt), Google OAuth, GitHub OAuth
- Protected routes: `/dashboard`, `/dashboard/settings`, `/admin`
- Protected API routes: `/api/dashboard`, `/api/user/settings`, `/api/admin`
- Middleware at `src/middleware.ts` handles auth checks, admin role gates, and CSP headers
- OAuth users are auto-upserted into the database; contacted submissions auto-link to new accounts as projects
- JWT callbacks re-validate role from DB on every request, and invalidate tokens if password changed after issuance
- Profile completion flow: OAuth users without phone/company are flagged via `profileComplete` in JWT
- Inactivity auto-logout after 30 minutes via `useInactivityLogout` hook (localStorage timestamp + visibility API)

### Database Schema
PostgreSQL via Prisma. All models:

| Model | Purpose |
|-------|---------|
| `User` | Users with role (user/admin), optional password, email verification, profile fields |
| `Session` | Custom session tokens (separate from NextAuth JWT) |
| `Project` | Client projects with status workflow (pending > accepted > in_progress > review > completed) |
| `Invoice` | Invoices linked to users/projects with status + payment method tracking |
| `ContactSubmission` | Contact form entries with status (new > contacted > archived > closed) |
| `NewsletterSubscriber` | Newsletter emails with unsubscribe tokens |
| `EmailVerificationToken` | OTP tokens for email verification (6-digit, expiring) |
| `PasswordResetToken` | Password reset tokens (unique, expiring) |
| `EmailChangeToken` | Email change OTP tokens (one per user, expiring) |

Enums: `SubmissionStatus`, `UserRole`, `ProjectStatus`, `InvoiceStatus`

`prisma generate` runs automatically on `npm run build` (via build script) and `postinstall`.

### API Security
- All API routes use `readJsonBody()` from `validate.ts` which enforces 16KB max body size and JSON content-type
- Input fields sanitized via `stripTags()` and validated with typed validators (`validateName`, `validateEmail`, `validatePassword`, etc.)
- HTML output in emails uses `escapeHtml()` to prevent injection
- Token comparisons use `timingSafeEqualStr()` (constant-time via `crypto.timingSafeEqual`)
- Rate limiting via in-memory IP-based buckets (`rateLimit.ts`) on auth and contact endpoints
- CSP header set in middleware (allows `unsafe-inline` for scripts/styles due to inline JSON-LD and email rendering)
- Security headers in `next.config.mjs`: HSTS, X-Frame-Options DENY, nosniff, referrer policy, permissions policy

### SEO
- `robots.ts` generates robots.txt (allows `/`, disallows `/api/`, `/admin/`, `/dashboard/`, `/payment/`)
- `sitemap.ts` generates sitemap.xml with all public routes and priorities
- `JsonLd` component renders WebSite + Organization structured data in root layout
- OpenGraph and Twitter meta tags configured in root `layout.tsx` metadata
- Google Search Console verified (`MMvuUpAmS35boJ1mt8CuNyvFp2AcsbBRESHDRD3qto8`)
- Bing Webmaster verified (`B48E839D6613D75AD82AF61EC702C4C8`)
- IndexNow API route at `/api/indexnow` for instant index pings
- Non-www to www redirect in `next.config.mjs` (excludes auth callback paths)

### Email System
- `src/lib/mailer.ts` sends branded HTML emails via Resend API
- Emails use a full XHTML email template with logo, social links, and footer
- Email types: OTP verification, password reset, contact form notification, project reminders
- Branded email template wraps all emails in consistent HydraBytes styling
- Cron route `/api/cron/project-reminders` handles scheduled project reminder emails (protected by `CRON_SECRET`)

### Client Layout (Global UI Shell)
`ClientLayout.tsx` wraps all pages and provides:
- `SessionProvider` (NextAuth)
- `ThemeProvider` (dark/light)
- `InactivityGuard` (auto-logout)
- `PostHogProvider` (analytics)
- `ScrollProgress` (top progress bar)
- `LoadingScreen` (initial page load)
- `Navbar` + `Footer`
- `PageTransition` (route animations)
- `ScrollToTop` (floating button)
- `CookieBanner` (GDPR consent)
- WhatsApp FAB button (fixed bottom-left, links to wa.me/923395116983)

## Environment Variables

See `.env.example` for the full list:

```
# Database
DATABASE_URL                  # PostgreSQL connection string

# Auth
AUTH_SECRET                   # NextAuth secret
AUTH_URL                      # App URL (for NextAuth)

# OAuth
GOOGLE_CLIENT_ID / SECRET     # Google OAuth
GITHUB_CLIENT_ID / SECRET     # GitHub OAuth

# Email
RESEND_API_KEY                # Resend API key
TEAM_EMAIL                    # Team notification email (default: contact@hydrabytes.tech)

# Cron
CRON_SECRET                   # Secret for cron endpoint auth

# SEO
INDEXNOW_KEY                  # IndexNow API key

# Payments
USDT_TRC20_WALLET             # USDT TRC20 wallet address

# Analytics
NEXT_PUBLIC_POSTHOG_KEY       # PostHog project key
NEXT_PUBLIC_POSTHOG_HOST      # PostHog host (default: us.i.posthog.com)

# Error Tracking
NEXT_PUBLIC_SENTRY_DSN        # Sentry DSN
SENTRY_AUTH_TOKEN             # Sentry auth (enables source map upload)

# Public
NEXT_PUBLIC_WHATSAPP          # WhatsApp number
NEXT_PUBLIC_CALENDLY_URL      # Calendly booking link
```

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build (runs prisma generate first)
npm run start        # Start production server
npm run lint         # ESLint (flat config, eslint v9)
npx prisma studio    # Open Prisma database GUI
npx prisma db push   # Push schema changes to database
npx prisma generate  # Regenerate Prisma client
```

## Important Rules

1. **Never use em dashes (---)** in website copy. Use a colon, comma, or period instead.
2. **Never use Resend for Gmail-originated emails.** Resend bounces them. The mailer currently uses Resend API (`src/lib/mailer.ts`), but if emails need to go to/from Gmail addresses, use Gmail SMTP via nodemailer instead.
3. **Only push to `HydraBytes-main` repo.** There is an old abandoned `hydrabytes` repo; never push to it.
4. **Vercel auto-deploys from `master`.** Every push to master triggers a production deployment.
5. **Project data is centralized in `src/app/portfolio/projects.ts`.** When adding a new project, add it there. The homepage gallery and portfolio page both read from this array.
6. **Images in `public/portfolio/`** are portfolio thumbnails. Full project assets go in `public/<ProjectName>/` folders.
7. **Team data** is in `src/app/about/page.tsx` (the `team` array).
8. **Blog articles** link externally to dev.to. Blog data is hardcoded in `src/app/blog/page.tsx`.
9. **The `resend` package is still in dependencies** even though `nodemailer` is also present. Migration to Gmail SMTP is planned.

## Known Issues

- `mailer.ts` still uses Resend API; migration to Gmail SMTP (nodemailer) is planned
- Some `<img>` tags used instead of `next/image` (intentional in hero for theme layering, less intentional in Footer/Navbar/auth pages)
- CSP header uses `unsafe-inline` for scripts and styles (needed for inline JSON-LD and email rendering)
- The `resend` package is still in `package.json` alongside `nodemailer`
