# CLAUDE.md — LootLog

## What is LootLog?

LootLog is a **gaming expense tracker** SPA. Gamers log purchases (games, DLC, skins, battle passes, subscriptions, loot boxes, in-game currency), visualize spending analytics, set monthly budgets, and manage wishlists. Bilingual (FR/EN), freemium model (free/premium via Stripe).

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite 7, React Router DOM v7 |
| Backend | Supabase (PostgreSQL + RLS + Edge Functions) |
| Auth | Supabase Auth (email/password only) |
| Payments | Stripe (subscription checkout) |
| Charts | Recharts 3.5 |
| Icons | Lucide React |
| i18n | react-i18next + i18next-browser-languagedetector |
| Analytics | PostHog JS (optional) |
| AI | Anthropic Claude API (smart CSV import) |
| Styling | Custom CSS — Liquid Glass design system (no Tailwind) |
| Fonts | Outfit (headings), DM Sans (body) — via Google Fonts |
| Deploy | Docker (Vite build → Nginx) or Vercel |

## Project Structure

```
lootlog/
├── client/                          # React SPA (Vite)
│   ├── src/
│   │   ├── App.jsx                  # Main router + global state
│   │   ├── index.css                # Full design system (~64KB, CSS vars)
│   │   ├── App.css                  # Component-specific styles
│   │   ├── supabaseClient.js        # Supabase client init
│   │   ├── i18n.js                  # i18next config
│   │   ├── posthog.js               # PostHog analytics wrapper
│   │   ├── components/
│   │   │   ├── LandingPage.jsx      # Marketing page (hero, features, pricing)
│   │   │   ├── LoginPage.jsx        # Dedicated /login route
│   │   │   ├── AuthForm.jsx         # Sign-in/sign-up form
│   │   │   ├── OnboardingFlow.jsx   # 4-step new user wizard
│   │   │   ├── TransactionForm.jsx  # Add/edit transaction modal
│   │   │   ├── TransactionList.jsx  # Sortable/filterable table
│   │   │   ├── StatsOverview.jsx    # Dashboard stat cards
│   │   │   ├── AnalyticsCharts.jsx  # Recharts (platform, genre, store)
│   │   │   ├── BudgetWidget.jsx     # Monthly budget progress (premium)
│   │   │   ├── BudgetForm.jsx       # Set/edit budget modal
│   │   │   ├── WishlistView.jsx     # Wishlist card grid
│   │   │   ├── SearchOverlay.jsx    # Cmd+K search modal
│   │   │   ├── NotificationDropdown.jsx # Budget alerts + summaries
│   │   │   ├── SettingsModal.jsx    # Profile, theme, language, account
│   │   │   ├── UpgradeModal.jsx     # Premium upsell modal
│   │   │   ├── ImportModal.jsx      # CSV + AI import flow
│   │   │   ├── ImportDropZone.jsx   # Drag-and-drop CSV upload
│   │   │   ├── ImportPreviewTable.jsx # Preview rows before insert
│   │   │   ├── SkeletonLoader.jsx   # Shimmer loading placeholders
│   │   │   ├── ErrorBoundary.jsx    # React error fallback
│   │   │   ├── OfflineBanner.jsx    # Network detection banner
│   │   │   └── Toast.jsx           # Notification toasts
│   │   ├── hooks/
│   │   │   ├── useAuth.js           # Auth state + signIn/signUp/signOut
│   │   │   ├── useTransactions.js   # CRUD transactions + filtering
│   │   │   ├── usePlan.js           # Free/premium plan checks
│   │   │   ├── useProfile.js        # User profile CRUD
│   │   │   ├── useBudget.js         # Monthly budget CRUD
│   │   │   └── useImport.js         # CSV + AI import logic
│   │   ├── utils/
│   │   │   ├── currency.js          # Exchange rates (USD→EUR live, fallbacks)
│   │   │   ├── exportCsv.js         # CSV export with UTF-8 BOM
│   │   │   ├── csvParser.js         # CSV parsing + FR/EN header mapping
│   │   │   ├── importValidation.js  # Transaction row validation
│   │   │   └── formatters.js        # Number/date formatting
│   │   ├── locales/
│   │   │   ├── en.json              # English translations (362 keys)
│   │   │   └── fr.json              # French translations (362 keys)
│   │   └── constants/
│   │       └── avatars.js           # 32 emoji avatar options
│   ├── public/
│   │   └── favicon.svg
│   ├── index.html                   # Entry HTML with SEO/OG meta tags
│   ├── vite.config.js
│   ├── nginx.conf                   # Docker Nginx SPA config
│   └── package.json
├── supabase/
│   └── functions/                   # Supabase Edge Functions (Deno/TS)
│       ├── create-checkout-session/ # Stripe checkout → returns URL
│       ├── parse-transactions/      # Claude API → structured transaction JSON
│       └── stripe-webhook/          # Stripe events → update subscriptions table
├── supabase_full_setup.sql          # Complete DB schema (single consolidated file)
├── migrate_data.js                  # One-time data migration utility
├── Dockerfile                       # Multi-stage: Node 22 build → Nginx serve
├── package.json                     # Root (only supabase-js dep)
└── README.md
```

## Database Schema (PostgreSQL + RLS)

All tables enforce **Row-Level Security** — users can only access their own rows.

### `transactions`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID (FK → auth.users) | |
| title | text | Required |
| type | text | `game`, `dlc`, `skin`, `battle_pass`, `currency`, `loot_box`, `subscription` |
| price | numeric | Required |
| currency | text | `EUR`, `USD`, `GBP`, `JPY` |
| platform | text | `PC`, `Steam`, `PS5`, `PS4`, `Switch`, `Xbox Series`, `Xbox One`, `Mobile`, `Console` |
| genre | text | `FPS`, `RPG`, `MOBA`, `Racing`, etc. (15 options) |
| store | text | Free text |
| status | text | `Backlog`, `Playing`, `Completed`, `Wishlist`, `Abandoned` |
| purchase_date | date | |
| notes | text | |
| rating | integer | 1–10 |
| hours_played | numeric | |
| cover_url | text | From RAWG API (premium) |
| parent_game_id | UUID (FK → transactions.id) | Self-ref for DLC linking |
| created_at, updated_at | timestamptz | Auto-managed via trigger |

### `profiles`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID (unique, FK → auth.users) | |
| display_name | text | |
| avatar | text | Emoji string |
| default_currency | text | `EUR` default |
| onboarding_completed | boolean | |

### `budgets`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID (FK → auth.users) | |
| month | integer | 1–12 |
| year | integer | |
| amount | numeric | |
| currency | text | |
| Unique constraint on (user_id, month, year) | | |

### `subscriptions`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID (PK) | |
| user_id | UUID (unique, FK → auth.users) | |
| plan | text | `free` or `premium` |
| started_at, expires_at | timestamptz | |
| stripe_customer_id | text | |
| stripe_subscription_id | text | |

## Key Business Logic

### Freemium Model
- **Free:** 50 transactions max, EUR only, basic charts, no budget/export/cover art
- **Premium:** Unlimited transactions, multi-currency, advanced charts, budgets, CSV export, RAWG covers
- Enforced via `usePlan()` hook → `isPremium` flag + `canAddTransaction()` check
- Stripe checkout flow: `UpgradeModal` → Edge Function → Stripe → webhook → DB update

### Multi-Currency
- Live USD→EUR rate fetched on app load (exchangerate-api.com)
- GBP/JPY derived from USD rate; hardcoded fallbacks if API fails
- All analytics normalize amounts to user's default currency

### i18n (FR/EN)
- Detection: localStorage → browser language → fallback `fr`
- Usage: `const { t } = useTranslation()` → `t('key.path')`
- Persistence: `localStorage.language`
- All user-facing strings are in `locales/fr.json` and `locales/en.json`

### Import System
1. **CSV Import:** Drag-and-drop → parse headers (FR/EN aliases) → map columns → validate rows → preview → bulk insert
2. **AI Import:** Free-text → `parse-transactions` Edge Function → Claude API → structured JSON → same validation/preview flow

## Environment Variables

### Client (Vite — prefix `VITE_`)
```
VITE_SUPABASE_URL=https://xxx.supabase.co          # Required
VITE_SUPABASE_ANON_KEY=eyJ...                       # Required
VITE_RAWG_API_KEY=xxx                               # Optional — game cover art
VITE_POSTHOG_KEY=phc_xxx                            # Optional — analytics
VITE_POSTHOG_HOST=https://eu.i.posthog.com          # Optional
```

### Edge Functions (auto-injected by Supabase + secrets)
```
STRIPE_SECRET_KEY=sk_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
ANTHROPIC_API_KEY=sk-ant-xxx
SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY  # Auto-injected
```

## Development

```bash
cd client
npm install
npm run dev          # Vite dev server on http://localhost:5173
npm run build        # Production build → client/dist/
npm run preview      # Preview production build
npm run lint         # ESLint
```

## Coding Conventions

- **Language:** JavaScript (JSX), no TypeScript
- **Components:** Functional with hooks, one component per file
- **State:** React hooks only (useState, useCallback, useEffect, useMemo) — no Redux/Zustand
- **Styling:** CSS classes in `index.css` / `App.css`, CSS variables for theming (`data-theme="dark"` on root)
- **No Tailwind** — custom Liquid Glass design system with glassmorphism effects
- **Supabase queries:** Direct `supabase.from('table').select/insert/update/delete` in hooks
- **Edge Functions:** Deno/TypeScript, CORS headers, JWT auth via `supabase.auth.getUser()`
- **i18n:** All user-facing text via `t('key')`, never hardcoded strings
- **Naming:** PascalCase components, camelCase hooks/utils, kebab-case CSS classes

## Design System — Liquid Glass

- **Color palette:** Crème (#F5F0E8), Bleu Nuit (#1A1A2E), Doré (#D4A853)
- **Theme:** Light (default) + Dark mode via CSS variables
- **Effects:** Glassmorphism (backdrop-blur, semi-transparent backgrounds, subtle shadows)
- **Typography:** Outfit 500–800 (headings), DM Sans 300–700 (body)
- **Buttons:** `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-icon-only`
- **Layout:** Flexbox/Grid, responsive breakpoints via media queries

## Edge Functions Summary

| Function | Method | Purpose |
|----------|--------|---------|
| `create-checkout-session` | POST | Create Stripe checkout URL for premium upgrade |
| `parse-transactions` | POST | Parse free-text via Claude API → structured transaction array |
| `stripe-webhook` | POST | Handle Stripe events (checkout.completed, subscription.updated/deleted, invoice.paid/failed) |

## Common Tasks

- **Add a new transaction field:** Update `supabase_full_setup.sql` → add column to `TransactionForm.jsx` → update `useTransactions.js` queries → add i18n keys in both `fr.json` and `en.json`
- **Add a new page/route:** Add route in `App.jsx` → create component in `components/` → add nav link
- **Add i18n key:** Add to both `locales/fr.json` and `locales/en.json` with matching key paths
- **Modify styling:** Edit `client/src/index.css` (design system) or `client/src/App.css` (component styles)
- **Add Edge Function:** Create folder in `supabase/functions/` with `index.ts`, handle CORS preflight
