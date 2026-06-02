from sqlalchemy import Column, String, Integer
from ..database import Base
import uuid

class Item(Base):
    __tablename__ = "items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    category = Column(String, nullable=False)
    current_stock = Column(Integer, default=0)
    max_stock = Column(Integer, default=0)
    unit = Column(String, nullable=False)
    notes = Column(String, nullable=True)