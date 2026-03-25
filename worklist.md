# AngelWatch Implementation Work List

Based on the **Priority Roadmap** and **Features List** from `instruction.md`.

## Phase 1: MVP (Core Functionality)
*Goal: Core flows work end-to-end (Auth, Booking, Tracking).*

### Authentication & User Management
- [ ] Implement Email/Password & Google Sign-In via Firebase Auth.
- [ ] Create User Profile page (name, photo, phone, vehicle info).
- [ ] Implement Role-Based Access Control (RBAC) for `client`, `driver`, `admin`.

### Real-Time Tracking & Map
- [ ] Replace current placeholders with a real Map (Google Maps API or Mapbox).
- [ ] Implement live driver location updates (store GPS in Firestore, stream to client).
- [ ] Display route polyline from driver to client on the map.
- [ ] Implement ETA calculation.

### Booking & Matching System
- [ ] Build the booking backend (store requests in `serviceRequests` collection).
- [ ] Create manual driver selection (browse and choose a specific driver).
- [ ] Implement simple automatic driver matching (find closest available).
- [ ] Allow cancellation (with reason logging).

### Communication & Driver Panel
- [ ] Build in-app real-time chat (Firestore-powered) between client and driver.
- [ ] Finalize Online/Offline toggle logic for drivers.
- [ ] Ensure "Active Job" card updates in real-time.

## Phase 2: Safety & Trust
*Goal: Enhance reliability and user safety.*

### Safety Features
- [ ] Implement Driver Verification Flow (license upload, background check badge).
- [ ] Add "Share Trip" functionality (live tracking link for trusted contacts).
- [ ] Implement Emergency SOS button (one-tap alert to emergency contacts).
- [ ] Display insurance information on driver profiles.

### Ratings & Reviews
- [ ] Build post-ride rating system (1–5 stars + comment).
- [ ] Implement mutual rating (driver rates client).
- [ ] Update driver card to show average rating.

### Admin Console (Safety Ops)
- [ ] Add driver management (approve/reject/suspend).
- [ ] Implement live mission monitor (map of all active rides).

## Phase 3: Commercial & Monetization
*Goal: Enable payments and earnings.*

### Payments & Earnings
- [ ] Integrate Payment Gateway (Stripe or similar).
- [ ] Build Driver Earnings Dashboard (daily/weekly/monthly stats).
- [ ] Implement Tipping feature.
- [ ] Automated Invoice/Receipt generation (PDF email).
- [ ] Build Payout system for drivers.

### Booking Advanced
- [ ] Implement Scheduled Bookings (future date/time).
- [ ] Add Booking History view for clients and drivers.

## Phase 4: Growth & Engagement
*Goal: Expand reach and user retention.*

### Mobile & PWA
- [ ] Configure Progressive Web App (manifest, service worker for offline support).
- [ ] Optimize for "native-like" feel (gestures, splash screen).
- [ ] Implement Dark Mode.

### Marketing & Notifications
- [ ] Connect "Rejoindre" (Volunteer) form to backend.
- [ ] Implement Referral Program.
- [ ] Add Loyalty Badges.
- [ ] Create Blog/News section for road safety awareness.
- [ ] Implement Push Notifications (Firebase Cloud Messaging).
- [ ] Add SMS fallback (via Twilio or similar).

## Phase 5: Scale & Quality
*Goal: Operational efficiency and code robustness.*

### Admin Console (Analytics) & content
- [ ] Build Analytics Dashboard (revenue, peak hours, charts).
- [ ] Add Content Management (edit FAQs/Landing text without code).
- [ ] Implement Report Exports (CSV/PDF).

### DevOps & Quality
- [ ] Set up CI/CD pipeline (GitHub Actions → Firebase App Hosting).
- [ ] Write Unit Tests (Jest) and E2E Tests (Playwright).
- [ ] Integrate Error Monitoring (Sentry).
- [ ] Audit Accessibility (WCAG 2.1 AA) and ARIA labels.
- [ ] Add i18n support (French, English, Créole Réunionnais).

## Phase 6: Enterprise & Advanced Features
*Goal: Support business users and advanced use cases.*

### Business/Corporate
- [ ] Corporate Accounts (centralized billing, employee profiles).
- [ ] Expense reporting integration (export to accounting software).
- [ ] Business travel policies (max ride cost, approved destinations).
- [ ] Centralized admin dashboard for company managers.

### Advanced Booking Features
- [ ] Multi-stop rides (add waypoints during trip).
- [ ] Favorite/Saved locations (Home, Work, custom labels).
- [ ] Recurring rides (weekly commute scheduling).
- [ ] Ride categories (Economy, Comfort, Accessibility, Group).
- [ ] Price estimates before booking.

### Driver Enhancements
- [ ] Demand heatmap (high-demand areas for drivers).
- [ ] Surge pricing/dynamic fares during peak hours.
- [ ] Route optimization for multiple pickups.
- [ ] Driver incentives and quest programs.

### AI & Automation
- [ ] Fraud detection (fake bookings, payment fraud).
- [ ] AI-powered route optimization.
- [ ] Demand prediction for driver positioning.
- [ ] Auto-assignment based on ML matching.

## Phase 7: Platform Expansion
*Goal: Expand platform reach and capabilities.*

### Native Mobile Apps
- [ ] Build dedicated iOS app (Swift/SwiftUI).
- [ ] Build dedicated Android app (Kotlin/Jetpack Compose).
- [ ] Separate driver-native apps for better UX.
- [ ] App store deployment (Play Store, App Store).

### Ecosystem & APIs
- [ ] Public API for third-party integrations.
- [ ] Hotel/airport concierge integration.
- [ ] Partner fleet integration (white-label support).
- [ ] Telematics integration for fleet vehicles.

### Future Tech
- [ ] Electric vehicle (EV) charging station routing.
- [ ] Carbon footprint tracking and offsetting.
- [ ] Blockchain-based ride verification (optional).
- [ ] Autonomous vehicle integration readiness.