import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ThemeProvider, useAuth } from './context/Contexts';
import { ServerStatusProvider, useServerStatus } from './context/ServerStatusContext';
import RenderAwakeningModal from './components/RenderAwakeningModal';
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
  const { elapsedSeconds } = useServerStatus();

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#000000] p-6 text-center text-slate-100">
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="w-3 h-3 rounded-full bg-orange-500 animate-ping" />
        </div>
      </div>
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-3">
        <span>⚡ Render Free Tier Spin-up</span>
      </div>
      <h3 className="text-xl font-black text-white mb-2">Connecting to Backend Service</h3>
      <p className="text-xs text-slate-400 max-w-md leading-relaxed mb-4">
        Render puts free instances to sleep after 15 min of inactivity. The backend container is warming up (typically takes ~45–60s on first load). Resuming your banking session...
      </p>
      <div className="text-xs font-mono text-cyan-400 bg-[#0c192c] px-4 py-2 rounded-xl border border-[#1c3554]">
        ⏱️ Elapsed Time: <strong className="text-orange-400">{elapsedSeconds}s</strong> / ~50s
      </div>
      <button
        type="button"
        onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
        className="mt-6 text-xs text-slate-500 hover:text-slate-300 underline transition-colors"
      >
        Sign in with another account
      </button>
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
      <ServerStatusProvider>
        <AuthProvider>
          <RenderAwakeningModal />
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
      </ServerStatusProvider>
    </ThemeProvider>
  );
}
