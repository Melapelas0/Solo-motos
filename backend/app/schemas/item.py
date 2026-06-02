from pydantic import BaseModel
from typing import Optional

class ItemCreate(BaseModel):
    name: str
    category: str
    current_stock: int
    max_stock: int
    unit: str
    notes: Optional[str] = None


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    current_stock: Optional[int] = None
    max_stock: Optional[int] = None
    unit: Optional[str] = None
    notes: Optional[str] = None


class ItemResponse(ItemCreate):
    id: str

    class Config:
        from_attributes = True