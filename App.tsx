import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout';
import { UserRole } from './types';

// Context Providers
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { NotificationProvider } from './contexts/NotificationContext';

// Pages
import { HomePage } from './pages/HomePage';
import { AttractionDetail } from './pages/AttractionDetail';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { CartPage } from './pages/CartPage';
import { AuthPage } from './pages/AuthPage';
import { MerchantDashboard } from './pages/MerchantDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { UserOrders } from './pages/UserOrders';

// Protected Route Component
const ProtectedRoute = ({ children, roles }: { children?: React.ReactNode, roles?: UserRole[] }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <NotificationProvider>
          <HashRouter>
            <Layout>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<AuthPage type="login" />} />
                <Route path="/register" element={<AuthPage type="register" />} />
                <Route path="/attractions/:id" element={<AttractionDetail />} />
                <Route path="/products" element={<ProductList />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                
                {/* Routes accessible by Guests and Travelers, but blocked for Merchant/Admin */}
                <Route path="/cart" element={<CartPage />} />

                {/* Protected Routes */}
                <Route path="/orders" element={
                  <ProtectedRoute roles={[UserRole.TRAVELER]}>
                    <UserOrders />
                  </ProtectedRoute>
                } />
                
                <Route path="/merchant" element={
                  <ProtectedRoute roles={[UserRole.MERCHANT]}>
                    <MerchantDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin" element={
                  <ProtectedRoute roles={[UserRole.ADMIN]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </Layout>
          </HashRouter>
        </NotificationProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;