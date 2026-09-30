# BudgetStar | Single Source of Truth (SSoT)

## 1. Project Identity & Vision
- **Objective:** Minimal, distraction-free, open-source personal finance and budgeting dashboard.
- **Audience:** Independent builders, self-hosters, and households seeking tactile, private budgeting tools without forced cloud accounts, telemetry, or invasive tracking.
- **Philosophy:** Built by Elric in the Serpilas studio tradition. 100% free and open under the Serpilas 4 Rules.

## 2. Tech Stack
- **Frontend:** React 18, Vite, Mantine UI v7, Recharts, Tabler Icons.
- **Backend:** Python 3.11, FastAPI, SQLAlchemy ORM, SQLite.
- **Infra/DevOps:** Docker Compose, multi-stage Node/Nginx alpine frontend, Uvicorn backend, persistent volume storage.
- **Port Defaults:** Backend on `8000`, Frontend on `3000` (customizable via `.env`).

## 3. Serpilas Workspace Guidelines
- **Minimal Emoji Use:** No decorative emojis in UI headers, buttons, cards, or status pills. Use semantic labels and Tabler SVG vector icons.
- **Aesthetic:** Minimal "Light Phone"-inspired terminal aesthetic. Distraction-free utility, high legibility, matte charcoal finishes (`#121212`, `#1E1E24`, `#2E2E33`).
- **Typography:** Grotesque sans-serif (Inter/Geist/system-ui) for UI headers and labels; Monospace strictly for raw numeric counters and currency.
- **Tone & Voice:** Independent digital workshop built by Elric. Friendly, direct, honest, unpretentious. Zero corporate jargon.
- **Action-Oriented Verbs:** "LOG EXPENSE", "CREATE GOAL", "SAVE ASSET", "EXPORT CSV", "LOAD DEMO DATA".
- **The Serpilas 4 Rules:**
  1. Ad-Free Experience
  2. Transparent & Open Source
  3. No Accounts Required
  4. Zero Data Selling or Tracking

## 4. Architecture & Key Features
- **Dynamic Household Profiles:** Customizable profile members (User 1, User 2, Partner, etc.) with custom badge colors and dynamic user cycling. Single-user mode supported.
- **Payment Method Management:** Configurable payment methods with quick filter toggles.
- **Variable Spending & Daily Pace:** Real-time variable spending pace calculated against a 3-month variable baseline, strictly excluding fixed living expenses (rent/utilities) to prevent 1st-of-month pacing distortion.
- **Battery-Style Budget Goals:** Dynamic battery health indicators (100% Green down to 10% Red) with multi-category consolidated budget support.
- **Universal Income & Cashflow:** Dual-mode income tracking supporting direct paycheck logging or optional percentage-based giving/tithing inference.
- **Category Necessity Spreadsheet:** 1★ to 5★ necessity rating breakdown with average spend and star metrics per category.
- **Purchase Log:** Multi-field real-time keyword search, sorting, CSV import/export, and reimbursement tracking.
- **Subscriptions & Recurrings:** Subscription tracking with billing charge day, notes, and monthly totals.
- **Asset Net Worth Tracker:** Valuation and appreciation/depreciation tracking for physical and electronic assets.
- **Demo Data & Sandbox:** One-click sample data generator and safe reset controls for immediate out-of-the-box exploration.

## 5. Version History
- **v2.0.0 (Current):** Complete generic open-source release. Configurable profiles, multi-category battery goals, cashflow tracking, Docker Compose orchestration, demo data generator, and Serpilas design system.
- **v1.5:** Multi-category goals, category necessity matrix, battery progression, and charge date tracking.
- **v1.4:** Fixed-cost isolation from variable pacing, keyword search log, and mobile drawer UI.
- **v1.0 - v1.3:** Initial prototype, CRUD models, and chart visualizations.
