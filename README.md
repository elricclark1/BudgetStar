# BudgetStar

A minimal, distraction-free, self-hosted personal finance dashboard.

BudgetStar gives you a clear, honest view of your spending, daily pace limits, and category budgets. Built for speed, high legibility, and 100% data ownership—no accounts, no cloud subscriptions, and zero tracking.

---

## Quickstart

Run BudgetStar locally using Docker Compose:

```bash
git clone https://github.com/elricclark1/BudgetStar.git
cd BudgetStar
docker compose up -d
```

- **Web Dashboard:** [http://localhost:3000](http://localhost:3000)
- **API Documentation:** [http://localhost:8000/docs](http://localhost:8000/docs)

To customize port bindings or database paths, copy `.env.example` to `.env` before running.

---

## Core Features

- **Pacing & Variable Baseline:** Compares month-to-date spending against a 3-month rolling baseline. Fixed living costs (rent, utilities) are isolated so lump-sum 1st-of-month payments don't break your daily pace limit.
- **Battery-Style Budget Goals:** Goals start at 100% on the 1st of the month and deplete as you log purchases, with adaptive color progression (Green $\rightarrow$ Yellow $\rightarrow$ Red). Supports single or multi-category targets.
- **Household Profiles:** Seamlessly switch between individual members or view shared household spending with custom badge colors.
- **Necessity Matrix:** Rate purchases 1★ to 5★ to uncover discretionary spending habits and identify painless cutbacks.
- **Subscriptions & Asset Tracking:** Keep tabs on recurring monthly bill dates, plus track depreciating/appreciating asset valuations.
- **Universal Cashflow:** Inflow vs. outflow tracking with an optional 10% charitable giving / tithing calculation mode.
- **Data Portability:** Full CSV Export and Import in the Purchase Log for easy backups and bank statement migration.
- **One-Click Demo Sandbox:** Load 40+ realistic sample transactions from Settings to explore all charts and widgets before logging your own records.

---

## Where Your Data Lives

All data is stored locally on your machine in a SQLite database (`budgetstar.db` inside the persistent Docker volume `budgetstar_data`). Nothing is ever sent to external cloud servers, third parties, or telemetry trackers.

### Backing Up Your Data
- **CSV Export:** Click **"Export CSV"** in the Purchase Log.
- **Database Snapshot:** Copy the SQLite database directly from the running container:
  ```bash
  docker cp budgetstar-backend:/app/data/budgetstar.db ./budgetstar-backup.db
  ```

---

## AI & Operational Transparency

BudgetStar is vibe-coded with AI assistance, thoroughly human-tested, and self-hosted on real bare-metal hardware.

AI automation isn't used as a corporate shortcut—it is the superpower that allows a solo builder to create, polish, and maintain high-quality, completely free tools without ads, venture capital, or paywalls. Every feature, database model, and interface component was designed, tested, and iterated through real-world personal use.

---

## Tech Stack

- **Frontend:** React 18, Vite, Mantine UI v7, Recharts, Tabler Icons
- **Backend:** Python 3.11, FastAPI, SQLAlchemy 2.0 ORM, SQLite (WAL mode)
- **Deployment:** Docker, Docker Compose, Nginx Alpine

---

## License

[MIT License](LICENSE). Free to use, modify, distribute, and self-host.
