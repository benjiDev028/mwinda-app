from sqlalchemy.orm import Session
from app.db.models import LoyaltyHistory
from app.db.schemas import LoyaltyHistoryCreate
from sqlalchemy import desc
import uuid

def create_loyalty_history(db: Session, loyalty_data: LoyaltyHistoryCreate):
    new_loyalty = LoyaltyHistory(
        id=uuid.uuid4(),
        user_id=loyalty_data.user_id,
        points=loyalty_data.points,
        service=loyalty_data.service,
        reference=loyalty_data.reference,
        amount=loyalty_data.amount,
        id_admin=loyalty_data.id_admin
    )
    db.add(new_loyalty)
    db.commit()
    db.refresh(new_loyalty)
    return new_loyalty

def get_loyalty_history(db: Session, loyalty_id: uuid.UUID):
    return db.query(LoyaltyHistory).filter_by(id=loyalty_id).first()

def get_all_loyalty_history(db: Session):
    return db.query(LoyaltyHistory).order_by(desc(LoyaltyHistory.date_points)).all()

def get_user_loyalty_history(db: Session, user_id: uuid.UUID):
    return db.query(LoyaltyHistory).filter_by(user_id=user_id).order_by(desc(LoyaltyHistory.date_points)).all()

def get_admin_loyalty_history(db: Session, id_admin: uuid.UUID):
    return db.query(LoyaltyHistory).filter_by(id_admin=id_admin).order_by(desc(LoyaltyHistory.date_points)).all()

def update_loyalty_history(db: Session, loyalty_id: uuid.UUID, loyalty_data: LoyaltyHistoryCreate):
    history = db.query(LoyaltyHistory).filter_by(id=loyalty_id).first()
    if not history:
        return None
    
    for key, value in loyalty_data.dict().items():
        setattr(history, key, value)
    
    db.commit()
    db.refresh(history)
    return history

def delete_loyalty_history(db: Session, loyalty_id: uuid.UUID):
    history = db.query(LoyaltyHistory).filter_by(id=loyalty_id).first()
    if history:
        db.delete(history)
        db.commit()
        return True
    return False