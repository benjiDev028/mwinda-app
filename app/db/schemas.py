from pydantic import BaseModel
from datetime import datetime
import uuid

class LoyaltyHistoryBase(BaseModel):
    user_id: uuid.UUID
    points: int
    service: str
    reference: str
    amount: float
    id_admin: uuid.UUID

class LoyaltyHistoryCreate(LoyaltyHistoryBase):
    pass

class LoyaltyHistoryResponse(LoyaltyHistoryBase):
    id: uuid.UUID
    date_points: datetime

class LoyaltyAllHistoryResponse(LoyaltyHistoryBase): 
    pass

    class Config:
        orm_mode = True
