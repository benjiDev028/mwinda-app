from pydantic import BaseModel, EmailStr
from datetime import datetime,date
from uuid import UUID
#Schemas pour Verfication Email
class NotificationRequest(BaseModel):
    email: str
    code: int
class Generatecode(BaseModel):
    email: str
 

#Schemas pour le User
class UserBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    date_birth: str

class UserFindByName(BaseModel):
    first_name: str
    last_name: str

class UserFindByEmail(BaseModel):
    email: str

class UserFindByBirth(BaseModel):
    date_birth: str

class UserUpdate(BaseModel) :
    first_name: str
    last_name: str
    email :EmailStr
    date_birth :str

class User(BaseModel):
    first_name: str
    last_name: str
    email: str
    date_birth: str

class UserResponseFind(UserBase):
    id: UUID
    first_name: str
    last_name: str
    email: EmailStr
    date_birth: str
    is_email_verified: bool 
    role: str
    pointevents: int 
    pointstudios: int 
    

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    date_birth: str
    password: str
class UserFindById(BaseModel):
    id: UUID

class UserResponse(UserBase):
    id: UUID
    first_name: str
    last_name: str
    email: str
    date_birth: str
    role : str
    is_email_verified: bool = False
    pointevents: int 
    pointstudios: int 



class User(UserBase):
    id: UUID
    is_email_verified: bool = False
    pointevents: int 
    pointstudios: int 

    class Config:
        from_attributes = True  # Utilisé pour remplacer 'orm_mode' dans Pydantic v2
