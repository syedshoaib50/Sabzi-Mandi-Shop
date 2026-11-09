# Green Vegetable — Online Sabzi Mandi 

A dual-portal digital fresh produce marketplace and wholesale mandi management platform connecting regional farmers directly with households, retailers, and restaurants with zero middleman markups.

---

## 🌟 Key Features

### 1. Dual-Portal Architecture ("Two Sites in One")
- **Customer Storefront Portal**:
  - Live vegetable rates with daily morning market pricing.
  - Interactive produce catalog with dynamic weight selection (100g, 250g, 500g, 1kg, 1.5kg, 2kg, 5kg, and custom weights).
  - Quick cart & seamless buying request dispatching.
  - "My Requests" drawer to track order status (Pending, Verified, Delivered).
  - Read-only About Us (ہمارے متعلق) page providing verified mandi heritage, sourcing standards, timings, and committee information.
- **Admin Operations Desk Portal**:
  - Real-time inventory and stock control (price updates, restocking, stock-out alerts).
  - Order verification and delivery dispatching with automated stock deduction.
  - Product management (add new vegetables with photos, edit prices, delete items).
  - User Directory with List View / Cards toggle and real-time search.
  - Change Admin Signup Secret Code with customizable passcode guard.
  - Dedicated About Page Editor allowing admins to update stories, contacts, operating hours, and leadership members with device photo uploads.

### 2. Audio & Mandi Voice Engine
- Regional street hawker announcements (Saraiki voice persona).
- Background market ambiance calls for daily fresh vegetables.
- Interactive voice price announcements on vegetable clicks.
- Custom sound effects (scanner beeps, restock chimes, error alerts).

### 3. Permanent Deletion & Session Continuity
- Customers, admins, and products deleted by an admin are permanently stored in deletion registries and never resurrected on page reload.
- If an active user/admin is deleted, the session transitions to the remaining active user automatically.

### 4. About Mandi Page (Both Sides Access)
- Public view shows verified mandi heritage, stats, timings, and helpline.
- Admin edit view allows editing all text, contact numbers, hours, and addresses.
- Leadership members can be added with photos from device or emojis, and edited/deleted at will.

### 5. Strict Validation & Security
- **Pakistani Mobile Validation**: Strictly requires an 11-digit number starting with `03` (e.g. `03001234567`).
- **Google Gmail Requirement**: Only genuine `@gmail.com` addresses accepted.
- **Password Enforcement**: Strictly 8 to 20 characters with live length counter.
- **Dynamic Admin Secret Code**: Updatable passcode required for new admin registrations.
- **Rate Limiter**: 5-attempt brute-force defense lockout.

---

## 🛠️ Technology Stack
- React 19 (TypeScript)
- Vite
- Tailwind CSS
- Lucide React
- Canvas Confetti
- Node.js Native Test Runner (`node:test`)

---

## 🚀 Commands
- `npm run dev`: Start local development server on port 3000
- `npm run build`: Build production bundle
- `npx tsx --test src/utils/inventoryLogic.test.ts src/utils/orderAndAuth.test.ts`: Run all unit tests

<img width="1215" height="551" alt="Screenshot 2026-11-10 001305" src="https://github.com/user-attachments/assets/d2e595cd-3797-4f37-96f3-ed6fd11b3b1c" />
