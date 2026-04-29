import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Alert, Paper, Box, Grid, Avatar, Snackbar, MenuItem } from '@mui/material';
import { Coffee } from '@mui/icons-material';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('cashier');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const navigate = useNavigate();

  const switchMode = () => {
    setIsRegister(!isRegister);
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Ошибка входа');
      }
      const user = await response.json();
      localStorage.setItem('username', user.username);
      localStorage.setItem('role', user.role);

      if (user.role === 'cashier') navigate('/cashier');
      else if (user.role === 'barista') navigate('/barista');
      else if (user.role === 'trade_agent') navigate('/trade-agent/inventory');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    try {
      const response = await fetch('http://localhost:8000/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password, role }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || 'Ошибка регистрации');
      }
      setSuccessMessage('Пользователь создан! Теперь войдите.');
      setIsRegister(false);
      setUsername('');
      setPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCloseSnackbar = () => setSuccessMessage('');

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundImage: 'url(https://images.unsplash.com/photo-1442512595331-e89e73853f31?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={6} sx={{ p: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.9)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: '#4e2e1e', width: 56, height: 56 }}>
              <Coffee fontSize="large" />
            </Avatar>
          </Box>
          <Typography variant="h5" align="center" gutterBottom>
            {isRegister ? 'Регистрация' : 'Добро пожаловать!'}
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            {isRegister ? 'Создайте аккаунт для работы в системе' : 'Войдите в свою учётную запись'}
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <form onSubmit={isRegister ? handleRegister : handleLogin}>
            <TextField
              fullWidth
              label="Логин"
              margin="normal"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <TextField
              fullWidth
              label="Пароль"
              type="password"
              margin="normal"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {isRegister && (
              <>
                <TextField
                  fullWidth
                  label="Подтверждение пароля"
                  type="password"
                  margin="normal"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <TextField
                  select
                  fullWidth
                  label="Роль"
                  margin="normal"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <MenuItem value="cashier">Кассир</MenuItem>
                  <MenuItem value="barista">Бариста</MenuItem>
                  <MenuItem value="trade_agent">Торговый агент</MenuItem>
                </TextField>
              </>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3, mb: 2, py: 1.5, bgcolor: '#4e2e1e', '&:hover': { bgcolor: '#3a2214' } }}
            >
              {isRegister ? 'Зарегистрироваться' : 'Войти'}
            </Button>

            <Grid container justifyContent="center">
              <Button variant="text" onClick={switchMode} sx={{ textTransform: 'none' }}>
                {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
              </Button>
            </Grid>
          </form>
        </Paper>
      </Container>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        message={successMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
};

export default Login;