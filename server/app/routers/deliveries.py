from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models
from ..dependencies import get_db, require_role

router = APIRouter()

@router.post("/")
def create_delivery(delivery: schemas.DeliveryCreate, current_user = Depends(require_role(["trade_agent"])), db: Session = Depends(get_db)):
    db_delivery = models.Delivery(delivery_date=delivery.delivery_date, deliverer_id=delivery.deliverer_id)
    db.add(db_delivery)
    db.commit()
    db.refresh(db_delivery)
    for prod in delivery.products:
        delivered = models.DeliveredProduct(
            delivery_id=db_delivery.delivery_id,
            product_id=prod.product_id,
            delivered_quantity=prod.quantity,
            delivered_price=prod.price
        )
        db.add(delivered)
        cafe_address = "г. Липецк, ул. Ленина, 10"
        located = db.query(models.Located).filter(models.Located.cafe_address == cafe_address,
                                                  models.Located.product_id == prod.product_id).first()
        if located:
            located.located_count += prod.quantity
        else:
            located = models.Located(cafe_address=cafe_address, product_id=prod.product_id, located_count=prod.quantity)
            db.add(located)
    db.commit()
    return {"msg": "Delivery created"}