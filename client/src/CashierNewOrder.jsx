import React, { useState, useEffect } from 'react';
import {
  Container, Grid, Card, CardContent, Typography, Button, Box, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Paper, Alert,
  CircularProgress, Divider, Chip, Avatar
} from '@mui/material';
import { Add, Remove, Delete, Coffee, LocalCafe, EmojiEmotions } from '@mui/icons-material';
import Layout from './components/Layout';

const API_BASE = 'http://localhost:8000/api/v1';

const CashierNewOrder = () => {
  const [dishes, setDishes] = useState([]);
  const [cart, setCart] = useState([]);
  const [orderId, setOrderId] = useState(null);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/dishes`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('Ошибка загрузки меню');
        return res.json();
      })
      .then(data => {
        setDishes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Создание нового заказа
  const createOrder = async () => {
    setCreatingOrder(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ cafe_address: 'г. Липецк, ул. Ленина, 10' })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Ошибка создания заказа');
      }
      const data = await res.json();
      setOrderId(data.order_id);
    } catch (err) {
      setError(`Не удалось создать заказ: ${err.message}`);
      console.error(err);
    } finally {
      setCreatingOrder(false);
    }
  };

  // Добавление блюда в корзину (создаёт заказ, если его нет)
  const addToCart = async (dish) => {
    // Обновляем корзину сразу для отзывчивости UI
    setCart(prev => {
      const existing = prev.find(item => item.dish_id === dish.dish_id);
      if (existing) {
        return prev.map(item =>
          item.dish_id === dish.dish_id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...dish, quantity: 1 }];
    });

    // Если заказа ещё нет – создаём
    if (!orderId && !creatingOrder) {
      await createOrder();
    }
  };

  const updateQuantity = (dishId, delta) => {
    setCart(prev =>
      prev
        .map(item =>
          item.dish_id === dishId ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeItem = (dishId) => {
    setCart(prev => prev.filter(item => item.dish_id !== dishId));
  };

  const totalPrice = cart.reduce((sum, item) => sum + item.dish_price * item.quantity, 0);

  // Сохранение позиций заказа на сервере
  const saveOrderItems = async () => {
    if (!orderId) {
      throw new Error('Заказ не создан');
    }
    for (const item of cart) {
      const res = await fetch(`${API_BASE}/orders/${orderId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ dish_id: item.dish_id, quantity: item.quantity })
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Ошибка добавления позиции');
      }
    }
  };

  const handlePayment = async () => {
    try {
      await saveOrderItems();
      const paymentRes = await fetch(`${API_BASE}/orders/${orderId}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ payment_method: paymentMethod })
      });
      if (!paymentRes.ok) {
        const errData = await paymentRes.json();
        throw new Error(errData.detail || 'Ошибка оплаты');
      }
      alert('Заказ оплачен!');
      setCart([]);
      setOrderId(null);
      setPaymentDialog(false);
    } catch (err) {
      alert(`Ошибка: ${err.message}`);
    }
  };

  const renderMenu = () => {
    if (loading) return <CircularProgress sx={{ mt: 4 }} />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (dishes.length === 0) {
      return (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#faf3e8' }}>
          <LocalCafe sx={{ fontSize: 60, color: '#b87c4e', mb: 2 }} />
          <Typography variant="h6">Меню пока пусто</Typography>
          <Typography variant="body2" color="text.secondary">
            Администратор скоро добавит блюда. Загляните позже!
          </Typography>
        </Paper>
      );
    }
    return (
      <Grid container spacing={2}>
        {dishes.map(dish => (
          <Grid item xs={12} sm={6} md={4} key={dish.dish_id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', transition: '0.3s', '&:hover': { transform: 'scale(1.02)' } }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>{dish.dish_name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Вес: {dish.dish_weight} г
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                  {dish.dish_price} ₽
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => addToCart(dish)}
                  sx={{ mt: 2 }}
                  fullWidth
                  disabled={creatingOrder}
                >
                  Добавить
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  return (
    <Layout title="Приём заказов">
      {/* Баннер */}
      <Paper sx={{ p: 2, mb: 4, bgcolor: '#fff3e0', borderRadius: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              ☕ Специальное предложение!
            </Typography>
            <Typography variant="body1">
              При заказе двух любых напитков – третий в подарок!
            </Typography>
            <Chip label="Акция действует до 31 марта" color="primary" sx={{ mt: 1 }} />
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Avatar sx={{ width: 80, height: 80, bgcolor: '#b87c4e', mx: 'auto' }}>
              <Coffee sx={{ fontSize: 50 }} />
            </Avatar>
          </Grid>
        </Grid>
      </Paper>

      <Grid container spacing={3}>
        {/* Меню */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" gutterBottom>Наше меню</Typography>
          {renderMenu()}
        </Grid>

        {/* Корзина */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, position: 'sticky', top: 20 }}>
            <Typography variant="h5" gutterBottom>Корзина</Typography>
            <Divider sx={{ my: 1 }} />
            {cart.length === 0 ? (
              <Alert severity="info" icon={<EmojiEmotions />}>
                Корзина пуста. Добавьте что-нибудь из меню!
              </Alert>
            ) : (
              <>
                {cart.map(item => (
                  <Box key={item.dish_id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography>{item.dish_name}</Typography>
                    <Box>
                      <IconButton size="small" onClick={() => updateQuantity(item.dish_id, -1)}><Remove /></IconButton>
                      <Typography component="span">{item.quantity}</Typography>
                      <IconButton size="small" onClick={() => updateQuantity(item.dish_id, 1)}><Add /></IconButton>
                      <IconButton size="small" onClick={() => removeItem(item.dish_id)}><Delete /></IconButton>
                    </Box>
                    <Typography>{item.dish_price * item.quantity} ₽</Typography>
                  </Box>
                ))}
                <Divider sx={{ my: 1 }} />
                <Typography variant="h6" sx={{ mt: 1 }}>
                  Итого: {totalPrice} ₽
                </Typography>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  disabled={cart.length === 0 || creatingOrder || !orderId}
                  onClick={() => setPaymentDialog(true)}
                  sx={{ mt: 2 }}
                >
                  Оплатить
                </Button>
                {creatingOrder && <CircularProgress size={20} sx={{ mt: 1 }} />}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Блок популярных напитков */}
      {dishes.length > 0 && (
        <Box sx={{ mt: 6 }}>
          <Typography variant="h5" gutterBottom>Популярное у гостей</Typography>
          <Grid container spacing={2}>
            {dishes.slice(0, 3).map(dish => (
              <Grid item xs={12} sm={4} key={dish.dish_id}>
                <Card sx={{ bgcolor: '#fef7e8' }}>
                  <CardContent>
                    <Typography variant="subtitle1">{dish.dish_name}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      <Dialog open={paymentDialog} onClose={() => setPaymentDialog(false)}>
        <DialogTitle>Оплата заказа</DialogTitle>
        <DialogContent>
          <TextField
            select
            label="Способ оплаты"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            fullWidth
            SelectProps={{ native: true }}
          >
            <option value="cash">Наличные</option>
            <option value="card">Карта</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Отмена</Button>
          <Button onClick={handlePayment}>Оплатить</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default CashierNewOrder;