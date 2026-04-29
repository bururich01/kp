import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import CashierNewOrder from './CashierNewOrder';
import CashierOrderHistory from './CashierOrderHistory';
import BaristaKitchen from './BaristaKitchen';
import TradeAgentInventory from './TradeAgentInventory';
import TradeAgentSuppliers from './TradeAgentSuppliers';
import TradeAgentCreateDelivery from './TradeAgentCreateDelivery';
import AdminUsers from './AdminUsers';
import AdminDishes from './AdminDishes';
import AdminProducts from './AdminProducts';
import AdminReports from './AdminReports';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const role = localStorage.getItem('role');
  if (!role) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/cashier"
          element={
            <ProtectedRoute allowedRoles={['cashier']}>
              <CashierNewOrder />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cashier/orders"
          element={
            <ProtectedRoute allowedRoles={['cashier']}>
              <CashierOrderHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/barista"
          element={
            <ProtectedRoute allowedRoles={['barista']}>
              <BaristaKitchen />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trade-agent"
          element={
            <ProtectedRoute allowedRoles={['trade_agent']}>
              <Navigate to="/trade-agent/inventory" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trade-agent/inventory"
          element={
            <ProtectedRoute allowedRoles={['trade_agent']}>
              <TradeAgentInventory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trade-agent/suppliers"
          element={
            <ProtectedRoute allowedRoles={['trade_agent']}>
              <TradeAgentSuppliers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trade-agent/deliveries"
          element={
            <ProtectedRoute allowedRoles={['trade_agent']}>
              <TradeAgentCreateDelivery />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <Navigate to="/admin/users" replace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dishes"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDishes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminProducts />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminReports />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;