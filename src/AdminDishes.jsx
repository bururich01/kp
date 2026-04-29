import React, { useState, useEffect } from 'react';
import {
  Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Typography, Chip, Box, Alert
} from '@mui/material';
import { Edit, Delete, Add, Close } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import Layout from './components/Layout';

const API_BASE = 'http://localhost:8000/api/v1';

const AdminDishes = () => {
  const [dishes, setDishes] = useState([]);
  const [products, setProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openCompositionDialog, setOpenCompositionDialog] = useState(false);
  const [currentDish, setCurrentDish] = useState(null);
  const [dishForm, setDishForm] = useState({ dish_name: '', dish_price: '', dish_weight: '' });
  const [composition, setComposition] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const dishesRes = await fetch(`${API_BASE}/dishes`, { credentials: 'include' });
      const productsRes = await fetch(`${API_BASE}/products`, { credentials: 'include' });
      if (!dishesRes.ok || !productsRes.ok) throw new Error();
      setDishes(await dishesRes.json());
      setProducts(await productsRes.json());
    } catch (err) {
      setError('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const fetchComposition = async (dishId) => {
    try {
      const res = await fetch(`${API_BASE}/dishes/${dishId}/composition`, { credentials: 'include' });
      if (res.ok) setComposition(await res.json());
    } catch (err) {}
  };

  const handleOpenDialog = (dish = null) => {
    if (dish) {
      setCurrentDish(dish);
      setDishForm({ dish_name: dish.dish_name, dish_price: dish.dish_price, dish_weight: dish.dish_weight });
    } else {
      setCurrentDish(null);
      setDishForm({ dish_name: '', dish_price: '', dish_weight: '' });
    }
    setOpenDialog(true);
  };

  const handleSaveDish = async () => {
    try {
      const url = currentDish ? `${API_BASE}/dishes/${currentDish.dish_id}` : `${API_BASE}/dishes`;
      const method = currentDish ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dishForm)
      });
      if (!res.ok) throw new Error();
      fetchData();
      setOpenDialog(false);
    } catch (err) {
      setError('Ошибка сохранения');
    }
  };

  const handleDeleteDish = async (dishId) => {
    if (!window.confirm('Удалить блюдо?')) return;
    try {
      const res = await fetch(`${API_BASE}/dishes/${dishId}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error();
      fetchData();
    } catch (err) {
      setError('Ошибка удаления');
    }
  };

  const handleOpenComposition = async (dish) => {
    setCurrentDish(dish);
    await fetchComposition(dish.dish_id);
    setOpenCompositionDialog(true);
  };

  const handleAddIngredient = async () => {
    if (!selectedProduct) return;
    try {
      const res = await fetch(`${API_BASE}/dishes/${currentDish.dish_id}/composition`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ product_id: selectedProduct, quantity: 1 })
      });
      if (res.ok) {
        await fetchComposition(currentDish.dish_id);
        setSelectedProduct('');
      }
    } catch (err) {}
  };

  const handleRemoveIngredient = async (productId) => {
    try {
      const res = await fetch(`${API_BASE}/dishes/${currentDish.dish_id}/composition/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) await fetchComposition(currentDish.dish_id);
    } catch (err) {}
  };

  if (loading) return <Layout title="Меню"><CircularProgress /></Layout>;

  return (
    <Layout title="Управление меню">
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="contained" startIcon={<Add />} onClick={() => handleOpenDialog()} sx={{ mb: 2 }}>
        Добавить блюдо
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Цена</TableCell>
              <TableCell>Вес</TableCell>
              <TableCell>Состав</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {dishes.map(dish => (
              <TableRow key={dish.dish_id}>
                <TableCell>{dish.dish_id}</TableCell>
                <TableCell>{dish.dish_name}</TableCell>
                <TableCell>{dish.dish_price} ₽</TableCell>
                <TableCell>{dish.dish_weight} г</TableCell>
                <TableCell>
                  <Button size="small" onClick={() => handleOpenComposition(dish)}>Состав</Button>
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpenDialog(dish)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDeleteDish(dish.dish_id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{currentDish ? 'Редактировать' : 'Новое блюдо'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Название" fullWidth
            value={dishForm.dish_name} onChange={e => setDishForm({...dishForm, dish_name: e.target.value})} />
          <TextField margin="dense" label="Цена" type="number" fullWidth
            value={dishForm.dish_price} onChange={e => setDishForm({...dishForm, dish_price: e.target.value})} />
          <TextField margin="dense" label="Вес (г)" type="number" fullWidth
            value={dishForm.dish_weight} onChange={e => setDishForm({...dishForm, dish_weight: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={handleSaveDish}>Сохранить</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openCompositionDialog} onClose={() => setOpenCompositionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Состав: {currentDish?.dish_name}</DialogTitle>
        <DialogContent>
          <Box display="flex" gap={1} alignItems="center" mb={2}>
            <select
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              style={{ flex: 1, padding: 8 }}
            >
              <option value="">Выберите ингредиент</option>
              {products.map(p => (
                <option key={p.product_id} value={p.product_id}>{p.product_name}</option>
              ))}
            </select>
            <Button variant="contained" onClick={handleAddIngredient}>Добавить</Button>
          </Box>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Ингредиент</TableCell>
                <TableCell>Кол-во (г)</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {composition.map(item => (
                <TableRow key={item.product_id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>
                    <IconButton size="small" onClick={() => handleRemoveIngredient(item.product_id)}>
                      <Close fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCompositionDialog(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AdminDishes;