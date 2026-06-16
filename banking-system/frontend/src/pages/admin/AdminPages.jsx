// ============================================================
// src/pages/admin/AdminDashboard.jsx
// ============================================================
import {
  FaUsers, FaUniversity, FaExchangeAlt, FaHandHoldingUsd,
  FaIdCard, FaCodeBranch, FaCheckCircle, FaClock
} from 'react-icons/fa';

import { useState, useEffect } from 'react';

import { adminApi } from '../../services/api';

import { Bar, Line, Doughnut } from 'react-chartjs-2';

import { Chart, registerables } from 'chart.js';

import { toast } from 'react-toastify';

import { FaSearch, FaLock, FaUnlock, FaUserCheck, FaUserTimes } from 'react-icons/fa';

import { FaCheck, FaTimes } from 'react-icons/fa';


Chart.register(...registerables);

function StatCard({ icon, label, value, color, sub }) {
  return (
    <div className={`glass-card glass-card-hover border-l-4 ${color} relative overflow-hidden group`}>
      <div className="flex justify-between items-start z-10 relative">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-black text-white mt-2 tracking-tight">{value ?? '—'}</p>
          {sub && <p className="text-xs text-cyan-400 font-bold mt-1.5">{sub}</p>}
        </div>
        <span className="text-2xl p-3 rounded-2xl bg-white/5 transition-transform duration-300 group-hover:scale-110">
          {icon}
        </span>
      </div>
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/[0.01] rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
    </div>
  );
}

export function AdminDashboard() {
  const [stats, setStats]     = useState(null);
  const [report, setReport]   = useState(null);
  const [loading, setLoading] = useState(true);

  const today   = new Date().toISOString().split('T')[0];
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0];

  useEffect(() => {
    Promise.all([
      adminApi.getDashboard(),
      adminApi.getSummaryReport(weekAgo, today)
    ]).then(([s, r]) => {
      setStats(s.data.data);
      setReport(r.data.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const barData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Transactions',
      data: [120, 190, 150, 210, 180, 90, 60],
      backgroundColor: 'rgba(59,130,246,0.7)',
      borderRadius: 6,
    }]
  };

  const lineData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'New Customers',
      data: [30, 55, 40, 70, 60, 85],
      borderColor: '#10b981',
      backgroundColor: 'rgba(16,185,129,0.1)',
      fill: true,
      tension: 0.4,
    }]
  };

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="spinner" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">System overview & key metrics</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={<FaUsers className="text-cyan-400"/>}   label="Total Customers"  value={stats?.totalCustomers}        color="border-cyan-400" />
        <StatCard icon={<FaUniversity className="text-green-400"/>} label="Total Accounts" value={stats?.totalAccounts}      color="border-green-400" />
        <StatCard icon={<FaExchangeAlt className="text-purple-400"/>} label="Txns Today"  value={stats?.totalTransactionsToday} color="border-purple-400" sub={`₹${Number(stats?.totalTransactionValueToday||0).toLocaleString('en-IN')}`} />
        <StatCard icon={<FaHandHoldingUsd className="text-orange-400"/>} label="Active Loans" value={stats?.activeLoans}    color="border-orange-400" />
        <StatCard icon={<FaClock className="text-yellow-400"/>}  label="Pending KYC"    value={stats?.pendingKycVerifications} color="border-yellow-400" />
        <StatCard icon={<FaCheckCircle className="text-teal-400"/>} label="Pending Loans" value={stats?.pendingLoanApplications} color="border-teal-400" />
        <StatCard icon={<FaCodeBranch className="text-red-400"/>} label="Branches"       value={stats?.totalBranches}         color="border-red-400" />
        <StatCard icon={<FaIdCard className="text-cyan-400"/>} label="New Customers (7d)" value={report?.newCustomers}       color="border-cyan-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card">
          <h2 className="font-extrabold text-white text-base mb-4">Weekly Transaction Volume</h2>
          <Bar data={barData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
        <div className="glass-card">
          <h2 className="font-extrabold text-white text-base mb-4">Customer Growth</h2>
          <Line data={lineData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>
      </div>

      {report && (
        <div className="glass-card">
          <h2 className="font-extrabold text-white text-base mb-6">7-Day Summary Report ({weekAgo} → {today})</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div><p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Transactions</p><p className="text-2xl font-black text-white mt-1">{report.totalTransactions}</p></div>
            <div><p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Amount</p><p className="text-2xl font-black text-cyan-400 mt-1">₹{Number(report.totalAmount||0).toLocaleString('en-IN')}</p></div>
            <div><p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">New Accounts</p><p className="text-2xl font-black text-white mt-1">{report.newAccounts}</p></div>
            <div><p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">New Customers</p><p className="text-2xl font-black text-white mt-1">{report.newCustomers}</p></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// src/pages/admin/AdminCustomers.jsx
// ============================================================

export function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [page, setPage]           = useState(0);
  const [total, setTotal]         = useState(0);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(false);

  useEffect(() => { load(); }, [page, search]);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getCustomers(page, 15, search);
      const d   = res.data.data;
      setCustomers(d?.content || []);
      setTotal(d?.totalPages || 0);
    } catch { toast.error('Failed to load'); }
    finally { setLoading(false); }
  }

  async function action(fn, msg) {
    try { await fn(); toast.success(msg); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold dark:text-white">Customer Management</h1>

      <div className="relative max-w-xs group">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-cyan-400 transition-colors" />
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
          placeholder="Search by name or email..."
          className="glass-input pl-11" />
      </div>

      <div className="glass-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]">
              <tr className="text-slate-400 border-b border-white/5">{['Name','Email','Phone','KYC','Status','Locked','Joined','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No customers found</td></tr>
              ) : customers.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 text-xs font-bold border border-cyan-500/20">
                        {c.firstName?.[0]}{c.lastName?.[0]}
                      </div>
                      <span className="font-semibold text-white">{c.firstName} {c.lastName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.email}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{c.phone}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.kycStatus === 'VERIFIED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                      {c.kycStatus || 'PENDING'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {c.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.isLocked ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                      {c.isLocked ? 'Locked' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {c.isActive
                        ? <button onClick={() => action(() => adminApi.deactivateCustomer(c.id), 'Customer deactivated')} title="Deactivate" className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"><FaUserTimes /></button>
                        : <button onClick={() => action(() => adminApi.activateCustomer(c.id), 'Customer activated')} title="Activate" className="p-1.5 text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"><FaUserCheck /></button>
                      }
                      {c.isLocked && (
                        <button onClick={() => action(() => adminApi.unlockCustomer(c.id), 'Customer unlocked')} title="Unlock" className="p-1.5 text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded"><FaUnlock /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-white/5">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-4 text-xs">Previous</button>
            <span className="text-xs text-slate-400 font-semibold">Page {page + 1} of {total}</span>
            <button disabled={page >= total - 1} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-4 text-xs">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// src/pages/admin/AdminLoans.jsx
// ============================================================

export function AdminLoans() {
  const [loans, setLoans]   = useState([]);
  const [page, setPage]     = useState(0);
  const [total, setTotal]   = useState(0);
  const [modal, setModal]   = useState(null); // { id, decision }
  const [remarks, setRemarks] = useState('');

  useEffect(() => { load(); }, [page]);

  async function load() {
    try {
      const res = await adminApi.getPendingLoans(page);
      const d   = res.data.data;
      setLoans(d?.content || []);
      setTotal(d?.totalPages || 0);
    } catch { toast.error('Failed to load'); }
  }

  async function review() {
    if (!modal) return;
    try {
      await adminApi.reviewLoan({ applicationId: modal.id, decision: modal.decision, remarks });
      toast.success(`Loan ${modal.decision.toLowerCase()} successfully`);
      setModal(null); setRemarks('');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold dark:text-white">Loan Approvals</h1>

      <div className="glass-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]">
              <tr className="text-slate-400 border-b border-white/5">{['App No','Customer','Loan Type','Amount','Tenure','EMI Est.','Income','Employment','Submitted','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loans.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-12 text-gray-400">No pending loan applications</td></tr>
              ) : loans.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-mono text-xs dark:text-gray-300">{l.applicationNo}</td>
                  <td className="px-4 py-3 dark:text-white font-medium">{l.customerName || '—'}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{l.loanType}</td>
                  <td className="px-4 py-3 font-semibold dark:text-white">₹{Number(l.amountRequested||0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{l.tenureMonths}m</td>
                  <td className="px-4 py-3 dark:text-gray-300">₹{Number(l.emiEstimate||0).toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{l.annualIncome ? `₹${Number(l.annualIncome).toLocaleString('en-IN')}` : '—'}</td>
                  <td className="px-4 py-3 dark:text-gray-300 text-xs">{l.employmentType || '—'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{l.submittedAt ? new Date(l.submittedAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => { setModal({ id: l.id, decision: 'APPROVED' }); setRemarks(''); }}
                        className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 rounded text-xs font-medium">
                        <FaCheck /> Approve
                      </button>
                      <button onClick={() => { setModal({ id: l.id, decision: 'REJECTED' }); setRemarks(''); }}
                        className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-medium">
                        <FaTimes /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-white/5">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-4 text-xs">Previous</button>
            <span className="text-xs text-slate-400 font-semibold">Page {page + 1} of {total}</span>
            <button disabled={page >= total - 1} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-4 text-xs">Next</button>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-frosted rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-white/10 modal-transition">
            <h2 className="font-extrabold text-xl text-white mb-2">
              {modal.decision === 'APPROVED' ? '✅ Approve Loan' : '❌ Reject Loan'}
            </h2>
            <p className="text-xs text-slate-400 mb-6 leading-relaxed">
              Are you sure you want to <strong>{modal.decision.toLowerCase()}</strong> this loan application?
            </p>
            <label className="label">Remarks (optional)</label>
            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3}
              placeholder="Add remarks for the customer..."
              className="glass-input mb-6" />
            <div className="flex gap-3">
              <button onClick={review}
                className={`flex-1 py-3.5 rounded-2xl text-white font-bold text-sm transition-all active:scale-[0.98] ${modal.decision === 'APPROVED' ? 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/20' : 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20'}`}>
                Confirm {modal.decision}
              </button>
              <button onClick={() => setModal(null)} className="flex-1 btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// src/pages/admin/AdminKyc.jsx
// ============================================================

export function AdminKyc() {
  const [list, setList]     = useState([]);
  const [page, setPage]     = useState(0);
  const [total, setTotal]   = useState(0);
  const [modal, setModal]   = useState(null);
  const [remarks, setRemarks] = useState('');
  const [decision, setDecision] = useState('VERIFIED');

  useEffect(() => { load(); }, [page]);

  async function load() {
    try {
      const res = await adminApi.getPendingKyc(page);
      const d   = res.data.data;
      setList(d?.content || []);
      setTotal(d?.totalPages || 0);
    } catch { toast.error('Failed to load KYC list'); }
  }

  async function review() {
    try {
      await adminApi.verifyKyc(modal.kycId, { status: decision, remarks });
      toast.success(`KYC ${decision.toLowerCase()}`);
      setModal(null); setRemarks('');
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold dark:text-white">KYC Verification</h1>

      <div className="glass-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]">
              <tr className="text-slate-400 border-b border-white/5">{['Customer','Email','Aadhaar','PAN','City','State','Submitted','Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {list.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">No pending KYC verifications</td></tr>
              ) : list.map(k => (
                <tr key={k.kycId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-medium dark:text-white">{k.name}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{k.email}</td>
                  <td className="px-4 py-3 font-mono text-xs dark:text-gray-300">{k.aadhaar}</td>
                  <td className="px-4 py-3 font-mono text-xs dark:text-gray-300">{k.pan}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{k.city}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{k.state}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">{k.submittedAt ? new Date(k.submittedAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button onClick={() => { setModal(k); setDecision('VERIFIED'); setRemarks(''); }}
                        className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 hover:bg-green-200 rounded text-xs font-medium">
                        <FaCheck /> Verify
                      </button>
                      <button onClick={() => { setModal(k); setDecision('REJECTED'); setRemarks(''); }}
                        className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 hover:bg-red-200 rounded text-xs font-medium">
                        <FaTimes /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-white/5">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-4 text-xs">Previous</button>
            <span className="text-xs text-slate-400 font-semibold">Page {page + 1} of {total}</span>
            <button disabled={page >= total - 1} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-4 text-xs">Next</button>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-frosted rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl border border-white/10 modal-transition">
            <h2 className="font-extrabold text-xl text-white mb-1">Review KYC — {modal.name}</h2>
            <p className="text-xs text-slate-400 mb-6 font-mono">Aadhaar: {modal.aadhaar} | PAN: {modal.pan}</p>
            <div className="flex gap-3 mb-6">
              <button onClick={() => setDecision('VERIFIED')}
                className={`flex-1 py-3.5 rounded-2xl text-xs font-bold border transition-all active:scale-[0.98] ${decision==='VERIFIED' ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-500/10' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}>
                ✓ Verify
              </button>
              <button onClick={() => setDecision('REJECTED')}
                className={`flex-1 py-3.5 rounded-2xl text-xs font-bold border transition-all active:scale-[0.98] ${decision==='REJECTED' ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-500/10' : 'border-white/10 text-slate-400 hover:bg-white/5'}`}>
                ✕ Reject
              </button>
            </div>
            <label className="label">Remarks</label>
            <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3}
              className="glass-input mb-6"
              placeholder="Add review notes..." />
            <div className="flex gap-3">
              <button onClick={review} className="flex-1 btn-primary text-sm py-2">Submit</button>
              <button onClick={() => setModal(null)} className="flex-1 btn-secondary text-sm py-2">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// src/pages/admin/AdminTransactions.jsx
// ============================================================

export function AdminTransactions() {
  const [txns, setTxns]   = useState([]);
  const [page, setPage]   = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => { load(); }, [page]);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getAllTransactions(page);
      const d   = res.data.data;
      setTxns(d?.content || []);
      setTotal(d?.totalPages || 0);
    } catch { } finally { setLoading(false); }
  }

  const statusColor = {
    SUCCESS: 'bg-green-100 text-green-700', FAILED: 'bg-red-100 text-red-700',
    PENDING: 'bg-yellow-100 text-yellow-700', REVERSED: 'bg-gray-100 text-gray-600',
  };
  const typeColor = { DEPOSIT:'text-green-600', WITHDRAWAL:'text-red-600', TRANSFER:'text-blue-600' };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold dark:text-white">Transaction Monitoring</h1>

      <div className="glass-card p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="spinner" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02]">
                <tr className="text-slate-400 border-b border-white/5">{['Ref No','Type','Amount','From Account','To Account','Status','Channel','Date'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {txns.length === 0 ? (
                  <tr><td colSpan={8} className="text-center py-12 text-gray-400">No transactions</td></tr>
                ) : txns.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="px-4 py-3 font-mono text-xs dark:text-gray-300">{t.transactionRef}</td>
                    <td className={`px-4 py-3 font-medium ${typeColor[t.transactionType] || 'dark:text-gray-300'}`}>{t.transactionType?.replace('_',' ')}</td>
                    <td className="px-4 py-3 font-semibold dark:text-white">₹{Number(t.amount||0).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{t.fromAccount || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{t.toAccount || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[t.status] || ''}`}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs dark:text-gray-400">{t.channel}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{t.initiatedAt ? new Date(t.initiatedAt).toLocaleString('en-IN', {dateStyle:'short',timeStyle:'short'}) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {total > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t dark:border-gray-700">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-4 py-1.5 border rounded-lg text-sm disabled:opacity-40 dark:border-gray-600 dark:text-white">Previous</button>
            <span className="text-sm text-gray-500 dark:text-gray-400">Page {page + 1} of {total}</span>
            <button disabled={page >= total - 1} onClick={() => setPage(p => p + 1)} className="px-4 py-1.5 border rounded-lg text-sm disabled:opacity-40 dark:border-gray-600 dark:text-white">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminCards() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getPendingCards();
      setRequests(res.data.data || []);
    } catch {
      toast.error('Failed to load pending cards');
    } finally {
      setLoading(false);
    }
  }

  async function issueCard(id) {
    try {
      await adminApi.issueCard(id);
      toast.success('Card issued successfully');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue card');
    }
  }

  async function rejectCard(id) {
    if (!confirm('Reject this card request?')) return;
    try {
      await adminApi.rejectCard(id);
      toast.success('Card request rejected');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject card');
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold dark:text-white">ATM Card Requests</h1>

      <div className="glass-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]">
              <tr className="text-slate-400 border-b border-white/5">
                {['Cardholder Name','Account No','Card Type','Network','Status','Requested At','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No pending card requests</td></tr>
              ) : requests.map(r => (
                <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-semibold dark:text-white">{r.cardHolderName}</td>
                  <td className="px-4 py-3 font-mono text-xs dark:text-gray-300">{r.cardNumber}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{r.cardType}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{r.cardNetwork}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{r.requestedAt ? new Date(r.requestedAt).toLocaleString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => issueCard(r.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded text-xs font-semibold transition-all">
                        <FaCheck /> Issue
                      </button>
                      <button onClick={() => rejectCard(r.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded text-xs font-semibold transition-all">
                        <FaTimes /> Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminTerminations() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getPendingTerminations();
      setRequests(res.data.data || []);
    } catch {
      toast.error('Failed to load termination requests');
    } finally {
      setLoading(false);
    }
  }

  async function approve(id) {
    if (!confirm('Approve account termination and CLOSE this account permanently?')) return;
    try {
      await adminApi.approveTermination(id);
      toast.success('Account closed successfully');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close account');
    }
  }

  async function reject(id) {
    if (!confirm('Reject account termination and restore account to ACTIVE status?')) return;
    try {
      await adminApi.rejectTermination(id);
      toast.success('Termination request rejected');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject termination request');
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold dark:text-white">Account Terminations</h1>

      <div className="glass-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]">
              <tr className="text-slate-400 border-b border-white/5">
                {['Account Number','Account Type','Branch Name','Balance','Status','Opened At','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No pending termination requests</td></tr>
              ) : requests.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-mono text-xs dark:text-gray-300">{a.accountNumber}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{a.accountType}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{a.branchName}</td>
                  <td className="px-4 py-3 font-semibold dark:text-white">₹{a.balance?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{a.openedAt ? new Date(a.openedAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => approve(a.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 hover:bg-green-500/20 rounded text-xs font-semibold transition-all">
                        <FaCheck /> Approve Close
                      </button>
                      <button onClick={() => reject(a.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded text-xs font-semibold transition-all">
                        <FaTimes /> Keep Active
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export function AdminAccounts() {
  const [accounts, setAccounts] = useState([]);
  const [page, setPage]         = useState(0);
  const [total, setTotal]       = useState(0);
  const [loading, setLoading]   = useState(false);

  useEffect(() => { load(); }, [page]);

  async function load() {
    setLoading(true);
    try {
      const res = await adminApi.getAllAccounts(page);
      const d = res.data.data;
      setAccounts(d?.content || []);
      setTotal(d?.totalPages || 0);
    } catch {
      toast.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }

  async function toggleStatus(id, currentStatus) {
    try {
      if (currentStatus === 'FROZEN') {
        await adminApi.activateAccount(id);
        toast.success('Account activated successfully');
      } else {
        await adminApi.freezeAccount(id);
        toast.success('Account frozen successfully');
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update account status');
    }
  }

  async function deleteAccount(id) {
    if (!confirm('Are you sure you want to PERMANENTLY DELETE this account? All associated transaction histories, card requests, UPI IDs, and loan applications will be deleted immediately. This action is irreversible.')) return;
    try {
      await adminApi.deleteAccount(id);
      toast.success('Account deleted successfully');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold dark:text-white">Account Management</h1>

      <div className="glass-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-white/[0.02]">
              <tr className="text-slate-400 border-b border-white/5">
                {['Account Number', 'Account Type', 'Branch Name', 'Balance', 'Status', 'Opened At', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">Loading...</td></tr>
              ) : accounts.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-gray-400">No accounts found</td></tr>
              ) : accounts.map(a => (
                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="px-4 py-3 font-mono text-xs dark:text-gray-300">{a.accountNumber}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{a.accountType}</td>
                  <td className="px-4 py-3 dark:text-gray-300">{a.branchName}</td>
                  <td className="px-4 py-3 font-semibold dark:text-white">₹{a.balance?.toLocaleString('en-IN')}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      a.status === 'ACTIVE' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                      a.status === 'FROZEN' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                      a.status === 'CLOSED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                      'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {a.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">{a.openedAt ? new Date(a.openedAt).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {a.status !== 'CLOSED' && (
                        <button onClick={() => toggleStatus(a.id, a.status)}
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-all ${
                            a.status === 'FROZEN'
                              ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                              : 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                          }`}>
                          {a.status === 'FROZEN' ? 'Activate' : 'Freeze'}
                        </button>
                      )}
                      <button onClick={() => deleteAccount(a.id)}
                        className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded text-xs font-semibold transition-all">
                        <FaTimes /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {total > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-white/5">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="btn-secondary py-1.5 px-4 text-xs">Previous</button>
            <span className="text-xs text-slate-400 font-semibold">Page {page + 1} of {total}</span>
            <button disabled={page >= total - 1} onClick={() => setPage(p => p + 1)} className="btn-secondary py-1.5 px-4 text-xs">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
