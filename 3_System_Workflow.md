# System Workflow Document
## Travel & Tourism Web Platform

---

## 1. User Registration & Login Flow

```mermaid
sequenceDiagram
    participant U as User (React App)
    participant A as API (Express)
    participant DB as PostgreSQL (Prisma)

    U->>A: POST /api/v1/auth/register {name, email, password}
    A->>A: Validate input (Zod)
    A->>A: Hash password (bcrypt)
    A->>DB: Create User
    DB-->>A: User created
    A-->>U: 201 + Access Token + Refresh Token (httpOnly cookie)

    U->>A: POST /api/v1/auth/login {email, password}
    A->>DB: Find user by email
    A->>A: Compare password hash
    A-->>U: 200 + Access Token (JWT) + Refresh Token
    U->>U: Store access token (memory/state), refresh token in httpOnly cookie
```

---

## 2. Trip Planning Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant A as API
    participant DB as Database

    U->>A: POST /api/v1/trips {title, startDate, endDate, budget}
    A->>DB: Create Trip
    U->>A: POST /api/v1/trips/:id/items {destinationId, day, activity}
    A->>DB: Create ItineraryItem
    U->>A: GET /api/v1/trips/:id
    A->>DB: Fetch trip + itinerary items + destination info
    A-->>U: Trip details with day-wise plan
    U->>A: GET /api/v1/trips/:id/share (optional)
    A-->>U: Public read-only share link
```

---

## 3. Destination Discovery Workflow

1. User lands on **Explore Destinations** page.
2. Frontend calls `GET /api/v1/destinations?category=&budget=&search=` with filters.
3. Backend queries PostgreSQL (indexed on category/state) via Prisma, returns paginated results.
4. User opens a destination → `GET /api/v1/destinations/:id` returns full detail (images, weather info, attractions, nearby hotels, nearby restaurants, reviews).
5. Reviews are fetched with pagination (`GET /api/v1/destinations/:id/reviews`).

---

## 4. Hotel Booking Workflow (Core Flow)

```mermaid
sequenceDiagram
    participant U as User
    participant A as API
    participant DB as Database
    participant R as Razorpay

    U->>A: GET /api/v1/hotels/search?destination=&checkIn=&checkOut=&guests=
    A->>DB: Query available rooms (date-overlap check)
    A-->>U: List of available hotels/rooms

    U->>A: POST /api/v1/bookings/initiate {roomId, checkIn, checkOut, guests}
    A->>DB: Create Booking (status = PENDING)
    A->>R: Create Razorpay Order (amount, currency=INR)
    R-->>A: orderId
    A-->>U: {bookingId, razorpayOrderId, amount}

    U->>R: Razorpay Checkout (user pays)
    R-->>U: paymentId, signature

    U->>A: POST /api/v1/bookings/verify {bookingId, paymentId, orderId, signature}
    A->>A: Verify signature (HMAC SHA256 with Razorpay secret)
    alt Signature valid
        A->>DB: Update Booking status = CONFIRMED, create Payment record
        A->>U: 200 Booking confirmed
        A->>A: Trigger confirmation email (Nodemailer)
    else Signature invalid
        A->>DB: Update Booking status = FAILED
        A-->>U: 400 Payment verification failed
    end
```

**Additional flows:**
- **Webhook fallback:** Razorpay webhook (`payment.captured`, `payment.failed`) hits `POST /api/v1/payments/webhook` as a source of truth in case the client-side verification call is missed (network drop). Webhook signature is also verified.
- **Cancellation:** `POST /api/v1/bookings/:id/cancel` → checks cancellation policy → updates status → (optional) triggers refund via Razorpay Refund API.

---

## 5. Food & Local Cuisine Workflow

1. On a destination page, frontend calls `GET /api/v1/destinations/:id/restaurants`.
2. Backend returns restaurant list (cuisine tags, price range, rating) filtered/sorted by rating or price.
3. User views restaurant detail (`GET /api/v1/restaurants/:id`) — menu highlights, location map pin.

---

## 6. Tourist Assistant Workflow

```mermaid
flowchart TD
    A[User opens Assistant widget] --> B{Query type}
    B -->|Common FAQ| C[Search FAQ knowledge base - GET /api/v1/assistant/faq?q=]
    C --> D[Return matched answer instantly]
    B -->|Needs human help| E[Escalate to Support Chat]
    E --> F[Socket.io connects user to available Support Agent]
    F --> G[Real-time chat session, logged to TicketMessage/ChatLog]
```

- FAQ content (visa info, emergency contacts, local transport, currency tips) is stored per-destination in the database and served via a simple search endpoint.
- If the FAQ doesn't resolve the query, the widget offers "Talk to Support," which opens a live chat session via Socket.io.

---

## 7. Customer Service / Support Ticket Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant A as API
    participant DB as Database
    participant S as Support Agent

    U->>A: POST /api/v1/tickets {subject, description, bookingId?}
    A->>DB: Create Ticket (status = OPEN)
    A-->>U: Ticket created (ticketId)

    S->>A: GET /api/v1/admin/tickets?status=OPEN
    A->>DB: Fetch open tickets
    S->>A: PATCH /api/v1/tickets/:id {assignedAgentId, status=IN_PROGRESS}

    U->>A: Socket: joinTicketRoom(ticketId)
    S->>A: Socket: joinTicketRoom(ticketId)
    U->>A: Socket: sendMessage(ticketId, message)
    A->>DB: Save TicketMessage
    A-->>S: Socket: receiveMessage

    S->>A: PATCH /api/v1/tickets/:id {status=RESOLVED}
    A->>DB: Update ticket status
    A-->>U: Email notification: ticket resolved
```

---

## 8. Vendor (Hotel Partner) Workflow

1. Vendor registers/is invited → account marked `role = VENDOR`, `verified = false` until admin approval.
2. Vendor creates hotel listing (`POST /api/v1/vendor/hotels`) with images (uploaded to Cloudinary), amenities, rooms & pricing.
3. Admin reviews and approves listing (`PATCH /api/v1/admin/hotels/:id/approve`) before it becomes publicly visible.
4. Vendor views bookings on their dashboard (`GET /api/v1/vendor/bookings`), manages availability calendar.

---

## 9. Admin Workflow

- **Dashboard:** Aggregate stats — total bookings, revenue, active users, pending vendor approvals (`GET /api/v1/admin/analytics`).
- **Moderation:** Approve/reject hotel listings, remove inappropriate reviews.
- **Dispute handling:** View flagged bookings/tickets, issue refunds via Razorpay Refund API.
- **User management:** Suspend/activate users or vendors.

---

## 10. End-to-End Data Flow Summary

```mermaid
flowchart LR
    UI[React UI] -->|Axios/HTTPS| API[Express REST API]
    UI <-->|WebSocket| SOCK[Socket.io]
    API --> PRISMA[Prisma Client]
    PRISMA --> PG[(PostgreSQL)]
    API --> PAY[Razorpay]
    API --> MAIL[Email Service]
    API --> IMG[Cloudinary/S3]
    SOCK --> PRISMA
```
