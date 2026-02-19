import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import SalesDashboard from './pages/SalesDashboard';
import SalesList from './pages/SalesList';
import SalesImport from './pages/SalesImport';
import SalesAnalytics from './pages/SalesAnalytics';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: { fontFamily: 'Inter, sans-serif', fontSize: '14px' },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/sales/dashboard" replace />} />
          <Route path="sales/dashboard" element={<SalesDashboard />} />
          <Route path="sales/records"   element={<SalesList />} />
          <Route path="sales/import"    element={<SalesImport />} />
          <Route path="sales/analytics" element={<SalesAnalytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
