// ============================================================
// src/pages/MainPages.jsx — Premium Glassmorphic Edition
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import {
  FaCreditCard,
  FaDownload,
  FaExchangeAlt,
  FaHandHoldingUsd,
  FaPlus,
  FaTimesCircle,
  FaUniversity,
  FaFileAlt,
  FaCalendarAlt,
  FaArrowRight,
  FaInfoCircle
} from 'react-icons/fa';
import { useAuth } from '../context/Contexts';
import { accountApi, loanApi, txnApi } from '../services/api';

Chart.register(...registerables);

function StatCard({ title, value, icon, color, link }) {
  return (
    <Link to={link} className="glass-card glass-card-hover border-l-4 border-blue-500 block relative overflow-hidden group">
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-black text-white mt-2 tracking-tight">{value}</p>
        </div>
        <span className={`text-2xl p-3 rounded-2xl bg-white/5 ${color} transition-transform duration-300 group-hover:scale-110`}>
          {icon}
        </span>
      </div>
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/[0.01] rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
    </Link>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      accountApi.getAll().then(r => setAccounts(r.data.data || [])),
      txnApi.getHistory(0, 10).then(r => setTransactions(r.data.data?.content || [])),
      loanApi.getLoans().then(r => setLoans(r.data.data || []))
    ]).catch((err) => {
      toast.error(err.response?.data?.message || 'Failed to fetch dashboard metrics');
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  const lineData = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun'],
    datasets: [{
      label: 'Spending (₹)',
      data: [12000,19000,8000,22000,15000,18000],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.05)',
      fill: true, tension: 0.4
    }]
  };

  const donutData = {
    labels: accounts.map(a => a.accountType),
    datasets: [{ 
      data: accounts.map(a => a.balance), 
      backgroundColor: ['#3b82f6','#10b981','#f59e0b','#ef4444'],
      borderWidth: 0
    }]
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Welcome back, {user?.firstName}! 👋</h1>
        <p className="text-slate-400 text-xs mt-1 uppercase tracking-wider font-semibold">Financial Overview & Dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Balance" value={`₹${totalBalance.toLocaleString('en-IN')}`}
          icon={<FaUniversity />} color="text-blue-400" link="/accounts"/>
        <StatCard title="Active Accounts" value={accounts.length}
          icon={<FaUniversity />} color="text-green-400" link="/accounts"/>
        <StatCard title="Recent Txns" value={transactions.length}
          icon={<FaExchangeAlt />} color="text-yellow-400" link="/transactions"/>
        <StatCard title="Active Loans" value={loans.filter(l => l.status==='ACTIVE').length}
          icon={<FaHandHoldingUsd />} color="text-red-400" link="/loans"/>
      </div>

      {/* Opened Bank Accounts */}
      <div className="glass-card">
        <h2 className="font-extrabold text-white text-lg mb-6 flex items-center gap-2">
          <FaUniversity className="text-blue-500" /> Opened Bank Accounts
        </h2>
        {accounts.length === 0 ? (
          <div className="text-center py-10">
            <FaUniversity className="text-4xl mx-auto mb-2 text-slate-600" />
            <p className="text-slate-400 text-sm">No opened bank accounts found</p>
            <Link to="/accounts" className="text-xs text-blue-400 mt-2 inline-block hover:underline">Open one now →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {accounts.map(acc => (
              <div key={acc.id} className="border border-white/5 rounded-3xl p-5 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex flex-col justify-between group shadow-lg">
                <div>
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">{acc.accountType}</p>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      acc.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                    }`}>{acc.status}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-1.5">{acc.accountNumber}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{acc.branchName}</p>
                </div>
                <div className="mt-6 flex justify-between items-end border-t border-white/5 pt-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Available Balance</p>
                    <p className="text-lg font-black text-blue-400">₹{acc.availableBalance?.toLocaleString('en-IN')}</p>
                  </div>
                  <Link to="/accounts" className="text-xs text-blue-400 hover:text-blue-300 font-bold hover:underline">Manage →</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card">
          <h2 className="font-extrabold text-white text-base mb-4">Spending Trend</h2>
          <div className="h-[250px] flex items-center justify-center">
            <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
        <div className="glass-card flex flex-col justify-between">
          <h2 className="font-extrabold text-white text-base mb-4">Account Distribution</h2>
          <div className="flex-1 flex items-center justify-center p-2">
            {accounts.length > 0
              ? <div className="max-w-[180px] w-full"><Doughnut data={donutData} options={{ responsive: true, plugins: { legend: { display: false } } }} /></div>
              : <p className="text-slate-500 text-center text-sm">No accounts yet</p>
            }
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-extrabold text-white text-lg">Recent Transactions</h2>
          <Link to="/transactions" className="text-blue-400 text-xs font-bold hover:underline">View All</Link>
        </div>
        {transactions.length === 0
          ? <p className="text-slate-500 text-center py-8 text-sm">No recent transactions</p>
          : <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-slate-400 border-b border-white/5">
                  <th className="py-3 text-left font-bold text-xs uppercase tracking-wider">Ref No</th>
                  <th className="py-3 text-left font-bold text-xs uppercase tracking-wider">Type</th>
                  <th className="py-3 text-right font-bold text-xs uppercase tracking-wider">Amount</th>
                  <th className="py-3 text-left font-bold text-xs uppercase tracking-wider pl-6">Status</th>
                  <th className="py-3 text-left font-bold text-xs uppercase tracking-wider">Date</th>
                </tr></thead>
                <tbody className="divide-y divide-white/5">
                  {transactions.map(t => (
                    <tr key={t.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 font-mono text-xs text-slate-300">{t.transactionRef}</td>
                      <td className="py-3.5 text-xs font-bold uppercase tracking-wider text-slate-300">{t.transactionType}</td>
                      <td className="py-3.5 text-right font-black text-slate-100">₹{t.amount?.toLocaleString('en-IN')}</td>
                      <td className="py-3.5 pl-6">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          t.status==='SUCCESS' ? 'bg-green-500/10 text-green-400' :
                          t.status==='FAILED'  ? 'bg-red-500/10 text-red-400' :
                          'bg-yellow-500/10 text-yellow-400'}`}>{t.status}</span>
                      </td>
                      <td className="py-3.5 text-slate-400 text-xs">{new Date(t.initiatedAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>
    </div>
  );
}

// ============================================================
// src/pages/AccountsPage.jsx
// ============================================================

export function AccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [types, setTypes]       = useState([]);
  const [branches, setBranches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ accountTypeId: '', branchId: '', nomineeName: '' });
  const [passbookAccount, setPassbookAccount] = useState(null);
  const [passbookTxns, setPassbookTxns] = useState([]);
  const [loadingPassbook, setLoadingPassbook] = useState(false);

  async function openPassbook(acc) {
    setPassbookAccount(acc);
    setLoadingPassbook(true);
    try {
      const res = await txnApi.getByAccount(acc.id);
      setPassbookTxns(res.data.data || []);
    } catch {
      toast.error("Failed to load passbook details");
    } finally {
      setLoadingPassbook(false);
    }
  }

  useEffect(() => {
    accountApi.getAll()
      .then(r => setAccounts(r.data.data || []))
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Error loading accounts list');
      });
    
    accountApi.getTypes().then(r => setTypes(r.data.data || [])).catch(() => {});
    accountApi.getBranches().then(r => setBranches(r.data.data || [])).catch(() => {});
  }, []);

  async function openAccount(e) {
    e.preventDefault();
    try {
      const res = await accountApi.open({ accountTypeId: +form.accountTypeId, branchId: +form.branchId, nomineeName: form.nomineeName });
      toast.success('Account opened successfully!');
      setShowForm(false);
      setForm({ accountTypeId: '', branchId: '', nomineeName: '' });
      
      const newAcc = res.data?.data;
      if (newAcc) {
        setAccounts(prev => {
          if (prev.some(a => a.id === newAcc.id)) return prev;
          return [...prev, newAcc];
        });
      }
      
      accountApi.getAll().then(r => setAccounts(r.data.data || [])).catch(() => {});
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to open account'); }
  }

  async function downloadStatement(accId) {
    try {
      const res = await accountApi.getStatement({ accountId: accId, fromDate: '2024-01-01', toDate: new Date().toISOString().split('T')[0] });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a   = document.createElement('a'); a.href = url; a.download = `statement-${accId}.pdf`; a.click();
    } catch { toast.error('Failed to download statement'); }
  }

  const statusColor = { 
    ACTIVE:'bg-green-500/10 text-green-400', 
    PENDING:'bg-yellow-500/10 text-yellow-400', 
    FROZEN:'bg-blue-500/10 text-blue-400', 
    CLOSED:'bg-red-500/10 text-red-400' 
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white">My Accounts</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Manage and view your banking options</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2 text-sm">
          <FaPlus /> Open Account
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-frosted rounded-[2.5rem] p-8 w-full max-w-md modal-transition border border-white/10 shadow-2xl">
            <h2 className="font-extrabold text-xl text-white mb-6">Open New Account</h2>
            <form onSubmit={openAccount} className="space-y-5">
              <div>
                <label className="label">Account Type</label>
                <select required value={form.accountTypeId} onChange={e => setForm(f => ({...f, accountTypeId: e.target.value}))}
                  className="w-full bg-slate-900/60 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl px-4 py-3 text-white focus:outline-none transition-all duration-300 text-sm cursor-pointer">
                  <option value="" className="bg-slate-950">Select account type</option>
                  {types.map(t => <option key={t.id} value={t.id} className="bg-slate-950">{t.typeName}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Preferred Branch</label>
                <select required value={form.branchId} onChange={e => setForm(f => ({...f, branchId: e.target.value}))}
                  className="w-full bg-slate-900/60 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl px-4 py-3 text-white focus:outline-none transition-all duration-300 text-sm cursor-pointer">
                  <option value="" className="bg-slate-950">Select branch</option>
                  {branches.map(b => <option key={b.id} value={b.id} className="bg-slate-950">{b.branchName} — {b.city}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Nominee Name</label>
                <input value={form.nomineeName} onChange={e => setForm(f => ({...f, nomineeName: e.target.value}))}
                  placeholder="Enter nominee full name"
                  className="glass-input" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 btn-primary text-sm">Submit</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accounts.map(acc => (
          <div key={acc.id} className="glass-card glass-card-hover flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Account Number</p>
                  <p className="font-mono text-sm font-semibold text-slate-200">{acc.accountNumber}</p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor[acc.status]||'bg-white/5 text-slate-400'}`}>{acc.status}</span>
              </div>
              
              <div className="bg-gradient-to-r from-blue-600/90 to-indigo-600/90 rounded-2xl p-5 text-white shadow-lg shadow-indigo-600/10">
                <p className="text-[10px] opacity-75 uppercase tracking-wider font-semibold">Available Balance</p>
                <p className="text-3xl font-black mt-1">₹{acc.availableBalance?.toLocaleString('en-IN')}</p>
                <p className="text-xs font-medium mt-3 opacity-90">{acc.accountType}</p>
              </div>

              <div className="text-xs text-slate-400 space-y-2 border-t border-white/5 pt-4">
                <div className="flex justify-between"><span className="text-slate-500">Branch</span><span className="font-semibold text-slate-300">{acc.branchName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">IFSC Code</span><span className="font-mono text-slate-300">{acc.ifscCode}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Opened On</span><span className="text-slate-300">{acc.openedAt}</span></div>
              </div>
            </div>

            <div className="flex gap-3 border-t border-white/5 pt-4 mt-6">
              <button onClick={() => downloadStatement(acc.id)}
                className="flex-1 flex items-center justify-center gap-1.5 border border-white/10 hover:bg-white/5 text-xs font-semibold py-2 rounded-xl text-slate-300 transition-colors">
                <FaDownload /> Statement
              </button>
              <button onClick={() => openPassbook(acc)}
                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-xs font-semibold py-2 rounded-xl text-white transition-all">
                <FaFileAlt /> Passbook
              </button>
            </div>
          </div>
        ))}
        {accounts.length === 0 && (
          <div className="col-span-3 glass-card text-center py-20">
            <FaUniversity className="text-6xl mx-auto mb-4 text-slate-700 animate-pulse" />
            <p className="text-slate-400 font-bold">No accounts yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Open your first digital savings or business account in seconds!</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mt-6 text-sm">Open Account Now</button>
          </div>
        )}
      </div>

      {passbookAccount && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-frosted rounded-[2.5rem] p-6 sm:p-8 w-full max-w-4xl max-h-[85vh] flex flex-col modal-transition border border-white/10 shadow-2xl">
            <div className="flex justify-between items-start border-b border-white/5 pb-4 mb-4 flex-shrink-0">
              <div>
                <h2 className="font-extrabold text-lg text-white flex items-center gap-2">
                  <FaFileAlt className="text-blue-500" /> Account Passbook
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  {passbookAccount.accountNumber} ({passbookAccount.accountType})
                </p>
              </div>
              <button 
                onClick={() => setPassbookAccount(null)}
                className="text-slate-400 hover:text-white text-2xl font-bold transition-colors"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 pr-1">
              {loadingPassbook ? (
                <div className="text-center py-16 text-slate-400">
                  <div className="spinner mx-auto mb-4" />
                  Loading passbook entries...
                </div>
              ) : passbookTxns.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <FaExchangeAlt className="text-4xl mx-auto mb-3 text-slate-700" />
                  <p>No transaction history for this account yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-white/5 rounded-2xl shadow-inner">
                  <table className="w-full text-sm border-collapse">
                    <thead className="bg-white/[0.02] sticky top-0">
                      <tr className="border-b border-white/5 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <th className="px-4 py-3">Date & Time</th>
                        <th className="px-4 py-3">Reference No</th>
                        <th className="px-4 py-3">Particulars</th>
                        <th className="px-4 py-3 text-right">Debit (Dr)</th>
                        <th className="px-4 py-3 text-right">Credit (Cr)</th>
                        <th className="px-4 py-3 text-right">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {passbookTxns.map(t => {
                        const isCredit = t.transactionType === 'DEPOSIT' || t.transactionType === 'UPI_CREDIT' || t.transactionType === 'INTEREST_CREDIT' || t.toAccount === passbookAccount.accountNumber;
                        const isDebit = t.transactionType === 'WITHDRAWAL' || t.transactionType === 'UPI_DEBIT' || t.transactionType === 'EMI_DEBIT' || t.transactionType === 'CHARGE' || t.fromAccount === passbookAccount.accountNumber;
                        return (
                          <tr key={t.id} className="hover:bg-white/[0.01] transition-colors">
                            <td className="px-4 py-3.5 text-xs text-slate-400">
                              {new Date(t.initiatedAt).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                            <td className="px-4 py-3.5 font-mono text-xs text-slate-300">{t.transactionRef}</td>
                            <td className="px-4 py-3.5 text-xs">
                              <span className="font-bold block uppercase text-slate-200">
                                {t.transactionType.replace('_', ' ')}
                              </span>
                              <span className="text-slate-500 text-[10px] block mt-0.5">{t.description}</span>
                            </td>
                            <td className="px-4 py-3.5 text-right text-red-400 font-bold font-mono text-xs">
                              {isDebit ? `₹${t.amount?.toLocaleString('en-IN')}` : '—'}
                            </td>
                            <td className="px-4 py-3.5 text-right text-green-400 font-bold font-mono text-xs">
                              {isCredit ? `₹${t.amount?.toLocaleString('en-IN')}` : '—'}
                            </td>
                            <td className="px-4 py-3.5 text-right font-bold font-mono text-xs text-white">
                              ₹{t.balanceAfter?.toLocaleString('en-IN') || '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-4 mt-4 flex justify-end gap-2 flex-shrink-0">
              <button 
                onClick={() => setPassbookAccount(null)}
                className="btn-secondary py-2 px-5 text-sm"
              >
                Close Passbook
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// src/pages/TransferPage.jsx
// ============================================================

export function TransferPage() {
  const [accounts, setAccounts] = useState([]);
  const [form, setForm] = useState({ fromAccountId: '', toAccountNumber: '', amount: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeTab, setActiveTab] = useState('transfer');

  useEffect(() => { 
    accountApi.getAll()
      .then(r => setAccounts(r.data.data?.filter(a => a.status==='ACTIVE') || []))
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Error fetching active accounts');
      }); 
  }, []);

  async function handleTransfer(e) {
    e.preventDefault(); setLoading(true);
    try {
      const res = await txnApi.transfer({ ...form, fromAccountId: +form.fromAccountId, amount: +form.amount });
      setResult(res.data.data);
      toast.success('Transfer successful!');
      setForm(f => ({ ...f, amount: '', description: '', toAccountNumber: '' }));
    } catch (err) { toast.error(err.response?.data?.message || 'Transfer failed'); }
    finally { setLoading(false); }
  }

  async function handleDeposit(e) {
    e.preventDefault(); setLoading(true);
    try {
      await txnApi.deposit({ accountId: +form.fromAccountId, amount: +form.amount, description: form.description });
      toast.success('Deposit successful!');
      setForm(f => ({ ...f, amount: '', description: '' }));
      // Reload balances
      accountApi.getAll().then(r => setAccounts(r.data.data?.filter(a => a.status==='ACTIVE') || []));
    } catch (err) { toast.error(err.response?.data?.message || 'Deposit failed'); }
    finally { setLoading(false); }
  }

  async function handleWithdraw(e) {
    e.preventDefault(); setLoading(true);
    try {
      await txnApi.withdraw({ accountId: +form.fromAccountId, amount: +form.amount, description: form.description });
      toast.success('Withdrawal successful!');
      setForm(f => ({ ...f, amount: '', description: '' }));
      // Reload balances
      accountApi.getAll().then(r => setAccounts(r.data.data?.filter(a => a.status==='ACTIVE') || []));
    } catch (err) { toast.error(err.response?.data?.message || 'Withdrawal failed'); }
    finally { setLoading(false); }
  }

  const tabs = ['transfer','deposit','withdraw'];
  const handlers = { transfer: handleTransfer, deposit: handleDeposit, withdraw: handleWithdraw };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">Money Transfer</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Perform instant transfers, deposits, or withdrawals</p>
      </div>

      <div className="flex rounded-2xl bg-white/5 border border-white/5 p-1">
        {tabs.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setResult(null); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-300
              ${activeTab===tab ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="glass-card">
        <form onSubmit={handlers[activeTab]} className="space-y-5">
          <div>
            <label className="label">
              {activeTab === 'transfer' ? 'Source Account' : 'Account'}
            </label>
            <select required value={form.fromAccountId} onChange={e => setForm(f => ({...f, fromAccountId: e.target.value}))}
              className="w-full bg-slate-900/60 border border-white/10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-2xl px-4 py-3 text-white focus:outline-none transition-all duration-300 text-sm cursor-pointer">
              <option value="" className="bg-slate-950">Select account</option>
              {accounts.map(a => <option key={a.id} value={a.id} className="bg-slate-950">{a.accountNumber} — Balance: ₹{a.balance?.toLocaleString('en-IN')}</option>)}
            </select>
          </div>

          {activeTab === 'transfer' && (
            <div>
              <label className="label">Destination Account Number</label>
              <input required value={form.toAccountNumber} onChange={e => setForm(f => ({...f, toAccountNumber: e.target.value}))}
                placeholder="Enter recipient account number"
                className="glass-input" />
            </div>
          )}

          <div>
            <label className="label">Amount (₹)</label>
            <input type="number" required min="1" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))}
              placeholder="Enter transaction amount"
              className="glass-input" />
          </div>

          <div>
            <label className="label">Description / Remarks (Optional)</label>
            <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
              placeholder="What's this for?"
              className="glass-input" />
          </div>

          <button type="submit" disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 group mt-2"
          >
            {loading ? 'Processing transaction...' : (
              <>
                <FaExchangeAlt /> {activeTab.charAt(0).toUpperCase()+activeTab.slice(1)} Funds
              </>
            )}
          </button>
        </form>

        {result && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex gap-3 items-start animate-fade-in">
            <span className="text-green-400 mt-1"><FaInfoCircle /></span>
            <div>
              <p className="text-green-400 font-bold text-sm">Transaction Complete</p>
              <p className="text-slate-300 text-xs mt-1 font-mono">Reference ID: {result.transactionRef}</p>
              <p className="text-slate-300 text-xs mt-0.5">Amount Processed: ₹{result.amount?.toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
