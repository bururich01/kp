-- ============================================
-- 1. Добавление кафе
-- ============================================
INSERT INTO cafe (cafe_address) 
VALUES ('г. Липецк, ул. Ленина, 10')
ON CONFLICT (cafe_address) DO NOTHING;

-- ============================================
-- 2. Добавление продуктов
-- ============================================
INSERT INTO product (product_name, product_price) VALUES
('Кофе в зернах (арабика)', 800),
('Молоко 3.2%', 70),
('Сахар', 50),
('Шоколадный сироп', 200),
('Ванильный сироп', 200);

-- ============================================
-- 3. Добавление остатков на складе
-- ============================================
INSERT INTO located (cafe_address, product_id, located_count) VALUES
('г. Липецк, ул. Ленина, 10', (SELECT product_id FROM product WHERE product_name = 'Кофе в зернах (арабика)'), 15),
('г. Липецк, ул. Ленина, 10', (SELECT product_id FROM product WHERE product_name = 'Молоко 3.2%'), 50),
('г. Липецк, ул. Ленина, 10', (SELECT product_id FROM product WHERE product_name = 'Сахар'), 10),
('г. Липецк, ул. Ленина, 10', (SELECT product_id FROM product WHERE product_name = 'Шоколадный сироп'), 5),
('г. Липецк, ул. Ленина, 10', (SELECT product_id FROM product WHERE product_name = 'Ванильный сироп'), 3);

-- ============================================
-- 4. Добавление блюд
-- ============================================
INSERT INTO dish (dish_name, dish_price, dish_weight) VALUES
('Латте', 300, 300),
('Эспрессо', 200, 50),
('Капучино', 250, 250),
('Американо', 180, 200),
('Круассан', 150, 80);

-- ============================================
-- 5. Состав блюд
-- ============================================
INSERT INTO consists (dish_id, product_id) VALUES
((SELECT dish_id FROM dish WHERE dish_name = 'Латте'), (SELECT product_id FROM product WHERE product_name = 'Кофе в зернах (арабика)')),
((SELECT dish_id FROM dish WHERE dish_name = 'Латте'), (SELECT product_id FROM product WHERE product_name = 'Молоко 3.2%')),
((SELECT dish_id FROM dish WHERE dish_name = 'Латте'), (SELECT product_id FROM product WHERE product_name = 'Сахар'));

INSERT INTO consists (dish_id, product_id) VALUES
((SELECT dish_id FROM dish WHERE dish_name = 'Эспрессо'), (SELECT product_id FROM product WHERE product_name = 'Кофе в зернах (арабика)'));

INSERT INTO consists (dish_id, product_id) VALUES
((SELECT dish_id FROM dish WHERE dish_name = 'Капучино'), (SELECT product_id FROM product WHERE product_name = 'Кофе в зернах (арабика)')),
((SELECT dish_id FROM dish WHERE dish_name = 'Капучино'), (SELECT product_id FROM product WHERE product_name = 'Молоко 3.2%')),
((SELECT dish_id FROM dish WHERE dish_name = 'Капучино'), (SELECT product_id FROM product WHERE product_name = 'Сахар'));

INSERT INTO consists (dish_id, product_id) VALUES
((SELECT dish_id FROM dish WHERE dish_name = 'Американо'), (SELECT product_id FROM product WHERE product_name = 'Кофе в зернах (арабика)'));

-- ============================================
-- 6. Добавление поставщиков
-- ============================================
INSERT INTO deliverer (deliverer_info) VALUES 
('ООО "Кофе-Трейд", тел. +7-999-123-45-67'),
('ИП Иванов И.И., email: ivanov@coffee.ru');

-- ============================================
-- 7. Добавление бариста
-- ============================================
INSERT INTO cook (cook_name, cook_post, cafe_address) VALUES
('Иванов Иван Иванович', 'бариста', 'г. Липецк, ул. Ленина, 10');
