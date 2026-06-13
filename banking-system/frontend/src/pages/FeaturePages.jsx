// ============================================================
// src/pages/TransactionsPage.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FaCalculator,
  FaChevronDown,
  FaChevronUp,
  FaCreditCard,
  FaDownload,
  FaFileAlt,
  FaFilter,
  FaKey,
  FaLock,
  FaMobileAlt,
  FaPaperPlane,
  FaPlus,
  FaQrcode,
  FaSearch,
  FaUnlock,
} from 'react-icons/fa';
import { accountApi, cardApi, loanApi, txnApi, upiApi } from '../services/api';


export function TransactionsPage() {
  const [txns, setTxns]         = useState([]);
  const [page, setPage]         = useState(0);
  const [totalPages, setTotal]  = useState(0);
  const [loading, setLoading]   = useState(false);
  const [filters, setFilters]   = useState({ type: '', status: '', from: '', to: '' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => { loadTxns(); }, [page]);

  async function loadTxns() {
    setLoading(true);
    try {
      const res = await txnApi.getHistory(page, 15);
      const data = res.data.data;
      setTxns(data?.content || []);
      setTotal(data?.totalPages || 0);
    } catch { toast.error('Failed to load transactions'); }
    finally { setLoading(false); }
  }

  async function downloadReceipt(ref) {
    try {
      const res = await txnApi.getReceipt(ref);
      const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const a = document.createElement('a'); a.href = url; a.download = `receipt-${ref}.pdf`; a.click();
    } catch { toast.error('Failed to download receipt'); }
  }

  const statusColor = {
    SUCCESS: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    FAILED:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    PENDING: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    REVERSED:'bg-gray-100 text-gray-600',
  };

  const typeColor = {
    DEPOSIT: 'text-green-600', WITHDRAWAL: 'text-red-600',
    TRANSFER: 'text-blue-600', UPI_CREDIT: 'text-green-600', UPI_DEBIT: 'text-red-600',
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Transaction History</h1>
        <button onClick={() => setShowFilters(s => !s)}
          className="flex items-center gap-2 border px-4 py-2 rounded-lg text-sm hover:bg-gray-50 dark:border-gray-600 dark:text-white dark:hover:bg-gray-700">
          <FaFilter /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Type</label>
            <select value={filters.type} onChange={e => setFilters(f => ({...f, type: e.target.value}))}
              className="w-full border rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">All</option>
              {['DEPOSIT','WITHDRAWAL','TRANSFER','UPI_CREDIT','UPI_DEBIT','EMI_DEBIT'].map(t =>
                <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">Status</label>
            <select value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))}
              className="w-full border rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">All</option>
              {['SUCCESS','FAILED','PENDING','REVERSED'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">From Date</label>
            <input type="date" value={filters.from} onChange={e => setFilters(f => ({...f, from: e.target.value}))}
              className="w-full border rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 block">To Date</label>
            <input type="date" value={filters.to} onChange={e => setFilters(f => ({...f, to: e.target.value}))}
              className="w-full border rounded-lg px-3 py-1.5 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr className="text-gray-500 dark:text-gray-400">
                  {['Ref No','Type','From','To','Amount','Balance After','Status','Date','Receipt'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {txns.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-12 text-gray-400">No transactions found</td></tr>
                ) : txns.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs dark:text-gray-300">{t.transactionRef}</td>
                    <td className={`px-4 py-3 font-medium ${typeColor[t.transactionType] || 'text-gray-600 dark:text-gray-300'}`}>
                      {t.transactionType?.replace('_',' ')}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{t.fromAccount || '—'}</td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{t.toAccount || '—'}</td>
                    <td className="px-4 py-3 font-semibold dark:text-white">₹{t.amount?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                      {t.balanceAfter != null ? `₹${t.balanceAfter?.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[t.status] || ''}`}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">
                      {t.initiatedAt ? new Date(t.initiatedAt).toLocaleString('en-IN', {dateStyle:'short',timeStyle:'short'}) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      {t.status === 'SUCCESS' && (
                        <button onClick={() => downloadReceipt(t.transactionRef)}
                          className="text-blue-500 hover:text-blue-700 p-1" title="Download receipt">
                          <FaDownload />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-between items-center px-4 py-3 border-t dark:border-gray-700">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="px-4 py-1.5 border rounded-lg text-sm disabled:opacity-40 dark:border-gray-600 dark:text-white">Previous</button>
            <span className="text-sm text-gray-500 dark:text-gray-400">Page {page + 1} of {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
              className="px-4 py-1.5 border rounded-lg text-sm disabled:opacity-40 dark:border-gray-600 dark:text-white">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// src/pages/LoansPage.jsx
// ============================================================

export function LoansPage() {
  const [tab, setTab]               = useState('my');
  const [loans, setLoans]           = useState([]);
  const [apps, setApps]             = useState([]);
  const [types, setTypes]           = useState([]);
  const [accounts, setAccounts]     = useState([]);
  const [calcResult, setCalcResult] = useState(null);
  const [emiOpen, setEmiOpen]       = useState(null);
  const [emiSchedule, setEmiSchedule] = useState([]);
  const [form, setForm] = useState({ loanTypeId:'', accountId:'', amountRequested:'', tenureMonths:'', purpose:'', annualIncome:'', employmentType:'SALARIED', employerName:'' });
  const [calcForm, setCalcForm] = useState({ loanTypeId:'', amount:'', tenureMonths:'' });

  useEffect(() => {
    loanApi.getLoans().then(r => setLoans(r.data.data || [])).catch(()=>{});
    loanApi.getApplications().then(r => setApps(r.data.data || [])).catch(()=>{});
    loanApi.getTypes().then(r => setTypes(r.data.data || [])).catch(()=>{});
    accountApi.getAll().then(r => setAccounts((r.data.data || []).filter(a => a.status==='ACTIVE'))).catch(()=>{});
  }, []);

  async function calculate(e) {
    e.preventDefault();
    try {
      const res = await loanApi.calculate({ loanTypeId: calcForm.loanTypeId, amount: calcForm.amount, tenureMonths: calcForm.tenureMonths });
      setCalcResult(res.data.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Calculation failed'); }
  }

  async function applyLoan(e) {
    e.preventDefault();
    try {
      await loanApi.apply({ ...form, loanTypeId: +form.loanTypeId, accountId: +form.accountId, amountRequested: +form.amountRequested, tenureMonths: +form.tenureMonths, annualIncome: +form.annualIncome });
      toast.success('Loan application submitted!');
      loanApi.getApplications().then(r => setApps(r.data.data || []));
      setTab('apps');
    } catch (err) { toast.error(err.response?.data?.message || 'Application failed'); }
  }

  async function loadEmi(loanId) {
    if (emiOpen === loanId) { setEmiOpen(null); return; }
    try {
      const res = await loanApi.getEmiSchedule(loanId);
      setEmiSchedule(res.data.data || []);
      setEmiOpen(loanId);
    } catch { toast.error('Failed to load EMI schedule'); }
  }

  const statusColor = { ACTIVE:'bg-green-100 text-green-700', SUBMITTED:'bg-blue-100 text-blue-700', APPROVED:'bg-emerald-100 text-emerald-700', REJECTED:'bg-red-100 text-red-700', DISBURSED:'bg-purple-100 text-purple-700', CLOSED:'bg-gray-100 text-gray-600', DRAFT:'bg-yellow-100 text-yellow-700' };

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold dark:text-white">Loans</h1>
      <div className="flex gap-2 border-b dark:border-gray-700">
        {[['my','My Loans'],['apps','Applications'],['apply','Apply'],['calc','Calculator']].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab===key ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* My Loans */}
      {tab === 'my' && (
        <div className="space-y-4">
          {loans.length === 0 ? <p className="text-center text-gray-400 py-12">No active loans</p> :
          loans.map(loan => (
            <div key={loan.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xs text-gray-400">Loan Account</p>
                  <p className="font-mono font-semibold dark:text-white">{loan.loanAccountNumber}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{loan.loanType}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[loan.status]||''}`}>{loan.status}</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div><p className="text-gray-400 text-xs">Principal</p><p className="font-semibold dark:text-white">₹{loan.principalAmount?.toLocaleString('en-IN')}</p></div>
                <div><p className="text-gray-400 text-xs">EMI Amount</p><p className="font-semibold dark:text-white">₹{loan.emiAmount?.toLocaleString('en-IN')}</p></div>
                <div><p className="text-gray-400 text-xs">Outstanding</p><p className="font-semibold text-orange-600">₹{loan.outstandingBalance?.toLocaleString('en-IN')}</p></div>
                <div><p className="text-gray-400 text-xs">Rate</p><p className="font-semibold dark:text-white">{loan.interestRate}% p.a.</p></div>
                <div><p className="text-gray-400 text-xs">Tenure</p><p className="font-semibold dark:text-white">{loan.tenureMonths} months</p></div>
                <div><p className="text-gray-400 text-xs">Paid EMIs</p><p className="font-semibold dark:text-white">{loan.paidEmis}/{loan.totalEmis}</p></div>
                <div><p className="text-gray-400 text-xs">Overdue EMIs</p><p className={`font-semibold ${loan.overdueEmis>0?'text-red-600':'dark:text-white'}`}>{loan.overdueEmis}</p></div>
                <div><p className="text-gray-400 text-xs">Last EMI Date</p><p className="font-semibold dark:text-white">{loan.lastEmiDate}</p></div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-3">
                <div className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${(loan.paidEmis / loan.totalEmis) * 100}%` }} />
              </div>
              <button onClick={() => loadEmi(loan.id)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline">
                {emiOpen === loan.id ? <FaChevronUp /> : <FaChevronDown />} View EMI Schedule
              </button>
              {emiOpen === loan.id && emiSchedule.length > 0 && (
                <div className="mt-3 overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>{['#','Due Date','EMI','Principal','Interest','Outstanding','Status'].map(h => (
                        <th key={h} className="px-3 py-2 text-left text-gray-500 dark:text-gray-400 font-medium">{h}</th>))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {emiSchedule.map(e => (
                        <tr key={e.emiNumber} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                          <td className="px-3 py-2 dark:text-gray-300">{e.emiNumber}</td>
                          <td className="px-3 py-2 dark:text-gray-300">{e.dueDate}</td>
                          <td className="px-3 py-2 dark:text-gray-300">₹{e.emiAmount?.toLocaleString('en-IN')}</td>
                          <td className="px-3 py-2 dark:text-gray-300">₹{e.principalComponent?.toLocaleString('en-IN')}</td>
                          <td className="px-3 py-2 dark:text-gray-300">₹{e.interestComponent?.toLocaleString('en-IN')}</td>
                          <td className="px-3 py-2 dark:text-gray-300">₹{e.outstandingAfter?.toLocaleString('en-IN')}</td>
                          <td className="px-3 py-2">
                            <span className={`px-1.5 py-0.5 rounded text-xs ${statusColor[e.status]||'bg-gray-100'}`}>{e.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Applications */}
      {tab === 'apps' && (
        <div className="space-y-3">
          {apps.length === 0 ? <p className="text-center text-gray-400 py-12">No loan applications</p> :
          apps.map(app => (
            <div key={app.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex justify-between items-center">
              <div>
                <p className="font-mono text-sm font-semibold dark:text-white">{app.applicationNo}</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">{app.loanType} · ₹{app.amountRequested?.toLocaleString('en-IN')} · {app.tenureMonths} months</p>
                <p className="text-xs text-gray-400 mt-1">EMI: ₹{app.emiEstimate?.toLocaleString('en-IN')} · Applied: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—'}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[app.status]||''}`}>{app.status}</span>
            </div>
          ))}
        </div>
      )}

      {/* Apply */}
      {tab === 'apply' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 max-w-2xl">
          <h2 className="font-semibold dark:text-white mb-4 flex items-center gap-2"><FaFileAlt /> Apply for Loan</h2>
          <form onSubmit={applyLoan} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['Loan Type','loanTypeId','select-type'],['Disbursal Account','accountId','select-account'],
              ['Amount Requested (₹)','amountRequested','number'],['Tenure (months)','tenureMonths','number'],
              ['Annual Income (₹)','annualIncome','number'],['Employer Name','employerName','text'],
            ].map(([label, key, type]) => (
              <div key={key}>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">{label}</label>
                {type === 'select-type' ? (
                  <select required value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="">Select loan type</option>
                    {types.map(t => <option key={t.id} value={t.id}>{t.typeName} — {t.interestRate}% p.a.</option>)}
                  </select>
                ) : type === 'select-account' ? (
                  <select required value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="">Select account</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.accountNumber}</option>)}
                  </select>
                ) : (
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                    className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                )}
              </div>
            ))}
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Employment Type</label>
              <select value={form.employmentType} onChange={e => setForm(f => ({...f, employmentType: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                {['SALARIED','SELF_EMPLOYED','BUSINESS','OTHER'].map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Purpose</label>
              <textarea rows={2} value={form.purpose} onChange={e => setForm(f => ({...f, purpose: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="md:col-span-2">
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg">Submit Application</button>
            </div>
          </form>
        </div>
      )}

      {/* Calculator */}
      {tab === 'calc' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
            <h2 className="font-semibold dark:text-white mb-4 flex items-center gap-2"><FaCalculator /> EMI Calculator</h2>
            <form onSubmit={calculate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Loan Type</label>
                <select required value={calcForm.loanTypeId} onChange={e => setCalcForm(f => ({...f, loanTypeId: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="">Select</option>
                  {types.map(t => <option key={t.id} value={t.id}>{t.typeName}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Loan Amount (₹)</label>
                <input type="number" required min="1000" value={calcForm.amount} onChange={e => setCalcForm(f => ({...f, amount: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Tenure (months)</label>
                <input type="number" required min="3" value={calcForm.tenureMonths} onChange={e => setCalcForm(f => ({...f, tenureMonths: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg">Calculate EMI</button>
            </form>
          </div>
          {calcResult && (
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl shadow-sm p-6 text-white">
              <h2 className="font-semibold mb-4">Calculation Result</h2>
              <div className="text-center mb-6">
                <p className="text-xs opacity-80">Monthly EMI</p>
                <p className="text-4xl font-bold">₹{calcResult.emi?.toLocaleString('en-IN')}</p>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="opacity-80">Principal</span><span className="font-medium">₹{calcResult.principal?.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="opacity-80">Interest Rate</span><span className="font-medium">{calcResult.interestRate}% p.a.</span></div>
                <div className="flex justify-between"><span className="opacity-80">Tenure</span><span className="font-medium">{calcResult.tenureMonths} months</span></div>
                <div className="flex justify-between border-t border-white/20 pt-2"><span className="opacity-80">Total Interest</span><span className="font-medium">₹{calcResult.totalInterest?.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between"><span className="opacity-80">Processing Fee</span><span className="font-medium">₹{calcResult.processingFee?.toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between border-t border-white/20 pt-2 font-bold"><span>Total Payable</span><span>₹{calcResult.totalAmount?.toLocaleString('en-IN')}</span></div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// src/pages/CardsPage.jsx
// ============================================================

export function CardsPage() {
  const [cards, setCards]     = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [showRequest, setShowRequest] = useState(false);
  const [showPin, setShowPin] = useState(null);
  const [form, setForm]       = useState({ accountId:'', cardType:'DEBIT', cardNetwork:'RUPAY' });
  const [pinForm, setPinForm] = useState({ pin:'', cvv:'' });

  useEffect(() => {
    cardApi.getAll().then(r => setCards(r.data.data || [])).catch(()=>{});
    accountApi.getAll().then(r => setAccounts((r.data.data||[]).filter(a=>a.status==='ACTIVE'))).catch(()=>{});
  }, []);

  async function requestCard(e) {
    e.preventDefault();
    try {
      const res = await cardApi.request({ ...form, accountId: +form.accountId });
      setCards(c => [...c, res.data.data]);
      toast.success('Card request submitted!');
      setShowRequest(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  }

  async function toggleBlock(card) {
    try {
      if (card.status === 'BLOCKED') {
        await cardApi.unblock(card.id);
        toast.success('Card unblocked');
      } else {
        await cardApi.block(card.id, { reason: 'User requested block' });
        toast.success('Card blocked');
      }
      cardApi.getAll().then(r => setCards(r.data.data || []));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  }

  async function setPin(e) {
    e.preventDefault();
    try {
      await cardApi.setPin({ cardId: showPin, ...pinForm });
      toast.success('PIN set successfully!');
      setShowPin(null); setPinForm({ pin:'', cvv:'' });
      cardApi.getAll().then(r => setCards(r.data.data || []));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  }

  const networkColor = { VISA:'bg-blue-600', MASTERCARD:'bg-red-500', RUPAY:'bg-orange-500' };
  const cardBg = { DEBIT:'from-blue-600 to-blue-800', CREDIT:'from-purple-600 to-purple-900' };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Cards</h1>
        <button onClick={() => setShowRequest(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <FaPlus /> Request Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(card => (
          <div key={card.id} className="space-y-3">
            {/* Card visual */}
            <div className={`bg-gradient-to-br ${cardBg[card.cardType]||'from-gray-600 to-gray-800'} rounded-2xl p-5 text-white relative overflow-hidden shadow-lg`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-8 -mt-8" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full -ml-5 -mb-5" />
              <div className="flex justify-between items-start mb-6">
                <span className="text-sm font-medium opacity-80">{card.cardType} CARD</span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${networkColor[card.cardNetwork]||'bg-gray-500'}`}>{card.cardNetwork}</span>
              </div>
              <div className="mb-4">
                <FaCreditCard className="text-2xl opacity-60 mb-2" />
                <p className="font-mono text-lg tracking-widest">{card.cardNumber}</p>
              </div>
              <div className="flex justify-between text-sm">
                <div><p className="opacity-60 text-xs">CARD HOLDER</p><p className="font-medium">{card.cardHolderName}</p></div>
                <div><p className="opacity-60 text-xs">EXPIRES</p><p className="font-medium">{String(card.expiryMonth).padStart(2,'0')}/{card.expiryYear}</p></div>
              </div>
              {card.status !== 'ACTIVE' && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                  <span className="bg-white text-red-600 font-bold px-4 py-1 rounded-full text-sm">{card.status}</span>
                </div>
              )}
            </div>
            {/* Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
              {card.cardType === 'CREDIT' && (
                <div className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Credit Used</span>
                    <span className="dark:text-white">₹{card.outstandingBalance?.toLocaleString('en-IN')} / ₹{card.creditLimit?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full"
                      style={{ width: card.creditLimit ? `${(card.outstandingBalance/card.creditLimit)*100}%` : '0%' }} />
                  </div>
                </div>
              )}
              <div className="flex gap-2 flex-wrap">
                <button onClick={() => toggleBlock(card)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                    ${card.status === 'BLOCKED' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                  {card.status === 'BLOCKED' ? <><FaUnlock /> Unblock</> : <><FaLock /> Block</>}
                </button>
                <button onClick={() => setShowPin(card.id)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600">
                  <FaKey /> Set PIN
                </button>
              </div>
            </div>
          </div>
        ))}
        {cards.length === 0 && (
          <div className="col-span-3 text-center py-16 text-gray-400">
            <FaCreditCard className="text-5xl mx-auto mb-3 opacity-30" />
            <p>No cards yet. Request your first card!</p>
          </div>
        )}
      </div>

      {/* Request Card Modal */}
      {showRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
            <h2 className="font-bold text-lg dark:text-white mb-4">Request Card</h2>
            <form onSubmit={requestCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Linked Account</label>
                <select required value={form.accountId} onChange={e => setForm(f => ({...f, accountId: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="">Select account</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.accountNumber}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Card Type</label>
                <select value={form.cardType} onChange={e => setForm(f => ({...f, cardType: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="DEBIT">Debit Card</option>
                  <option value="CREDIT">Credit Card</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Network</label>
                <select value={form.cardNetwork} onChange={e => setForm(f => ({...f, cardNetwork: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="RUPAY">RuPay</option>
                  <option value="VISA">Visa</option>
                  <option value="MASTERCARD">Mastercard</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Request</button>
                <button type="button" onClick={() => setShowRequest(false)} className="flex-1 border rounded-lg py-2 dark:border-gray-600 dark:text-white">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set PIN Modal */}
      {showPin && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
            <h2 className="font-bold text-lg dark:text-white mb-4 flex items-center gap-2"><FaKey /> Set Card PIN</h2>
            <form onSubmit={setPin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">CVV</label>
                <input type="password" maxLength={3} required value={pinForm.cvv} onChange={e => setPinForm(f => ({...f, cvv: e.target.value}))}
                  placeholder="3-digit CVV"
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">New PIN</label>
                <input type="password" maxLength={4} required value={pinForm.pin} onChange={e => setPinForm(f => ({...f, pin: e.target.value}))}
                  placeholder="4-digit PIN"
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Set PIN</button>
                <button type="button" onClick={() => setShowPin(null)} className="flex-1 border rounded-lg py-2 dark:border-gray-600 dark:text-white">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// src/pages/UpiPage.jsx
// ============================================================

export function UpiPage() {
  const [upiIds, setUpiIds]   = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [tab, setTab]         = useState('ids');
  const [qrUrl, setQrUrl]     = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]       = useState({ accountId:'', upiId:'' });
  const [sendForm, setSendForm] = useState({ fromUpiId:'', toUpiId:'', amount:'', description:'' });

  useEffect(() => {
    upiApi.getAll().then(r => setUpiIds(r.data.data || [])).catch(()=>{});
    accountApi.getAll().then(r => setAccounts((r.data.data||[]).filter(a=>a.status==='ACTIVE'))).catch(()=>{});
  }, []);

  async function createUpi(e) {
    e.preventDefault();
    try {
      const res = await upiApi.create({ accountId: +form.accountId, upiId: form.upiId });
      setUpiIds(u => [...u, res.data.data]);
      toast.success('UPI ID created!');
      setShowCreate(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  }

  async function getQr(upiId) {
    try {
      const res = await upiApi.getQr(upiId);
      setQrUrl(URL.createObjectURL(new Blob([res.data], { type: 'image/png' })));
    } catch { toast.error('Failed to generate QR'); }
  }

  async function sendMoney(e) {
    e.preventDefault();
    try {
      await upiApi.send({ ...sendForm, amount: +sendForm.amount });
      toast.success('UPI payment successful!');
      setSendForm({ fromUpiId:'', toUpiId:'', amount:'', description:'' });
    } catch (err) { toast.error(err.response?.data?.message || 'Transfer failed'); }
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold dark:text-white">UPI</h1>
      <div className="flex gap-2 border-b dark:border-gray-700">
        {[['ids','My UPI IDs'],['send','Send Money'],['qr','QR Code']].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab===key ? 'border-blue-500 text-blue-600 dark:text-blue-400' : 'border-transparent text-gray-500 dark:text-gray-400'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'ids' && (
        <div className="space-y-4">
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
            <FaPlus /> Create UPI ID
          </button>
          {upiIds.map(u => (
            <div key={u.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2">
                  <FaMobileAlt className="text-blue-500" />
                  <p className="font-semibold dark:text-white">{u.upiId}</p>
                  {u.isDefault && <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">Default</span>}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Linked to: {u.linkedAccountNumber}</p>
              </div>
              <button onClick={() => getQr(u.upiId)} className="flex items-center gap-1 text-sm text-blue-600 hover:underline">
                <FaQrcode /> View QR
              </button>
            </div>
          ))}
          {upiIds.length === 0 && <p className="text-center text-gray-400 py-12">No UPI IDs yet</p>}
        </div>
      )}

      {tab === 'send' && (
        <div className="max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="font-semibold dark:text-white mb-4 flex items-center gap-2"><FaPaperPlane /> Send Money via UPI</h2>
          <form onSubmit={sendMoney} className="space-y-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">From UPI ID</label>
              <select required value={sendForm.fromUpiId} onChange={e => setSendForm(f => ({...f, fromUpiId: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="">Select your UPI ID</option>
                {upiIds.map(u => <option key={u.id} value={u.upiId}>{u.upiId}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">To UPI ID</label>
              <input required value={sendForm.toUpiId} onChange={e => setSendForm(f => ({...f, toUpiId: e.target.value}))}
                placeholder="recipient@bank"
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Amount (₹)</label>
              <input type="number" required min="1" value={sendForm.amount} onChange={e => setSendForm(f => ({...f, amount: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Note (optional)</label>
              <input value={sendForm.description} onChange={e => setSendForm(f => ({...f, description: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg">Send Money</button>
          </form>
        </div>
      )}

      {tab === 'qr' && (
        <div className="max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 text-center">
          <h2 className="font-semibold dark:text-white mb-4">Your QR Code</h2>
          <div className="mb-4">
            <select onChange={e => e.target.value && getQr(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="">Select UPI ID</option>
              {upiIds.map(u => <option key={u.id} value={u.upiId}>{u.upiId}</option>)}
            </select>
          </div>
          {qrUrl ? (
            <div>
              <img src={qrUrl} alt="QR Code" className="mx-auto w-48 h-48 border rounded-lg" />
              <a href={qrUrl} download="upi-qr.png" className="mt-3 inline-block text-blue-600 text-sm hover:underline">Download QR</a>
            </div>
          ) : (
            <div className="py-12 text-gray-400">
              <FaQrcode className="text-5xl mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a UPI ID to generate QR</p>
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-sm">
            <h2 className="font-bold text-lg dark:text-white mb-4">Create UPI ID</h2>
            <form onSubmit={createUpi} className="space-y-4">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">Link to Account</label>
                <select required value={form.accountId} onChange={e => setForm(f => ({...f, accountId: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <option value="">Select account</option>
                  {accounts.map(a => <option key={a.id} value={a.id}>{a.accountNumber}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">UPI ID</label>
                <input required value={form.upiId} onChange={e => setForm(f => ({...f, upiId: e.target.value}))}
                  placeholder="yourname@bank"
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Create</button>
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 border rounded-lg py-2 dark:border-gray-600 dark:text-white">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
