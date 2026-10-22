# MealMitra — Surplus Food Rescue & Community Donation Platform

> **Tagline:** *“Share More. Waste Less.”*

MealMitra is a modern full-stack web application designed to eliminate food waste by connecting restaurants, college dining canteens, hostels, and banquet event organizers with verified orphanages, NGOs, night shelters, and community couriers.

---

## 1. Project Overview & Features

- **Surplus Food CRUD:** Food donors can publish, view, update, and delete excess food batches with preparation timestamps, expiration deadlines, quantities, storage conditions, and allergen warnings.
- **Transaction-Safe Reservation Workflow:** Prevents over-reservation using concurrent transaction checks. Automatically deducts inventory upon request acceptance and restores inventory if cancelled.
- **In-App Communication & WhatsApp/Call Hotlines:** Dedicated conversation threads linked to every donation request, equipped with instant **WhatsApp Chat** (`https://wa.me/...`) and **Direct Phone Call** (`tel:...`) buttons for rapid coordination.
- **Multi-Role RBAC:**
  - **Food Donors:** Restaurants, college canteens, bakeries, hostels.
  - **Recipient Organizations:** Orphanages, NGOs, emergency shelters, soup kitchens.
  - **Volunteers:** Community bike & van couriers for transit assistance.
- **Food Safety Standards:** Adheres to the 2-Hour Cooked Food Rule, cold-chain maintenance, packaging compliance, and an integrated listing reporting workflow.
- **Live Impact Dashboard:** Real-time metrics calculated from actual database records (available listings, active requests, meals rescued, completed handovers).
- **Design System:** Calm, trustworthy **Warm Ivory (`#FFF8ED`) & Sage Green (`#8BAF92`)** palette with Deep Forest (`#344E41`) headers and Earthy Terracotta (`#C97B63`) urgency badges.

---

## 2. Technology Stack

- **Frontend:** React.js 19, Vite, Tailwind CSS v4, Lucide Icons
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL (with `server/schema.sql` 3NF relational design & `pg` connection pool)
- **Persistent Cloud Store:** Firebase Firestore & Firebase Authentication
- **APIs:** RESTful JSON APIs using Fetch API

---

## 3. Directory Layout

```text
├── firebase-applet-config.json     # Firebase cloud credentials
├── firebase-blueprint.json         # Intermediate database representation
├── firestore.rules                 # Deployed zero-trust security rules
├── index.html                      # HTML entry with Plus Jakarta Sans typography
├── metadata.json                   # App title and capabilities
├── package.json                    # Project dependencies
├── server/
│   ├── db.js                       # PostgreSQL connection pool with transaction helper
│   ├── middleware/
│   │   └── auth.js                 # Authentication & RBAC middleware
│   ├── routes/
│   │   ├── dashboard.js            # Live calculated statistics & safety reports
│   │   ├── donations.js            # Surplus food listings CRUD
│   │   ├── organizations.js        # Organization directory endpoints
│   │   └── requests.js             # Claims, status workflow & messages
│   ├── schema.sql                  # PostgreSQL relational DDL (7 tables, triggers, indexes)
│   ├── seed.js                     # Demonstration seed data (donors, shelters, batches)
│   ├── server.js                   # Express application entry point
│   └── services/
│       └── donationService.js      # Concurrency & inventory state transitions
├── src/
│   ├── App.tsx                     # Main routing, layout, and modal controllers
│   ├── components/
│   │   ├── CreateDonationModal.tsx # Donor listing publication & edit modal
│   │   ├── DonationCard.tsx        # Surplus food card with urgency & storage tags
│   │   ├── DonationDetailsModal.tsx# Inspection, allergen, and safety detail modal
│   │   ├── MessagesModal.tsx       # In-app chat, WhatsApp link & phone call hotline
│   │   ├── Navbar.tsx              # Brand header, persona switcher & navigation
│   │   ├── ReportModal.tsx         # Flagging unsafe food or inaccurate listings
│   │   └── RequestModal.tsx        # Quantity claim modal for recipient shelters
│   ├── context/
│   │   └── AuthContext.tsx         # User authentication & demo role switcher
│   ├── lib/
│   │   └── firebase.ts             # Firebase client SDK initialization & health check
│   ├── pages/
│   │   ├── BrowseDonations.tsx     # Discovery feed with search & category filters
│   │   ├── Dashboard.tsx           # Aggregated statistics & urgent surplus callouts
│   │   ├── DocsArchitecturePage.tsx# In-app database schema viewer & API docs
│   │   ├── FoodSafetyPage.tsx      # 5 Golden Rules of Food Rescue & charter
│   │   ├── MyListings.tsx          # Donor management & inbound request approval
│   │   ├── MyRequests.tsx          # Shelter claim tracker & unlocked pickup addresses
│   │   ├── OrganizationsPage.tsx   # Verified shelter & orphanage directory
│   │   └── VolunteerDispatch.tsx   # Courier board for transit assistance
│   ├── services/
│   │   └── api.ts                  # Centralized REST API client
│   └── types/
│       └── index.ts                # TypeScript domain models
└── vite.config.ts                  # Vite config with embedded Express API middleware
```

---

## 4. PostgreSQL Relational Schema (`server/schema.sql`)

The database design comprises 7 normalized tables:

1. **`users`**: User identity, credentials, roles (`donor`, `recipient`, `volunteer`), contact phone, and location.
2. **`organizations`**: Orphanages, shelters, canteens, contact liaison, verification status, and daily beneficiary count.
3. **`donations`**: Surplus food items, category, quantity, unit, public pickup landmark, protected address details, preparation time, deadline, storage conditions, allergens, and status (`Available`, `Reserved`, `Completed`, `Expired`).
4. **`donation_requests`**: Claims made by shelters, requested quantity, proposed pickup time, and status (`Pending`, `Accepted`, `Declined`, `Cancelled`, `Collected`, `Completed`).
5. **`conversations`**: Request-linked communication channels.
6. **`messages`**: Individual communication messages exchanged between donor, recipient, and assigned volunteer.
7. **`collections`**: Logistics tracking for scheduled pickups, transit notes, and handover confirmation.

---

## 5. REST API Documentation

| Method | Endpoint | Description | Role Required |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Returns real calculated stats (available, active, rescued) | Public |
| `GET` | `/api/donations` | Browse surplus listings with search & category filters | Public |
| `GET` | `/api/donations/:id` | Fetch specific donation listing details | Public |
| `POST` | `/api/donations` | Publish a new surplus food batch | Food Donor |
| `PUT` | `/api/donations/:id` | Edit quantity, pickup deadline, or description | Donor (Owner) |
| `DELETE` | `/api/donations/:id` | Delete an unreserved listing | Donor (Owner) |
| `GET` | `/api/requests` | List requests related to the logged-in user | Authenticated |
| `POST` | `/api/requests` | Submit claim for specific quantity & pickup time | Recipient Org |
| `PATCH` | `/api/requests/:id/status` | Accept, decline, or complete request (safe transaction) | Donor / Recipient |
| `PATCH` | `/api/requests/:id/assign-volunteer` | Volunteer self-assigns to provide delivery | Volunteer |
| `GET` | `/api/requests/:id/messages` | Retrieve conversation thread history | Request Participants |
| `POST` | `/api/requests/:id/messages` | Send coordination message | Request Participants |
| `GET` | `/api/organizations` | Directory of verified community shelters | Public |
| `POST` | `/api/reports` | Submit food safety report on listing | Authenticated |

---

## 6. Testing & Verification Checklist (Section 11)

- [x] **1. Donation creation:** Food donations created in the React interface are submitted to the Express backend and persisted.
- [x] **2. Persistence:** Saved donations persist across browser refreshes.
- [x] **3. Donor editing/deletion:** Donors can update details or delete their unreserved listings.
- [x] **4. Organization requests:** Shelters can submit requests specifying quantity and collection time.
- [x] **5. Inbound approval:** Donors can Accept or Decline incoming shelter requests.
- [x] **6. Concurrency math:** Available quantities automatically decrement upon acceptance; cannot oversell; restores quantity if cancelled.
- [x] **7. Messaging & Hotlines:** In-app conversation thread works with sender role badges, plus direct WhatsApp and Phone Call buttons.
- [x] **8. Private address protection:** Sensitive pickup instructions are shielded until a request is officially approved.
- [x] **9. Expiration prevention:** Expired items are marked and cannot be newly reserved.
- [x] **10. Status tracking:** Request progression (`Pending` -> `Accepted` -> `Collected` -> `Completed`) functions cleanly.
- [x] **11. Validation feedback:** Friendly error messages for past deadlines, non-positive quantities, or over-requests.
- [x] **12. Real dashboard statistics:** Impact cards calculate actual counts from database records.

---

## 7. How to Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Run development server (serves frontend & Express REST API on port 3000)
npm run dev

# 3. Build for production
npm run build
```
