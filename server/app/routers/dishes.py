from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models
from ..dependencies import get_db, require_role

router = APIRouter()

@router.get("/", response_model=list[schemas.DishOut])
def list_dishes(db: Session = Depends(get_db)):
    dishes = db.query(models.Dish).all()
    return dishes

@router.post("/", response_model=schemas.DishOut)
def create_dish(dish: schemas.DishCreate, current_user = Depends(require_role(["admin"])), db: Session = Depends(get_db)):
    db_dish = models.Dish(**dish.dict())
    db.add(db_dish)
    db.commit()
    db.refresh(db_dish)
    return db_dish

@router.delete("/{dish_id}")
def delete_dish(dish_id: int, current_user = Depends(require_role(["admin"])), db: Session = Depends(get_db)):
    dish = db.query(models.Dish).filter(models.Dish.dish_id == dish_id).first()
    if not dish:
        raise HTTPException(status_code=404, detail="Dish not found")
    db.delete(dish)
    db.commit()
    return {"msg": "Deleted"}