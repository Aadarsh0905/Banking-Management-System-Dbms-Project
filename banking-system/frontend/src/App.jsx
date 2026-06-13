import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ThemeProvider, useAuth } from './context/Contexts';
import Layout from './components/Layout';

// Auth
import { LoginPage, RegisterPage, ForgotPasswordPage } from './pages/AuthPages';

// Main
import { DashboardPage, AccountsPage, TransferPage } from './pages/MainPages';

// Feature
import { TransactionsPage } from './pages/FeaturePages';
import { LoansPage }        from './pages/FeaturePages';
import { CardsPage }        from './pages/FeaturePages';
import { UpiPage }          from './pages/FeaturePages';

// User
import { ProfilePage }       from './pages/UserPages';
import { KycPage }           from './pages/UserPages';
import { BeneficiariesPage } from './pages/UserPages';
import { NotificationsPage } from './pages/UserPages';

// AI
import AiChatbotPage                    from './pages/AiChatbotPage';
import { SpendingInsightsPage, FraudDetectionPage } from './pages/AiPages';

// Admin
import { AdminDashboard, AdminCustomers, AdminLoans, AdminKyc, AdminTransactions } from './pages/admin/AdminPages';

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.roles?.includes('ROLE_ADMIN')) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login"           element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register"        element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

            {/* Protected */}
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"         element={<DashboardPage />} />
              <Route path="accounts"          element={<AccountsPage />} />
              <Route path="transactions"      element={<TransactionsPage />} />
              <Route path="transfer"          element={<TransferPage />} />
              <Route path="loans"             element={<LoansPage />} />
              <Route path="cards"             element={<CardsPage />} />
              <Route path="upi"               element={<UpiPage />} />
              <Route path="profile"           element={<ProfilePage />} />
              <Route path="kyc"               element={<KycPage />} />
              <Route path="beneficiaries"     element={<BeneficiariesPage />} />
              <Route path="notifications"     element={<NotificationsPage />} />
              <Route path="chatbot"           element={<AiChatbotPage />} />
              <Route path="spending-insights" element={<SpendingInsightsPage />} />
              <Route path="fraud-detection"   element={<FraudDetectionPage />} />
              <Route path="admin"              element={<PrivateRoute adminOnly><AdminDashboard /></PrivateRoute>} />
              <Route path="admin/customers"    element={<PrivateRoute adminOnly><AdminCustomers /></PrivateRoute>} />
              <Route path="admin/loans"        element={<PrivateRoute adminOnly><AdminLoans /></PrivateRoute>} />
              <Route path="admin/kyc"          element={<PrivateRoute adminOnly><AdminKyc /></PrivateRoute>} />
              <Route path="admin/transactions" element={<PrivateRoute adminOnly><AdminTransactions /></PrivateRoute>} />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
