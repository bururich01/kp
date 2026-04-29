from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, DECIMAL, SMALLINT
from .database import Base

class Cafe(Base):
    __tablename__ = "cafe"
    cafe_address = Column(String(100), primary_key=True)

class Cook(Base):
    __tablename__ = "cook"
    cook_id = Column(Integer, primary_key=True, index=True)
    cook_name = Column(String(150), nullable=False)
    cook_post = Column(String(75), nullable=False)
    cafe_address = Column(String(100), ForeignKey("cafe.cafe_address"))

class Dish(Base):
    __tablename__ = "dish"
    dish_id = Column(Integer, primary_key=True, index=True)
    dish_name = Column(String(100), nullable=False)
    dish_price = Column(DECIMAL(8,2), nullable=False)
    dish_weight = Column(SMALLINT, nullable=False)

class Product(Base):
    __tablename__ = "product"
    product_id = Column(Integer, primary_key=True, index=True)
    product_name = Column(String(75), nullable=False)
    product_price = Column(DECIMAL(8,2), nullable=False)

class Consists(Base):
    __tablename__ = "consists"
    dish_id = Column(Integer, ForeignKey("dish.dish_id"), primary_key=True)
    product_id = Column(Integer, ForeignKey("product.product_id"), primary_key=True)

class Order(Base):
    __tablename__ = "orders"
    order_id = Column(Integer, primary_key=True, index=True)
    order_date = Column(DateTime, nullable=False)
    cafe_address = Column(String(100), ForeignKey("cafe.cafe_address"))
    status = Column(String(20), default="new")

class Cheque(Base):
    __tablename__ = "cheque"
    dish_id = Column(Integer, ForeignKey("dish.dish_id"), primary_key=True)
    order_id = Column(Integer, ForeignKey("orders.order_id"), primary_key=True)
    cheque_quantity = Column(Integer, nullable=False)
    cheque_price = Column(DECIMAL(8,2), nullable=False)

class Deliverer(Base):
    __tablename__ = "deliverer"
    deliverer_id = Column(Integer, primary_key=True, index=True)
    deliverer_info = Column(String(100), nullable=False)

class Delivery(Base):
    __tablename__ = "delivery"
    delivery_id = Column(Integer, primary_key=True, index=True)
    delivery_date = Column(DateTime, nullable=False)
    deliverer_id = Column(Integer, ForeignKey("deliverer.deliverer_id"))

class DeliveredProduct(Base):
    __tablename__ = "delivered_product"
    delivered_id = Column(Integer, primary_key=True, index=True)
    delivery_id = Column(Integer, ForeignKey("delivery.delivery_id"))
    product_id = Column(Integer, ForeignKey("product.product_id"))
    delivered_quantity = Column(Integer, nullable=False)
    delivered_price = Column(DECIMAL(8,2), nullable=False)

class Located(Base):
    __tablename__ = "located"
    cafe_address = Column(String(100), ForeignKey("cafe.cafe_address"), primary_key=True)
    product_id = Column(Integer, ForeignKey("product.product_id"), primary_key=True)
    located_count = Column(Integer, nullable=False)

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False)
    cook_id = Column(Integer, ForeignKey("cook.cook_id"), nullable=True)