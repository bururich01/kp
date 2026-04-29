-- ============================================
-- Триггерная функция: проверка остатков перед заказом
-- ============================================
CREATE OR REPLACE FUNCTION check_product_availability()
RETURNS TRIGGER AS $$
DECLARE
    product_id INTEGER;
    needed_qty INTEGER;
    available_qty INTEGER;
BEGIN
    -- Для каждого продукта в составе блюда
    FOR product_id IN SELECT product_id FROM consists WHERE dish_id = NEW.dish_id LOOP
        -- Получаем остаток на складе
        SELECT located_count INTO available_qty
        FROM located
        WHERE located.product_id = product_id 
          AND located.cafe_address = (
              SELECT cafe_address FROM orders WHERE order_id = NEW.order_id
          );
        
        -- Получаем необходимое количество
        SELECT COUNT(*) INTO needed_qty FROM consists WHERE dish_id = NEW.dish_id;
        
        -- Проверка
        IF available_qty IS NULL OR available_qty < NEW.cheque_quantity * needed_qty THEN
            RAISE EXCEPTION 'Недостаточно продукта с ID % на складе', product_id;
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Создание триггера
-- ============================================
CREATE TRIGGER trg_check_stock_before_cheque_insert
BEFORE INSERT ON cheque
FOR EACH ROW
EXECUTE FUNCTION check_product_availability();
