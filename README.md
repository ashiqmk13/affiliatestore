# Sample Website — SaaS Platform

A full-stack affiliate store SaaS platform built with Next.js 14, Prisma, PostgreSQL, Stripe, and Tailwind CSS.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| Database | PostgreSQL via Prisma ORM |
| Auth | Custom JWT + httpOnly cookies |
| Payments | Stripe Subscriptions |
| Email | Nodemailer (SMTP) |
| Scraping | Cheerio (Open Graph parser) |
| Deployment | Vercel + Supabase |

---

## Complete File Structure

```
affiliatestore/
├── prisma/
│   ├── schema.prisma              # Database models
│   └── seed.ts                    # Admin user + platform settings seed
│
├── src/
│   ├── middleware.ts              # Route protection middleware
│   │
│   ├── app/
│   │   ├── layout.tsx             # Root HTML layout
│   │   ├── page.tsx               # Landing/marketing homepage
│   │   ├── not-found.tsx          # 404 page
│   │   ├── globals.css            # Global styles + CSS variables
│   │   │
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── forgot-password/page.tsx
│   │   │
│   │   ├── dashboard/
│   │   │   ├── layout.tsx         # Dashboard layout with sidebar
│   │   │   ├── page.tsx           # Overview/home
│   │   │   ├── store/page.tsx     # Store settings
│   │   │   ├── products/page.tsx  # Product management
│   │   │   ├── analytics/page.tsx # Analytics dashboard
│   │   │   ├── billing/page.tsx   # Subscription + billing
│   │   │   ├── domain/page.tsx    # Custom domain management
│   │   │   └── settings/page.tsx  # Account settings
│   │   │
│   │   ├── admin/
│   │   │   ├── layout.tsx         # Admin layout (ADMIN role only)
│   │   │   ├── page.tsx           # Platform overview stats
│   │   │   ├── users/page.tsx     # User management table
│   │   │   ├── stores/page.tsx    # All stores view
│   │   │   └── settings/page.tsx  # Platform settings editor
│   │   │
│   │   ├── store/
│   │   │   └── [slug]/page.tsx    # Public storefront (SEO-ready)
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts
│   │       │   ├── register/route.ts
│   │       │   ├── logout/route.ts
│   │       │   ├── forgot-password/route.ts
│   │       │   ├── reset-password/route.ts
│   │       │   └── verify-otp/route.ts
│   │       │
│   │       ├── dashboard/
│   │       │   ├── store/route.ts
│   │       │   ├── products/route.ts
│   │       │   ├── products/[id]/route.ts
│   │       │   ├── analytics/route.ts
│   │       │   ├── domain/route.ts
│   │       │   ├── domain/verify/route.ts
│   │       │   └── account/route.ts
│   │       │
│   │       ├── billing/
│   │       │   ├── checkout/route.ts
│   │       │   ├── portal/route.ts
│   │       │   └── webhook/route.ts
│   │       │
│   │       ├── admin/
│   │       │   ├── stats/route.ts
│   │       │   ├── users/route.ts
│   │       │   ├── users/[id]/route.ts
│   │       │   └── settings/route.ts
│   │       │
│   │       ├── scrape/route.ts
│   │       └── store/
│   │           ├── [slug]/route.ts
│   │           └── [slug]/click/route.ts
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── Sidebar.tsx        # Navigation sidebar
│   │   │   ├── Topbar.tsx         # Mobile header
│   │   │   ├── Overview.tsx       # Dashboard home widgets
│   │   │   ├── StoreClient.tsx    # Store settings form
│   │   │   ├── ProductsClient.tsx # Products list + filters
│   │   │   ├── AddProductModal.tsx # Add/edit product modal
│   │   │   ├── AnalyticsClient.tsx # Charts + analytics
│   │   │   ├── BillingClient.tsx  # Subscription management
│   │   │   ├── DomainClient.tsx   # Domain + DNS setup
│   │   │   └── SettingsClient.tsx # Profile + password
│   │   │
│   │   ├── admin/
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AdminUsersClient.tsx
│   │   │   └── AdminSettingsClient.tsx
│   │   │
│   │   └── store/
│   │       └── StoreClient.tsx    # Public storefront UI
│   │
│   └── lib/
│       ├── db.ts                  # Prisma client singleton
│       ├── auth.ts                # JWT, sessions, OTP, bcrypt
│       ├── email.ts               # Nodemailer email templates
│       ├── scraper.ts             # URL → product data (Cheerio)
│       ├── stripe.ts              # Stripe helpers
│       ├── settings.ts            # Platform settings CRUD
│       └── utils.ts               # cn, slugify, formatters, etc.
│
├── package.json
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
├── postcss.config.js
└── .env.example
```

---

## Setup Instructions

### Prerequisites
- Node.js v18 or higher
- npm v9 or higher
- PostgreSQL (local or cloud)
- Stripe account (for payments)
- Gmail or SMTP provider (for emails)

### Step 1 — Install dependencies

```bash
cd affiliatestore
npm install
```

### Step 2 — Configure environment

```bash
cp .env.example .env
```

Open `.env` and fill in:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/affiliatestore"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Auth secrets — generate with: openssl rand -base64 32
NEXTAUTH_SECRET="..."
JWT_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_PRICE_ID="price_..."

# Email (Gmail example)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="yourmail@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@yourdomain.com"
```

### Step 3 — Set up Stripe

1. Log into [dashboard.stripe.com](https://dashboard.stripe.com)
2. Go to **Products** → Create a product
3. Add a price: **$13/month, recurring**
4. Copy the **Price ID** (starts with `price_`) → paste as `STRIPE_PRICE_ID`
5. Go to **Developers → Webhooks** → Add endpoint:
   - URL: `http://localhost:3000/api/billing/webhook` (for dev)
   - Select events: `customer.subscription.*`, `invoice.payment_succeeded`, `invoice.payment_failed`
6. Copy webhook secret → paste as `STRIPE_WEBHOOK_SECRET`

### Step 4 — Set up the database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates all tables)
npm run db:push

# Seed admin user and default settings
npm run db:seed
```

**Seeded admin credentials:**
- Email: `admin@samplewebsite.com`
- Password: `Admin@123456`

---

## Run Instructions

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### In a second terminal — run Stripe webhook listener

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli
stripe listen --forward-to localhost:3000/api/billing/webhook
```

### View database

```bash
npm run db:studio
# Opens Prisma Studio at http://localhost:5555
```

### Available URLs in dev

| URL | Description |
|---|---|
| `http://localhost:3000` | Landing page |
| `http://localhost:3000/auth/login` | Login |
| `http://localhost:3000/auth/register` | Register |
| `http://localhost:3000/dashboard` | User dashboard |
| `http://localhost:3000/admin` | Admin panel |
| `http://localhost:3000/store/[slug]` | Public storefront |

---

## Deployment Instructions (Vercel + Supabase)

### Step 1 — Create a PostgreSQL database on Supabase

1. Go to [supabase.com](https://supabase.com) → New project
2. **Settings → Database → Connection string → URI mode**
3. Copy the URI — this is your `DATABASE_URL`

### Step 2 — Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# For production
vercel --prod
```

### Step 3 — Add environment variables in Vercel

Go to your Vercel project → **Settings → Environment Variables**

Add all variables from `.env`:
- `DATABASE_URL` — your Supabase connection string
- `NEXT_PUBLIC_APP_URL` — your Vercel app URL (e.g. `https://your-app.vercel.app`)
- `JWT_SECRET`, `NEXTAUTH_SECRET` — strong random strings
- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `STRIPE_WEBHOOK_SECRET`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`

### Step 4 — Run migrations on production

```bash
# Set your production DATABASE_URL temporarily
DATABASE_URL="your-supabase-url" npx prisma db push
DATABASE_URL="your-supabase-url" npx prisma db seed
```

### Step 5 — Set up production Stripe webhook

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-app.vercel.app/api/billing/webhook`
3. Select events: all `customer.subscription.*` and `invoice.*`
4. Copy the new webhook secret → update `STRIPE_WEBHOOK_SECRET` in Vercel env vars
5. Redeploy: `vercel --prod`

### Step 6 — Custom domain (optional)

1. Vercel Dashboard → Project → **Domains**
2. Add your domain, follow DNS instructions
3. Update `NEXT_PUBLIC_APP_URL` to your custom domain
4. Redeploy

---

## Features Summary

| Feature | Implementation |
|---|---|
| **Auth** | Custom JWT sessions, httpOnly cookies, bcrypt passwords |
| **Password reset** | 6-digit OTP via email, 10-minute expiry |
| **Email verification** | OTP-based at registration |
| **Trial** | 30 days free, tracked in DB |
| **Subscriptions** | Stripe with webhook sync |
| **Product import** | URL scraping via Cheerio + Open Graph |
| **Manual products** | Full form with images, tags, SEO |
| **Store builder** | Name, theme, colors, meta, publish toggle |
| **Analytics** | Daily pageviews, visitors, clicks — stored in Postgres |
| **Custom domains** | TXT record verification + CNAME routing |
| **Admin panel** | User management, promote/demote, delete, extend trial |
| **Platform settings** | Platform name, domain, price — editable from admin |
| **SEO** | Per-store + per-product meta title + description |
| **Audit log** | All admin actions and logins logged |
| **Security** | Sessions invalidated on password change, rate limiting via Vercel |
| **Public storefront** | SEO-ready, filterable, product modals, click tracking |

---

## Customization

### Change the platform name
Log in as admin → `/admin/settings` → Update "Platform Name"

### Change subscription price (display)
Admin settings → Update "Monthly Price". **Also update in Stripe** to match.

### Add a new admin
From admin panel → Users → find user → Actions → Make Admin

### Enable maintenance mode
Admin Settings → Maintenance Mode → On

---

## Security Notes

- Passwords hashed with bcrypt (12 rounds)
- Sessions stored in DB, invalidated on logout and password change
- JWT verified on every protected API route
- Admin routes double-checked: middleware + route handler
- OTP tokens expire in 10 minutes and are single-use
- Stripe webhook signature verified on every request
- Never store card details — all payments handled by Stripe
