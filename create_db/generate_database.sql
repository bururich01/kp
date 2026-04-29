-- ============================================
-- 1. Заведение (кафе)
-- ============================================
CREATE TABLE cafe (
    cafe_address VARCHAR(100) PRIMARY KEY
);

-- ============================================
-- 2. Бариста
-- ============================================
CREATE TABLE cook (
    cook_id SERIAL PRIMARY KEY,
    cook_name VARCHAR(150) NOT NULL,
    cook_post VARCHAR(75) NOT NULL,
    cafe_address VARCHAR(100) NOT NULL,
    CONSTRAINT fk_cook_cafe FOREIGN KEY (cafe_address) REFERENCES cafe(cafe_address)
);

-- ============================================
-- 3. Блюда
-- ============================================
CREATE TABLE dish (
    dish_id SERIAL PRIMARY KEY,
    dish_name VARCHAR(100) NOT NULL,
    dish_price DECIMAL(8,2) NOT NULL,
    dish_weight SMALLINT NOT NULL
);

-- ============================================
-- 4. Продукты
-- ============================================
CREATE TABLE product (
    product_id SERIAL PRIMARY KEY,
    product_name VARCHAR(75) NOT NULL,
    product_price DECIMAL(8,2) NOT NULL
);

-- ============================================
-- 5. Состав блюда
-- ============================================
CREATE TABLE consists (
    dish_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    PRIMARY KEY (dish_id, product_id),
    CONSTRAINT fk_consists_dish FOREIGN KEY (dish_id) REFERENCES dish(dish_id),
    CONSTRAINT fk_consists_product FOREIGN KEY (product_id) REFERENCES product(product_id)
);

-- ============================================
-- 6. Заказы
-- ============================================
CREATE TABLE orders (
    order_id SERIAL PRIMARY KEY,
    order_date DATE NOT NULL,
    cafe_address VARCHAR(100) NOT NULL,
    CONSTRAINT fk_orders_cafe FOREIGN KEY (cafe_address) REFERENCES cafe(cafe_address)
);

-- ============================================
-- 7. Чек
-- ============================================
CREATE TABLE cheque (
    dish_id INTEGER NOT NULL,
    order_id INTEGER NOT NULL,
    cheque_quantity INTEGER NOT NULL,
    cheque_price DECIMAL(8,2) NOT NULL,
    PRIMARY KEY (dish_id, order_id),
    CONSTRAINT fk_cheque_dish FOREIGN KEY (dish_id) REFERENCES dish(dish_id),
    CONSTRAINT fk_cheque_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- ============================================
-- 8. Поставщики
-- ============================================
CREATE TABLE deliverer (
    deliverer_id SERIAL PRIMARY KEY,
    deliverer_info VARCHAR(100) NOT NULL
);

-- ============================================
-- 9. Поставки
-- ============================================
CREATE TABLE delivery (
    delivery_id SERIAL PRIMARY KEY,
    delivery_date TIMESTAMP NOT NULL,
    deliverer_id INTEGER NOT NULL,
    CONSTRAINT fk_delivery_deliverer FOREIGN KEY (deliverer_id) REFERENCES deliverer(deliverer_id)
);

-- ============================================
-- 10. Доставленные продукты
-- ============================================
CREATE TABLE delivered_product (
    delivered_id SERIAL PRIMARY KEY,
    delivery_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    delivered_quantity INTEGER NOT NULL,
    delivered_price DECIMAL(8,2) NOT NULL,
    CONSTRAINT fk_delivered_product_delivery FOREIGN KEY (delivery_id) REFERENCES delivery(delivery_id),
    CONSTRAINT fk_delivered_product_product FOREIGN KEY (product_id) REFERENCES product(product_id)
);

-- ============================================
-- 11. Остатки на складе
-- ============================================
CREATE TABLE located (
    cafe_address VARCHAR(100) NOT NULL,
    product_id INTEGER NOT NULL,
    located_count INTEGER NOT NULL,
    PRIMARY KEY (cafe_address, product_id),
    CONSTRAINT fk_located_cafe FOREIGN KEY (cafe_address) REFERENCES cafe(cafe_address),
    CONSTRAINT fk_located_product FOREIGN KEY (product_id) REFERENCES product(product_id)
);

-- ============================================
-- 12. Пользователи
-- ============================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'cashier', 'barista', 'trade_agent')),
    cook_id INTEGER NULL,
    CONSTRAINT fk_users_cook FOREIGN KEY (cook_id) REFERENCES cook(cook_id)
);
