# Security Architecture Document
## Travel & Tourism Web Platform

---

## 1. Security Objectives

- Protect user personal data (PII) and payment-related information.
- Ensure only authenticated & authorized users can access protected resources.
- Prevent common web vulnerabilities (OWASP Top 10).
- Ensure safe, verifiable payment processing via Razorpay.
- Maintain auditability (logging) without compromising performance.

---

## 2. Authentication

- **Method:** Email/Password with **JWT (JSON Web Tokens)**.
- **Password storage:** Hashed using **bcrypt** (salt rounds ≥ 10). Passwords are never stored or logged in plain text.
- **Token strategy:**
  - **Access Token:** Short-lived (e.g., 15 minutes), sent in `Authorization: Bearer <token>` header, used for API requests.
  - **Refresh Token:** Longer-lived (e.g., 7 days), stored in an **httpOnly, Secure, SameSite=Strict cookie** (not accessible via JS → mitigates XSS token theft).
  - Refresh endpoint (`POST /api/v1/auth/refresh`) issues a new access token; refresh tokens are rotated and old ones invalidated (stored hashed in DB or a `RefreshToken` table with `revoked` flag).
- **Password reset:** Time-limited (e.g., 15 min), single-use token emailed to the user; token stored hashed in DB.
- **Logout:** Invalidates/revokes the refresh token server-side; clears cookie client-side.

---

## 3. Authorization

- **Role-Based Access Control (RBAC):** Roles — `USER`, `VENDOR`, `ADMIN`, `SUPPORT_AGENT`.
- Express middleware (`requireAuth`, `requireRole([...])`) guards protected routes.
- Resource-level checks (e.g., a vendor can only edit their own hotel listings; a user can only view/cancel their own bookings) enforced at the service layer, not just route layer.
- Admin routes are fully isolated under `/api/v1/admin/*` with strict role middleware.

---

## 4. Data Protection

| Layer | Control |
|---|---|
| **In transit** | HTTPS/TLS enforced everywhere (Vercel & Railway/Render provide TLS by default); HSTS header enabled |
| **At rest** | PostgreSQL managed instance with encryption at rest (provider-level, Railway/Render); sensitive fields (if any, e.g., refresh tokens) hashed before storage |
| **PII handling** | Minimal PII collection; no storage of raw card/payment data (fully delegated to Razorpay, PCI-DSS compliant) |
| **Backups** | Automated daily DB backups via hosting provider; tested restore process |

---

## 5. API & Application Security

- **Helmet.js** — sets secure HTTP headers (CSP, X-Frame-Options, X-Content-Type-Options, etc.).
- **CORS** — restricted to known frontend origin(s) only (`credentials: true` with explicit `origin` whitelist, never `*` when cookies are used).
- **Input validation** — all request bodies validated via **Zod/Joi** schemas at the middleware layer before reaching controllers; rejects unexpected fields (mitigates mass assignment).
- **Rate limiting** — `express-rate-limit` on auth endpoints (login, register, forgot-password) to mitigate brute-force/credential stuffing; stricter limits on `/auth/*` than general API.
- **SQL Injection** — mitigated inherently by **Prisma ORM** (parameterized queries); no raw string-concatenated SQL.
- **XSS** — React escapes output by default; any user-generated HTML (e.g., rich text reviews) sanitized server-side (e.g., `sanitize-html`) before storage/render.
- **CSRF** — since JWT access tokens are sent via `Authorization` header (not cookies) for state-changing requests, CSRF risk is reduced; refresh-token cookie uses `SameSite=Strict`/`Lax` as additional protection.
- **File upload security** — restrict file types/sizes for image uploads (hotel/vendor images, ticket attachments); scan/validate MIME type server-side before forwarding to Cloudinary/S3.
- **Error handling** — centralized error-handling middleware; no stack traces or internal error details leaked to clients in production.

---

## 6. Payment Security (Razorpay)

- No card/UPI details ever touch the application backend — Razorpay Checkout handles all sensitive payment data (PCI-DSS Level 1 compliant on Razorpay's side).
- **Order creation** happens server-side only (`POST /api/v1/bookings/initiate`) — amount is calculated and set on the backend, never trusted from the client, preventing price tampering.
- **Payment verification** — HMAC SHA256 signature verification of `razorpay_order_id | razorpay_payment_id` using the Razorpay secret key before marking a booking as `CONFIRMED`.
- **Webhooks** — Razorpay webhook endpoint (`payment.captured`, `payment.failed`, `refund.processed`) is signature-verified independently as the authoritative source of truth (handles cases where client-side confirmation call fails/is skipped).
- Razorpay **API keys/secrets** stored only in backend environment variables — never exposed to the frontend (only the public `key_id` is exposed to initialize Razorpay Checkout on the client).

---

## 7. Secrets & Environment Management

- All secrets (`DATABASE_URL`, `JWT_SECRET`, `RAZORPAY_KEY_SECRET`, `SMTP` credentials, `CLOUDINARY` keys) stored as environment variables in Vercel/Railway/Render dashboards — never committed to Git.
- `.env` files added to `.gitignore`; `.env.example` maintained for onboarding without real values.
- Separate credentials/keys for **development**, **staging**, and **production** environments.
- JWT secret is a strong, randomly generated value (≥256-bit), rotated periodically.

---

## 8. Logging, Monitoring & Auditing

- Structured request logging (e.g., `winston` or `pino`) — logs exclude sensitive data (passwords, tokens, full card info).
- Audit trail for sensitive admin actions (hotel approval, refunds, user suspension) — who did what, when.
- Error monitoring integration (e.g., Sentry) to catch and alert on runtime exceptions in production.
- Failed login attempt tracking to support future account-lockout/alerting features.

---

## 9. OWASP Top 10 — Mitigation Summary

| Risk | Mitigation |
|---|---|
| **Broken Access Control** | RBAC middleware + resource-ownership checks at service layer |
| **Cryptographic Failures** | bcrypt password hashing, TLS everywhere, no plaintext secrets |
| **Injection** | Prisma parameterized queries, schema validation on all inputs |
| **Insecure Design** | Threat-modeled booking/payment flow, server-side price calculation |
| **Security Misconfiguration** | Helmet headers, strict CORS, environment-based configs, no verbose errors in prod |
| **Vulnerable Components** | Regular `npm audit` / Dependabot alerts, pinned dependency versions |
| **Identification & Auth Failures** | JWT short expiry + refresh rotation, rate-limited auth endpoints |
| **Software & Data Integrity Failures** | Signed Razorpay webhooks, CI/CD pipeline with tests before deploy |
| **Logging & Monitoring Failures** | Centralized structured logging + error monitoring (Sentry) |
| **SSRF** | Strict allowlisting for any server-side outbound requests (e.g., image URL fetches, if any) |

---

## 10. Compliance Considerations

- Aligns with general data-protection best practices; if expanding beyond India, review **GDPR**/regional data-protection requirements for EU users.
- Razorpay integration keeps the platform out of direct **PCI-DSS** scope for card data.
- Clear Privacy Policy and Terms of Service pages required before production launch (legal review recommended — outside engineering scope).
