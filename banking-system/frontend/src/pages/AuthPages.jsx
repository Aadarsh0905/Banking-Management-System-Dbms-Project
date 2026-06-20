// ============================================================
// src/pages/AuthPages.jsx — Premium Glassmorphic Edition
// ============================================================

import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
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
function AuthLayout({ children, title, subtitle, activeTab, maxWidth = 'max-w-md' }) {
  const navigate = useNavigate();
  const [sloganIdx, setSloganIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const [activeConsoleTab, setActiveConsoleTab] = useState('ledger');
  const [selectedAccIdx, setSelectedAccIdx] = useState(0);
  const [cardFrozen, setCardFrozen] = useState(false);
  const [routingActive, setRoutingActive] = useState(false);
  const [limitValue, setLimitValue] = useState(50000);

  const slogans = [
    "intelligent console.",
    "secure environment.",
    "real-time analytics.",
    "lightning-fast routing."
  ];

  // Rotate slogans using pure React state updates and transitions
  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setSloganIdx(prev => (prev + 1) % slogans.length);
        setFade(true);
      }, 300);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const accounts = [
    { id: 'ACC4906528634', type: 'Savings Account', balance: '₹1,000.00', history: [40, 20, 60, 45, 80, 50, 95] },
    { id: 'ACC1000000003', type: 'Savings Account', balance: '₹50,000.00', history: [85, 90, 75, 88, 98, 92, 100] },
    { id: 'ACC6244220352', type: 'Fixed Deposit', balance: '₹0.00', history: [10, 10, 10, 10, 10, 10, 10] }
  ];

  const toggleCardFreeze = () => {
    setCardFrozen(!cardFrozen);
    if (!cardFrozen) {
      toast.warning('Card FROZEN: Online payments blocked.', { id: 'card-status', duration: 2000 });
    } else {
      toast.success('Card ACTIVATED: Operational clearance granted.', { id: 'card-status', duration: 2000 });
    }
  };

  const triggerRouting = () => {
    if (routingActive) return;
    setRoutingActive(true);
    toast.info('Simulating transit grid tracing...', { id: 'upi-trace', duration: 1500 });
    setTimeout(() => {
      setRoutingActive(false);
      toast.success('Grid route secure. Transfer cleared.', { id: 'upi-trace-success', duration: 1500 });
    }, 2000);
  };

  const handleLimitIncrease = () => {
    if (limitValue === 100000) {
      toast.info('Maximum transit limit reached.', { id: 'limit-status', duration: 2000 });
      return;
    }
    setLimitValue(100000);
    toast.success('Simulated request: limit extended to ₹1,00,000.', { id: 'limit-status', duration: 2500 });
  };

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col lg:flex-row overflow-hidden font-sans text-slate-100 select-none page-transition">
      
      {/* Column 1: Interactive Dashboard Style Sidebar (Only on large screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#020813] to-[#071328] border-r border-[#1c3554]/40 p-12 flex-col justify-between relative overflow-hidden">
        {/* Floating background glowing orbs */}
        <div className="absolute top-[-10%] left-[-10%] w-96 h-96 rounded-full bg-orange-600/10 blur-[100px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />

        {/* Brand Header */}
        <div className="flex items-center gap-3 z-10">
          <div className="p-3 bg-[#ff6600] text-white rounded-2xl shadow-lg shadow-orange-500/10">
            <FaUniversity className="text-2xl" />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white">BankPortal</h2>
            <p className="text-[10px] text-cyan-400 font-bold tracking-widest uppercase">Digital Banking System</p>
          </div>
        </div>

        {/* Main interactive mockups */}
        <div className="space-y-6 my-auto z-10 max-w-lg">
          <div className="space-y-2">
            <span className="text-[10px] bg-orange-500/10 border border-orange-500/30 text-[#ff6600] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Interactive Preview
            </span>
            <h1 className="text-3.5xl font-black tracking-tight text-white leading-tight min-h-[4.5rem]">
              Manage assets with an <br />
              <span className={`text-[#ff6600] inline-block transition-all duration-300 transform ${fade ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}>
                {slogans[sloganIdx]}
              </span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Hover over or click dashboard elements below to update client metrics. Try signing in using our quick access emulation panel on the right.
            </p>
          </div>

          {/* Console Module Tabs */}
          <div className="flex border border-[#1c3554]/40 bg-[#060e17]/80 rounded-2xl p-1 relative gap-1">
            <button 
              type="button" 
              onClick={() => setActiveConsoleTab('ledger')}
              className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 z-10 ${activeConsoleTab === 'ledger' ? 'bg-[#ff6600] text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Asset Ledger
            </button>
            <button 
              type="button" 
              onClick={() => setActiveConsoleTab('security')}
              className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 z-10 ${activeConsoleTab === 'security' ? 'bg-[#ff6600] text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Security Card
            </button>
            <button 
              type="button" 
              onClick={() => setActiveConsoleTab('routing')}
              className={`flex-1 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 z-10 ${activeConsoleTab === 'routing' ? 'bg-[#ff6600] text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Transit Grid
            </button>
          </div>

          {/* Active Tab View */}
          <div className="min-h-[12.5rem]">
            {activeConsoleTab === 'ledger' && (
              <div className="space-y-4">
                {/* Account Pills Selection */}
                <div className="flex gap-2">
                  {accounts.map((acc, index) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => setSelectedAccIdx(index)}
                      className={`py-1.5 px-3 rounded-lg text-[10px] font-mono tracking-wider transition-all duration-150 ${selectedAccIdx === index ? 'bg-[#1c3554] text-white border border-cyan-500/50' : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-[#1c3554]/20'}`}
                    >
                      {acc.id.substring(0, 7)}...
                    </button>
                  ))}
                </div>

                {/* Card representation */}
                <div className="glass-card border border-[#1c3554] p-5 hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300 group cursor-pointer">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{accounts[selectedAccIdx].type}</span>
                    <span className="text-[9px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full font-bold uppercase tracking-wider animate-pulse">Live Ledger</span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-3.5xl font-black text-white group-hover:text-orange-500 transition-colors duration-300">
                        {accounts[selectedAccIdx].balance}
                      </p>
                      <p className="text-[9px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">Active account verification checks operational</p>
                    </div>
                    <div className="text-right text-xs text-slate-400 border-l border-[#1c3554] pl-4">
                      <p className="font-semibold text-white">Branch Node</p>
                      <p className="font-mono text-slate-500 mt-0.5">{accounts[selectedAccIdx].id}</p>
                    </div>
                  </div>
                </div>

                {/* CSS Chart */}
                <div className="flex items-end justify-between h-20 gap-2 pt-4 border-t border-[#1c3554]/40">
                  {accounts[selectedAccIdx].history.map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center group/bar">
                      <div className="w-full bg-[#0c192c] border border-[#1c3554] h-full rounded-t-lg overflow-hidden flex items-end">
                        <div 
                          style={{ height: `${val}%` }} 
                          className="w-full bg-[#ff6600]/80 group-hover/bar:bg-[#ff6600] rounded-t transition-all duration-500 relative"
                        >
                          <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 border border-[#1c3554] text-[8px] font-mono px-1 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none text-white whitespace-nowrap z-20 shadow-md">
                            {val}%
                          </span>
                        </div>
                      </div>
                      <span className="text-[8px] text-slate-500 mt-1.5 font-mono">{idx + 1}d</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeConsoleTab === 'security' && (
              <div className="space-y-4">
                {/* Debit Card representation */}
                <div 
                  onClick={toggleCardFreeze}
                  className={`relative p-6 rounded-3xl border transition-all duration-300 group cursor-pointer overflow-hidden ${cardFrozen ? 'border-red-500/40 bg-red-950/15 shadow-red-500/5 shadow-2xl' : 'border-orange-500/30 bg-[#0c192c] hover:border-orange-500/50 hover:shadow-orange-500/5'}`}
                >
                  {/* Floating glass overlay effects */}
                  <div className="absolute top-[-20%] right-[-10%] w-40 h-40 rounded-full bg-white/5 blur-xl" />
                  
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">BankPortal Visa Platinum</p>
                      <p className="text-[8px] text-slate-500 font-mono mt-0.5">SECURE CRYPTO CHIP</p>
                    </div>
                    <div className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider transition-all duration-300 ${cardFrozen ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {cardFrozen ? 'Frozen' : 'Active'}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xl font-mono text-white tracking-widest">4532 •••• •••• 8901</p>
                    
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Card Holder</p>
                        <p className="text-xs font-bold text-slate-200 mt-0.5 uppercase">Demo Customer</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] text-slate-500 uppercase font-bold tracking-wider">Expires</p>
                        <p className="text-xs font-mono font-bold text-slate-200 mt-0.5">12/30</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#060e17] border border-[#1c3554]/40 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-300">Click card to toggle freeze</h4>
                    <p className="text-[9px] text-slate-500 mt-0.5">Blocks all merchant transactions immediately</p>
                  </div>
                  <button
                    type="button"
                    onClick={toggleCardFreeze}
                    className={`py-1.5 px-3.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 border ${cardFrozen ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400' : 'bg-red-950/40 border-red-500/40 text-red-400'}`}
                  >
                    {cardFrozen ? 'Unfreeze' : 'Freeze Card'}
                  </button>
                </div>
              </div>
            )}

            {activeConsoleTab === 'routing' && (
              <div className="space-y-4">
                {/* UPI Router visualizer */}
                <div className="glass-card border border-[#1c3554] p-5">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">UPI Transit Channel</span>
                    <button
                      type="button"
                      onClick={triggerRouting}
                      className="py-1 px-2.5 bg-[#1c3554]/50 hover:bg-[#1c3554] border border-cyan-500/30 text-white rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all"
                    >
                      Trace Route
                    </button>
                  </div>

                  <div className="flex justify-between items-center bg-[#060e17] border border-[#1c3554]/30 rounded-2xl p-4 relative overflow-hidden">
                    <div className="text-center z-10">
                      <div className="w-9 h-9 rounded-full bg-[#0c192c] border border-orange-500/40 flex items-center justify-center text-[10px] font-bold text-slate-200">
                        SRC
                      </div>
                      <span className="text-[8px] text-slate-400 block mt-1.5 font-mono">SAVINGS-AC</span>
                    </div>
                    
                    <div className="flex-1 mx-4 h-0.5 border-t border-dashed border-[#1c3554]/60 relative">
                      {routingActive && (
                        <div 
                          className="absolute top-[-3.5px] w-2 h-2 rounded-full bg-[#ff6600] shadow-md shadow-orange-500"
                          style={{ animation: 'routingDot 2s linear infinite' }}
                        />
                      )}
                    </div>
                    
                    <div className="text-center z-10">
                      <div className="w-9 h-9 rounded-full bg-[#0c192c] border border-cyan-500/40 flex items-center justify-center text-[10px] font-bold text-slate-200">
                        DST
                      </div>
                      <span className="text-[8px] text-slate-400 block mt-1.5 font-mono">UPI-PAYEE</span>
                    </div>
                  </div>
                </div>

                {/* Limit utilization */}
                <div className="p-4 bg-[#060e17] border border-[#1c3554]/40 rounded-2xl space-y-2">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-400 uppercase tracking-wider">Transit Limit remaining</span>
                    <button
                      type="button"
                      onClick={handleLimitIncrease}
                      className={`text-[9px] font-bold uppercase tracking-wider transition-colors ${limitValue === 100000 ? 'text-slate-500 cursor-not-allowed' : 'text-cyan-400 hover:text-cyan-300'}`}
                    >
                      Upgrade Limit
                    </button>
                  </div>
                  <div className="w-full bg-[#0c192c] border border-[#1c3554]/40 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#ff6600] h-full transition-all duration-700 ease-out" 
                      style={{ width: limitValue === 50000 ? '50%' : '100%' }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-mono text-slate-500">
                    <span>₹{limitValue.toLocaleString()} utilized</span>
                    <span>Max: ₹1,00,000</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Feature Highlights Menu */}
          <div className="space-y-2 pt-2 border-t border-[#1c3554]/30">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Interactive Slogan Mapping</p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { title: "Universal UPI Transfers", desc: "Instantly route funds across any linked UPI address.", tab: 'routing' },
                { title: "One-Click Card Freeze", desc: "Instantly lock or freeze debit/credit cards for maximum protection.", tab: 'security' },
                { title: "AI-Powered Budgeting", desc: "Autopilot tracking of monthly flows and category thresholds.", tab: 'ledger' }
              ].map((f, i) => (
                <div 
                  key={i} 
                  onClick={() => setActiveConsoleTab(f.tab)}
                  className={`flex gap-3 items-start p-2.5 rounded-xl border transition-all duration-200 cursor-pointer group ${activeConsoleTab === f.tab ? 'bg-[#0c192c] border-[#1c3554] shadow-md shadow-orange-500/5' : 'bg-transparent border-transparent hover:border-[#1c3554]/40 hover:bg-[#0c192c]/30'}`}
                >
                  <span className={`mt-1.5 w-1.5 h-1.5 rounded-full transition-transform duration-300 ${activeConsoleTab === f.tab ? 'bg-[#ff6600] scale-125 shadow-sm shadow-orange-500' : 'bg-slate-600 group-hover:bg-[#ff6600]'}`} />
                  <div>
                    <h4 className={`text-xs font-bold transition-colors ${activeConsoleTab === f.tab ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>{f.title}</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[10px] text-slate-500 z-10">
          © {new Date().getFullYear()} BankPortal Inc. Secured with 256-bit SSL encryption.
        </p>
      </div>

      {/* Column 2: Login / Registration Panel */}
      <div className="flex-1 min-h-screen bg-[#000000] relative flex items-center justify-center p-4 md:p-12 overflow-y-auto">
        {/* Decorative background glow inside workspace */}
        <div className="absolute top-[20%] right-[10%] w-72 h-72 rounded-full bg-[#1c3554]/10 blur-[90px] pointer-events-none" />
        
        <div className={`w-full ${maxWidth} z-10 my-8`}>
          <div className="glass-card border border-[#1c3554] shadow-2xl p-0 overflow-hidden rounded-[2.5rem] flex flex-col">
            
            {/* Header top bar for Professional Dashboard look */}
            <div className="flex justify-between items-center px-6 md:px-8 py-3 bg-[#060e17] border-b border-[#1c3554] text-[9px] md:text-[10px] font-mono tracking-wider text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold text-slate-300">GATEWAY ONLINE</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-cyan-400 uppercase font-bold text-[9px]">NODE: HOST-1</span>
                <span className="text-slate-600">/</span>
                <span className="text-orange-500 font-bold text-[9px]">SECURED</span>
              </div>
            </div>

            {/* Content Container */}
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-center">
              
              {/* Header for small screens (brand logo) */}
              <div className="text-center mb-6">
                <div className="lg:hidden inline-flex p-3 bg-[#ff6600] text-white rounded-2xl shadow-lg shadow-orange-500/10 mb-4">
                  <FaUniversity className="text-xl" />
                </div>
                <h1 className="text-2xl font-black tracking-tight text-white leading-none">
                  {title}
                </h1>
                <p className="text-cyan-400 text-[9px] mt-1.5 font-bold tracking-widest uppercase">{subtitle}</p>
              </div>

              {/* Tab navigation for Switching */}
              {activeTab && (
                <div className="flex rounded-2xl bg-[#0c192c]/85 border border-[#1c3554] p-1 mb-6 relative">
                  <button 
                    type="button"
                    onClick={() => navigate('/login')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 z-10 relative
                      ${activeTab === 'login' ? 'text-white font-extrabold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Sign In
                  </button>
                  <button 
                    type="button"
                    onClick={() => navigate('/register')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 z-10 relative
                      ${activeTab === 'register' ? 'text-white font-extrabold' : 'text-slate-400 hover:text-slate-200'}`}
                  >
                    Register
                  </button>
                  {/* Sliding background highlight - solid orange instead of multicolor gradient */}
                  <div 
                    className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#ff6600] rounded-xl transition-all duration-500 ease-out shadow-lg shadow-orange-500/20
                      ${activeTab === 'login' ? 'left-1' : 'left-[50%]'}`}
                  />
                </div>
              )}

              {children}
            </div>
          </div>
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
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [usernameForOtp, setUsernameForOtp] = useState('');
  const { login, verifyOtp } = useAuth();
  const navigate  = useNavigate();

  const handleQuickLogin = (username, password) => {
    setForm({ usernameOrEmail: username, password: password });
    toast.info(`Filled credentials for ${username}`, { autoClose: 1500 });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(form);
      if (result && result.otpRequired) {
        setUsernameForOtp(result.username);
        setShowOtpInput(true);
        toast.info('Verification OTP sent to your registered email!');
      } else {
        toast.success(`Welcome back, ${result.firstName}! 👋`);
        if (result.roles?.includes('ROLE_ADMIN')) {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleOtpSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await verifyOtp(usernameForOtp, otp);
      toast.success(`Welcome back, ${user.firstName}! 👋`);
      if (user.roles?.includes('ROLE_ADMIN')) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'OTP Verification failed');
    } finally {
      setLoading(false);
    }
  }

  if (showOtpInput) {
    return (
      <AuthLayout title="OTP Verification" subtitle="Enter Code Sent to Email" maxWidth="max-w-md">
        <form onSubmit={handleOtpSubmit} className="space-y-5">
          <div className="focus-glow text-left">
            <label className="label">One-Time Password (OTP)</label>
            <div className="relative group">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="glass-input pl-11 tracking-widest text-center font-mono text-lg font-bold"
                placeholder="000000"
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-normal italic mt-2 text-center">
              Please enter the 6-digit OTP code printed in your server logs or sent via email.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 group"
          >
            {loading ? 'Verifying...' : (
              <>
                Verify & Login <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setShowOtpInput(false)}
            className="w-full text-slate-400 hover:text-slate-200 text-xs font-semibold uppercase tracking-wider text-center mt-2 hover:underline"
          >
            Back to Password Sign In
          </button>
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="BankPortal" subtitle="Secure Digital Gateway" activeTab="login" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="focus-glow text-left">
          <label className="label">Username or Email</label>
          <div className="relative group">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-cyan-400 transition-colors" />
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

        <div className="focus-glow text-left">
          <div className="flex justify-between items-center mb-2">
            <label className="label mb-0">Password</label>
            <Link to="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 font-bold hover:underline tracking-wider uppercase">
              Forgot?
            </Link>
          </div>
          <div className="relative group">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-cyan-400 transition-colors" />
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

      {/* Demo Accounts Panel */}
      <div className="mt-8 pt-6 border-t border-white/5">
        <p className="text-[10px] font-bold text-cyan-400/80 uppercase tracking-widest mb-4 text-center">
          Quick Access Demo Portals
        </p>
        <div className="space-y-3">
          <div className="flex justify-between items-center bg-[#060e17] border border-[#1c3554]/30 p-3.5 rounded-2xl">
            <span className="font-extrabold text-xs text-slate-300 uppercase tracking-wider">Manager Access</span>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin', 'Admin@123')}
              className="py-2 px-3.5 bg-[#0c192c] border border-[#1c3554] hover:bg-[#13263e] hover:border-[#2b4c75] text-slate-300 hover:text-white rounded-xl text-xs font-mono transition-all duration-200 active:scale-[0.97]"
            >
              admin / Admin@123
            </button>
          </div>
          <div className="bg-[#060e17] border border-[#1c3554]/30 p-3.5 rounded-2xl">
            <span className="font-extrabold text-xs text-slate-300 block mb-2 text-left uppercase tracking-wider">Customer Portals</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('rahul.sharma', 'Customer@123')}
                className="py-2 px-3.5 bg-[#0c192c] border border-[#1c3554] hover:bg-[#13263e] hover:border-[#2b4c75] text-slate-300 hover:text-white rounded-xl text-xs font-mono transition-all duration-200 active:scale-[0.97]"
              >
                rahul.sharma
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('priya.patel', 'Customer@123')}
                className="py-2 px-3.5 bg-[#0c192c] border border-[#1c3554] hover:bg-[#13263e] hover:border-[#2b4c75] text-slate-300 hover:text-white rounded-xl text-xs font-mono transition-all duration-200 active:scale-[0.97]"
              >
                priya.patel
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('Aadarsh', 'Aadarsh@123')}
                className="py-2 px-3.5 bg-[#0c192c] border border-[#1c3554] hover:bg-[#13263e] hover:border-[#2b4c75] text-slate-300 hover:text-white rounded-xl text-xs font-mono transition-all duration-200 active:scale-[0.97]"
              >
                Aadarsh
              </button>
            </div>
            <p className="text-[9px] text-slate-500 mt-2.5 italic text-left tracking-wide font-medium">Authentication Key: Customer@123 (Aadarsh@123 for client Aadarsh)</p>
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
    <div key={key} className="space-y-1.5 focus-glow text-left">
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
    <AuthLayout title="Register" subtitle="Open a New Digital Account" activeTab="register" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {renderField('First Name', 'firstName', 'text', 'Rahul')}
        {renderField('Last Name', 'lastName', 'text', 'Sharma')}
        {renderField('Username', 'username', 'text', 'rahul.sharma')}
        {renderField('Email', 'email', 'email', 'rahul@email.com')}
        {renderField('Phone', 'phone', 'tel', '9876543210', '10-digit number')}
        {renderField('Password', 'password', 'password', 'Min 8 characters', 'Alphanumeric + symbol')}

        <div className="md:col-span-2 space-y-1.5 focus-glow text-left">
          <label className="label">Gender</label>
          <select
            value={form.gender}
            onChange={set('gender')}
            className="glass-input cursor-pointer"
          >
            <option value="MALE" className="bg-slate-950">Male</option>
            <option value="FEMALE" className="bg-slate-950">Female</option>
            <option value="OTHER" className="bg-slate-950">Other</option>
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
    </AuthLayout>
  );
}

// ── Forgot Password Page ────────────────────────────────────
export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      toast.success('Reset OTP generated! Check server logs.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error requesting reset');
    } finally {
      setLoading(false);
    }
  }

  async function handleResetSubmit(e) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ token: otp, newPassword });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Reset Password" subtitle="Recover Your Portal Account" maxWidth="max-w-md">
      {sent ? (
        <form onSubmit={handleResetSubmit} className="space-y-5">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 rounded-xl text-[10px] text-center font-semibold uppercase tracking-wider">
            OTP generated. Please check your server console logs for the reset code.
          </div>
          
          <div className="focus-glow text-left">
            <label className="label">One-Time Password (OTP)</label>
            <div className="relative group">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-cyan-400 transition-colors" />
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="glass-input pl-11 tracking-widest text-center font-mono text-lg font-bold"
                placeholder="000000"
              />
            </div>
          </div>

          <div className="focus-glow text-left">
            <label className="label">New Password</label>
            <div className="relative group">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-cyan-400 transition-colors" />
              <input
                type={showPwd ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="glass-input pl-11 pr-10 font-mono"
                placeholder="New Password (min 8 chars)"
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

          <div className="focus-glow text-left">
            <label className="label">Confirm New Password</label>
            <div className="relative group">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-cyan-400 transition-colors" />
              <input
                type={showConfirmPwd ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="glass-input pl-11 pr-10 font-mono"
                placeholder="Confirm New Password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPwd(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showConfirmPwd ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 group"
          >
            {loading ? 'Resetting password...' : (
              <>
                Reset Password <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={() => setSent(false)}
            className="w-full text-slate-400 hover:text-slate-200 text-xs font-semibold uppercase tracking-wider text-center mt-2 hover:underline"
          >
            Back
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="focus-glow text-left">
            <label className="label">Registered Email Address</label>
            <div className="relative group">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-cyan-400 transition-colors" />
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
            {loading ? 'Sending OTP...' : (
              <>
                Send Reset OTP <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}

      <p className="text-center mt-6 text-sm font-medium">
        <Link to="/login" className="text-cyan-400 hover:text-cyan-300 hover:underline tracking-wider uppercase text-xs font-bold">
          Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
}

// ── Reset Password Page ──────────────────────────────────────
export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      toast.error('Reset token is missing from the link.');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, newPassword });
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error resetting password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Choose New Password" subtitle="Update Your Password Securely" maxWidth="max-w-md">
      {success ? (
        <div className="text-center bg-[#060e17] border border-[#1c3554]/30 p-6 rounded-2xl space-y-4">
          <div className="inline-flex p-3.5 bg-green-500/10 text-green-400 rounded-full mb-1">
            <FaCheckCircle className="text-4xl" />
          </div>
          <p className="text-green-300 font-bold text-lg">Password Changed</p>
          <p className="text-slate-400 text-xs leading-relaxed">
            Your password has been successfully reset. Redirecting you to login in a few seconds...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {!token && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs text-center font-semibold animate-pulse">
              Warning: Reset token is missing. This submission might fail.
            </div>
          )}
          <div className="focus-glow text-left">
            <label className="label">New Password</label>
            <div className="relative group">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-cyan-400 transition-colors" />
              <input
                type={showPwd ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="glass-input pl-11 pr-10 font-mono"
                placeholder="New Password (min 8 chars)"
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

          <div className="focus-glow text-left">
            <label className="label">Confirm New Password</label>
            <div className="relative group">
              <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm group-focus-within:text-cyan-400 transition-colors" />
              <input
                type={showConfirmPwd ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="glass-input pl-11 pr-10 font-mono"
                placeholder="Confirm New Password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPwd(s => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showConfirmPwd ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 group"
          >
            {loading ? 'Resetting password...' : (
              <>
                Reset Password <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      )}

      <p className="text-center mt-6 text-sm font-medium">
        <Link to="/login" className="text-cyan-400 hover:text-cyan-300 hover:underline tracking-wider uppercase text-xs font-bold">
          Back to Login
        </Link>
      </p>
    </AuthLayout>
  );
}

