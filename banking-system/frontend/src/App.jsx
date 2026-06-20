import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ThemeProvider, useAuth } from './context/Contexts';
import Layout from './components/Layout';
import { toast } from 'react-toastify';
import { sounds } from './services/sounds';

// Auth
import { LoginPage, RegisterPage, ForgotPasswordPage, ResetPasswordPage } from './pages/AuthPages';

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
import { AdminDashboard, AdminCustomers, AdminAccounts, AdminLoans, AdminKyc, AdminTransactions, AdminCards, AdminTerminations } from './pages/admin/AdminPages';

function PrivateRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-[#000000]">
      <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !user.roles?.includes('ROLE_ADMIN')) return <Navigate to="/dashboard" replace />;
  return children;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  if (user) {
    if (user.roles?.includes('ROLE_ADMIN')) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function IndexRedirect() {
  const { user } = useAuth();
  if (user?.roles?.includes('ROLE_ADMIN')) {
    return <Navigate to="/admin" replace />;
  }
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  useEffect(() => {
    // 1. Global Click / Touch sound trigger
    const handleGlobalClick = (e) => {
      const isInteractive = e.target.closest(
        'button, a, input[type="button"], input[type="submit"], [role="button"], select, option, label, textarea'
      );
      if (isInteractive) {
        sounds.playClick();
      }
    };
    window.addEventListener('click', handleGlobalClick, { capture: true });

    // 2. Global Notification toast sound trigger (intercepts all messages)
    const unsubscribe = toast.onChange((payload) => {
      if (payload.status === 'added') {
        if (payload.type === 'success') {
          const contentStr = String(payload.content || '').toLowerCase();
          // If transaction-related, play the coin drop / transfer success sound
          if (
            contentStr.includes('transfer') ||
            contentStr.includes('sent') ||
            contentStr.includes('received') ||
            contentStr.includes('deposit') ||
            contentStr.includes('withdraw') ||
            contentStr.includes('success') ||
            contentStr.includes('paid') ||
            contentStr.includes('opened') ||
            contentStr.includes('activated')
          ) {
            sounds.playSuccess();
          } else {
            sounds.playNotification();
          }
        } else if (payload.type === 'error') {
          sounds.playError();
        } else {
          sounds.playNotification();
        }
      }
    });

    return () => {
      window.removeEventListener('click', handleGlobalClick, { capture: true });
      unsubscribe();
    };
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login"           element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/register"        element={<PublicRoute><RegisterPage /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />
            <Route path="/reset-password"  element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />

            {/* Protected */}
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
              <Route index element={<IndexRedirect />} />
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
              <Route path="admin/accounts"     element={<PrivateRoute adminOnly><AdminAccounts /></PrivateRoute>} />
              <Route path="admin/cards"        element={<PrivateRoute adminOnly><AdminCards /></PrivateRoute>} />
              <Route path="admin/terminations" element={<PrivateRoute adminOnly><AdminTerminations /></PrivateRoute>} />
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
