from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..auth import get_current_admin
from ..models.item import Item
from ..schemas.item import ItemCreate, ItemResponse, ItemUpdate

router = APIRouter(prefix="/items", tags=["Items"])


@router.get("", response_model=list[ItemResponse]) # Protegida
def get_items(db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Solo el admin puede ver la lista completa de items"""
    return db.query(Item).all()


@router.post("", response_model=ItemResponse) # Protegida
def create_item(item: ItemCreate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Solo el admin puede crear items"""
    new_item = Item(**item.model_dump())

    db.add(new_item)
    db.commit()
    db.refresh(new_item)

    return new_item


@router.put("/{item_id}", response_model=ItemResponse) # Protegida
def update_item(item_id: str, item_data: ItemUpdate, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Solo el admin puede actualizar items"""
    item = db.query(Item).filter(Item.id == item_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")

    update_fields = item_data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)

    return item


@router.delete("/{item_id}") # Protegida
def delete_item(item_id: str, db: Session = Depends(get_db), admin: str = Depends(get_current_admin)):
    """Solo el admin puede eliminar items"""
    item = db.query(Item).filter(Item.id == item_id).first()

    if not item:
        raise HTTPException(status_code=404, detail="Item no encontrado")

    db.delete(item)
    db.commit()

    return {"message": "Item eliminado"}