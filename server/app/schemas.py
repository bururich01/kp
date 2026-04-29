from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

class UserLogin(BaseModel):
    username: str
    password: str

class UserOut(BaseModel):
    user_id: int
    username: str
    role: str

class UserRegister(BaseModel):
    username: str
    password: str
    role: str = "cashier" 

class DishBase(BaseModel):
    dish_name: str
    dish_price: float
    dish_weight: int

class DishCreate(DishBase):
    pass

class DishOut(DishBase):
    dish_id: int

class OrderCreate(BaseModel):
    cafe_address: str

class OrderItemCreate(BaseModel):
    dish_id: int
    quantity: int

class OrderItemOut(BaseModel):
    dish_id: int
    dish_name: str
    quantity: int
    price: float

class OrderOut(BaseModel):
    order_id: int
    order_date: datetime
    cafe_address: str
    status: str
    items: List[OrderItemOut] = []

class ProductBase(BaseModel):
    product_name: str
    product_price: float

class ProductCreate(ProductBase):
    pass

class ProductOut(ProductBase):
    product_id: int

class InventoryItem(BaseModel):
    product_id: int
    product_name: str
    stock: float
    avg_usage: float
    days_until_reorder: int

class SupplierBase(BaseModel):
    deliverer_info: str

class SupplierCreate(SupplierBase):
    pass

class SupplierOut(SupplierBase):
    deliverer_id: int

class DeliveryProductCreate(BaseModel):
    product_id: int
    quantity: int
    price: float

class DeliveryCreate(BaseModel):
    deliverer_id: int
    delivery_date: datetime
    products: List[DeliveryProductCreate]

class SalesReportItem(BaseModel):
    dish_name: str
    units_sold: int
    total_revenue: float
    avg_check: float