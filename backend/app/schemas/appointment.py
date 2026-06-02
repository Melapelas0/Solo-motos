from pydantic import BaseModel
from typing import Optional

class AppointmentCreate(BaseModel):
    client_name: str
    client_phone: str
    motorcycle_plate: str
    motorcycle_model: str
    service_type: str  # "mecanica" o "lavado"
    description: str
    date: str  # YYYY-MM-DD
    time: str  # HH:MM


class AppointmentUpdate(BaseModel):
    client_name: Optional[str] = None
    client_phone: Optional[str] = None
    motorcycle_plate: Optional[str] = None
    motorcycle_model: Optional[str] = None
    service_type: Optional[str] = None
    description: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    status: Optional[str] = None


class AppointmentResponse(AppointmentCreate):
    id: str
    status: str
    created_at: str

    class Config:
        from_attributes = True
