import datetime
from pydantic import BaseModel
from typing import Optional

class TransactionBase(BaseModel):
    date: datetime.date
    description: str
    amount: float
    necessity: int
    method: str
    category: str
    user: str = "Elric"
    tag: Optional[str] = None
    notes: Optional[str] = None
    is_reimbursed: bool = False
    reimbursement_amount: float = 0.0

class TransactionCreate(TransactionBase):
    pass

class TransactionUpdate(BaseModel):
    date: Optional[datetime.date] = None
    description: Optional[str] = None
    amount: Optional[float] = None
    necessity: Optional[int] = None
    method: Optional[str] = None
    category: Optional[str] = None
    user: Optional[str] = None
    tag: Optional[str] = None
    notes: Optional[str] = None
    is_reimbursed: Optional[bool] = None
    reimbursement_amount: Optional[float] = None

class Transaction(TransactionBase):
    id: int

    class Config:
        orm_mode = True

class GoalBase(BaseModel):
    category: str
    amount: float
    period: str
    user: str = "Elric"

class GoalCreate(GoalBase):
    pass

class Goal(GoalBase):
    id: int

    class Config:
        orm_mode = True

class RecurringBase(BaseModel):
    name: str
    amount: float
    category: str
    period: str

class RecurringCreate(RecurringBase):
    pass

class Recurring(RecurringBase):
    id: int

    class Config:
        orm_mode = True

class AssetBase(BaseModel):
    name: str
    purchase_date: datetime.date
    purchase_price: float
    estimated_value: float
    description: Optional[str] = None
    updated_at: datetime.date

class AssetCreate(AssetBase):
    pass

class Asset(AssetBase):
    id: int

    class Config:
        orm_mode = True

class SavingBase(BaseModel):
    date: datetime.date
    amount: float
    notes: Optional[str] = None
    user: str = "Elric"
    account_name: str = "Cash"

class SavingCreate(SavingBase):
    pass

class Saving(SavingBase):
    id: int

    class Config:
        orm_mode = True

class SavingsAccountBase(BaseModel):
    name: str
    user: str = "Elric"

class SavingsAccountCreate(SavingsAccountBase):
    pass

class SavingsAccount(SavingsAccountBase):
    id: int

    class Config:
        orm_mode = True
