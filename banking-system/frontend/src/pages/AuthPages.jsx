// ============================================================
// src/pages/AuthPages.jsx — Premium Glassmorphic Edition
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  FaEnvelope, 
  FaEye, 
  FaEyeSlash, 
  FaUniversity, 
  FaUser, 
  FaPhone, 
  FaLock, 
  FaArrowRight,
  FaCheckCircle
} from 'react-icons/fa';
import { useAuth } from '../context/Contexts';
import { authApi } from '../services/api';

// ── Glassmorphic Background Layout ──────────────────────────
function AuthLayout({ children, title, subtitle, maxWidth = 'max-w-md' }) {
  return (
    <div className="min-h-screen bg-slate-950 relative flex items-center justify-center p-4 overflow-hidden font-sans select-none page-transition">
      {/* Animated Premium Floating Gradient Orbs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-tr from-blue-600/25 to-indigo-500/20 blur-[130px] animate-float-1 pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] rounded-full bg-gradient-to-bl from-purple-600/20 to-pink-500/20 blur-[130px] animate-float-2 pointer-events-none"></div>
      <div className="absolute top-[30%] left-[25%] w-80 h-80 rounded-full bg-cyan-500/5 blur-[100px] pointer-events-none"></div>

      <div className={`w-full ${maxWidth} z-10`}>
        {/* Frosted Glass Container with super smooth borders and round corners */}
        <div className="glass-frosted rounded-[2.5rem] shadow-2xl p-6 sm:p-10 border border-white/10 hover:border-white/15 transition-all duration-500 shadow-blue-500/5">
          <div className="text-center mb-8">
            {/* Glowing Bank Portal Logo */}
            <div className="inline-flex p-4 bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white rounded-3xl shadow-xl shadow-indigo-500/25 mb-4 transform hover:scale-105 hover:rotate-6 transition-all duration-300">
              <FaUniversity className="text-3xl" />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white">
              {title}
            </h1>
            <p className="text-slate-400 text-xs mt-2 font-medium tracking-wide uppercase">{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

// ── Login Page ──────────────────────────────────────────────
export function LoginPage() {
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleQuickLogin = (username, password) => {
    setForm({ usernameOrEmail: username, password: password });
    toast.info(`Filled credentials for ${username}`, { autoClose: 1500 });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.firstName}! 👋`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="BankPortal" subtitle="Secure Digital Gateway" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Username or Email</label>
          <div className="relative group">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-blue-400 transition-colors" />
            <input
              type="text"
              required
              value={form.usernameOrEmail}
              onChange={e => setForm(f => ({ ...f, usernameOrEmail: e.target.value }))}
              className="glass-input pl-11"
              placeholder="Enter username or email"
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="label mb-0">Password</label>
            <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold hover:underline">
              Forgot?
            </Link>
          </div>
          <div className="relative group">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-blue-400 transition-colors" />
            <input
              type={showPwd ? 'text' : 'password'}
              required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="glass-input pl-11 pr-10 font-mono"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPwd(s => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            >
              {showPwd ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-2 flex items-center justify-center gap-2 group"
        >
          {loading ? 'Signing in...' : (
            <>
              Sign In <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-6 font-medium">
        Don't have an account?{' '}
        <Link to="/register" className="text-blue-400 font-bold hover:text-blue-300 hover:underline">
          Register
        </Link>
      </p>

      {/* Demo Accounts Panel */}
      <div className="mt-8 pt-6 border-t border-white/5">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">
          Quick Access Demo Portals
        </p>
        <div className="space-y-2.5">
          <div className="flex justify-between items-center bg-white/5 border border-white/5 p-3 rounded-2xl">
            <span className="font-bold text-xs text-slate-300">Manager Access</span>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'Admin@123')}
              className="bg-blue-500/15 text-blue-300 hover:bg-blue-500/25 px-3 py-1.5 rounded-xl border border-blue-500/20 active:scale-95 transition-all text-xs font-mono"
            >
              admin / Admin@123
            </button>
          </div>
          <div className="bg-white/5 border border-white/5 p-3 rounded-2xl">
            <span className="font-bold text-xs text-slate-300 block mb-2">Customer Portals</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('rahul.sharma', 'Customer@123')}
                className="bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 px-3 py-1.5 rounded-xl border border-emerald-500/20 active:scale-95 transition-all text-xs font-mono"
              >
                rahul.sharma
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('priya.patel', 'Customer@123')}
                className="bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 px-3 py-1.5 rounded-xl border border-emerald-500/20 active:scale-95 transition-all text-xs font-mono"
              >
                priya.patel
              </button>
            </div>
            <p className="text-[9px] text-slate-400 mt-2 italic">Password for customers is Customer@123</p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}

// ── Register Page ───────────────────────────────────────────
export function RegisterPage() {
  const [form, setForm] = useState({
    username: '', email: '', password: '', firstName: '', lastName: '', phone: '', gender: 'MALE'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      const respData = err.response?.data;
      if (respData?.data && typeof respData.data === 'object') {
        const details = Object.values(respData.data).join(', ');
        toast.error(`${respData.message}: ${details}`);
      } else {
        toast.error(respData?.message || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  }

  const renderField = (label, key, type = 'text', placeholder = '', helpText = '') => (
    <div key={key} className="space-y-1.5">
      <label className="label">{label}</label>
      <input
        type={type}
        required
        value={form[key]}
        onChange={set(key)}
        placeholder={placeholder}
        className="glass-input"
      />
      {helpText && (
        <p className="text-[10px] text-slate-400 leading-normal italic">{helpText}</p>
      )}
    </div>
  );

  return (
    <AuthLayout title="Register" subtitle="Open a New Digital Account" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderField('First Name', 'firstName', 'text', 'Rahul')}
        {renderField('Last Name', 'lastName', 'text', 'Sharma')}
        {renderField('Username', 'username', 'text', 'rahul.sharma')}
        {renderField('Email', 'email', 'email', 'rahul@email.com')}
        {renderField('Phone', 'phone', 'tel', '9876543210', '10-digit number')}
        {renderField('Password', 'password', 'password', 'Min 8 characters', 'Alphanumeric + symbol')}

        <div className="md:col-span-2 space-y-1.5">
          <label className="label">Gender</label>
          <select
            value={form.gender}
            onChange={set('gender')}
            className="w-full bg-slate-900/60 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl px-4 py-3 text-white focus:outline-none transition-all duration-300 text-sm cursor-pointer"
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 btn-primary w-full mt-4 flex items-center justify-center gap-2 group"
        >
          {loading ? 'Creating account...' : (
            <>
              Create Account <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-sm text-slate-400 mt-6 font-medium">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-400 font-bold hover:text-blue-300 hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
}

// ── Forgot Password Page ────────────────────────────────────
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending link');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Recover Your Portal Account" maxWidth="max-w-md">
      {sent ? (
        <div className="text-center bg-white/5 border border-white/5 p-6 rounded-2xl space-y-4">
          <div className="inline-flex p-3.5 bg-green-500/10 text-green-400 rounded-full mb-1">
            <FaCheckCircle className="text-4xl" />
          </div>
          <p className="text-green-300 font-bold text-lg">Verification Dispatched</p>
          <p className="text-slate-400 text-xs leading-relaxed">
            A password reset link has been sent to <strong>{email}</strong>. Please check your inbox.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="label">Registered Email Address</label>
            <div className="relative group">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-blue-400 transition-colors" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="glass-input pl-11"
                placeholder="registered@email.com"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 group"
          >
            {loading ? 'Sending link...' : (
              <>
                Send Reset Link <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}

      <p className="text-center mt-6 text-sm font-medium">
        <Link to="/login" className="text-blue-400 hover:text-blue-300 hover:underline">
          Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
}

