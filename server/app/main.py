from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
import os
from dotenv import load_dotenv

from .routers import auth, users, dishes, products, orders, inventory, suppliers, deliveries, reports
from . import models, database

load_dotenv()

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Coffee Chain API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv("SECRET_KEY", "change-this-in-production"),
    same_site="lax",
    https_only=False,
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(dishes.router, prefix="/api/v1/dishes", tags=["dishes"])
app.include_router(products.router, prefix="/api/v1/products", tags=["products"])
app.include_router(orders.router, prefix="/api/v1/orders", tags=["orders"])
app.include_router(inventory.router, prefix="/api/v1/inventory", tags=["inventory"])
app.include_router(suppliers.router, prefix="/api/v1/suppliers", tags=["suppliers"])
app.include_router(deliveries.router, prefix="/api/v1/deliveries", tags=["deliveries"])
app.include_router(reports.router, prefix="/api/v1/reports", tags=["reports"])