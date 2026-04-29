import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Container, Box, IconButton, Avatar, Menu, MenuItem } from '@mui/material';
import { Coffee, MenuBook, Receipt, LocalShipping, AdminPanelSettings } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const Layout = ({ children, title }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');
  const [anchorEl, setAnchorEl] = useState(null);

  const getRoleIcon = () => {
    switch (role) {
      case 'cashier': return <Receipt />;
      case 'barista': return <Coffee />;
      case 'trade_agent': return <LocalShipping />;
      case 'admin': return <AdminPanelSettings />;
      default: return <MenuBook />;
    }
  };

  const getMenuItems = () => {
    switch (role) {
      case 'cashier':
        return [
          { label: 'Новый заказ', path: '/cashier' },
          { label: 'История заказов', path: '/cashier/orders' },
        ];
      case 'barista':
        return [{ label: 'Кухня', path: '/barista' }];
      case 'trade_agent':
        return [
          { label: 'Склад', path: '/trade-agent/inventory' },
          { label: 'Поставщики', path: '/trade-agent/suppliers' },
          { label: 'Новая поставка', path: '/trade-agent/deliveries' },
        ];
      case 'admin':
        return [
          { label: 'Пользователи', path: '/admin/users' },
          { label: 'Меню', path: '/admin/dishes' },
          { label: 'Продукты', path: '/admin/products' },
          { label: 'Отчёты', path: '/admin/reports' },
        ];
      default:
        return [];
    }
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    fetch('http://localhost:8000/api/v1/auth/logout', { method: 'POST', credentials: 'include' })
      .finally(() => {
        localStorage.clear();
        navigate('/login');
      });
  };

  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: '#4e2e1e', mb: 3 }}>
        <Toolbar>
          <Coffee sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1, cursor: 'pointer' }} onClick={() => navigate('/')}>
            CoffeeChain System
          </Typography>
          {username && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getRoleIcon()}
              <Typography variant="body1" sx={{ mx: 2 }}>
                {username} ({role})
              </Typography>
              <IconButton color="inherit" onClick={handleMenuOpen}>
                <Avatar sx={{ bgcolor: '#8b5a2b' }}>{username.charAt(0).toUpperCase()}</Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                {getMenuItems().map((item) => (
                  <MenuItem key={item.path} onClick={() => handleNavigation(item.path)}>
                    {item.label}
                  </MenuItem>
                ))}
                <MenuItem onClick={handleLogout}>Выйти</MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl">
        {title && (
          <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#4e2e1e' }}>
            {title}
          </Typography>
        )}
        {children}
      </Container>

      <Box component="footer" sx={{ mt: 8, py: 3, bgcolor: '#f5e7d3', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} CoffeeChain – Ваш идеальный кофе
        </Typography>
      </Box>
    </>
  );
};

export default Layout;