import React, { useState, useEffect } from 'react';
import {
  Container, Paper, Typography, TextField, Button, Select, MenuItem,
  FormControl, InputLabel, IconButton, Table, TableBody, TableCell,
  TableHead, TableRow, Box, Alert
} from '@mui/material';
import { Add, Delete } from '@mui/icons-material';
import Layout from './components/Layout';

const API_BASE = 'http://localhost:8000/api/v1';

const TradeAgentCreateDelivery = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    deliverer_id: '',
    delivery_date: new Date().toISOString().slice(0, 16),
    products: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSuppliers();
    fetchProducts();
  }, []);

  const fetchSuppliers = async () => {
    const res = await fetch(`${API_BASE}/suppliers`, { credentials: 'include' });
    if (res.ok) setSuppliers(await res.json());
  };
  const fetchProducts = async () => {
    const res = await fetch(`${API_BASE}/products`, { credentials: 'include' });
    if (res.ok) setProducts(await res.json());
  };

  const addProductRow = () => {
    setForm({
      ...form,
      products: [...form.products, { product_id: '', quantity: '', price: '' }]
    });
  };

  const updateProductRow = (index, field, value) => {
    const updated = [...form.products];
    updated[index][field] = value;
    setForm({ ...form, products: updated });
  };

  const removeProductRow = (index) => {
    const updated = form.products.filter((_, i) => i !== index);
    setForm({ ...form, products: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    // Валидация
    if (!form.deliverer_id || form.products.length === 0) {
      setError('Выберите поставщика и добавьте хотя бы один продукт');
      return;
    }
    for (let p of form.products) {
      if (!p.product_id || !p.quantity || !p.price) {
        setError('Заполните все поля для каждого продукта');
        return;
      }
    }
    try {
      const res = await fetch(`${API_BASE}/deliveries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          deliverer_id: form.deliverer_id,
          delivery_date: form.delivery_date,
          products: form.products.map(p => ({
            product_id: p.product_id,
            quantity: Number(p.quantity),
            price: Number(p.price)
          }))
        })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Ошибка');
      }
      setSuccess('Поставка создана!');
      setForm({ deliverer_id: '', delivery_date: new Date().toISOString().slice(0, 16), products: [] });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Layout title="Новая поставка">
      <Paper sx={{ p: 3 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Поставщик</InputLabel>
            <Select
              value={form.deliverer_id}
              onChange={e => setForm({...form, deliverer_id: e.target.value})}
              required
            >
              {suppliers.map(s => (
                <MenuItem key={s.deliverer_id} value={s.deliverer_id}>{s.deliverer_info}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Дата поставки"
            type="datetime-local"
            fullWidth
            margin="normal"
            value={form.delivery_date}
            onChange={e => setForm({...form, delivery_date: e.target.value})}
            required
          />
          <Typography variant="h6" sx={{ mt: 2 }}>Продукты</Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Продукт</TableCell>
                <TableCell>Количество</TableCell>
                <TableCell>Цена за ед.</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {form.products.map((item, idx) => (
                <TableRow key={idx}>
                  <TableCell>
                    <Select
                      value={item.product_id}
                      onChange={e => updateProductRow(idx, 'product_id', e.target.value)}
                      fullWidth
                    >
                      {products.map(p => (
                        <MenuItem key={p.product_id} value={p.product_id}>{p.product_name}</MenuItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={e => updateProductRow(idx, 'quantity', e.target.value)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      type="number"
                      value={item.price}
                      onChange={e => updateProductRow(idx, 'price', e.target.value)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => removeProductRow(idx)}><Delete /></IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button variant="outlined" startIcon={<Add />} onClick={addProductRow} sx={{ mt: 1 }}>
            Добавить продукт
          </Button>
          <Box sx={{ mt: 3 }}>
            <Button type="submit" variant="contained">Создать поставку</Button>
          </Box>
        </form>
      </Paper>
    </Layout>
  );
};

export default TradeAgentCreateDelivery;