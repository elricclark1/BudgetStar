# BudgetStar

A self-hosted personal finance and budgeting dashboard built to track household spending, daily pacing, and category goals on a local server.

---

## Why I Built This

I built BudgetStar because most budgeting apps either require paid subscriptions, rely on third-party bank syncing services, or don't handle daily pacing well. In typical apps, paying rent or a large insurance bill on the 1st of the month makes it look like you've blown your entire budget on day one. 

I wanted a lightweight, distraction-free tool running on my own hardware where financial data stays in a local SQLite file. I put this together using FastAPI, React (Mantine UI), and Docker, vibe-coding the implementation with AI assistance and testing it by hand against our own household expenses.

---

## What It Does

- **Overview & Pacing:** Tracks your month-to-date spending against a 3-month rolling baseline. Fixed living costs (rent, utilities) are separated from variable spending so lump-sum bills don't throw off your daily pace limit.
- **Battery Budget Goals:** Category budget bars that start at 100% at the beginning of the month and deplete as you log purchases. Supports single categories or grouping multiple categories into a single target (e.g. Groceries + Fuel).
- **Purchase Log:** Filterable transaction ledger with real-time keyword search, sorting, 1★ to 5★ necessity ratings, and full CSV export/import.
- **Household Profiles:** Switch between individual member spending and shared household expenses. Member names and badge colors are configurable in Settings.
- **Subscriptions:** Recurring expense tracker that highlights upcoming billing days and calculates total monthly recurring commitments.
- **Asset Tracker:** Basic net-worth ledger for physical and financial assets (vehicles, electronics, tools) tracking purchase cost vs. current valuation.
- **Cashflow:** Monthly inflow vs. outflow tracking, with an optional toggle for 10% charitable giving or tithing calculations.
- **Demo Sandbox:** A one-click button in Settings to populate realistic sample data so you can test all views before logging your own numbers.

---

## Installation & Running

### Using Docker Compose (Recommended)

```bash
# 1. Clone the repository
git clone https://github.com/elricclark1/BudgetStar.git
cd BudgetStar

# 2. Start the services
docker compose up -d
```

- **Frontend:** [http://localhost:3000](http://localhost:3000)
- **API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

To change ports or database settings, copy `.env.example` to `.env` before starting.

### Running Manually (Without Docker)

#### Backend (Python 3.11+)
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

uvicorn main:app --reload --port 8000
```

#### Frontend (Node 18+)
```bash
cd frontend
npm install
npm run dev
```

---

## Data Storage & Privacy

All data is stored in a local SQLite database (`budgetstar.db` inside the `budgetstar_data` Docker volume or `backend/data/`). The application runs entirely on your own machine—there are no cloud accounts, external network calls, or telemetry.

To create a backup of your database:
```bash
docker cp budgetstar-backend:/app/data/budgetstar.db ./backup.db
```

---

## Tech Stack

- **Backend:** Python 3.11, FastAPI, SQLAlchemy 2.0, SQLite (WAL mode)
- **Frontend:** React 18, Vite, Mantine UI v7, Recharts, Tabler Icons
- **Deployment:** Docker, Docker Compose, Nginx

---

## License

[MIT](LICENSE)
