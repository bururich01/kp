import React, { useState, useEffect } from 'react';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Chip, CircularProgress, Alert } from '@mui/material';
import { Inventory, Warning } from '@mui/icons-material';
import Layout from './components/Layout';

const API_BASE = 'http://localhost:8000/api/v1';

const TradeAgentInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await fetch(`${API_BASE}/inventory`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInventory(data);
    } catch (err) {
      setError('Не удалось загрузить данные');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Layout title="Склад"><CircularProgress /></Layout>;

  return (
    <Layout title="Склад">
      {error && <Alert severity="error">{error}</Alert>}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Актуальные остатки и прогноз пополнения.
        </Typography>
      </Box>
      {inventory.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#faf3e8' }}>
          <Inventory sx={{ fontSize: 60, color: '#b87c4e', mb: 2 }} />
          <Typography variant="h6">Нет данных о продуктах</Typography>
          <Typography variant="body2">Добавьте продукты в систему, чтобы отслеживать склад.</Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: '#4e2e1e' }}>
              <TableRow>
                <TableCell sx={{ color: 'white' }}>Продукт</TableCell>
                <TableCell sx={{ color: 'white' }}>Остаток (кг)</TableCell>
                <TableCell sx={{ color: 'white' }}>Среднее использование в день (кг)</TableCell>
                <TableCell sx={{ color: 'white' }}>Прогноз до пополнения (дней)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {inventory.map(item => (
                <TableRow key={item.product_id}>
                  <TableCell>{item.product_name}</TableCell>
                  <TableCell>
                    <Chip label={`${item.stock} кг`} color={item.stock < 10 ? "error" : "success"} size="small" />
                  </TableCell>
                  <TableCell>{item.avg_usage}</TableCell>
                  <TableCell>
                    {item.days_until_reorder < 5 ? (
                      <Chip icon={<Warning />} label={`${item.days_until_reorder} дней`} color="warning" />
                    ) : (
                      `${item.days_until_reorder} дней`
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Layout>
  );
};

export default TradeAgentInventory;