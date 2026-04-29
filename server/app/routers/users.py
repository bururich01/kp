from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import schemas, models
from ..dependencies import get_db, require_role

router = APIRouter()

@router.get("/", response_model=list[schemas.UserOut])
def list_users(current_user = Depends(require_role(["admin"])), db: Session = Depends(get_db)):
    users = db.query(models.User).all()
    return users

@router.put("/{user_id}/role")
def update_role(user_id: int, role_data: dict, current_user = Depends(require_role(["admin"])), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    new_role = role_data.get("role")
    if new_role not in ["admin", "cashier", "barista", "trade_agent"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    user.role = new_role
    db.commit()
    return {"msg": "Role updated"}