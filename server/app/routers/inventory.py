from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from .. import schemas, models
from ..dependencies import get_db, require_role

router = APIRouter()

@router.get("/", response_model=list[schemas.InventoryItem])
def get_inventory(current_user = Depends(require_role(["trade_agent", "admin"])), db: Session = Depends(get_db)):
    locations = db.query(models.Located).all()
    inventory = []
    for loc in locations:
        product = db.query(models.Product).filter(models.Product.product_id == loc.product_id).first()
        inventory.append(schemas.InventoryItem(
            product_id=product.product_id,
            product_name=product.product_name,
            stock=float(loc.located_count),
            avg_usage=0.0,
            days_until_reorder=999
        ))
    return inventory