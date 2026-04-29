from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from .. import schemas, auth, models
from ..dependencies import get_db

router = APIRouter()

@router.post("/login", response_model=schemas.UserOut)
def login(request: Request, login_data: schemas.UserLogin, db: Session = Depends(get_db)):
    user = auth.authenticate_user(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    request.session["user_id"] = user.user_id
    return user

@router.post("/logout")
def logout(request: Request):
    request.session.clear()
    return {"msg": "Logged out"}

@router.get("/me", response_model=schemas.UserOut)
def me(request: Request, db: Session = Depends(get_db)):
    user_id = request.session.get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Not authenticated")
    user = db.query(models.User).filter(models.User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/register", response_model=schemas.UserOut)
def register(user_data: schemas.UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(models.User).filter(models.User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    if user_data.role not in ["cashier", "barista", "trade_agent"]:
        raise HTTPException(status_code=400, detail="Invalid role")
    
    hashed_password = auth.get_password_hash(user_data.password)
    
    new_user = models.User(
        username=user_data.username,
        password_hash=hashed_password,
        role=user_data.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user