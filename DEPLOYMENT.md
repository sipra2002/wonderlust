# 🚀 Deployment Guide — Wanderlust India

This guide covers step-by-step instructions for deploying the **Wanderlust India** platform to production:
- **Frontend (React + Vite)**: Deployed to **Vercel**
- **Backend (Node.js + Express + Prisma)**: Deployed to **Railway** (or Render / Fly.io)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                 Vercel (Frontend CDN)                       │
│    - React 18 + Vite SPA                                    │
│    - Dynamic *.vercel.app domain support                    │
│    - Admin Dashboard (/admin) & Stays, Planner, SOS         │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS API Calls (VITE_API_URL)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 Railway / Render (Backend)                  │
│    - Node.js + Express REST API                             │
│    - Prisma ORM + PostgreSQL Database                       │
│    - Dynamic CORS for *.vercel.app                          │
│    - WebSocket server for live updates                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 1. Frontend Deployment on Vercel

### Option A: Via GitHub (Recommended)
1. Push your repository to **GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete admin page and vercel deployment config"
   git push origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New..." > "Project"**.
3. Import your GitHub repository.
4. In the configuration screen:
   - **Framework Preset**: Vite (detected automatically)
   - **Root Directory**: Click `Edit` and choose `client` (or leave default root; root `vercel.json` will handle it)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Environment Variables**:
   Add the following environment variable:
   | Key | Value | Notes |
   |-----|-------|-------|
   | `VITE_API_URL` | `https://your-backend.up.railway.app` | No trailing slash. (Leave empty if testing with local backend) |
6. Click **Deploy**!
   Your site will be live at `https://your-project.vercel.app` with instant preview deployments for every commit.

### Option B: Via Vercel CLI
```bash
cd client
npm install -g vercel
vercel
# Follow prompts to link and deploy
```

---

## 2. Backend Deployment on Railway (Recommended)

Because the project uses persistent sessions, Socket.io, and a database, Railway or Render is ideal.

1. Go to [railway.app](https://railway.app) and create a **New Project**.
2. Add a **PostgreSQL Database** service (recommended for cloud production):
   - Railway automatically provides a `DATABASE_URL` variable.
3. In `server/prisma/schema.prisma`, change the provider to PostgreSQL:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Deploy the Node service:
   - Connect your GitHub repo and set **Root Directory** to `/server`.
   - Railway will detect `package.json` and start `node src/server.js`.
5. Set Environment Variables in Railway:
   | Variable | Example Value |
   |----------|---------------|
   | `PORT` | `5000` |
   | `NODE_ENV` | `production` |
   | `DATABASE_URL` | `postgresql://...` (Auto-filled by Railway Postgres) |
   | `JWT_SECRET` | `generate-a-strong-random-secret-key-32-chars` |
   | `CLIENT_URL` | `https://your-project.vercel.app` |
   | `RAZORPAY_KEY_ID` | `rzp_test_...` (optional for test payments) |
   | `RAZORPAY_KEY_SECRET` | `your_secret` (optional) |
6. Run database migrations and seed in Railway CLI or deploy step:
   ```bash
   npx prisma db push
   node prisma/seed.js
   ```

---

## 3. Seeded Demo Accounts

The database includes 4 demo accounts with preset roles for testing:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | `admin@example.com` | `Password123!` | Full control over `/admin`: analytics, approvals, bookings, user roles, support |
| **Traveler** | `traveler@example.com` | `Password123!` | Browse stays, book trips, manage bookings, raise tickets |
| **Vendor** | `vendor@example.com` | `Password123!` | Hotel partner portal, submit listings for admin review |
| **Support** | `support@example.com` | `Password123!` | Support agent portal to resolve traveler tickets |

> 💡 **Quick Demo Role Switcher**: Click the "Role" badge in the navigation bar to instantly switch between Admin, Vendor, Traveler, and Support accounts!

---

## 4. Key Verification Checklist

- [x] Client builds cleanly with zero errors (`npm run build`)
- [x] Single Page App (SPA) routes rewrite to `/index.html` via `vercel.json`
- [x] CORS on backend dynamically permits all `*.vercel.app` domains
- [x] Admin dashboard `/admin` renders 5 operational modules:
  - 📊 Real-time Revenue & Booking KPI Analytics
  - 🏨 Hotel Listing Moderation & One-Click Approvals
  - 📅 Bookings & Reservation Management with Status Updates
  - 👥 User & Vendor Role Management + Verification Badges
  - 🎧 Support Helpdesk & Live Ticket Reply System
- [x] Emergency Tourist Assistant & SOS Banner accessible across all views
