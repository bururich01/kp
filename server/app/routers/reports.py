from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from .. import schemas, models
from ..dependencies import get_db, require_role

router = APIRouter()

@router.get("/sales", response_model=list[schemas.SalesReportItem])
def sales_report(start_date: datetime = None, end_date: datetime = None,
                 current_user = Depends(require_role(["admin", "trade_agent"])),
                 db: Session = Depends(get_db)):
    if not start_date:
        start_date = datetime.now() - timedelta(days=30)
    if not end_date:
        end_date = datetime.now()
    query = db.query(models.Cheque).join(models.Order).filter(models.Order.order_date.between(start_date, end_date))
    items = {}
    for ch in query.all():
        dish = db.query(models.Dish).filter(models.Dish.dish_id == ch.dish_id).first()
        if dish.dish_name not in items:
            items[dish.dish_name] = {"units": 0, "revenue": 0, "count": 0}
        items[dish.dish_name]["units"] += ch.cheque_quantity
        items[dish.dish_name]["revenue"] += float(ch.cheque_price)
        items[dish.dish_name]["count"] += 1
    result = []
    for name, data in items.items():
        avg_check = data["revenue"] / data["count"] if data["count"] else 0
        result.append(schemas.SalesReportItem(
            dish_name=name,
            units_sold=data["units"],
            total_revenue=data["revenue"],
            avg_check=avg_check
        ))
    return result