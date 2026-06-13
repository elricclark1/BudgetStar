from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
import models, schemas
from database import SessionLocal, engine
from fastapi.middleware.cors import CORSMiddleware
from datetime import date

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="BudgetStar API", description="Backend for the new BudgetStar web app")

@app.on_event("startup")
def startup_populate_accounts():
    db = SessionLocal()
    try:
        if db.query(models.SavingsAccount).count() == 0:
            defaults = ["Cash", "Capital One performance", "Rogue savings", "Rogue ownership"]
            for name in defaults:
                db_acc = models.SavingsAccount(name=name, user="Elric")
                db.add(db_acc)
            db.commit()
            print("Successfully prepopulated default savings accounts")
    except Exception as e:
        print("Prepopulate error:", e)
    finally:
        db.close()

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/transactions/", response_model=schemas.Transaction)
def create_transaction(transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    db_transaction = models.Transaction(**transaction.dict())
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction

@app.get("/transactions/", response_model=List[schemas.Transaction])
def read_transactions(skip: int = 0, limit: int = 5000, db: Session = Depends(get_db)):
    transactions = db.query(models.Transaction).order_by(models.Transaction.date.desc()).offset(skip).limit(limit).all()
    return transactions

@app.get("/transactions/summary")
def get_summary(start_date: date = Query(None), end_date: date = Query(None), db: Session = Depends(get_db)):
    # Simple aggregation for dashboard
    query = db.query(models.Transaction)
    if start_date:
        query = query.filter(models.Transaction.date >= start_date)
    if end_date:
        query = query.filter(models.Transaction.date <= end_date)
    
    transactions = query.all()
    total_spent = sum(t.amount for t in transactions)
    # Could add more complex aggregation here or do it in frontend
    return {"total_spent": total_spent, "count": len(transactions)}

@app.delete("/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    transaction = db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()
    if transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    db.delete(transaction)
    db.commit()
    return {"ok": True}

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

@app.post("/goals/", response_model=schemas.Goal)
def create_goal(goal: schemas.GoalCreate, db: Session = Depends(get_db)):
    db_goal = models.Goal(**goal.dict())
    db.add(db_goal)
    db.commit()
    db.refresh(db_goal)
    return db_goal

@app.get("/goals/", response_model=List[schemas.Goal])
def read_goals(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    goals = db.query(models.Goal).offset(skip).limit(limit).all()
    return goals

@app.delete("/goals/{goal_id}")
def delete_goal(goal_id: int, db: Session = Depends(get_db)):
    goal = db.query(models.Goal).filter(models.Goal.id == goal_id).first()
    if goal is None:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    db.delete(goal)
    db.commit()
    return {"ok": True}

@app.post("/recurrings/", response_model=schemas.Recurring)
def create_recurring(recurring: schemas.RecurringCreate, db: Session = Depends(get_db)):
    db_recurring = models.Recurring(**recurring.dict())
    db.add(db_recurring)
    db.commit()
    db.refresh(db_recurring)
    return db_recurring

@app.get("/recurrings/", response_model=List[schemas.Recurring])
def read_recurrings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    recurrings = db.query(models.Recurring).offset(skip).limit(limit).all()
    return recurrings

@app.delete("/recurrings/{recurring_id}")
def delete_recurring(recurring_id: int, db: Session = Depends(get_db)):
    recurring = db.query(models.Recurring).filter(models.Recurring.id == recurring_id).first()
    if recurring is None:
        raise HTTPException(status_code=404, detail="Recurring not found")
    
    db.delete(recurring)
    db.commit()
    return {"ok": True}

@app.post("/assets/", response_model=schemas.Asset)
def create_asset(asset: schemas.AssetCreate, db: Session = Depends(get_db)):
    db_asset = models.Asset(**asset.dict())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@app.get("/assets/", response_model=List[schemas.Asset])
def read_assets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    assets = db.query(models.Asset).offset(skip).limit(limit).all()
    return assets

@app.put("/assets/{asset_id}", response_model=schemas.Asset)
def update_asset(asset_id: int, asset: schemas.AssetCreate, db: Session = Depends(get_db)):
    db_asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if db_asset is None:
        raise HTTPException(status_code=404, detail="Asset not found")
    
    for var, value in vars(asset).items():
        setattr(db_asset, var, value) if value else None

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

@app.post("/savings/", response_model=schemas.Saving)
def create_saving(saving: schemas.SavingCreate, db: Session = Depends(get_db)):
    db_saving = models.Saving(**saving.dict())
    db.add(db_saving)
    db.commit()
    db.refresh(db_saving)
    return db_saving

@app.get("/savings/", response_model=List[schemas.Saving])
def read_savings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    savings = db.query(models.Saving).order_by(models.Saving.date.desc()).offset(skip).limit(limit).all()
    return savings

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
    accounts = db.query(models.SavingsAccount).offset(skip).limit(limit).all()
    return accounts

@app.delete("/savings-accounts/{account_id}")
def delete_savings_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(models.SavingsAccount).filter(models.SavingsAccount.id == account_id).first()
    if account is None:
        raise HTTPException(status_code=404, detail="Savings account not found")
    
    db.delete(account)
    db.commit()
    return {"ok": True}

