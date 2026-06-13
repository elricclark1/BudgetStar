# BudgetStar | Single Source of Truth (SSoT)

## 1. Project Identity & Vision
- **Objective:** AI-enhanced financial tracking and budgeting application.
- **Target Environment:** Production HomeLab.
- **Key Constraints:** Real-time budget updates, AI querying of financial data.

## 2. The Tech Stack (The "How")
- **Frontend:** React (Vite, Mantine UI).
- **Backend:** Python (FastAPI).
- **Database/Persistence:** SQLite (`budgetstar.db`).
- **Infra/DevOps:** Docker (Port 8000 backend, 3005 frontend).

## 3. Global Standards (The "Rules")
- **Naming:** kebab-case files, snake_case Python functions.
- **Design Tokens:** Dark theme, Aquamarine accent (`#2DD4BF`).

## 4. Current Architecture Map
- **Directory Structure:**
  - `/frontend`: Vite/React project with widget-based dashboard.
  - `/backend`: FastAPI project with SQLModel-like SQLAlchemy models.
- **Data Models:** 
  - Transaction: Personal spending records.
  - Goal: Category-based budget targets.
  - Recurring: Subscription/bill tracking.
  - Asset: Tracking of valuable items (Car, PC, etc.) with purchase and valuation data.

## 5. Progress Log (The "Memory")
- [2026-03] Core logic, database migration, and AI integration established.
- [2026-05-11] Added "Assets" tracking tab with full CRUD and widget-style UI (v3.1).
- [2026-05-27] v3.2: Reversed Goal bars to battery style, simplified Monthly Pace, and added Info page.
- [2026-05-27] v3.3: Dynamic Info page content based on user mode (Technical for Elric).
- [2026-06-02] v4.0b: Added togglable ranking graph view to "Spending by Category" card.
- [2026-06-02] v4.1: Updated monthly pacing calculations to compare against the past 3 complete months instead of overall average.

## 6. Next Steps (The "Queue")
- [ ] Implement asset valuation history/charts.
- [ ] Connect frontend to AI query endpoints.
- [ ] Implement monthly report generation.
