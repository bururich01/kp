from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models
from ..dependencies import get_db, require_role

router = APIRouter()

@router.get("/", response_model=list[schemas.SupplierOut])
def list_suppliers(current_user = Depends(require_role(["trade_agent", "admin"])), db: Session = Depends(get_db)):
    suppliers = db.query(models.Deliverer).all()
    return suppliers

@router.post("/", response_model=schemas.SupplierOut)
def create_supplier(supplier: schemas.SupplierCreate, current_user = Depends(require_role(["trade_agent", "admin"])), db: Session = Depends(get_db)):
    db_supplier = models.Deliverer(deliverer_info=supplier.deliverer_info)
    db.add(db_supplier)
    db.commit()
    db.refresh(db_supplier)
    return db_supplier