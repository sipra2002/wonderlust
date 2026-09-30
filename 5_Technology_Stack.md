# Technology Stack Document
## Travel & Tourism Web Platform

---

## 1. Frontend

| Category | Technology | Purpose |
|---|---|---|
| Core framework | **React.js** (Vite) | SPA UI |
| Routing | **React Router v6** | Client-side routing, protected routes |
| Styling | **Tailwind CSS** | Utility-first responsive styling |
| Animation | **Framer Motion** | Page transitions, component animations, stagger effects |
| Scroll animation | **AOS (Animate on Scroll)** or Framer `useInView` | Reveal-on-scroll effects |
| Hover/micro-interactions | **CSS transitions/transforms** + Framer Motion `whileHover`/`whileTap` | Card lift, button scale, image zoom |
| State management | **Redux Toolkit** or **Zustand** | Global app state (auth, cart/booking flow) |
| Server-state/data fetching | **TanStack Query (React Query)** | Caching, background refetch, loading/error states |
| Forms & validation | **React Hook Form** + **Zod** | Booking forms, auth forms |
| HTTP client | **Axios** | API communication with interceptors (JWT attach/refresh) |
| Maps | **Google Maps JavaScript/Embed API** (`@react-google-maps/api`) | Destination/hotel location |
| Icons | **Lucide React / React Icons** | UI icons |
| Notifications | **React Hot Toast / Sonner** | Toast notifications (booking success, errors) |
| Real-time | **Socket.io-client** | Live chat with support agent |
| Payments (client) | **Razorpay Checkout.js** | Payment UI |

---

## 2. Backend

| Category | Technology | Purpose |
|---|---|---|
| Runtime | **Node.js (LTS)** | Server runtime |
| Framework | **Express.js** | REST API framework |
| ORM | **Prisma ORM** | Type-safe DB access, migrations |
| Database | **PostgreSQL** | Primary relational database |
| Authentication | **JWT (jsonwebtoken)** + **bcrypt** | Auth tokens & password hashing |
| Validation | **Zod** (or Joi) | Request schema validation |
| Real-time | **Socket.io** | Live chat / notifications |
| Payments | **Razorpay Node SDK** | Order creation, signature/webhook verification |
| Email | **Nodemailer** (SMTP) or **Resend/SendGrid** | Transactional emails |
| File storage | **Cloudinary SDK** (or AWS S3 + `multer-s3`) | Image uploads (hotels, destinations, tickets) |
| Security middleware | **Helmet**, **cors**, **express-rate-limit** | HTTP security headers, CORS, brute-force protection |
| Logging | **Winston** or **Pino** | Structured application logs |
| Error monitoring | **Sentry** | Production error tracking |
| API docs | **Swagger (OpenAPI)** via `swagger-jsdoc`/`swagger-ui-express` | API documentation |
| Environment config | **dotenv** | Environment variable management |
| Testing | **Jest** + **Supertest** | Unit & integration testing |

---

## 3. Database & ORM

| Item | Detail |
|---|---|
| Database | **PostgreSQL 15+** |
| ORM | **Prisma** — schema-first modeling, type-safe client, migration tooling (`prisma migrate`) |
| Connection pooling | **Prisma Accelerate/Data Proxy** or **PgBouncer** (for scale) |
| Hosting | Managed PostgreSQL on **Railway** or **Render** |

---

## 4. DevOps & Deployment

| Category | Technology |
|---|---|
| Frontend hosting | **Vercel** |
| Backend hosting | **Railway** or **Render** |
| Database hosting | **Railway/Render Managed PostgreSQL** |
| Version control | **Git + GitHub** |
| CI/CD | **GitHub Actions** (lint → test → build → deploy) |
| Containerization (optional) | **Docker** (for local dev parity / future migration to AWS/GCP/Azure) |
| Secrets management | Platform environment variable dashboards (Vercel/Railway/Render) |

---

## 5. Payment Gateway

- **Razorpay** — Orders API, Checkout, Webhooks, Refunds API. (India-focused, INR settlements, supports UPI/Cards/Netbanking/Wallets.)

---

## 6. Third-Party Services

| Service | Purpose |
|---|---|
| **Google Maps API** | Destination/hotel maps |
| **Cloudinary** | Image hosting/transformation |
| **SMTP / SendGrid / Resend** | Transactional email |
| **Sentry** | Error tracking |

---

## 7. Development Tooling

| Tool | Purpose |
|---|---|
| **ESLint + Prettier** | Code quality & consistent formatting |
| **Husky + lint-staged** | Pre-commit hooks (lint/format before commit) |
| **Postman / Thunder Client** | API testing during development |
| **Prisma Studio** | Visual DB browser during development |

---

## 8. Suggested Package Summary (npm)

**Frontend:**
```
react react-dom react-router-dom axios @tanstack/react-query
redux (or zustand) react-hook-form zod
framer-motion aos tailwindcss
socket.io-client react-hot-toast lucide-react
@react-google-maps/api razorpay-checkout (via CDN script)
```

**Backend:**
```
express @prisma/client prisma
jsonwebtoken bcrypt zod cors helmet express-rate-limit
socket.io nodemailer cloudinary multer
razorpay winston dotenv swagger-jsdoc swagger-ui-express
jest supertest
```
