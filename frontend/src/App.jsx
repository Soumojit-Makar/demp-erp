import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, RoleBasedRoute } from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// App pages
import Dashboard from './pages/dashboard/Dashboard';
import Employees from './pages/employees/Employees';
import EmployeeForm from './pages/employees/EmployeeForm';
import Products from './pages/inventory/Products';
import ProductForm from './pages/inventory/ProductForm';
import Sales from './pages/sales/Sales';
import SaleForm from './pages/sales/SaleForm';
import Reports from './pages/reports/Reports';
import Profile from './pages/profile/Profile';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes — requires login */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Default redirect */}
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard — all roles */}
            <Route path="dashboard" element={<Dashboard />} />

            {/* HR Module — admin & manager only */}
            <Route
              path="employees"
              element={
                <RoleBasedRoute roles={['admin', 'manager']}>
                  <Employees />
                </RoleBasedRoute>
              }
            />
            <Route
              path="employees/new"
              element={
                <RoleBasedRoute roles={['admin', 'manager']}>
                  <EmployeeForm />
                </RoleBasedRoute>
              }
            />
            <Route
              path="employees/:id/edit"
              element={
                <RoleBasedRoute roles={['admin', 'manager']}>
                  <EmployeeForm />
                </RoleBasedRoute>
              }
            />

            {/* Inventory Module — all roles can view */}
            <Route path="products" element={<Products />} />
            <Route
              path="products/new"
              element={
                <RoleBasedRoute roles={['admin', 'manager']}>
                  <ProductForm />
                </RoleBasedRoute>
              }
            />
            <Route
              path="products/:id/edit"
              element={
                <RoleBasedRoute roles={['admin', 'manager']}>
                  <ProductForm />
                </RoleBasedRoute>
              }
            />

            {/* Sales Module — admin & manager only */}
            <Route
              path="sales"
              element={
                <RoleBasedRoute roles={['admin', 'manager']}>
                  <Sales />
                </RoleBasedRoute>
              }
            />
            <Route
              path="sales/new"
              element={
                <RoleBasedRoute roles={['admin', 'manager']}>
                  <SaleForm />
                </RoleBasedRoute>
              }
            />
            <Route
              path="sales/:id/edit"
              element={
                <RoleBasedRoute roles={['admin', 'manager']}>
                  <SaleForm />
                </RoleBasedRoute>
              }
            />

            {/* Reports — admin & manager only */}
            <Route
              path="reports"
              element={
                <RoleBasedRoute roles={['admin', 'manager']}>
                  <Reports />
                </RoleBasedRoute>
              }
            />

            {/* Profile — all roles */}
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
