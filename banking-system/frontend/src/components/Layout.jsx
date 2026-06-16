// ============================================================
// src/components/Layout.jsx — Glassmorphic Edition
// ============================================================
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  FaBars,
  FaBell,
  FaChartBar,
  FaChartPie,
  FaCreditCard,
  FaExchangeAlt,
  FaFileAlt,
  FaHandHoldingUsd,
  FaHome,
  FaIdCard,
  FaMobileAlt,
  FaMoon,
  FaRobot,
  FaShieldAlt,
  FaSignOutAlt,
  FaSun,
  FaUniversity,
  FaUser,
  FaUsers,
} from 'react-icons/fa';
import { useAuth, useTheme } from '../context/Contexts';
import { notifApi } from '../services/api';

function Sidebar({ open }) {
  const { isAdmin } = useAuth();

  if (!open) return null;

  const customerNav = [
    { to: '/dashboard', label: 'Dashboard', icon: <FaHome /> },
    { to: '/accounts', label: 'Accounts', icon: <FaUniversity /> },
    { to: '/transactions', label: 'Transactions', icon: <FaExchangeAlt /> },
    { to: '/transfer', label: 'Transfer', icon: <FaHandHoldingUsd /> },
    { to: '/loans', label: 'Loans', icon: <FaFileAlt /> },
    { to: '/cards', label: 'Cards', icon: <FaCreditCard /> },
    { to: '/upi', label: 'UPI', icon: <FaMobileAlt /> },
    { to: '/beneficiaries', label: 'Beneficiaries', icon: <FaUsers /> },
    { to: '/profile', label: 'Profile', icon: <FaUser /> },
    { to: '/kyc', label: 'KYC', icon: <FaIdCard /> },
    { to: '/notifications', label: 'Notifications', icon: <FaBell /> },
  ];

  const aiNav = [
    { to: '/chatbot', label: 'AI Assistant', icon: <FaRobot /> },
    { to: '/spending-insights', label: 'Spending Insights', icon: <FaChartPie /> },
    { to: '/fraud-detection', label: 'Fraud Detection', icon: <FaShieldAlt /> },
  ];

  const adminNav = [
    { to: '/admin', label: 'Admin Dashboard', icon: <FaChartBar /> },
    { to: '/admin/customers', label: 'Customers', icon: <FaUsers /> },
    { to: '/admin/loans', label: 'Loan Approvals', icon: <FaFileAlt /> },
    { to: '/admin/kyc', label: 'KYC Review', icon: <FaIdCard /> },
    { to: '/admin/transactions', label: 'Monitor Txns', icon: <FaExchangeAlt /> },
  ];

  function NavItem({ to, icon, label }) {
    return (
      <NavLink
        to={to}
        className={({ isActive }) =>
          `flex items-center gap-3 px-4 py-3 text-sm transition-all duration-300 rounded-xl mx-2 my-0.5 ${
            isActive
              ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-l-4 border-blue-500 text-white font-semibold shadow-inner'
              : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
          }`
        }
      >
        <span className="text-base flex-shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </NavLink>
    );
  }

  function SectionLabel({ label }) {
    return <p className="px-4 pt-4 pb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>;
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-slate-950/60 backdrop-blur-xl border-r border-white/5 text-white flex flex-col shadow-xl overflow-y-auto">
      <div className="p-4 border-b border-white/5 flex-shrink-0">
        <div className="flex items-center gap-2">
          <FaUniversity className="text-2xl text-blue-500 animate-pulse" />
          <div>
            <p className="font-extrabold text-base leading-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">BankPortal</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-2">
        {!isAdmin && (
          <>
            <SectionLabel label="Banking" />
            {customerNav.map((item) => <NavItem key={item.to} {...item} />)}

            <SectionLabel label="AI Features" />
            {aiNav.map((item) => <NavItem key={item.to} {...item} />)}
          </>
        )}

        {isAdmin && (
          <>
            <SectionLabel label="Administration" />
            {adminNav.map((item) => <NavItem key={item.to} {...item} />)}
          </>
        )}
      </nav>
    </aside>
  );
}

function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notifApi.getUnreadCount().then((r) => setUnread(r.data.data || 0)).catch(() => {});
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="flex-shrink-0 bg-slate-950/40 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between z-10">
      <button onClick={onToggleSidebar} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all">
        <FaBars className="text-slate-300" />
      </button>

      <div className="flex items-center gap-3">
        <button onClick={toggleTheme} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all">
          {theme === 'dark' ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-slate-300" />}
        </button>

        <button onClick={() => navigate('/notifications')} className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all">
          <FaBell className="text-slate-300" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black shadow-lg shadow-red-500/30">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        <button onClick={() => navigate('/profile')} className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <span className="text-sm font-semibold text-slate-300">{user?.firstName} {user?.lastName}</span>
        </button>

        <button onClick={handleLogout} className="flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-red-600/20 active:scale-95">
          <FaSignOutAlt />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar open={sidebarOpen} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onToggleSidebar={() => setSidebarOpen((open) => !open)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-950/20">
          <div key={location.pathname} className="page-transition">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
