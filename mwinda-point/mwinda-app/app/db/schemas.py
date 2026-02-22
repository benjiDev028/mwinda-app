from datetime import datetime
from pydantic import BaseModel, EmailStr
from uuid import UUID


class RedeemPointsRequest(BaseModel):
    user_id: UUID
    admin_id: UUID
    reference : str

class LoyaltyHistoryBase(BaseModel):
    user_id: UUID
    points: int
    service: str
    reference: str
    amount: float
    id_admin: UUID

class RedeemPointsResponse(BaseModel):
    message: str
    user_id: UUID
    reference : str
    points_used: int

class PointsThresholdNotification(BaseModel):
    user_id: UUID
    current_points: int
    threshold: int
    message: str

class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    date_birth: str

class UserResponse(UserBase):
    id: UUID
    pointstudios: int
    pointevents : int

    class Config:
        orm_mode = True

class LoyaltyHistoryCreate(BaseModel):
    code_barre: int
    montant : float
    service : str
    reference : str
    id_admin: UUID


class LoyaltyAllHistoryResponse(LoyaltyHistoryBase): 
    pass

    class Config:
        orm_mode = True

class LoyaltyHistoryResponse(LoyaltyHistoryBase):
    id: UUID
    date_points: datetime



