# AngelWatch — Instruction & Feature Guide

> **AngelWatch** is a road-safety initiative and ride-escort platform based in **La Réunion, France**.  
> Its mission is to prevent drunk driving and ensure safe returns home by pairing clients with vetted *Angel* drivers who escort them or drive their vehicle back safely.

---

## 📋 Table of Contents

1. [What the App Does](#1-what-the-app-does)
2. [Current Pages & Roles](#2-current-pages--roles)
3. [Technology Stack](#3-technology-stack)
4. [Features Needed to Make a Great App](#4-features-needed-to-make-a-great-app)
5. [Priority Roadmap](#5-priority-roadmap)

---

## 1. What the App Does

AngelWatch connects two groups of users:

| User Type | Role |
|---|---|
| **Client** | Someone who has been drinking or is unable to drive safely and needs help getting home with their own vehicle. |
| **Angel (Driver)** | A vetted volunteer or professional who drives the client's car to the destination safely. |
| **Admin** | Manages drivers, monitors missions, handles reports and platform configuration. |

The platform lets clients **book an Angel in real time**, track them live on a map, and receive status updates until they arrive home safely.

---

## 2. Current Pages & Roles

### 🌐 Landing Page (`/`)
- Hero section with animated entrance and CTA buttons.
- **Nos Actions** section — 3 pillars: Sensitisation, Stop Alcohol au Volant, Partenariats Soirées.
- **Live Tracking interface** showcase section.
- **Rejoindre** — form for volunteers wishing to become an Angel.
- **Réservation** — quick booking form (Name, Pickup location, Desired time).
- **Contact** — contact form + embedded Google Maps showing headquarters.
- Footer with social links.
- Responsive mobile navigation (Sheet/hamburger menu).

### 📱 Client Dashboard (`/dashboard`)
- Live map with nearby active drivers shown.
- Destination input → request a Professional Escort.
- Real-time status updates once matched.
- List of vetted drivers available.
- Cancel Service Request button.

### 🚗 Driver Panel (`/driver`)
- Online/Offline toggle switch.
- Today's earnings and trips counter.
- Active job card: shows client name, pickup, destination, ETA.
- Navigation and message buttons.
- Confirm Arrival button to end the job.
- Live traffic map.

### 🔐 Authentication (`/auth`)
- Sign in / Sign up flow powered by Firebase Auth.

### 🛠 Admin Console (`/admin`)
- Only accessible to users with `role: 'admin'` in Firestore.
- Platform management (drivers, orders, reports).

---

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 15** (App Router, Turbopack) |
| Language | **TypeScript** |
| Styling | **Tailwind CSS** + **shadcn/ui** (Radix UI primitives) |
| Backend / Auth | **Firebase** (Firestore, Auth, App Hosting) |
| AI | **Google Genkit** + `@genkit-ai/google-genai` |
| Charts | **Recharts** |
| Forms | **React Hook Form** + **Zod** |
| Icons | **Lucide React** |

---

## 4. Features Needed to Make a Great App

The following features are **recommended** to turn AngelWatch into a complete, professional, and reliable platform.

---

### 🔑 Authentication & User Management

- [ ] **Email/Password + Google Sign-In** via Firebase Auth.
- [ ] **User profile page** — name, photo, phone number, vehicle info.
- [ ] **Role-based access control** — `client`, `driver`, `admin` roles stored in Firestore.
- [ ] **Driver verification flow** — upload driving license, background check status badge.
- [ ] **Account settings page** — change password, manage notifications, delete account.

---

### 📍 Real-Time Tracking & Map

- [ ] **Replace map placeholder with a real map** (Google Maps API or Mapbox).
- [ ] **Live driver location updates** — driver GPS coordinates stored in Firestore and streamed to client.
- [ ] **ETA calculation** using Google Directions API or similar.
- [ ] **Route polyline** displayed on map from driver to client.
- [ ] **Geofencing alerts** — notify client when driver is X minutes away.

---

### 🚖 Booking & Matching System

- [ ] **Real booking backend** — store requests in Firestore (`serviceRequests` collection).
- [ ] **Automatic driver matching** algorithm — find closest available Angel.
- [ ] **Manual driver selection** — client can browse and choose a specific driver.
- [ ] **Booking history** — clients and drivers can view past rides.
- [ ] **Scheduled bookings** — reserve an Angel for a future date and time.
- [ ] **Cancellation with reason** — both sides can cancel with a reason logged.

---

### 💬 Communication

- [ ] **In-app real-time chat** between client and driver (Firestore-powered).
- [ ] **Push notifications** — booking confirmed, driver en route, arrival alert (Firebase Cloud Messaging).
- [ ] **SMS fallback** — send SMS when the app is closed (via Twilio or similar).
- [ ] **Emergency SOS button** — one-tap alert to emergency contact or admin.

---

### 💰 Payments & Earnings

- [ ] **Payment integration** — Stripe or equivalent for paid subscription / per-ride fee.
- [ ] **Driver earnings dashboard** — daily, weekly, monthly stats with charts (Recharts).
- [ ] **Tip feature** — clients can tip their Angel after a completed ride.
- [ ] **Invoice/receipt generation** — PDF receipt emailed after each ride.
- [ ] **Payout system** — admin can trigger payouts to drivers.

---

### ⭐ Ratings & Reviews

- [ ] **Post-ride rating** — client rates driver (1–5 stars + comment).
- [ ] **Driver rates client** — mutual rating system.
- [ ] **Review moderation** — admin can hide or flag inappropriate reviews.
- [ ] **Average rating displayed** on driver card and profile.

---

### 🛡 Safety Features

- [ ] **Driver background check status** badge visible to clients.
- [ ] **Share trip** — client can share a live tracking link with a trusted contact.
- [ ] **Panic / SOS button** — sends alert with GPS location to emergency contacts.
- [ ] **Ride recording option** — opt-in audio/visual recording during trip.
- [ ] **Insurance information** displayed per driver.

---

### 🛠 Admin Console

- [ ] **Driver management** — approve/reject/suspend drivers.
- [ ] **Live mission monitor** — map of all active rides in real time.
- [ ] **Service request list** — filter by status (pending, active, completed, cancelled).
- [ ] **User management** — view/edit/delete client or driver accounts.
- [ ] **Analytics dashboard** — rides per day, peak hours, revenue, ratings (charts).
- [ ] **Content management** — update landing page text, FAQs, pricing without code.
- [ ] **Export reports** — CSV/PDF exports of ride and revenue data.

---

### 📣 Marketing & Engagement

- [ ] **Volunteer application backend** — store "Rejoindre" form submissions in Firestore, email notification to admin.
- [ ] **Contact form backend** — send messages to admin email via SendGrid or similar.
- [ ] **Referral program** — clients earn credits for referring new users.
- [ ] **Loyalty badge** — rewards for regular users.
- [ ] **Event partnership module** — admin can link Angels to specific events/festivals.
- [ ] **Blog / News section** — awareness articles about road safety.

---

### 📱 Mobile & PWA

- [ ] **Progressive Web App (PWA)** — installable on iOS and Android from the browser.
- [ ] **Service Worker** — offline support and background sync.
- [ ] **Splash screen & app icon** — properly configured `manifest.ts`.
- [ ] **Native-like gestures** — swipe to cancel, pull to refresh.
- [ ] **Dark mode** support.

---

### ♿ Accessibility & Internationalization

- [ ] **Full ARIA labels** on all interactive elements.
- [ ] **Keyboard navigation** support.
- [ ] **i18n support** — French (default), English, and Créole Réunionnais.
- [ ] **WCAG 2.1 AA compliance** audit.

---

### 🔧 DevOps & Quality

- [ ] **Environment variables** — all secrets via `.env.local`, never committed.
- [ ] **Unit tests** — Jest + React Testing Library for components.
- [ ] **E2E tests** — Playwright for critical user flows.
- [ ] **Error monitoring** — Sentry integration.
- [ ] **CI/CD pipeline** — GitHub Actions → Firebase App Hosting on merge to `main`.
- [ ] **Rate limiting** on API routes to prevent abuse.
- [ ] **Firestore security rules** — properly scoped per role.

---

## 5. Priority Roadmap

| Phase | Focus | Must-Have Features |
|---|---|---|
| **Phase 1 — MVP** | Core flows work end-to-end | Real auth, Firestore bookings, real map, driver online/offline, basic chat |
| **Phase 2 — Safety** | Trust & reliability | Driver verification, SOS button, trip sharing, ratings |
| **Phase 3 — Commercial** | Monetisation | Payments, driver earnings, invoices |
| **Phase 4 — Growth** | Reach & engagement | PWA, push notifications, referrals, multilingual |
| **Phase 5 — Scale** | Operations & data | Admin analytics, CI/CD, E2E tests, i18n |

---

> 💡 **Start with Phase 1.** A working booking loop with real-time tracking is the heart of the product — everything else builds on top of it.
