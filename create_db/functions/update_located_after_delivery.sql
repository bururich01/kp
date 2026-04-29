-- ============================================
-- Триггерная функция: обновление остатков при поставке
-- ============================================
CREATE OR REPLACE FUNCTION update_located_after_delivery()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO located (cafe_address, product_id, located_count)
    VALUES (
        (SELECT cafe_address FROM delivery d 
         JOIN orders o ON d.delivery_id = NEW.delivery_id LIMIT 1),
        NEW.product_id,
        NEW.delivered_quantity
    )
    ON CONFLICT (cafe_address, product_id)
    DO UPDATE SET located_count = located.located_count + NEW.delivered_quantity;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Создание триггера
-- ============================================
CREATE TRIGGER trg_update_located_after_insert
AFTER INSERT ON delivered_product
FOR EACH ROW
EXECUTE FUNCTION update_located_after_delivery();
