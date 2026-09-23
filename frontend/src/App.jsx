import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MyCropsPage from './pages/farmer/MyCropsPage';
import AddCropPage from './pages/farmer/AddCropPage';
import EditCropPage from './pages/farmer/EditCropPage';
import BuyerMarketplacePage from './pages/buyer/BuyerMarketplacePage';
import CropDetailsPage from './pages/buyer/CropDetailsPage';
import PlaceOrderPage from './pages/buyer/PlaceOrderPage';
import MyOrdersPage from './pages/buyer/MyOrdersPage';
import PaymentCheckoutPage from './pages/buyer/PaymentCheckoutPage';
import FarmerIncomingOrdersPage from './pages/farmer/FarmerIncomingOrdersPage';
import WarehouseManagementPage from './pages/warehouse/WarehouseManagementPage';
import AddWarehousePage from './pages/warehouse/AddWarehousePage';
import TransporterDashboardPage from './pages/transporter/TransporterDashboardPage';
import AssignShipmentPage from './pages/transporter/AssignShipmentPage';
import AdminAnalyticsDashboardPage from './pages/admin/AdminAnalyticsDashboardPage';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          <Route path="/marketplace" element={<BuyerMarketplacePage />} />
          <Route path="/crops/:id" element={<CropDetailsPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Admin Analytics Route */}
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminAnalyticsDashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Buyer Order & Payment Routes */}
          <Route
            path="/orders/place/:cropId"
            element={
              <ProtectedRoute allowedRoles={['BUYER']}>
                <PlaceOrderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/mine"
            element={
              <ProtectedRoute allowedRoles={['BUYER']}>
                <MyOrdersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/orders/:orderId/pay"
            element={
              <ProtectedRoute allowedRoles={['BUYER']}>
                <PaymentCheckoutPage />
              </ProtectedRoute>
            }
          />

          {/* Warehouse Management Routes */}
          <Route
            path="/warehouse/facilities"
            element={
              <ProtectedRoute allowedRoles={['WAREHOUSE_MANAGER', 'ADMIN']}>
                <WarehouseManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/warehouse/add"
            element={
              <ProtectedRoute allowedRoles={['WAREHOUSE_MANAGER', 'ADMIN']}>
                <AddWarehousePage />
              </ProtectedRoute>
            }
          />

          {/* Transporter & Logistics Routes */}
          <Route
            path="/transporter/shipments"
            element={
              <ProtectedRoute allowedRoles={['TRANSPORTER', 'ADMIN']}>
                <TransporterDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transporter/assign"
            element={
              <ProtectedRoute allowedRoles={['TRANSPORTER', 'ADMIN']}>
                <AssignShipmentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transporter/assign/:orderId"
            element={
              <ProtectedRoute allowedRoles={['TRANSPORTER', 'ADMIN']}>
                <AssignShipmentPage />
              </ProtectedRoute>
            }
          />

          {/* Farmer Crop & Order Management Routes */}
          <Route
            path="/farmer/crops"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <MyCropsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/crops/add"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <AddCropPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/crops/edit/:id"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <EditCropPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/farmer/orders"
            element={
              <ProtectedRoute allowedRoles={['FARMER']}>
                <FarmerIncomingOrdersPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}



