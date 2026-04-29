import React, { useState, useEffect } from 'react';
import { Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Select, MenuItem, Button, Typography, Grid, Card, CardContent } from '@mui/material';
import { People, AdminPanelSettings, BarChart } from '@mui/icons-material';
import Layout from './components/Layout';

const API_BASE = 'http://localhost:8000/api/v1';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const res = await fetch(`${API_BASE}/users`, { credentials: 'include' });
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const changeRole = async (userId, newRole) => {
    await fetch(`${API_BASE}/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role: newRole })
    });
    fetchUsers();
  };

  const logout = async () => {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    localStorage.clear();
    window.location.href = '/login';
  };

  const roleCount = users.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] || 0) + 1;
    return acc;
  }, {});

  return (
    <Layout title="Администрирование">
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <People sx={{ mr: 2, color: '#4e2e1e' }} />
              <Typography variant="h5">{users.length}</Typography>
              <Typography variant="body2" sx={{ ml: 1 }}>всего пользователей</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <AdminPanelSettings sx={{ mr: 2, color: '#4e2e1e' }} />
              <Typography variant="h5">{roleCount.admin || 0}</Typography>
              <Typography variant="body2" sx={{ ml: 1 }}>администраторов</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <BarChart sx={{ mr: 2, color: '#4e2e1e' }} />
              <Typography variant="h5">{Object.keys(roleCount).length}</Typography>
              <Typography variant="body2" sx={{ ml: 1 }}>ролей</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Button variant="contained" color="secondary" onClick={logout} sx={{ mb: 2 }}>
        Выйти
      </Button>

      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ bgcolor: '#4e2e1e' }}>
            <TableRow>
              <TableCell sx={{ color: 'white' }}>ID</TableCell>
              <TableCell sx={{ color: 'white' }}>Логин</TableCell>
              <TableCell sx={{ color: 'white' }}>Роль</TableCell>
              <TableCell sx={{ color: 'white' }}>Действие</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map(user => (
              <TableRow key={user.user_id}>
                <TableCell>{user.user_id}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  <Select
                    value={user.role}
                    onChange={(e) => changeRole(user.user_id, e.target.value)}
                  >
                    <MenuItem value="cashier">Кассир</MenuItem>
                    <MenuItem value="barista">Бариста</MenuItem>
                    <MenuItem value="trade_agent">Торговый агент</MenuItem>
                    <MenuItem value="admin">Администратор</MenuItem>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Layout>
  );
};

export default AdminUsers;