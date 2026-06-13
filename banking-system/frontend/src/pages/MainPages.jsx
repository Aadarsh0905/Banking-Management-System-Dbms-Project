// ============================================================
// src/pages/DashboardPage.jsx
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
} from 'react-icons/fa';
import { useAuth } from '../context/Contexts';
import { accountApi, loanApi, notifApi, txnApi } from '../services/api';


Chart.register(...registerables);

function StatCard({ title, value, icon, color, link }) {
  return (
    <Link to={link} className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 ${color} hover:shadow-md transition-shadow block`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold dark:text-white mt-1">{value}</p>
        </div>
        <span className="text-3xl opacity-80">{icon}</span>
      </div>
    </Link>
  );
}

export function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    accountApi.getAll().then(r => setAccounts(r.data.data)).catch(() => {});
    txnApi.getHistory(0, 10).then(r => setTransactions(r.data.data?.content || [])).catch(() => {});
    loanApi.getLoans().then(r => setLoans(r.data.data || [])).catch(() => {});
  }, []);

  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);

  const lineData = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun'],
    datasets: [{
      label: 'Spending (₹)',
      data: [12000,19000,8000,22000,15000,18000],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59,130,246,0.1)',
      fill: true, tension: 0.4
    }]
  };

  const donutData = {
    labels: accounts.map(a => a.accountType),
    datasets: [{ data: accounts.map(a => a.balance), backgroundColor: ['#3b82f6','#10b981','#f59e0b','#ef4444'] }]
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold dark:text-white">Welcome back, {user?.firstName}! 👋</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Here's what's happening with your accounts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Balance" value={`₹${totalBalance.toLocaleString('en-IN')}`}
          icon={<FaUniversity className="text-blue-500"/>} color="border-blue-500" link="/accounts"/>
        <StatCard title="Accounts" value={accounts.length}
          icon={<FaUniversity className="text-green-500"/>} color="border-green-500" link="/accounts"/>
        <StatCard title="Transactions" value={transactions.length}
          icon={<FaExchangeAlt className="text-yellow-500"/>} color="border-yellow-500" link="/transactions"/>
        <StatCard title="Active Loans" value={loans.filter(l => l.status==='ACTIVE').length}
          icon={<FaHandHoldingUsd className="text-red-500"/>} color="border-red-500" link="/loans"/>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold dark:text-white mb-4">Spending Trend</h2>
          <Line data={lineData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
          <h2 className="font-semibold dark:text-white mb-4">Account Distribution</h2>
          {accounts.length > 0
            ? <Doughnut data={donutData} options={{ responsive: true }} />
            : <p className="text-gray-400 text-center py-8">No accounts yet</p>
          }
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold dark:text-white">Recent Transactions</h2>
          <Link to="/transactions" className="text-blue-600 text-sm hover:underline">View All</Link>
        </div>
        {transactions.length === 0
          ? <p className="text-gray-400 text-center py-8">No recent transactions</p>
          : <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="text-gray-500 border-b dark:border-gray-700">
                  <th className="py-2 text-left">Ref</th>
                  <th className="py-2 text-left">Type</th>
                  <th className="py-2 text-right">Amount</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-left">Date</th>
                </tr></thead>
                <tbody>
                  {transactions.map(t => (
                    <tr key={t.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 font-mono text-xs dark:text-gray-300">{t.transactionRef}</td>
                      <td className="py-3 dark:text-gray-300">{t.transactionType}</td>
                      <td className="py-3 text-right font-semibold dark:text-white">₹{t.amount?.toLocaleString('en-IN')}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          t.status==='SUCCESS' ? 'bg-green-100 text-green-700' :
                          t.status==='FAILED'  ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'}`}>{t.status}</span>
                      </td>
                      <td className="py-3 text-gray-500 text-xs">{new Date(t.initiatedAt).toLocaleDateString()}</td>
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

  useEffect(() => {
    accountApi.getAll().then(r => setAccounts(r.data.data || []));
    accountApi.getTypes().then(r => setTypes(r.data.data || []));
    accountApi.getBranches().then(r => setBranches(r.data.data || []));
  }, []);

  async function openAccount(e) {
    e.preventDefault();
    try {
      await accountApi.open({ accountTypeId: +form.accountTypeId, branchId: +form.branchId, nomineeName: form.nomineeName });
      toast.success('Account opened successfully!');
      setShowForm(false);
      accountApi.getAll().then(r => setAccounts(r.data.data || []));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  }

  async function downloadStatement(accId) {
    try {
      const res = await accountApi.getStatement({ accountId: accId, fromDate: '2024-01-01', toDate: new Date().toISOString().split('T')[0] });
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a   = document.createElement('a'); a.href = url; a.download = `statement-${accId}.pdf`; a.click();
    } catch { toast.error('Failed to download statement'); }
  }

  const statusColor = { ACTIVE:'bg-green-100 text-green-700', PENDING:'bg-yellow-100 text-yellow-700', FROZEN:'bg-blue-100 text-blue-700', CLOSED:'bg-red-100 text-red-700' };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">My Accounts</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <FaPlus /> Open Account
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="font-bold text-lg dark:text-white mb-4">Open New Account</h2>
            <form onSubmit={openAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Account Type</label>
                <select required value={form.accountTypeId} onChange={e => setForm(f => ({...f, accountTypeId: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="">Select type</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.typeName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Branch</label>
                <select required value={form.branchId} onChange={e => setForm(f => ({...f, branchId: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="">Select branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.branchName} — {b.city}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Nominee Name</label>
                <input value={form.nomineeName} onChange={e => setForm(f => ({...f, nomineeName: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Open Account</button>
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 border rounded-lg py-2 dark:border-gray-600 dark:text-white">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 space-y-3">
            <div className="flex justify-between">
              <div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Account Number</p>
                <p className="font-mono font-semibold dark:text-white">{acc.accountNumber}</p>
              </div>
              <span className={`px-2 py-0.5 h-fit rounded-full text-xs font-medium ${statusColor[acc.status]||'bg-gray-100'}`}>{acc.status}</span>
            </div>
            <div className="bg-gradient-to-r from-blue-600 to-blue-400 rounded-lg p-4 text-white">
              <p className="text-xs opacity-80">Available Balance</p>
              <p className="text-2xl font-bold">₹{acc.availableBalance?.toLocaleString('en-IN')}</p>
              <p className="text-xs mt-1">{acc.accountType}</p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
              <p>Branch: {acc.branchName}</p>
              <p>IFSC: {acc.ifscCode}</p>
              <p>Opened: {acc.openedAt}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => downloadStatement(acc.id)}
                className="flex-1 flex items-center justify-center gap-1 border rounded-lg py-1.5 text-sm hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
                <FaDownload /> Statement
              </button>
            </div>
          </div>
        ))}
        {accounts.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <FaUniversity className="text-5xl mx-auto mb-3 opacity-30" />
            <p>No accounts yet. Open your first account!</p>
          </div>
        )}
      </div>
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

  useEffect(() => { accountApi.getAll().then(r => setAccounts(r.data.data?.filter(a => a.status==='ACTIVE') || [])); }, []);

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
    } catch (err) { toast.error(err.response?.data?.message || 'Deposit failed'); }
    finally { setLoading(false); }
  }

  async function handleWithdraw(e) {
    e.preventDefault(); setLoading(true);
    try {
      await txnApi.withdraw({ accountId: +form.fromAccountId, amount: +form.amount, description: form.description });
      toast.success('Withdrawal successful!');
    } catch (err) { toast.error(err.response?.data?.message || 'Withdrawal failed'); }
    finally { setLoading(false); }
  }

  const tabs = ['transfer','deposit','withdraw'];
  const handlers = { transfer: handleTransfer, deposit: handleDeposit, withdraw: handleWithdraw };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Money Transfer</h1>
      <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-md text-sm font-medium capitalize transition-colors
              ${activeTab===tab ? 'bg-white dark:bg-gray-800 shadow text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <form onSubmit={handlers[activeTab]} className="space-y-4">
          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">
              {activeTab === 'transfer' ? 'From Account' : 'Account'}
            </label>
            <select required value={form.fromAccountId} onChange={e => setForm(f => ({...f, fromAccountId: e.target.value}))}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">Select account</option>
              {accounts.map(a => <option key={a.id} value={a.id}>{a.accountNumber} — ₹{a.balance?.toLocaleString('en-IN')}</option>)}
            </select>
          </div>

          {activeTab === 'transfer' && (
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">To Account Number</label>
              <input required value={form.toAccountNumber} onChange={e => setForm(f => ({...f, toAccountNumber: e.target.value}))}
                placeholder="Enter recipient account number"
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Amount (₹)</label>
            <input type="number" required min="1" value={form.amount} onChange={e => setForm(f => ({...f, amount: e.target.value}))}
              placeholder="Enter amount"
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium dark:text-gray-300 mb-1">Description (optional)</label>
            <input value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))}
              placeholder="What's this for?"
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? 'Processing...' : <><FaExchangeAlt /> {activeTab.charAt(0).toUpperCase()+activeTab.slice(1)}</>}
          </button>
        </form>

        {result && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-green-700 dark:text-green-400 font-medium">✓ Transfer Successful</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Ref: {result.transactionRef}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Amount: ₹{result.amount}</p>
          </div>
        )}
      </div>
    </div>
  );
}

