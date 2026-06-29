# Context File

## Changes Made
- Added a new `StoreInfo` component that integrates Google Maps iframe and live google reviews data.
- **REDESIGNED**: Overhauled `StoreInfo` layout to fix UI issues. It now features a premium glassmorphic Store Location card with a 3D-filtered map, and a seamlessly infinite scrolling marquee carousel for the Google reviews. Added GSAP entrance animations.
- Included the `StoreInfo` component in `Home.tsx` to render at the bottom of the home page.
- Extracted the `/admin` route out of `<Layout>` in `App.tsx` so the dashboard spans the full screen without global constraints (footer/logo).
- Added `isBanned` field to the User model and `GET /`, `PATCH /:id/ban` endpoints to a new `users.ts` route on the backend.
- Added a new `CUSTOMERS` tab in the `AdminDashboard` to manage users and toggle their ban status.
- **ADDRESS CAPTURE**: Updated `Account.tsx` registration form to capture the user's `address`, saved securely to the backend on sign-up.
- **SMART CHECKOUT**: Updated `Checkout.tsx` to fetch the logged-in user profile, automatically pre-fill the saved `address`, and offer dynamic Payment Channels (Credit Card, Saved Card, COD, UPI). Successfully completing checkout on a new card securely saves the card number and expiry to the user's account for future auto-fill, strictly excluding the CVV.

## Current File Structure
```
g:/TSS/src/
├── App.css
├── App.tsx
├── index.css
├── main.tsx
├── assets/
├── components/
│   ├── AnimatedButton.tsx
│   ├── StoreInfo.tsx      <-- [NEW] Added StoreInfo component
│   └── ui/
├── context/
├── hooks/
├── lib/
└── pages/
    ├── Home.tsx           <-- [MODIFIED] Added StoreInfo integration
    └── ... (other pages)
```
## Recent Changes (2026-06-29)

### 1. Fixed Netlify SPA Routing
- **What happened:** Added a `public/_redirects` file with the rule `/* /index.html 200`. This prevents Netlify from returning 404s when users navigate directly to SPA routes or refresh the page.
- **Current File Structure Changes:**
  - `[NEW]` `public/_redirects`

### 2. Made Account Page Buttons Interactive
- **What happened:** Hooked up the static buttons in the Accounts page to mock frontend logic (alerts and React state updates) so they "work" from a user interaction standpoint.
- **Changes in `src/pages/Account.tsx`:**
  - Added React state for `paymentMethods` and `notifications`.
  - Implemented `handleEditProfile`, `handleTrackOrder`, `handleInvoice`, `handleRemovePayment`, and `handleAddPayment` handlers.
  - Linked `ArrowButton` and `AnimatedButton` instances to these new handlers via the `onClick` prop.
  - Bound notification checkboxes to state.
- **Current File Structure Changes:** No structural changes to files; `src/pages/Account.tsx` was modified.

### 3. Added Custom Admin Account
- **What happened:** Modified the backend database seeding script to automatically create a custom admin account (`admintss@tss.com` / `atssdmin123`) with full admin privileges and CMS access upon server startup.
- **Changes in `backend/src/server.ts`:**
  - Added logic to hash the password and insert the new `User` document with `role: 'admin'`.
- **Current File Structure Changes:** No structural changes to files; `backend/src/server.ts` was modified.

### 4. Redesigned CMS Admin Dashboard
- **What happened:** Re-architected and redesigned the Admin CMS portal (`src/pages/AdminDashboard.tsx`) to feature a premium, layered cyberpunk console aesthetic. Added real-time database stats cards and improved layout spacing and visual hierarchy.
- **Changes in `src/pages/AdminDashboard.tsx`:**
  - Integrated `lucide-react` icons.
  - Added calculated inventory metrics: *Registered Hardware* (Total), *Low Stock Alerts* (Stock <= 5), and *Depleted Units* (Stock = 0).
  - Built a glassmorphic dashboard container with a subtle neon cyan top-border glow.
  - Revamped the products list table and quick inventory stock controller into high-contrast grid layouts with smooth hover scaling and transitions.
  - Cleaned up form organization, grouping input parameters logically.
- **Current File Structure Changes:** No structural changes to files; `src/pages/AdminDashboard.tsx` was modified.

### 5. Created Overall App Management & Analytics Dashboard
- **What happened:** Implemented a comprehensive `OVERVIEW` dashboard tab inside the admin panel (`src/pages/AdminDashboard.tsx`) for high-level store analytics, sales tracking, and order fulfillment.
- **Changes in `src/pages/AdminDashboard.tsx`:**
  - Added a **Timeframe Selector** supporting `24h`, `7d`, `30d`, and `12m` intervals.
  - Linked KPI cards (Total Revenue, Orders, Unique Visitors, Avg Order Value) to dynamically scale with the selected timeframe.
  - Created a custom **SVG Revenue Velocity Trend Line Chart** with an animated glow and area fill.
  - Added a **Category Distribution Matrix** tracking percentage sales across categories.
  - Designed an interactive **Order Transaction Log** table that allows admins to view customer details and update order statuses (Processing, Shipped, Delivered, Cancelled) in real time.
  - Integrated a **Top Performing Hardware** ledger tracking individual item revenue.
- **Current File Structure Changes:** No structural changes to files; `src/pages/AdminDashboard.tsx` was modified.

### 6. Compilation Auditing & Hotfixes
- **What happened:** Audited compilation for the entire codebase (frontend and backend) to ensure all pages build successfully.
- **Changes in `src/pages/AdminDashboard.tsx`:**
  - Removed unused imports (`Package`, `AlertTriangle`, `Eye`, `ChevronDown`).
  - Added missing `PlusCircle` icon import.
  - Adjusted `FloatingInput` `bgContext` parameters from `#07070a` and `#0c0c10` to `#0a0a0a` to match strict type constraints (`"#111" | "#0a0a0a"`).
  
- **Verification:** Both `npm run build` (Vite client) and `tsc` (Node backend) compiled successfully with 0 errors.
- **Current File Structure Changes:** No structural changes to files; `src/pages/AdminDashboard.tsx` and `context.md` were modified.

### 7. Generated Technical Specification PDF
- **What happened:** Generated a comprehensive technical document (`TSS_Website_Documentation.pdf`) detailing the application's executive summary, full-stack tech stack, route-based page directory (13 pages), administrative CMS/Analytics features, and deployment structure.
- **Current File Structure Changes:**
  - `[NEW]` [TSS_Website_Documentation.pdf](file:///g:/TSS/TSS_Website_Documentation.pdf)

### 8. Created E-Commerce Backend Blueprint Documentation
- **What happened:** Investigated the backend architecture and frontend API connection methods. Wrote a detailed markdown document mapping the overall flow, models, frontend connections (`src/lib/api.ts`), and common errors/fixes specifically encountered in this stack (like CORS, HttpOnly cookies with Vite, Multer FormData boundary issues).
- **Current File Structure Changes:**
  - `[NEW]` [ecommerce_backend_blueprint.md](file:///g:/TSS/ecommerce_backend_blueprint.md)

### 9. Fixed CORS Issue for GitHub Pages Hosted App
- **What happened:** Identified and fixed a `net::ERR_EMPTY_RESPONSE` error when the frontend (`atharv21-ui.github.io`) tried to communicate with the Railway backend. The root cause was that `github.io` was missing from the CORS allowed origins list. Added `github.io` to the allowed origins check in `backend/src/server.ts`.
- **Changes in `backend/src/server.ts`:**
  - Appended `origin.includes('github.io')` to the allowed origins check.
- **Current File Structure Changes:** No structural changes to files; `backend/src/server.ts` and `context.md` were modified.
