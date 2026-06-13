from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from ..database import get_db
from ..auth import get_current_admin
from ..models.appointment import Appointment
from ..schemas.appointment import AppointmentCreate, AppointmentUpdate, AppointmentResponse

router = APIRouter(prefix="/appointments", tags=["Appointments"])


def normalize_plate(plate: str) -> str:
    return "".join(ch for ch in plate.upper().strip() if ch.isalnum())


@router.get("/booked-slots", response_model=list[str])
def get_booked_slots(
    date: str = Query(..., description="Fecha en formato YYYY-MM-DD"),
    service_type: Optional[str] = Query(None, description="Tipo de servicio: mecanica o lavado"),
    db: Session = Depends(get_db),
):
    """
    Devuelve la lista de horas ya ocupadas (HH:MM) para una fecha y tipo de servicio dados.
    Excluye citas canceladas.
    """
    query = db.query(Appointment.time).filter(
        Appointment.date == date,
        Appointment.status != "cancelado",
    )
    if service_type:
        query = query.filter(Appointment.service_type == service_type)
    rows = query.all()
    return [row[0] for row in rows]


@router.get("", response_model=list[AppointmentResponse])
def get_appointments(
    db: Session = Depends(get_db), 
    admin: str = Depends(get_current_admin),
    skip: int = Query(0, ge=0, description="Número de registros a saltar"),
    limit: int = Query(50, ge=1, le=100, description="Máximo de registros a retornar (máximo 100)"),
):
    """Solo el admin puede ver la lista de citas. Soporta paginación."""
    return db.query(Appointment).offset(skip).limit(limit).all()


@router.post("", response_model=AppointmentResponse)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db)):
    """Esta ruta queda pública para que los clientes agenden"""
    appointment_data = appointment.model_dump()
    appointment_data["motorcycle_plate"] = normalize_plate(appointment_data["motorcycle_plate"])
    new_appointment = Appointment(**appointment_data)

    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)

    return new_appointment


@router.put("/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(
    appointment_id: str, 
    appointment_update: AppointmentUpdate, 
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    update_data = appointment_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(appointment, key, value)

    db.commit()
    db.refresh(appointment)

    return appointment


@router.delete("/{appointment_id}")
def delete_appointment(
    appointment_id: str, 
    db: Session = Depends(get_db),
    admin: str = Depends(get_current_admin)
):
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Cita no encontrada")

    db.delete(appointment)
    db.commit()

    return {"message": "Cita eliminada"}

@router.get("/status/{plate}", response_model=AppointmentResponse)
def get_status_by_plate(plate: str, db: Session = Depends(get_db)):
    """Obtiene la última cita de una moto por placa."""
    normalized_plate = normalize_plate(plate)
    appointment = None

    for candidate in db.query(Appointment).order_by(Appointment.created_at.desc()).all():
        if normalize_plate(candidate.motorcycle_plate) == normalized_plate:
            appointment = candidate
            break

    if not appointment:
        raise HTTPException(status_code=404, detail="Cita no encontrada")
    return appointment
