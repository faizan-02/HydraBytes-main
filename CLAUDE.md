# CLAUDE.md - HydraBytes Project Guide

## What is this project?

HydraBytes is a Pakistan-based IT agency website and client management platform. It serves as both a marketing site (showcasing services, portfolio, pricing) and a client portal (auth, dashboard, invoicing, project tracking). Live at **https://www.hydrabytes.tech**.

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19 and TypeScript
- **Styling:** CSS Modules + Tailwind CSS v4 (coexist side-by-side). Global tokens live in `src/app/globals.css`
- **Animations:** Framer Motion (`framer-motion` v12). Heavy use throughout
- **Icons:** `lucide-react` for UI icons, `react-icons` for brand/tech logos
- **Database:** PostgreSQL via Prisma ORM. Schema at `prisma/schema.prisma`
- **Auth:** NextAuth v5 (beta) with Credentials, Google, and GitHub providers. Config at `auth.ts`
- **Email:** Resend API (`src/lib/mailer.ts`) - but see warning below
- **Analytics:** PostHog (client-side), Sentry (error tracking)
- **Deployment:** Vercel (auto-deploys from `master` branch)
- **Package manager:** npm

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    page.tsx              # Homepage (hero, gallery, services, CTA)
    about/page.tsx        # Team, mission, values, timeline
    portfolio/page.tsx    # Projects grid + tech stack marquee
    services/page.tsx     # Service cards with orbiting skills animation
    pricing/page.tsx      # Pricing tiers
    contact/page.tsx      # Contact form with service/budget dropdowns
    blog/page.tsx         # Blog listing
    admin/page.tsx        # Admin panel (protected)
    dashboard/page.tsx    # Client dashboard (protected)
    auth/                 # signin, register, verify, forgot-password, reset-password
    payment/              # Invoice payment pages (local bank + USDT)
    legal/                # terms, privacy, refund policies
    api/                  # API routes (contact, auth, newsletter, payment, admin, cron)
    layout.tsx            # Root layout (fonts, metadata, JsonLd, Suspense boundary)
    ClientLayout.tsx      # Client-side providers (Session, Theme, Navbar, Footer)
    globals.css           # CSS custom properties, resets, utility classes
  components/
    Navbar.tsx            # Main navigation with mobile menu
    Footer.tsx            # Site footer
    AnimatedSection.tsx   # Scroll-triggered fade/slide wrapper (Framer Motion)
    SpotlightCard.tsx     # Card with mouse-following spotlight effect
    MagneticButton.tsx    # Button that magnetically follows cursor
    FloatingParticles.tsx # Ambient floating particle background
    BlurFade.tsx          # Blur + fade-in animation wrapper
    ui/                   # Reusable UI primitives
      circular-gallery.tsx    # 3D rotating project carousel (homepage)
      perspective-marquee.tsx # 3D perspective text marquee (portfolio)
      text-scramble.tsx       # Text scramble/decode animation
      grid-glow-effect-purple-blue.tsx  # Mouse-following glow border effect
      LogoLoop.tsx            # Infinite scrolling logo strip
      orbiting-skills.tsx     # Orbiting tech icons animation
      fluid-dropdown.tsx      # Animated dropdown select
      pricing-section.tsx     # Pricing cards component
  lib/
    prisma.ts             # Prisma client singleton
    ThemeContext.tsx       # Dark/light theme provider (data-theme attribute)
    mailer.ts             # Email sending via Resend API
    validate.ts           # Input validation helpers
    rateLimit.ts          # API rate limiting
    useInactivityLogout.ts # Auto-logout on inactivity
    utils.ts              # General utilities (cn, etc.)
auth.ts                   # NextAuth v5 configuration
middleware.ts             # Route protection + CSP headers (src/middleware.ts)
prisma/schema.prisma      # Database schema
```

## Theming System

- Uses `data-theme="dark"` / `data-theme="light"` attribute on `<html>`
- CSS custom properties defined in `globals.css` under `[data-theme='dark']` and `[data-theme='light']`
- Tailwind dark mode configured as `['selector', '[data-theme="dark"]']` in `tailwind.config.ts`
- Default: dark on mobile (<768px), light on desktop. User choice stored in `localStorage` key `hydrabytes-theme-manual`
- An inline `<script>` in `layout.tsx` prevents FOUC by applying the theme before paint
- Access theme in components via `useTheme()` from `src/lib/ThemeContext`

## Brand Colors

- Primary teal: `#0891b2` (dark), `#0e7490` (light)
- Cyan accent: `#00e5ff` / `#00b4d8`
- Gradient: `linear-gradient(135deg, #1a6b7a, #00b4d8)` (dark), `linear-gradient(135deg, #1e3a8a, #0891b2)` (light)
- Background dark: `#0a0a12` -> `#12121e` -> `#1a1a2e`
- Background light: `#f8f8fc` -> `#ffffff` -> `#f0f0f8`

## Styling Conventions

- **CSS Modules** for page and component styles (e.g., `page.module.css`, `services.module.css`)
- **Global utility classes** in `globals.css`: `.container`, `.section`, `.section-header`, `.section-label`, `.section-label-badge`, `.section-title`, `.section-subtitle`, `.gradient-text`, `.glass-card`, `.btn`, `.btn-primary`, `.btn-secondary`, `.grid-2/3/4`
- Responsive breakpoints: 1024px (tablet), 768px (mobile)
- Tailwind is available but most existing styles use CSS Modules + custom properties. Both approaches coexist
- Inline styles are used in some components (especially `circular-gallery.tsx` and homepage) for dynamic values

## Key Patterns

### Animation
- `AnimatedSection` wraps content for scroll-triggered fade/slide animations
- `SpotlightCard` adds interactive mouse-following spotlight to cards
- `GlowingEffect` adds animated glowing borders (performance-sensitive, uses throttled RAF)
- `FloatingParticles` provides ambient background particles on hero sections
- All animations respect `prefers-reduced-motion` via CSS media query in `globals.css`

### Performance Notes
- `GlowingEffect` was optimized to avoid framer-motion's `animate()` for the glow angle (caused memory leaks). Uses direct `style.setProperty` instead
- `backdrop-filter: blur()` was removed from `SpotlightCard` to reduce GPU compositing during scroll
- The circular gallery uses `requestAnimationFrame` + `IntersectionObserver` to pause when off-screen
- Hero workspace images use native `<img>` (not `next/image`) for theme opacity layering

### Auth Flow
- NextAuth v5 with JWT strategy
- Protected routes: `/dashboard`, `/admin` and their API counterparts
- Middleware at `src/middleware.ts` handles auth checks + CSP headers
- OAuth users are auto-upserted into the database with linked contact submissions

### Database
- PostgreSQL via Prisma. Models: User, Session, Project, Invoice, ContactSubmission, NewsletterSubscriber, EmailVerificationToken, PasswordResetToken, EmailChangeToken
- `prisma generate` runs automatically on `npm run build` and `postinstall`

## Environment Variables

See `.env.example` for the full list. Key ones:
- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - NextAuth secret
- `GOOGLE_CLIENT_ID/SECRET`, `GITHUB_CLIENT_ID/SECRET` - OAuth
- `RESEND_API_KEY` - Email delivery
- `NEXT_PUBLIC_POSTHOG_KEY` - Analytics
- `NEXT_PUBLIC_SENTRY_DSN` - Error tracking

## Commands

```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Production build (runs prisma generate first)
npm run start        # Start production server
npm run lint         # ESLint
npx prisma studio    # Open Prisma database GUI
npx prisma db push   # Push schema changes to database
```

## Important Rules

1. **Never use em dashes (---)** in website copy. Use a colon, comma, or period instead.
2. **Never use Resend for Gmail-originated emails.** Resend bounces them. The contact form and transactional emails currently use Resend API (`src/lib/mailer.ts`), but if emails need to go to/from Gmail addresses, use Gmail SMTP via nodemailer instead.
3. **Only push to `HydraBytes-main` repo.** There is an old abandoned `hydrabytes` repo; never push to it.
4. **Vercel auto-deploys from `master`.** Every push to master triggers a production deployment.
5. **Images in `public/portfolio/`** are project screenshots used by both the homepage gallery and portfolio page. When adding a new project, add the image there.
6. **Team data** is in `src/app/about/page.tsx` (the `team` array). Featured projects are defined in both `src/app/page.tsx` (homepage gallery subset) and `src/app/portfolio/page.tsx` (full list).

## Known Issues (from prior audit)

- `mailer.ts` still uses Resend API; migration to Gmail SMTP (nodemailer) is planned
- Some `<img>` tags used instead of `next/image` (intentional in hero for theme layering, less intentional in Footer/Navbar/auth pages)
- CSP header uses `unsafe-inline` for scripts and styles (needed for inline JSON-LD and email rendering)
- The `resend` package is still in `package.json` dependencies even though nodemailer is also present
