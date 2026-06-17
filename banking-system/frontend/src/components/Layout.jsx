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
  FaTimesCircle,
} from 'react-icons/fa';
import { useAuth, useTheme } from '../context/Contexts';
import { notifApi } from '../services/api';
import { toast } from 'react-toastify';

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
    { to: '/admin/accounts', label: 'All Accounts', icon: <FaUniversity /> },
    { to: '/admin/cards', label: 'Card Requests', icon: <FaCreditCard /> },
    { to: '/admin/terminations', label: 'Account Closures', icon: <FaTimesCircle /> },
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
              ? 'bg-blue-600/15 border-l-4 border-blue-500 text-white font-semibold shadow-inner'
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
    return <p className="px-4 pt-4 pb-1 text-[10px] font-bold text-slate-400/60 uppercase tracking-widest">{label}</p>;
  }

  return (
    <aside className="w-60 flex-shrink-0 bg-[#0c192c] border-r border-[#1c3554] text-white flex flex-col shadow-xl overflow-y-auto">
      <div className="p-4 border-b border-[#1c3554] flex-shrink-0">
        <div className="flex items-center gap-2">
          <FaUniversity className="text-2xl text-orange-500" />
          <div>
            <p className="font-extrabold text-base leading-tight bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">BankPortal</p>
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
  const [lastNotificationId, setLastNotificationId] = useState(null);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  useEffect(() => {
    if (!user) return;

    const checkNewNotifications = async () => {
      try {
        const res = await notifApi.getAll(0);
        const list = res.data?.data?.content || [];
        
        if (list.length > 0) {
          const latest = list[0];
          
          if (!isFirstLoad && lastNotificationId && latest.id > lastNotificationId) {
            // Filter all notifications that are newer than the last tracked ID
            const newNotifs = list.filter(n => n.id > lastNotificationId).reverse();
            newNotifs.forEach(n => {
              if (n.title.toLowerCase().includes('error') || n.title.toLowerCase().includes('failed') || n.title.toLowerCase().includes('insufficient')) {
                toast.error(`${n.title}: ${n.message}`);
              } else if (n.title.toLowerCase().includes('welcome') || n.title.toLowerCase().includes('success') || n.title.toLowerCase().includes('received') || n.title.toLowerCase().includes('opened')) {
                toast.success(`${n.title}: ${n.message}`);
              } else {
                toast.info(`${n.title}: ${n.message}`);
              }
            });
          }
          
          setLastNotificationId(latest.id);
          setIsFirstLoad(false);
        }
        
        const countRes = await notifApi.getUnreadCount();
        setUnread(countRes.data.data || 0);
      } catch (err) {
        console.warn("Failed to retrieve new notifications:", err);
      }
    };

    checkNewNotifications();
    const interval = setInterval(checkNewNotifications, 4000);
    return () => clearInterval(interval);
  }, [user, lastNotificationId, isFirstLoad]);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <header className="flex-shrink-0 bg-[#0c192c]/80 backdrop-blur-md border-b border-[#1c3554] px-4 py-3 flex items-center justify-between z-10">
      <button onClick={onToggleSidebar} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#1c3554] transition-all">
        <FaBars className="text-slate-300" />
      </button>

      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/notifications')} className="relative p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-[#1c3554] transition-all">
          <FaBell className="text-slate-300" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-black shadow-lg shadow-orange-500/30">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>

        <button onClick={() => navigate('/profile')} className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#1c3554] transition-colors">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white text-xs font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <span className="text-sm font-semibold text-slate-300">{user?.firstName} {user?.lastName}</span>
        </button>

        <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-600 hover:text-white text-red-400 text-sm font-bold transition-all active:scale-[0.97] shadow-sm hover:shadow-red-600/10">
          <FaSignOutAlt className="text-base" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const [loadingPage, setLoadingPage] = useState(false);

  useEffect(() => {
    setLoadingPage(true);
    const timer = setTimeout(() => setLoadingPage(false), 450);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-[#000000] overflow-hidden">
      {loadingPage && (
        <div className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 z-50 animate-loading-bar" />
      )}
      <Sidebar open={sidebarOpen} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Navbar onToggleSidebar={() => setSidebarOpen((open) => !open)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#000000]">
          <div key={location.pathname} className="page-transition">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
