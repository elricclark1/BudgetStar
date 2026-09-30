from sqlalchemy import Column, Integer, String, Float, Date, CheckConstraint, Boolean
from database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    necessity = Column(Integer, CheckConstraint('necessity >= 1 AND necessity <= 5'), nullable=False, default=3)
    method = Column(String, nullable=False, default="Credit Card")
    category = Column(String, nullable=False, default="Miscellaneous")
    user = Column(String, nullable=False, default="User 1")
    tag = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    is_reimbursed = Column(Boolean, nullable=False, default=False)
    reimbursement_amount = Column(Float, nullable=False, default=0.0)

class Saving(Base):
    __tablename__ = "savings"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    amount = Column(Float, nullable=False)
    notes = Column(String, nullable=True)
    user = Column(String, nullable=False, default="User 1")
    account_name = Column(String, nullable=False, default="Emergency Fund")

class SavingsAccount(Base):
    __tablename__ = "savings_accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    user = Column(String, nullable=False, default="User 1")

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    period = Column(String, nullable=False, default="month") # 'week' or 'month'
    user = Column(String, nullable=False, default="Shared")

class Recurring(Base):
    __tablename__ = "recurrings"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    period = Column(String, nullable=False, default="month") # 'month', 'year', 'week'
    notes = Column(String, nullable=True)
    day = Column(String, nullable=True)

class Asset(Base):
    __tablename__ = "assets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    purchase_date = Column(Date, nullable=False)
    purchase_price = Column(Float, nullable=False)
    estimated_value = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    updated_at = Column(Date, nullable=False)
    user = Column(String, nullable=True, default="User 1")
