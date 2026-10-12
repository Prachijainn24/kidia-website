# 🎈 KIDIA — Little Styles. Big Smiles.
### Premium Kidswear E-Commerce Platform & Admin Management Portal

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL_%26_Auth-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)

---

## 📖 Overview

**KIDIA** is a full-featured, design-driven kidswear boutique web application designed for children aged 1–12. The project combines a modern customer storefront with an administrative portal backed by **Supabase PostgreSQL** and **Supabase Auth**.

The application features:
1. **Customer Storefront** — High-conversion, touch-friendly shopping experience with real-time stock status, instant ordering, dynamic size guides, festive collections, cart drawer, and wishlist.
2. **Admin Portal** (`/admin`) — Management dashboard with live analytics, product catalog management, 1-click bestseller controls, customer account provisioning, review moderation, and store settings.

---

## ⚡ Frequently Asked Question

### Why did the Customer panel show 16 products while the Admin panel showed 8?

* **The Cause:** 
  * The customer storefront originally had a static catalog definition (`Frontend/src/data/catalog.ts`) containing **16 products** (`p1` to `p16`).
  * The initial database migration (`Backend/supabase_schema.sql`) seeded only the first **8 products** (`p1` to `p8`) into Supabase's `public.products` table.
  * Because the Admin panel fetches live data directly from Supabase (`supabase.from("products").select("*")`), it was only displaying the 8 records stored in the database.
* **The Fix:**
  * Products `p9` through `p16` were seeded directly into your live Supabase database via the REST API.
  * `Backend/supabase_schema.sql` was updated with the complete `p1` to `p16` seed definitions.
  * Both the Customer Storefront and Admin Portal are now synchronized with all **16 products**.

---

## ✨ Features

### 🛍️ Customer Storefront

* **Curated Catalog (16 Designs):** Boys, girls, and unisex clothing across Ethnic, Party, Everyday Essentials, Co-ord Sets, and Nightwear.
* **Instant Ordering & Stock Badges:** Every product card displays live inventory availability and an **"Add To Cart"** quick action.
* **Smart Filtering:** Filter by gender, age bracket (1–2Y, 3–5Y, 6–8Y, 9–12Y), occasion (Festive, Birthday, Everyday), and price.
* **Interactive Product Details:** Multi-angle image carousels, size selection, fabric & care specifications, and brand sizing charts.
* **Cart Drawer & Checkout:** Slide-over cart with free shipping progress bar, promo code validation, and simulated multi-step checkout.
* **Wishlist Persistence:** Save favorite items with persistent local and profile state.
* **Customer Authentication:** Customer signup and login flow with profiles created in `public.profiles`.

### 🛡️ Admin Portal (`/admin`)

* **Role-Based Security:** Protected routing via Supabase RLS and `role = 'admin'` profile verification.
* **Smooth Navigation:** Fixed background token refresh to prevent full-screen auth flashing when switching browser tabs.
* **Live KPI Dashboard:** Metrics for Store Revenue, Orders, Catalog Designs, and Registered Customers.
* **Product Catalog (`/admin/products`):**
  * View all 16 products with images, categories, price, MRP, and stock.
  * **1-Click Bestseller Star Toggle:** Instantly promote or demote products on the storefront.
  * Create, edit, and delete products with form validation.
* **Category Management (`/admin/categories`):** Add, inspect, and organize categories with live Supabase persistence.
* **Customer Management (`/admin/users`):**
  * Real customer list (admin account automatically excluded from user metrics).
  * **"Add New Customer" Modal:** Admin can provision new customer accounts without ending the admin session.
* **Order Management (`/admin/orders`):** Track customer orders, update shipping states (`pending`, `processing`, `shipped`, `delivered`, `cancelled`).
* **Review Moderation (`/admin/reviews`):** Rating scorecards with realistic fallback calculation when zero reviews are present.
* **Admin Settings (`/admin/settings`):**
  * Update admin name, email, and phone.
  * Store configuration (boutique name, currency, tax rates, free shipping threshold).
  * Live Supabase database connectivity health check.
* **Admin Profile Card:** Profile display with name and avatar in the sidebar.

---

## 🗄️ Database Architecture

The backend is powered by **Supabase PostgreSQL** with Row-Level Security (RLS) enabled on all tables.

```
┌─────────────────────────────────────────────────────────────┐
│                       SUPABASE POSTGRES                     │
├─────────────────┬─────────────────────────┬─────────────────┤
│  auth.users     │      public.profiles    │ public.products │
│  (Supabase Auth)│   (role: admin/customer)│  (16 products)  │
├─────────────────┼─────────────────────────┼─────────────────┤
│  categories     │         orders          │   order_items   │
├─────────────────┼─────────────────────────┼─────────────────┤
│    reviews      │       cart_items        │    wishlists    │
└─────────────────┴─────────────────────────┴─────────────────┘
```

### Key Security Policies:
* **Admin Access:** Enforced via `auth.uid()` checks against `public.profiles WHERE role = 'admin'`.
* **Customer Isolation:** Customers can only read/write their own cart items, wishlists, and orders.
* **Public Read:** Products and categories are publicly readable for storefront browsing.

---

## 🔑 Default Credentials

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Store Administrator** | `admin@kidia.com` | `Admin123` | [`/admin`](http://localhost:8080/admin) |
| **Customer** | *(Sign up via storefront)* | *(User created)* | [`/auth`](http://localhost:8080/auth) |

> **Note:** The admin account is pre-configured. Public signups automatically receive the `'customer'` role.

---

## 🛠️ Tech Stack

* **Frontend:** React 18, TypeScript, Vite 5
* **Styling:** Tailwind CSS, Radix UI Primitives, Lucide Icons, Framer Motion
* **State & Data Fetching:** TanStack React Query v5, Context API
* **Backend & Database:** Supabase (PostgreSQL 15, Auth, RLS, Edge Functions)
* **Testing & Quality:** Vitest, ESLint

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** v18+ or v20+
* **npm** or **pnpm**
* A [Supabase](https://supabase.com/) account & project

### 2. Clone the Repository
```bash
git clone <repository-url>
cd kindred-kid-boutique
```

### 3. Configure Environment Variables
Inside `Frontend/.env`:
```env
VITE_SUPABASE_PROJECT_ID="your-project-id"
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-supabase-anon-key"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-anon-key"
```

### 4. Setup Database Schema in Supabase
1. Open your [Supabase Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor**.
3. Copy the entire contents of [`Backend/supabase_schema.sql`](file:///Backend/supabase_schema.sql).
4. Run the script. This creates:
   - All database tables and indexes.
   - Row Level Security (RLS) policies.
   - Storage buckets for product images.
   - Seed data for all **16 products** and categories.
   - The default admin user (`admin@kidia.com` / `Admin123`).

### 5. Install Dependencies & Start Application
```bash
# Navigate to the frontend directory
cd Frontend

# Install packages
npm install

# Start development server
npm run dev
```

The application will be live at:
* **Customer Store:** [http://localhost:8080/](http://localhost:8080/)
* **Admin Portal:** [http://localhost:8080/admin](http://localhost:8080/admin)

---

## 📁 Project Directory Structure

```
kindred-kid-boutique/
├── Backend/
│   ├── .env                       # Backend Supabase environment configuration
│   ├── supabase_schema.sql        # Complete PostgreSQL schema, RLS policies, & 16-product seed
│   ├── drizzle/                   # Drizzle ORM migration files (optional)
│   └── supabase/                  # Supabase functions & config
│
├── Frontend/
│   ├── .env                       # Frontend Supabase URL and Anon key
│   ├── package.json               # NPM scripts and dependencies
│   ├── vite.config.ts             # Vite configuration with aliases
│   ├── tailwind.config.ts         # Tailwind design system tokens
│   └── src/
│       ├── admin/                 # Dedicated Admin Management Portal
│       │   ├── components/        # Admin layouts, sidebars, charts, headers
│       │   ├── pages/             # AdminProducts, AdminOrders, UserManagement,
│       │   │                      # AdminSettings, ProductReviews, AdminCategories
│       │   ├── services/          # adminApi.ts (Supabase direct integrations)
│       │   └── context/           # AdminContext & role management
│       ├── components/            # Customer UI: ProductCard, Navbar, Footer, CartDrawer
│       ├── data/
│       │   └── catalog.ts         # Initial product types & local reference catalog (p1–p16)
│       ├── hooks/
│       │   ├── useAuth.tsx        # Authentication provider & role resolution
│       │   ├── useCart.tsx        # Customer shopping cart state
│       │   └── useWishlist.tsx    # Customer saved items state
│       ├── pages/                 # Home, Shop, ProductDetail, Collections, Auth
│       └── integrations/
│           └── supabase/          # Supabase client instantiation
│
└── README.md                      # Project documentation (this file)
```

---

## 📜 Available NPM Scripts

Run all commands from within the `Frontend/` folder:

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server on port `8080` |
| `npm run build` | Generates optimized production build in `Frontend/dist` |
| `npm run preview` | Previews production build locally |
| `npm run lint` | Runs ESLint checks across codebase |
| `npm test` | Runs unit tests with Vitest |

---

## 📄 License

This project is proprietary and built for **KIDIA Kid Boutique**. All rights reserved.
