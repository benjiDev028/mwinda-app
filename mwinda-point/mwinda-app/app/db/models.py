from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, func , Boolean , Float
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from app.db.database import Base
from sqlalchemy import Sequence
import uuid

from sqlalchemy import event

from sqlalchemy import create_engine, Column, String, Integer, DateTime, Float, ForeignKey, Boolean, Sequence

from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from dotenv import load_dotenv
import os

load_dotenv()



from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Créez un moteur pour se connecter à votre base de données
engine = create_engine(os.getenv("DATABASE_URL"))  # Remplacez par l'URL de votre base de données

# Créez une fabrique de sessions liée à ce moteur
Session = sessionmaker(bind=engine)



# class User(Base):
#     __tablename__ = "users"
#     id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
#     first_name = Column(String, nullable=False)
#     last_name = Column(String, nullable=False)
#     email = Column(String, unique=True, nullable=False)
#     password_hash = Column(String, nullable=False)
#     password_salt = Column(String, nullable=False)
#     date_birth = Column(String, nullable=True)
#     is_email_verified = Column(Boolean, default=False)
#     role = Column(String, default="client")
#     pointstudios = Column(Integer, default=0)
#     pointevents = Column(Integer, default=0)
#     barcode_seq = Sequence('barcode_seq', start=120000001)  # Sequence for auto-increment
#     barcode = Column(Integer, nullable=True, server_default=barcode_seq.next_value())
#     created_at = Column(DateTime, default=datetime.utcnow)
#     updated_at = Column(DateTime, default=datetime.utcnow)


class LoyaltyHistory(Base):
    __tablename__ = "loyalty_history"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    points = Column(Integer, nullable=False)
    service = Column(String, nullable=False)
    reference = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date_points = Column(DateTime, default=func.now())
    id_admin = Column(UUID(as_uuid=True), nullable=False)
    # user = relationship("User", back_populates="history")

# User.history = relationship("LoyaltyHistory", back_populates="user")

# # Écouteur d'événements pour vérifier le rôle de l'admin
# @event.listens_for(LoyaltyHistory, 'before_insert')
# def validate_admin_role(mapper, connect, target):
#     session = Session.object_session(target)
#     admin_user = session.query(User).filter_by(id=target.id_admin, role='admin').first()
#     if not admin_user:
#         raise ValueError("L'utilisateur avec id_admin doit avoir le rôle 'admin'.")

# @event.listens_for(LoyaltyHistory, 'before_update')
# def validate_admin_role(mapper, connect, target):
#     session = Session.object_session(target)
#     admin_user = session.query(User).filter_by(id=target.id_admin, role='admin').first()
#     if not admin_user:
#         raise ValueError("L'utilisateur avec id_admin doit avoir le rôle 'admin'.")
