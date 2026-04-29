import React, { useState, useEffect } from 'react';
import {
  Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Typography, CircularProgress, Alert
} from '@mui/material';
import { Receipt } from '@mui/icons-material';
import Layout from './components/Layout';

const API_BASE = 'http://localhost:8000/api/v1';

const CashierOrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError('Не удалось загрузить историю заказов');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="История заказов">
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#4e2e1e' }}>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>ID заказа</TableCell>
                <TableCell sx={{ color: 'white' }}>Дата</TableCell>
                <TableCell sx={{ color: 'white' }}>Адрес кафе</TableCell>
                <TableCell sx={{ color: 'white' }}>Статус</TableCell>
                <TableCell sx={{ color: 'white' }}>Позиции</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">Заказов пока нет</TableCell>
                </TableRow>
              ) : (
                orders.map(order => (
                  <TableRow key={order.order_id}>
                    <TableCell>#{order.order_id}</TableCell>
                    <TableCell>{new Date(order.order_date).toLocaleString()}</TableCell>
                    <TableCell>{order.cafe_address}</TableCell>
                    <TableCell>
                      {order.status === 'new' && 'Новый'}
                      {order.status === 'paid' && 'Оплачен'}
                      {order.status === 'ready' && 'Готов'}
                    </TableCell>
                    <TableCell>
                      {order.items.map(item => `${item.dish_name} x${item.quantity}`).join(', ')}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Layout>
  );
};

export default CashierOrderHistory;