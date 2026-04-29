-- ============================================
-- Хранимая процедура: добавление новой поставки
-- ============================================
CREATE OR REPLACE PROCEDURE process_new_delivery(
    p_product_name VARCHAR,
    p_product_price NUMERIC,
    p_quantity INTEGER,
    p_price NUMERIC,
    p_delivery_date DATE,
    p_deliverer_id INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
    v_product_id INTEGER;
    v_delivery_id INTEGER;
BEGIN
    -- Проверка существования продукта
    SELECT product_id INTO v_product_id
    FROM product
    WHERE product_name = p_product_name;
    
    -- Если продукта нет — создаём
    IF NOT FOUND THEN
        INSERT INTO product(product_name, product_price)
        VALUES (p_product_name, p_product_price)
        RETURNING product_id INTO v_product_id;
    END IF;
    
    -- Создаём поставку
    INSERT INTO delivery(delivery_date, deliverer_id)
    VALUES (p_delivery_date, p_deliverer_id)
    RETURNING delivery_id INTO v_delivery_id;
    
    -- Добавляем позицию поставки
    INSERT INTO delivered_product(delivery_id, delivered_quantity, delievered_price, product_id)
    VALUES (v_delivery_id, p_quantity, p_price, v_product_id);
END;
$$;
