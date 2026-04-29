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

const TradeAgentSuppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [current, setCurrent] = useState(null);
  const [form, setForm] = useState({ deliverer_info: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await fetch(`${API_BASE}/suppliers`, { credentials: 'include' });
      if (!res.ok) throw new Error();
      setSuppliers(await res.json());
    } catch (err) {
      setError('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (supplier = null) => {
    if (supplier) {
      setCurrent(supplier);
      setForm({ deliverer_info: supplier.deliverer_info });
    } else {
      setCurrent(null);
      setForm({ deliverer_info: '' });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      const url = current ? `${API_BASE}/suppliers/${current.deliverer_id}` : `${API_BASE}/suppliers`;
      const method = current ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error();
      fetchSuppliers();
      setOpenDialog(false);
    } catch (err) {
      setError('Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить поставщика?')) return;
    try {
      const res = await fetch(`${API_BASE}/suppliers/${id}`, { method: 'DELETE', credentials: 'include' });
      if (!res.ok) throw new Error();
      fetchSuppliers();
    } catch (err) {
      setError('Ошибка удаления');
    }
  };

  if (loading) return <Layout title="Поставщики"><CircularProgress /></Layout>;

  return (
    <Layout title="Управление поставщиками">
      {error && <Alert severity="error">{error}</Alert>}
      <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ mb: 2 }}>
        Добавить поставщика
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Контактная информация</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {suppliers.map(s => (
              <TableRow key={s.deliverer_id}>
                <TableCell>{s.deliverer_id}</TableCell>
                <TableCell>{s.deliverer_info}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(s)}><Edit /></IconButton>
                  <IconButton onClick={() => handleDelete(s.deliverer_id)}><Delete /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{current ? 'Редактировать' : 'Новый поставщик'}</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Контактная информация" fullWidth
            value={form.deliverer_info} onChange={e => setForm({...form, deliverer_info: e.target.value})} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={handleSave}>Сохранить</Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default TradeAgentSuppliers;