import React, { useState, useEffect } from 'react';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Chip, Box } from '@mui/material';
import { Kitchen, CheckCircle } from '@mui/icons-material';
import Layout from './components/Layout';

const API_BASE = 'http://localhost:8000/api/v1';

const BaristaKitchen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders?status=paid`, { credentials: 'include' });
      const data = await res.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const markReady = async (orderId) => {
    await fetch(`${API_BASE}/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: 'ready' })
    });
    fetchOrders();
  };

  return (
    <Layout title="Кухня">
      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" color="text.secondary">
          Здесь отображаются оплаченные заказы, ожидающие приготовления.
        </Typography>
      </Box>

      {orders.length === 0 && !loading && (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#faf3e8' }}>
          <Kitchen sx={{ fontSize: 60, color: '#b87c4e', mb: 2 }} />
          <Typography variant="h6">Нет активных заказов</Typography>
          <Typography variant="body2">Отдыхайте, пока нет работы :)</Typography>
        </Paper>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#4e2e1e' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>ID заказа</TableCell>
              <TableCell sx={{ color: 'white' }}>Дата</TableCell>
              <TableCell sx={{ color: 'white' }}>Позиции</TableCell>
              <TableCell sx={{ color: 'white' }}>Действие</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map(order => (
              <TableRow key={order.order_id}>
                <TableCell>#{order.order_id}</TableCell>
                <TableCell>{new Date(order.order_date).toLocaleString()}</TableCell>
                <TableCell>
                  {order.items?.map(item => `${item.dish_name} x${item.quantity}`).join(', ')}
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="success" startIcon={<CheckCircle />} onClick={() => markReady(order.order_id)}>
                    Готово
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Layout>
  );
};

export default BaristaKitchen;