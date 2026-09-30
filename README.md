# BudgetStar

Minimal, distraction-free, open-source personal finance and budgeting dashboard.

BudgetStar is an independent digital tool built by Elric. Designed for self-hosters and households who value high utility, clean typography, and full data privacy. It gives you a clear, honest view of your spending, daily pace limits, and category budgets without invasive cloud accounts, tracking scripts, or advertisements.

---

## Serpilas has 4 rules:

1. **Ad-Free Experience:** Clean, tracker-free web applications engineered purely for utility, performance, and user satisfaction without invasive telemetry or crowding advertisements.
2. **Transparent & Open Source:** Public code built in the open. Anyone can inspect how it works, see what happens under the hood, or host it themselves. We want our tools to be useful and customizable to you.
3. **No Accounts Required:** Instant access to every tool without forced accounts or remembering passwords. Data stays on your machine—in your local SQLite database or your private browser storage.
4. **Zero Data Selling or Tracking:** User activity stays strictly yours. Nothing is tracked, packaged for advertising profiles, or sold to third-party data brokers.

---

## Key Features

- **Pacing & Variable Baseline:** Compares your month-to-date spending against a 3-month variable baseline. Fixed living bills (rent, utilities) are strictly isolated so lump-sum 1st-of-month payments don't distort your daily pacing.
- **Battery-Style Budget Goals:** Goals start at 100% on the 1st of the month and deplete as you log purchases. Progress bars transition from green to lime, yellow, orange, and red with animated depletion warnings.
- **Multi-Category Goals:** Combine related spending into unified targets (e.g., $650/month across Groceries, Fuel, and Personal Care) with real-time per-category breakdowns.
- **Household Profiles:** Easily toggle between profiles or view shared household spending. Add, rename, or color-code members directly in Settings.
- **Category Necessity Spreadsheet:** Breakdown purchases by 1★ to 5★ necessity ratings with average star ratings and average spend per category.
- **Universal Income & Cashflow:** Track income directly from paychecks or manual baselines, with an optional toggle for charitable giving/tithing inference.
- **Purchase Log with Instant Search:** Real-time multi-field search across descriptions, categories, payment methods, members, notes, and dates.
- **Subscription Tracker:** Log recurring expenses with charge day reminders and monthly cost totals.
- **Asset Net Worth Tracker:** Monitor valuation and appreciation/depreciation across electronics, vehicles, and tools.
- **One-Click Demo Sandbox:** Seed realistic sample data instantly from Settings to test every chart and widget before entering your own records.
- **Flexible Data Portability:** Full CSV Export and CSV Import support for effortless bank statement ingestion and offline backups.
- **Client & Offline First:** Operates seamlessly connected to the self-hosted backend or completely standalone offline in your browser.

---

## Quick Start (Docker Compose)

The easiest way to run BudgetStar is with Docker Compose.

### 1. Clone the repository
```bash
git clone https://github.com/elricclark1/BudgetStar.git
cd BudgetStar
```

### 2. Launch with Docker Compose
```bash
docker compose up -d --build
```

### 3. Open your browser
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

All database records are stored safely in a persistent Docker volume (`budgetstar_data`).

---

## Configuration & Environment Variables

You can configure port mappings and database paths by copying `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Default | Description |
| :--- | :--- | :--- |
| `FRONTEND_PORT` | `3000` | Host port mapped to the web interface |
| `BACKEND_PORT` | `8000` | Host port mapped to the FastAPI backend |
| `DATABASE_URL` | `sqlite:///./data/budgetstar.db` | SQLAlchemy database connection string |

---

## Manual Development Setup

If you prefer running the backend and frontend directly without Docker:

### Backend Setup (Python 3.11+)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run the API server
uvicorn main:app --reload --port 8000
```

### Frontend Setup (Node 18+)
```bash
cd frontend
npm install

# Start Vite dev server
npm run dev
```

---

## Tech Stack

- **Frontend:** React 18, Vite, Mantine UI v7, Recharts, Tabler Icons, Day.js
- **Backend:** Python 3.11, FastAPI, SQLAlchemy ORM, Uvicorn
- **Database:** SQLite
- **Deployment:** Docker, Docker Compose, Nginx Alpine

---

## License

MIT License. Free to use, modify, and self-host.
