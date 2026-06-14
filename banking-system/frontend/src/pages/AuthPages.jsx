// ============================================================
// src/pages/LoginPage.jsx
// ============================================================

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaEnvelope, FaEye, FaEyeSlash, FaUniversity } from 'react-icons/fa';
import { useAuth } from '../context/Contexts';
import { authApi } from '../services/api';


export function LoginPage() {
  const [form, setForm] = useState({ usernameOrEmail: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true);
    try {
      const user = await login(form);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <FaUniversity className="text-5xl text-blue-600 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Banking Portal</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username or Email</label>
            <input type="text" required value={form.usernameOrEmail}
              onChange={e => setForm(f => ({ ...f, usernameOrEmail: e.target.value }))}
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter username or email" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} required value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white pr-10"
                placeholder="Enter password" />
              <button type="button" onClick={() => setShowPwd(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                {showPwd ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">Forgot password?</Link>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Don't have an account? <Link to="/register" className="text-blue-600 font-medium hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}


// ============================================================
// src/pages/RegisterPage.jsx
// ============================================================

export function RegisterPage() {
  const [form, setForm] = useState({
    username:'', email:'', password:'', firstName:'', lastName:'', phone:'', gender:'MALE'
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault(); setLoading(true);
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
    } finally { setLoading(false); }
  }

  const field = (label, key, type='text', placeholder='') => (
    <div key={key}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
      <input type={type} required value={form[key]} onChange={set(key)} placeholder={placeholder}
        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <div className="text-center mb-6">
          <FaUniversity className="text-4xl text-blue-600 mx-auto mb-2" />
          <h1 className="text-2xl font-bold dark:text-white">Create Account</h1>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
          {field('First Name','firstName','text','John')}
          {field('Last Name','lastName','text','Doe')}
          {field('Username','username','text','johndoe')}
          {field('Email','email','email','john@email.com')}
          {field('Phone','phone','tel','9876543210')}
          {field('Password','password','password','Min 8 chars')}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gender</label>
            <select value={form.gender} onChange={set('gender')}
              className="w-full border rounded-lg px-4 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <button type="submit" disabled={loading}
            className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Registering...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
          Already have an account? <Link to="/login" className="text-blue-600 font-medium hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}


// ============================================================
// src/pages/ForgotPasswordPage.jsx
// ============================================================

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);
  async function handleSubmit(e) {
    e.preventDefault();
    try { await authApi.forgotPassword(email); setSent(true); toast.success('Reset email sent!'); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <FaEnvelope className="text-4xl text-blue-600 mx-auto mb-3" />
          <h1 className="text-xl font-bold dark:text-white">Forgot Password</h1>
        </div>
        {sent ? (
          <div className="text-center text-green-600">
            <p>Password reset link sent to <strong>{email}</strong>.</p>
            <p className="mt-2 text-sm">Check your inbox and follow the instructions.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg">
              Send Reset Link
            </button>
          </form>
        )}
        <p className="text-center mt-4 text-sm"><Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link></p>
      </div>
    </div>
  );
}
