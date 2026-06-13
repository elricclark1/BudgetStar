# BudgetStar

BudgetStar is a personal finance dashboard and budgeting application designed to track spending, manage financial goals, monitor savings, and project future income.

## Key Features
- **Interactive Dashboard:** View real-time spending, monthly averages, and daily budget pacing.
- **Goal & Budget Tracking:** Set monthly budgets per category with battery-style progress indicators.
- **Savings Tracker:** Track savings accounts and calculate overall net worth.
- **Tithing & Income Inference:** Optional module to calculate gross income, net income, and living-spending-to-net-income ratios.
- **Standalone Mode:** Works entirely in the browser using `localStorage` if the backend is unreachable. Support for JSON backups and CSV importing/exporting is built directly into the UI.
- **Local Dev / Cloud Sync Mode:** Connects to a FastAPI + SQLite backend.

---

## Running Locally

To run the full stack (Frontend, Backend API, SQLite database) on your local machine, use Docker Compose.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd budgetstar
   ```

2. **Start the application:**
   ```bash
   docker compose up -d --build
   ```

3. **Access the application:**
   - **Frontend Dashboard:** [http://localhost:3005](http://localhost:3005)
   - **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Tech Stack
- **Frontend:** React (Vite, Mantine UI)
- **Backend:** Python (FastAPI)
- **Database:** SQLite
- **Deployment:** Docker / Docker Compose
