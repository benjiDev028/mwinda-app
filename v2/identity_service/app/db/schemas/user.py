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

    class Config:
        from_attributes = True 

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

    class Config:
        from_attributes = True 

class User(BaseModel):
    first_name: str
    last_name: str
    email: str
    date_birth: str

    class Config:
        from_attributes = True 

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

    class Config:
        from_attributes = True 
    

class UserCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    date_birth: str
    password: str

    class Config:
        from_attributes = True 
class UserFindById(BaseModel):
    id: UUID

    class Config:
        from_attributes = True 

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
    barcode: str = None
    
    class Config:
        from_attributes = True
        
        orm_mode = True  # Utilisé pour remplacer 'orm_mode' dans Pydantic v2



class User(UserBase):
    id: UUID
    is_email_verified: bool = False
    pointevents: int 
    pointstudios: int 

    class Config:
        from_attributes = True  # Utilisé pour remplacer 'orm_mode' dans Pydantic v2
