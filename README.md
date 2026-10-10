# Travel Organiser App

A full-stack trip planning app: accounts, trip CRUD, day-by-day itinerary,
per-trip to-do checklist, interactive maps with travel-time between stops,
budget/expense tracking (Recharts), and shareable read-only trip links.

## Stack
- **Backend:** Node.js, Express, PostgreSQL (`pg`), JWT auth, bcrypt
- **Frontend:** React (Vite), React Router, Axios, Recharts, Mapbox GL JS
- **Maps:** Mapbox GL JS (map rendering) + Mapbox Directions API (travel time) — free tier, no billing card required

## Project layout
```
travel-organizer/
  backend/
    src/
      db/            # pg pool + schema.sql
      middleware/     # auth (JWT), error handler
      controllers/     # business logic per resource
      routes/          # express routers
      utils/
      server.js
    package.json
    .env.example
  frontend/
    src/
      api/            # axios client + per-resource API calls
      context/         # AuthContext (JWT in memory + localStorage)
      pages/           # route-level screens
      components/      # reusable UI pieces
      App.jsx
      main.jsx
    package.json
    .env.example
```

## How the 7 features map to code

| Feature | Backend | Frontend |
|---|---|---|
| User Accounts & Sign-In | `auth.routes.js` + `auth.controller.js`, JWT middleware | `AuthContext`, `Login.jsx`, `Register.jsx` |
| Trip CRUD | `trips.routes.js` + `trips.controller.js` | `Dashboard.jsx`, `TripCard.jsx`, `TripForm.jsx` |
| Day-by-day Itinerary | `itinerary.routes.js` + `itinerary.controller.js` (days + items tables) | `ItineraryPlanner.jsx` |
| Trip To-Do Checklist | `todos.routes.js` + `todos.controller.js` | `TodoChecklist.jsx` |
| Interactive Maps & Travel-Time | itinerary items store lat/lng | `MapView.jsx` (Mapbox GL JS + Directions API) |
| Budget & Expense Tracking | `expenses.routes.js` + `expenses.controller.js` | `BudgetTracker.jsx` (Recharts) |
| Shared Trip Link | `share.routes.js` + `share.controller.js` (public, token-based) | `SharedTrip.jsx`, `ShareTripModal.jsx` |

## Setup

### 1. Database
```bash
createdb travel_organizer
psql travel_organizer -f backend/src/db/schema.sql
```

### 2. Backend
```bash
cd backend
cp .env.example .env    # fill in DATABASE_URL and JWT_SECRET
npm install
npm run dev              # http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
cp .env.example .env    # fill in VITE_API_URL and VITE_MAPBOX_TOKEN
npm install
npm run dev               # http://localhost:5173
```

## Auth flow
Register/Login return a JWT. The frontend stores it in `localStorage` and
attaches it as `Authorization: Bearer <token>` on every request via an axios
interceptor. Protected routes are guarded both client-side (`ProtectedRoute`)
and server-side (`middleware/auth.js`).

## Share-link flow
Each trip has a `share_token` (UUID) and a `share_enabled` boolean.
- Owner toggles sharing on/off and copies `https://yourapp.com/shared/:token`.
- `GET /api/share/:token` is a **public, unauthenticated** route that returns
  a read-only view (trip info, itinerary, checklist). Expenses/budget are
  **excluded** from the public payload for privacy — see `share.controller.js`
  if you want to expose them too.
- Regenerating the token (owner action) invalidates old links instantly.

## Notes / next steps
- Passwords hashed with bcrypt (12 rounds). Add refresh tokens for production.
- Add rate-limiting (e.g. `express-rate-limit`) on `/api/auth/*`.
- Itinerary items store `lat`/`lng` directly (captured from the Google Places
  Autocomplete/geocoding you wire into the "add stop" form).
- Travel time between consecutive stops in a day uses the Google
  **Directions Service** on the frontend (keeps your backend free of a
  server-side Maps billing dependency); swap to Distance Matrix server-side
  if you want to cache/rate-limit those calls.
