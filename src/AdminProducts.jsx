import React, { useState, useEffect } from 'react';
import {
  Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Alert
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import Layout from './components/Layout';

const API_BASE = 'http://localhost:8000/api/v1';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [form, setForm] = useState({ product_name: '', product_price: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      setProducts(await res.json());
    } catch (err) {
      setError('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (product = null) => {
    if (product) {
      setCurrentProduct(product);
      setForm({ product_name: product.product_name, product_price: product.product_price });
    } else {
      setCurrentProduct(null);
      setForm({ product_name: '', product_price: '' });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const url = currentProduct ? `${API_BASE}/products/${currentProduct.product_id}` : `${API_BASE}/products`;
      const method = currentProduct ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error();
      fetchProducts();
      setOpenDialog(false);
    } catch (err) {
      setError('Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить продукт?')) return;
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error();
      fetchProducts();
    } catch (err) {
      setError('Ошибка удаления');
    }
  };

  if (loading) return <Layout title="Продукты"><CircularProgress /></Layout>;

  return (
    <Layout title="Управление продуктами">
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Добавить продукт
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Название</TableCell>
              <TableCell>Цена (закупочная)</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map(p => (
              <TableRow key={p.product_id}>
                <TableCell>{p.product_id}</TableCell>
                <TableCell>{p.product_name}</TableCell>
                <TableCell>{p.product_price} ₽</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(p)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(p.product_id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{currentProduct ? 'Редактировать' : 'Новый продукт'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Название" fullWidth
            value={form.product_name} onChange={e => setForm({...form, product_name: e.target.value})} />
          <TextField margin="dense" label="Цена" type="number" fullWidth
            value={form.product_price} onChange={e => setForm({...form, product_price: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default AdminProducts;