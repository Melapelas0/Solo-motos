from sqlalchemy import Column, String
from ..database import Base
import uuid
from datetime import datetime

class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    client_name = Column(String, nullable=False)
    client_phone = Column(String, nullable=False)
    motorcycle_plate = Column(String, nullable=False)
    motorcycle_model = Column(String, nullable=False)
    service_type = Column(String, nullable=False)  # "mecanica" o "lavado"
    description = Column(String, nullable=False)
    date = Column(String, nullable=False)  # YYYY-MM-DD
    time = Column(String, nullable=False)  # HH:MM
    status = Column(String, nullable=False, default="pendiente")  # "pendiente", "en_progreso", "completado", "cancelado"
    created_at = Column(String, default=lambda: datetime.utcnow().isoformat())
