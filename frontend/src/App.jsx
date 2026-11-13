import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PredictionPage from './pages/PredictionPage';
import MarketExplorerPage from './pages/MarketExplorerPage';
import RecommendationPage from './pages/RecommendationPage';

function ProtectedRoute({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

function AppShell() {
  const { token, user, logout } = useAuth();

  return (
    <Layout user={user} onLogout={logout}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={token ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/register" element={token ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />

        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/predict" element={<ProtectedRoute><PredictionPage /></ProtectedRoute>} />
        <Route path="/markets" element={<ProtectedRoute><MarketExplorerPage /></ProtectedRoute>} />
        <Route path="/recommendation" element={<ProtectedRoute><RecommendationPage /></ProtectedRoute>} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
