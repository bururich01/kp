from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from .. import schemas, models
from ..dependencies import get_db, require_role

router = APIRouter()

@router.post("/", response_model=schemas.OrderOut)
def create_order(order: schemas.OrderCreate, current_user = Depends(require_role(["cashier"])), db: Session = Depends(get_db)):
    db_order = models.Order(order_date=datetime.now(), cafe_address=order.cafe_address, status="new")
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    return schemas.OrderOut(
        order_id=db_order.order_id,
        order_date=db_order.order_date,
        cafe_address=db_order.cafe_address,
        status=db_order.status,
        items=[]
    )

@router.post("/{order_id}/items")
def add_order_item(
    order_id: int,
    item: schemas.OrderItemCreate,
    current_user = Depends(require_role(["cashier"])),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    dish = db.query(models.Dish).filter(models.Dish.dish_id == item.dish_id).first()
    if not dish:
        raise HTTPException(status_code=404, detail="Dish not found")
    total_price = dish.dish_price * item.quantity
    cheque = models.Cheque(
        dish_id=item.dish_id,
        order_id=order_id,
        cheque_quantity=item.quantity,
        cheque_price=total_price
    )
    db.add(cheque)
    db.commit()
    return {"msg": "Item added"}


@router.put("/{order_id}/status")
def update_order_status(
    order_id: int,
    status_data: dict,
    current_user = Depends(require_role(["barista", "cashier", "admin"])),
    db: Session = Depends(get_db)
):
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    new_status = status_data.get("status")
    if new_status not in ["new", "paid", "ready"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    order.status = new_status
    db.commit()
    return {"msg": f"Order status updated to {new_status}"}   

@router.post("/{order_id}/payment")
def pay_order(order_id: int, payment_data: dict, current_user = Depends(require_role(["cashier"])), db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.order_id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != "new":
        raise HTTPException(status_code=400, detail="Order already paid or ready")
    order.status = "paid"
    db.commit()
    return {"msg": "Payment successful"}

@router.get("/", response_model=list[schemas.OrderOut])
def list_orders(status: str = None, current_user = Depends(require_role(["cashier", "barista"])), db: Session = Depends(get_db)):
    query = db.query(models.Order)
    if status:
        query = query.filter(models.Order.status == status)
    orders = query.all()
    result = []
    for order in orders:
        items = db.query(models.Cheque).filter(models.Cheque.order_id == order.order_id).all()
        item_list = []
        for i in items:
            dish = db.query(models.Dish).filter(models.Dish.dish_id == i.dish_id).first()
            item_list.append(schemas.OrderItemOut(
                dish_id=i.dish_id,
                dish_name=dish.dish_name,
                quantity=i.cheque_quantity,
                price=i.cheque_price
            ))
        result.append(schemas.OrderOut(
            order_id=order.order_id,
            order_date=order.order_date,
            cafe_address=order.cafe_address,
            status=order.status,
            items=item_list
        ))
    return result
