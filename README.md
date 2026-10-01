# BudgetStar

A minimal, distraction-free, self-hosted personal finance and budgeting dashboard.

BudgetStar gives you a clear, honest view of your spending, daily pace limits, and category budgets—built for speed, legibility, and 100% data ownership. No cloud accounts, no subscriptions, and zero third-party telemetry.

---

## Key Features

- **Pacing & Variable Baseline:** Compares your month-to-date spending against a 3-month variable baseline. Fixed living bills (rent, utilities) are strictly isolated so lump-sum 1st-of-month payments don't distort your daily pacing.
- **Battery-Style Budget Goals:** Goals start at 100% on the 1st of the month and deplete as you log purchases. Visual progress bars transition from green to lime, yellow, orange, and red with animated depletion warnings.
- **Multi-Category Goals:** Combine related spending into unified targets (e.g., $650/month across Groceries, Fuel, and Household) with real-time per-category breakdowns.
- **Household Profiles:** Easily toggle between individual members or view shared household spending. Add, rename, and color-code members directly in Settings.
- **Category Necessity Matrix:** Breakdown purchases by 1★ to 5★ necessity ratings with average star ratings and average spend per category.
- **Universal Income & Cashflow:** Track income directly from paychecks or manual baselines, with an optional toggle for charitable giving / tithing calculations.
- **Purchase Log with Instant Search:** Real-time multi-field search across descriptions, categories, payment methods, members, notes, and dates.
- **Subscription Tracker:** Log recurring expenses with charge day reminders and monthly cost totals.
- **Asset Net Worth Tracker:** Monitor valuation and appreciation/depreciation across electronics, vehicles, and tools.
- **One-Click Demo Sandbox:** Seed realistic sample data instantly from Settings to test every chart and widget before entering your own records.
- **Data Portability & Offline Capability:** Full CSV Export and CSV Import support for effortless bank statement ingestion and offline backups.

---

## Installation & Quick Start

### Method 1: Docker Compose (Recommended)

The fastest and most reliable way to run BudgetStar is with Docker Compose.

#### 1. Clone the repository
```bash
git clone https://github.com/elricclark1/BudgetStar.git
cd BudgetStar
```

#### 2. Launch the containers
```bash
docker compose up -d --build
```

#### 3. Access the dashboard
- **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)
- **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

All database records are stored in a persistent Docker volume (`budgetstar_data`).

---

### Method 2: Manual Setup (Without Docker)

If you prefer running Python and Node directly on your host machine:

#### Prerequisites
- **Python:** 3.11 or newer
- **Node.js:** 18 or newer

#### 1. Start the Backend API
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run the API server on port 8000
uvicorn main:app --reload --port 8000
```

#### 2. Start the Frontend Dev Server
In a separate terminal:
```bash
cd frontend
npm install

# Start Vite dev server on port 3000
npm run dev
```

---

## Configuration & Environment Variables

You can customize port bindings and database locations by copying `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Default | Description |
| :--- | :--- | :--- |
| `FRONTEND_PORT` | `3000` | Host port mapped to the web interface |
| `BACKEND_PORT` | `8000` | Host port mapped to the FastAPI backend |
| `DATABASE_URL` | `sqlite:///./data/budgetstar.db` | SQLAlchemy SQLite database connection string |

---

## How to Use BudgetStar

### 1. Initial Setup
1. **Configure Household Members:** Open **Settings** (gear icon) and set up your household members (e.g., your name, partner, or room). Pick custom badge colors for each member.
2. **Configure Payment Methods:** Add your common payment types (Debit, Visa, Cash, Checking) so you can filter spending by card or account.
3. **Try Demo Data (Optional):** In **Settings**, click **"Seed Demo Data"** to immediately populate realistic sample transactions, budget goals, subscriptions, and assets. When you're ready to start logging your real finances, click **"Reset Database"**.

---

### 2. Logging Purchases
- Click **"Add Transaction"** in the top navigation bar.
- Enter the **Amount**, **Description**, **Category**, **Date**, and select which **Member** made the purchase.
- Assign a **Necessity Rating** (1★ to 5★):
  - `1★`: Discretionary impulse or pure luxury
  - `3★`: Standard comfort or routine non-essential
  - `5★`: Essential survival requirement (groceries, medicine, fuel)
- Optional: Add detailed transaction notes or tag the specific payment method.

---

### 3. Understanding the Pacing Engine

Traditional budgets often fail because lump-sum bills at the start of the month (like rent or insurance) make you look like you're instantly "over budget." BudgetStar solves this:

1. **Fixed Bills are Isolated:** Rent, mortgage, and regular utility bills are categorized as fixed living costs and excluded from daily pacing calculations.
2. **Variable Daily Pace:** Your daily pace target is calculated as:
   $$\text{Daily Pace Limit} = \frac{\text{Variable Budget Target} - \text{Month-to-Date Variable Spend}}{\text{Days Remaining in Month}}$$
3. **3-Month Rolling Baseline:** BudgetStar calculates your average variable spending over the past 90 days, giving you an honest baseline for whether this month is pacing higher or lower than usual.

---

### 4. Setting Up Battery Goals
Battery goals display your monthly budget allowance as a depleting battery:
- On day 1 of the month, the battery starts at **100%**.
- As purchases are logged in that category, the battery drains.
- **Color Progression:** 
  - `> 50%`: Emerald Green
  - `25% - 50%`: Lime / Yellow
  - `10% - 25%`: Orange Warning
  - `< 10%`: Crimson Critical / Depleted
- **Multi-Category Goals:** You can combine multiple spending categories into a single goal (for example, a single "Daily Living" goal that encompasses `Groceries`, `Household Supplies`, and `Fuel`).

---

### 5. Tracking Subscriptions & Assets
- **Subscriptions:** Track recurring monthly or annual software, gym, and streaming charges. The dashboard highlights the upcoming charge day of the month and sums your total monthly fixed recurring costs.
- **Assets:** Track physical and financial assets (vehicles, electronics, tools, investments). Log initial purchase prices and current market valuations to see appreciation or depreciation alongside your net worth.

---

### 6. Universal Cashflow & Charitable Giving
- View your total monthly inflows versus outflows at a glance.
- If you practice charitable giving or tithing, you can enable the **Charitable Giving / Tithing** toggle in Settings. This calculates an optional 10% gross baseline per profile and tracks contributions against your giving targets.

---

## Data Storage, Backups & Privacy

### Where is your data stored?
- **With Docker:** Your data is stored on your own host machine inside a persistent Docker volume named `budgetstar_data` (mapped to `/app/data/budgetstar.db` inside the backend container).
- **With Manual Setup:** Your database is saved to `backend/data/budgetstar.db`.
- **Zero Cloud Leakage:** All computation and storage remain strictly on your local machine. No external servers or telemetry are ever contacted.

### How to Back Up Your Data

#### Option A: CSV Export (Fastest)
In the **Purchase Log** tab, click **"Export CSV"**. This saves a clean, standard `.csv` file containing all of your logged transactions with full metadata, ready to import into spreadsheets or back into BudgetStar.

#### Option B: Backup SQLite Database Directly
To create a complete snapshot of your database file while Docker is running:

```bash
docker cp budgetstar-backend:/app/data/budgetstar.db ./budgetstar-backup-$(date +%F).db
```

#### How to Restore a Database Backup
```bash
# Stop the containers
docker compose down

# Copy the backup file into the volume location
docker run --rm -v budgetstar_data:/data -v $(pwd):/backup alpine cp /backup/budgetstar-backup-2026-09-30.db /data/budgetstar.db

# Restart the containers
docker compose up -d
```

---

## Tech Stack

- **Frontend:** React 18, Vite, Mantine UI v7, Recharts, Tabler Icons, Day.js
- **Backend:** Python 3.11, FastAPI, SQLAlchemy 2.0 ORM, Uvicorn
- **Database:** SQLite (with WAL journaling mode enabled)
- **Deployment:** Docker, Docker Compose, Nginx Alpine

---

## License

MIT License. Free to use, modify, distribute, and self-host.
