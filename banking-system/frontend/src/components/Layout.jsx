// ============================================================
// src/components/Layout.jsx
// ============================================================
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
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
          `flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${
            isActive
              ? 'bg-blue-700 dark:bg-blue-600 border-r-4 border-yellow-400 text-white font-medium'
              : 'text-blue-100 dark:text-gray-300 hover:bg-blue-800/70 dark:hover:bg-gray-700 hover:text-white'
          }`
        }
      >
        <span className="text-base flex-shrink-0">{icon}</span>
        <span className="truncate">{label}</span>
      </NavLink>
    );
  }

  function SectionLabel({ label }) {
    return <p className="px-4 pt-4 pb-1 text-xs font-bold text-blue-300 dark:text-gray-500 uppercase tracking-widest">{label}</p>;
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-blue-900 dark:bg-gray-800 text-white flex flex-col shadow-xl overflow-y-auto">
      <div className="p-4 border-b border-blue-800 dark:border-gray-700 flex-shrink-0">
        <div className="flex items-center gap-2">
          <FaUniversity className="text-2xl text-yellow-400" />
          <div>
            <p className="font-bold text-base leading-tight">BankPortal</p>
            <p className="text-xs text-blue-300 dark:text-gray-400">Management System</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-2">
        <SectionLabel label="Banking" />
        {customerNav.map((item) => <NavItem key={item.to} {...item} />)}

        <SectionLabel label="AI Features" />
        {aiNav.map((item) => <NavItem key={item.to} {...item} />)}

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
    <header className="flex-shrink-0 bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 px-4 py-3 flex items-center justify-between">
      <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <FaBars className="text-gray-600 dark:text-gray-300" />
      </button>

      <div className="flex items-center gap-2">
        <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          {theme === 'dark' ? <FaSun className="text-yellow-400" /> : <FaMoon className="text-gray-600" />}
        </button>

        <button onClick={() => navigate('/notifications')} className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
          <FaBell className="text-gray-600 dark:text-gray-300" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 font-bold">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        <button onClick={() => navigate('/profile')} className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
          <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <span className="text-sm font-medium dark:text-white">{user?.firstName} {user?.lastName}</span>
        </button>

        <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors">
          <FaSignOutAlt />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <Sidebar open={sidebarOpen} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onToggleSidebar={() => setSidebarOpen((open) => !open)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
