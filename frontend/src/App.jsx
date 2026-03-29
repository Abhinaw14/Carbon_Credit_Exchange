import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { WalletProvider } from './context/WalletContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import SubmitCredit from './pages/SubmitCredit';
import MyCredits from './pages/MyCredits';
import CreateAuction from './pages/CreateAuction';
import Auctions from './pages/Auctions';
import AdminPanel from './pages/AdminPanel';
import Architecture from './pages/Architecture';

export default function App() {
  return (
    <AuthProvider>
      <WalletProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              {/* Public routes */}
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/architecture" element={<Architecture />} />

              {/* Protected routes — require login */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/submit" element={<ProtectedRoute><SubmitCredit /></ProtectedRoute>} />
              <Route path="/my-credits" element={<ProtectedRoute><MyCredits /></ProtectedRoute>} />
              <Route path="/create-auction" element={<ProtectedRoute><CreateAuction /></ProtectedRoute>} />
              <Route path="/auctions" element={<ProtectedRoute><Auctions /></ProtectedRoute>} />

              {/* Admin only */}
              <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminPanel /></ProtectedRoute>} />
            </Route>
          </Routes>
        </BrowserRouter>
      </WalletProvider>
    </AuthProvider>
  );
}
