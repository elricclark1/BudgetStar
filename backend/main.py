import datetime
import random
from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
import models, schemas
from database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
from datetime import date, timedelta

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="BudgetStar API",
    version="2.0.0",
    description="Clean, open-source personal finance, budgeting, and asset tracking API."
)

@app.on_event("startup")
def startup_init():
    db = SessionLocal()
    try:
        # Prepopulate default savings accounts if none exist
        if db.query(models.SavingsAccount).count() == 0:
            defaults = ["Emergency Fund", "Checking Account", "High-Yield Savings", "Investment Reserve"]
            for name in defaults:
                db_acc = models.SavingsAccount(name=name, user="User 1")
                db.add(db_acc)
            db.commit()
            print("Successfully prepopulated default savings accounts")

        # Dynamic schema migrations for existing SQLite databases
        try:
            with engine.connect() as conn:
                rec_cols = [row[1] for row in conn.execute(text("PRAGMA table_info(recurrings)")).fetchall()]
                if "notes" not in rec_cols:
                    conn.execute(text("ALTER TABLE recurrings ADD COLUMN notes VARCHAR"))
                if "day" not in rec_cols:
                    conn.execute(text("ALTER TABLE recurrings ADD COLUMN day VARCHAR"))

                tx_cols = [row[1] for row in conn.execute(text("PRAGMA table_info(transactions)")).fetchall()]
                if "is_reimbursed" not in tx_cols:
                    conn.execute(text("ALTER TABLE transactions ADD COLUMN is_reimbursed BOOLEAN DEFAULT 0"))
                if "reimbursement_amount" not in tx_cols:
                    conn.execute(text("ALTER TABLE transactions ADD COLUMN reimbursement_amount FLOAT DEFAULT 0.0"))

                asset_cols = [row[1] for row in conn.execute(text("PRAGMA table_info(assets)")).fetchall()]
                if "user" not in asset_cols:
                    conn.execute(text("ALTER TABLE assets ADD COLUMN user VARCHAR DEFAULT 'User 1'"))

                conn.commit()
        except Exception as mig_err:
            print("Migration check notice:", mig_err)

    except Exception as e:
        print("Startup initialization error:", e)
    finally:
        db.close()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Health check
@app.get("/health")
def health_check():
    return {"status": "ok", "app": "BudgetStar", "version": "2.0.0"}

# --- Transactions ---

@app.post("/transactions/", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = models.Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.get("/transactions/", response_model=List[schemas.Transaction])
def read_transactions(skip: int = 0, limit: int = 10000, db: Session = Depends(get_db)):
    return db.query(models.Transaction).order_by(models.Transaction.date.desc()).offset(skip).limit(limit).all()

@app.get("/transactions/summary")
def get_summary(start_date: Optional[date] = Query(None), end_date: Optional[date] = Query(None), db: Session = Depends(get_db)):
    query = db.query(models.Transaction)
    if start_date:
        query = query.filter(models.Transaction.date >= start_date)
    if end_date:
        query = query.filter(models.Transaction.date <= end_date)
    
    transactions = query.all()
    total_spent = sum(t.amount - (t.reimbursement_amount or 0.0) for t in transactions if (t.category or '').lower() != 'income')
    return {"total_spent": total_spent, "count": len(transactions)}

@app.put("/transactions/{transaction_id}", response_model=schemas.Transaction)
def update_transaction(transaction_id: int, transaction: schemas.TransactionUpdate, db: Session = Depends(get_db)):
    db_transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if db_transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    update_data = transaction.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_transaction, key, value)

    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(transaction)
    db.commit()
    return {"ok": True}

# --- Goals ---

@app.post("/goals/", response_model=schemas.Goal)
def create_goal(goal: schemas.GoalCreate, db: Session = Depends(get_db)):
    goal_data = goal.dict()
    if isinstance(goal_data.get("category"), list):
        goal_data["category"] = ", ".join(str(c).strip() for c in goal_data["category"] if str(c).strip())
    db_goal = models.Goal(**goal_data)
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@app.get("/goals/", response_model=List[schemas.Goal])
def read_goals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    goals = db.query(models.Goal).all()
    # Sort with Shared/Both first or alphabetically by user
    goals.sort(key=lambda g: ((g.user or "Shared").lower() != "shared", (g.user or "").lower(), g.id or 0))
    return goals[skip : skip + limit]

@app.put("/goals/{goal_id}", response_model=schemas.Goal)
def update_goal(goal_id: int, goal: schemas.GoalCreate, db: Session = Depends(get_db)):
    db_goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if db_goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    goal_data = goal.dict()
    if isinstance(goal_data.get("category"), list):
        goal_data["category"] = ", ".join(str(c).strip() for c in goal_data["category"] if str(c).strip())
    for key, value in goal_data.items():
        setattr(db_goal, key, value)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@app.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    db.delete(goal)
    db.commit()
    return {"ok": True}

# --- Recurring Purchases ---

@app.post("/recurrings/", response_model=schemas.Recurring)
def create_recurring(recurring: schemas.RecurringCreate, db: Session = Depends(get_db)):
    db_recurring = models.Recurring(**recurring.dict())
    db.add(db_recurring)
    db.commit()
    db.refresh(db_recurring)
    return db_recurring

@app.get("/recurrings/", response_model=List[schemas.Recurring])
def read_recurrings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Recurring).offset(skip).limit(limit).all()

@app.put("/recurrings/{recurring_id}", response_model=schemas.Recurring)
def update_recurring(recurring_id: int, recurring: schemas.RecurringCreate, db: Session = Depends(get_db)):
    db_recurring = db.query(models.Recurring).filter(models.Recurring.id == recurring_id).first()
    if db_recurring is None:
        raise HTTPException(status_code=404, detail="Recurring not found")
    for key, value in recurring.dict().items():
        setattr(db_recurring, key, value)
    db.commit()
    db.refresh(db_recurring)
    return db_recurring

@app.delete("/recurrings/{recurring_id}")
def delete_recurring(recurring_id: int, db: Session = Depends(get_db)):
    recurring = db.query(models.Recurring).filter(models.Recurring.id == recurring_id).first()
    if recurring is None:
        raise HTTPException(status_code=404, detail="Recurring not found")
    db.delete(recurring)
    db.commit()
    return {"ok": True}

# --- Assets ---

@app.post("/assets/", response_model=schemas.Asset)
def create_asset(asset: schemas.AssetCreate, db: Session = Depends(get_db)):
    db_asset = models.Asset(**asset.dict())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@app.get("/assets/", response_model=List[schemas.Asset])
def read_assets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Asset).offset(skip).limit(limit).all()

@app.put("/assets/{asset_id}", response_model=schemas.Asset)
def update_asset(asset_id: int, asset: schemas.AssetCreate, db: Session = Depends(get_db)):
    db_asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    for key, value in asset.dict().items():
        setattr(db_asset, key, value)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@app.delete("/assets/{asset_id}")
def delete_asset(asset_id: int, db: Session = Depends(get_db)):
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    db.delete(asset)
    db.commit()
    return {"ok": True}

# --- Savings Records & Accounts ---

@app.post("/savings/", response_model=schemas.Saving)
def create_saving(saving: schemas.SavingCreate, db: Session = Depends(get_db)):
    db_saving = models.Saving(**saving.dict())
    db.add(db_saving)
    db.commit()
    db.refresh(db_saving)
    return db_saving

@app.get("/savings/", response_model=List[schemas.Saving])
def read_savings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Saving).order_by(models.Saving.date.desc()).offset(skip).limit(limit).all()

@app.put("/savings/{saving_id}", response_model=schemas.Saving)
def update_saving(saving_id: int, saving: schemas.SavingCreate, db: Session = Depends(get_db)):
    db_saving = db.query(models.Saving).filter(models.Saving.id == saving_id).first()
    if db_saving is None:
        raise HTTPException(status_code=404, detail="Saving record not found")
    for key, value in saving.dict().items():
        setattr(db_saving, key, value)
    db.commit()
    db.refresh(db_saving)
    return db_saving

@app.delete("/savings/{saving_id}")
def delete_saving(saving_id: int, db: Session = Depends(get_db)):
    saving = db.query(models.Saving).filter(models.Saving.id == saving_id).first()
    if saving is None:
        raise HTTPException(status_code=404, detail="Saving record not found")
    db.delete(saving)
    db.commit()
    return {"ok": True}

@app.post("/savings-accounts/", response_model=schemas.SavingsAccount)
def create_savings_account(account: schemas.SavingsAccountCreate, db: Session = Depends(get_db)):
    existing = db.query(models.SavingsAccount).filter(models.SavingsAccount.name == account.name).first()
    if existing:
         raise HTTPException(status_code=400, detail="Savings account with this name already exists")
    db_account = models.SavingsAccount(**account.dict())
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

@app.get("/savings-accounts/", response_model=List[schemas.SavingsAccount])
def read_savings_accounts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.SavingsAccount).offset(skip).limit(limit).all()

@app.delete("/savings-accounts/{account_id}")
def delete_savings_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(models.SavingsAccount).filter(models.SavingsAccount.id == account_id).first()
    if account is None:
        raise HTTPException(status_code=404, detail="Savings account not found")
    db.delete(account)
    db.commit()
    return {"ok": True}

# --- Demo & Seed Management ---

@app.post("/demo/seed")
def seed_demo_data(db: Session = Depends(get_db)):
    today = date.today()
    sample_categories = [
        ("Groceries", ["Supermarket produce", "Weekly pantry staples", "Bakery and dairy", "Farmers market trip"], [45.20, 82.50, 115.00, 64.30], 4, "Credit Card"),
        ("Eat out", ["Coffee and pastry", "Lunch bistro", "Weekend pizza dinner", "Sushi takeaway"], [6.50, 14.80, 36.00, 48.50], 2, "Debit Card"),
        ("Fuel", ["Gas station refill", "Commuter fuel top-off"], [38.50, 46.20], 4, "Credit Card"),
        ("Living/Utilities", ["Apartment Rent", "Electric utility bill", "High-speed internet"], [1250.00, 78.40, 65.00], 5, "Bank Transfer"),
        ("Subscription", ["Cloud Backup Service", "Streaming Entertainment", "Music Streaming"], [9.99, 15.99, 10.99], 3, "Credit Card"),
        ("Fun", ["Board game purchase", "Museum exhibition tickets", "Cinema night"], [28.00, 32.00, 24.50], 2, "Credit Card"),
        ("Personal Care", ["Pharmacy essentials", "Haircut appointment"], [18.25, 35.00], 3, "Debit Card"),
        ("Income", ["Bi-weekly Paycheck", "Bi-weekly Paycheck", "Freelance Consulting"], [1850.00, 1850.00, 320.00], 5, "Bank Transfer")
    ]

    users = ["User 1", "User 2"]
    created_txs = 0

    # Generate transactions spread over the past 75 days
    for day_offset in range(75, -1, -2):
        tx_date = today - timedelta(days=day_offset)
        # Select 1 to 3 items on this day
        for _ in range(random.choice([1, 1, 2])):
            cat_tuple = random.choice(sample_categories)
            cat_name = cat_tuple[0]
            desc = random.choice(cat_tuple[1])
            base_amt = random.choice(cat_tuple[2])
            amt = round(base_amt * random.uniform(0.9, 1.15), 2)
            necessity = cat_tuple[3]
            method = cat_tuple[4]
            user = random.choice(users) if cat_name != "Living/Utilities" else "Shared"

            tx = models.Transaction(
                date=tx_date,
                description=desc,
                amount=amt,
                necessity=necessity,
                method=method,
                category=cat_name,
                user=user,
                notes="Sample seed record for demonstration"
            )
            db.add(tx)
            created_txs += 1

    # Seed Sample Goals if empty
    if db.query(models.Goal).count() == 0:
        demo_goals = [
            models.Goal(category="Groceries, Fuel, Personal Care", amount=650.0, period="month", user="Shared"),
            models.Goal(category="Eat out", amount=160.0, period="month", user="User 1"),
            models.Goal(category="Fun", amount=120.0, period="month", user="User 2"),
            models.Goal(category="Subscription", amount=50.0, period="month", user="Shared")
        ]
        for g in demo_goals:
            db.add(g)

    # Seed Sample Recurrings if empty
    if db.query(models.Recurring).count() == 0:
        demo_recurrings = [
            models.Recurring(name="Apartment Rent", amount=1250.0, category="Living/Utilities", period="month", day="1st", notes="Primary housing"),
            models.Recurring(name="High-speed Fiber Internet", amount=65.0, category="Living/Utilities", period="month", day="15th", notes="Home internet connection"),
            models.Recurring(name="Streaming Entertainment", amount=15.99, category="Subscription", period="month", day="10th", notes="Family plan")
        ]
        for r in demo_recurrings:
            db.add(r)

    # Seed Sample Assets if empty
    if db.query(models.Asset).count() == 0:
        demo_assets = [
            models.Asset(name="Workstation PC", purchase_date=today - timedelta(days=360), purchase_price=1600.0, estimated_value=1150.0, description="Desktop computer setup", updated_at=today, user="User 1"),
            models.Asset(name="Commuter Vehicle", purchase_date=today - timedelta(days=700), purchase_price=9500.0, estimated_value=7800.0, description="Reliable daily driver", updated_at=today, user="Shared")
        ]
        for a in demo_assets:
            db.add(a)

    db.commit()
    return {"message": "Demo data successfully seeded", "transactions_created": created_txs}

@app.post("/demo/reset")
def reset_demo_data(db: Session = Depends(get_db)):
    db.query(models.Transaction).delete()
    db.query(models.Goal).delete()
    db.query(models.Recurring).delete()
    db.query(models.Asset).delete()
    db.query(models.Saving).delete()
    db.commit()
    return {"message": "Database reset successfully"}
