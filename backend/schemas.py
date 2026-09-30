import datetime
from pydantic import BaseModel
from typing import Optional, List, Union

class TransactionBase(BaseModel):
    date: datetime.date
    description: str
    amount: float
    necessity: int = 3
    method: str = "Credit Card"
    category: str = "Miscellaneous"
    user: str = "User 1"
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
        from_attributes = True

class GoalBase(BaseModel):
    category: Union[str, List[str]]
    amount: float
    period: str = "month"
    user: str = "Shared"

class GoalCreate(GoalBase):
    pass

class Goal(GoalBase):
    id: int

    class Config:
        orm_mode = True
        from_attributes = True

class RecurringBase(BaseModel):
    name: str
    amount: float
    category: str
    period: str = "month"
    notes: Optional[str] = None
    day: Optional[str] = None

class RecurringCreate(RecurringBase):
    pass

class Recurring(RecurringBase):
    id: int

    class Config:
        orm_mode = True
        from_attributes = True

class AssetBase(BaseModel):
    name: str
    purchase_date: datetime.date
    purchase_price: float
    estimated_value: float
    description: Optional[str] = None
    updated_at: datetime.date
    user: Optional[str] = "User 1"

class AssetCreate(AssetBase):
    pass

class Asset(AssetBase):
    id: int

    class Config:
        orm_mode = True
        from_attributes = True

class SavingBase(BaseModel):
    date: datetime.date
    amount: float
    notes: Optional[str] = None
    user: str = "User 1"
    account_name: str = "Emergency Fund"

class SavingCreate(SavingBase):
    pass

class Saving(SavingBase):
    id: int

    class Config:
        orm_mode = True
        from_attributes = True

class SavingsAccountBase(BaseModel):
    name: str
    user: str = "User 1"

class SavingsAccountCreate(SavingsAccountBase):
    pass

class SavingsAccount(SavingsAccountBase):
    id: int

    class Config:
        orm_mode = True
        from_attributes = True
