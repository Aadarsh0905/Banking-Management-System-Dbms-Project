// ============================================================
// src/pages/FeaturePages.jsx — Premium Paytm Glassmorphic Edition
// ============================================================

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FaCalculator,
  FaChevronDown,
  FaChevronUp,
  FaClock,
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
  FaExchangeAlt,
  FaInfoCircle
} from 'react-icons/fa';
import { accountApi, cardApi, loanApi, txnApi, upiApi } from '../services/api';

// ── Transactions Page ────────────────────────────────────────
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
    SUCCESS: 'bg-green-500/10 text-green-400 border border-green-500/20',
    FAILED:  'bg-red-500/10 text-red-400 border border-red-500/20',
    PENDING: 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20',
    REVERSED:'bg-white/5 text-slate-400 border border-white/5',
  };

  const typeColor = {
    DEPOSIT: 'text-green-400', WITHDRAWAL: 'text-red-400',
    TRANSFER: 'text-cyan-400', UPI_CREDIT: 'text-green-400', UPI_DEBIT: 'text-red-400',
  };

  return (
    <div className="space-y-6 page-transition">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white">Transaction History</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Monitor all deposits, withdrawals, and transfers</p>
        </div>
        <button onClick={() => setShowFilters(s => !s)}
          className="btn-secondary flex items-center gap-2 text-sm py-2 px-4 rounded-xl">
          <FaFilter /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="glass-card grid grid-cols-2 md:grid-cols-4 gap-4 p-5 animate-fade-in">
          <div>
            <label className="label">Type</label>
            <select value={filters.type} onChange={e => setFilters(f => ({...f, type: e.target.value}))}
              className="glass-input cursor-pointer">
              <option value="" className="bg-slate-950">All Types</option>
              {['DEPOSIT','WITHDRAWAL','TRANSFER','UPI_CREDIT','UPI_DEBIT','EMI_DEBIT'].map(t =>
                <option key={t} value={t} className="bg-slate-950">{t.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value}))}
              className="glass-input cursor-pointer">
              <option value="" className="bg-slate-950">All Statuses</option>
              {['SUCCESS','FAILED','PENDING','REVERSED'].map(s => <option key={s} value={s} className="bg-slate-950">{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">From Date</label>
            <input type="date" value={filters.from} onChange={e => setFilters(f => ({...f, from: e.target.value}))}
              className="glass-input" />
          </div>
          <div>
            <label className="label">To Date</label>
            <input type="date" value={filters.to} onChange={e => setFilters(f => ({...f, to: e.target.value}))}
              className="glass-input" />
          </div>
        </div>
      )}

      <div className="glass-card overflow-hidden p-0 border border-white/5 shadow-2xl">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="spinner" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.02] text-slate-400 border-b border-white/5 text-xs font-bold uppercase tracking-wider">
                  {['Ref No','Type','From','To','Amount','Balance After','Status','Date','Receipt'].map(h => (
                    <th key={h} className="px-5 py-4 text-left font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {txns.length === 0 ? (
                  <tr><td colSpan={9} className="text-center py-16 text-slate-500 font-bold">No transactions found</td></tr>
                ) : txns.map(t => (
                  <tr key={t.id} className="hover:bg-white/[0.01] transition-colors border-b border-white/5 last:border-0">
                    <td className="px-5 py-4 font-mono text-xs text-slate-300">{t.transactionRef}</td>
                    <td className={`px-5 py-4 font-bold text-xs uppercase tracking-wider ${typeColor[t.transactionType] || 'text-slate-300'}`}>
                      {t.transactionType?.replace('_',' ')}
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{t.fromAccount || '—'}</td>
                    <td className="px-5 py-4 text-xs text-slate-400 font-mono">{t.toAccount || '—'}</td>
                    <td className="px-5 py-4 font-black text-white">₹{t.amount?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4 text-slate-400 font-mono">
                      {t.balanceAfter != null ? `₹${t.balanceAfter?.toLocaleString('en-IN')}` : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor[t.status] || ''}`}>{t.status}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-slate-400">
                      {t.initiatedAt ? new Date(t.initiatedAt).toLocaleString('en-IN', {dateStyle:'short',timeStyle:'short'}) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      {t.status === 'SUCCESS' && (
                        <button onClick={() => downloadReceipt(t.transactionRef)}
                          className="text-cyan-400 hover:text-cyan-300 p-1.5 rounded-lg bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all" title="Download receipt">
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
          <div className="flex justify-between items-center px-5 py-4 border-t border-white/5 bg-white/[0.01]">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}
              className="btn-secondary py-1.5 px-4 text-xs rounded-xl disabled:opacity-40">Previous</button>
            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Page {page + 1} of {totalPages}</span>
            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
              className="btn-secondary py-1.5 px-4 text-xs rounded-xl disabled:opacity-40">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Loans Page ────────────────────────────────────────────────
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

  const statusColor = { 
    ACTIVE:'bg-green-500/10 text-green-400 border border-green-500/20', 
    SUBMITTED:'bg-blue-500/10 text-blue-400 border border-blue-500/20', 
    APPROVED:'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20', 
    REJECTED:'bg-red-500/10 text-red-400 border border-red-500/20', 
    DISBURSED:'bg-purple-500/10 text-purple-400 border border-purple-500/20', 
    CLOSED:'bg-white/5 text-slate-400 border border-white/5', 
    DRAFT:'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' 
  };

  return (
    <div className="space-y-6 page-transition">
      <div>
        <h1 className="text-2xl font-black text-white">Loans Portal</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Apply for personal/home loans and view EMI schedules</p>
      </div>

      <div className="flex rounded-2xl bg-white/5 border border-white/5 p-1">
        {[['my','My Loans'],['apps','Applications'],['apply','Apply'],['calc','Calculator']].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-300
              ${tab===key ? 'bg-gradient-to-r from-[#005CFF] to-[#00BAF2] text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* My Loans */}
      {tab === 'my' && (
        <div className="space-y-5">
          {loans.length === 0 ? (
            <div className="glass-card text-center py-16 text-slate-500 font-bold">
              No active loans found
            </div>
          ) : (
            loans.map(loan => (
              <div key={loan.id} className="glass-card glass-card-hover p-6 border border-white/5">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Loan Account Number</p>
                    <p className="font-mono font-bold text-slate-200">{loan.loanAccountNumber}</p>
                    <p className="text-xs text-cyan-400 mt-0.5 font-bold uppercase tracking-wider">{loan.loanType}</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusColor[loan.status]||''}`}>{loan.status}</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs mb-6 pt-4 border-t border-white/5">
                  <div><p className="text-slate-500 uppercase tracking-wider font-semibold">Principal</p><p className="font-black text-sm text-slate-200 mt-0.5">₹{loan.principalAmount?.toLocaleString('en-IN')}</p></div>
                  <div><p className="text-slate-500 uppercase tracking-wider font-semibold">EMI Amount</p><p className="font-black text-sm text-slate-200 mt-0.5">₹{loan.emiAmount?.toLocaleString('en-IN')}</p></div>
                  <div><p className="text-slate-500 uppercase tracking-wider font-semibold">Outstanding</p><p className="font-black text-sm text-orange-400 mt-0.5">₹{loan.outstandingBalance?.toLocaleString('en-IN')}</p></div>
                  <div><p className="text-slate-500 uppercase tracking-wider font-semibold">Interest Rate</p><p className="font-black text-sm text-slate-200 mt-0.5">{loan.interestRate}% p.a.</p></div>
                  <div><p className="text-slate-500 uppercase tracking-wider font-semibold">Tenure</p><p className="font-bold text-slate-200 mt-0.5">{loan.tenureMonths} months</p></div>
                  <div><p className="text-slate-500 uppercase tracking-wider font-semibold">Paid EMIs</p><p className="font-bold text-slate-200 mt-0.5">{loan.paidEmis}/{loan.totalEmis}</p></div>
                  <div><p className="text-slate-500 uppercase tracking-wider font-semibold">Overdue EMIs</p><p className={`font-bold mt-0.5 ${loan.overdueEmis>0?'text-red-400':'text-slate-200'}`}>{loan.overdueEmis}</p></div>
                  <div><p className="text-slate-500 uppercase tracking-wider font-semibold">Last EMI Date</p><p className="font-bold text-slate-200 mt-0.5">{loan.lastEmiDate}</p></div>
                </div>

                <div className="w-full bg-white/5 border border-white/5 rounded-full h-2.5 mb-4 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-cyan-400 h-full rounded-full transition-all"
                    style={{ width: `${(loan.paidEmis / loan.totalEmis) * 100}%` }} />
                </div>

                <button onClick={() => loadEmi(loan.id)}
                  className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-wider">
                  {emiOpen === loan.id ? <FaChevronUp /> : <FaChevronDown />} View EMI Schedule
                </button>

                {emiOpen === loan.id && emiSchedule.length > 0 && (
                  <div className="mt-4 overflow-x-auto border border-white/5 rounded-2xl animate-fade-in shadow-inner">
                    <table className="w-full text-xs">
                      <thead className="bg-white/[0.02] border-b border-white/5 text-slate-400 font-bold uppercase tracking-wider">
                        <tr>{['#','Due Date','EMI','Principal','Interest','Outstanding','Status'].map(h => (
                          <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {emiSchedule.map(e => (
                          <tr key={e.emiNumber} className="hover:bg-white/[0.01]">
                            <td className="px-4 py-3.5 dark:text-gray-300 font-bold">{e.emiNumber}</td>
                            <td className="px-4 py-3.5 dark:text-gray-300">{e.dueDate}</td>
                            <td className="px-4 py-3.5 font-bold text-white">₹{e.emiAmount?.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3.5 dark:text-gray-300">₹{e.principalComponent?.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3.5 dark:text-gray-300">₹{e.interestComponent?.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3.5 dark:text-gray-300 font-mono">₹{e.outstandingAfter?.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${statusColor[e.status]||'bg-white/5 text-slate-400'}`}>{e.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Applications */}
      {tab === 'apps' && (
        <div className="space-y-4">
          {apps.length === 0 ? (
            <div className="glass-card text-center py-16 text-slate-500 font-bold">
              No loan applications found
            </div>
          ) : (
            apps.map(app => (
              <div key={app.id} className="glass-card glass-card-hover p-6 border border-white/5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                  <p className="font-mono text-sm font-bold text-white">{app.applicationNo}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    <span className="text-cyan-400 font-bold uppercase tracking-wider">{app.loanType}</span> · Requested: <span className="font-black text-white">₹{app.amountRequested?.toLocaleString('en-IN')}</span> · {app.tenureMonths} months
                  </p>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-semibold">
                    EMI Estimate: ₹{app.emiEstimate?.toLocaleString('en-IN')} · Applied: {app.submittedAt ? new Date(app.submittedAt).toLocaleDateString() : '—'}
                  </p>
                </div>
                <span className={`self-start sm:self-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${statusColor[app.status]||''}`}>{app.status}</span>
              </div>
            ))
          )}
        </div>
      )}

      {/* Apply */}
      {tab === 'apply' && (
        <div className="glass-card p-6 max-w-2xl mx-auto border border-white/5">
          <h2 className="font-extrabold text-white text-lg mb-6 flex items-center gap-2 border-b border-white/5 pb-4"><FaFileAlt className="text-blue-500" /> Apply for Loan</h2>
          <form onSubmit={applyLoan} className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              ['Loan Type','loanTypeId','select-type'],['Disbursal Account','accountId','select-account'],
              ['Amount Requested (₹)','amountRequested','number'],['Tenure (months)','tenureMonths','number'],
              ['Annual Income (₹)','annualIncome','number'],['Employer Name','employerName','text'],
            ].map(([label, key, type]) => (
              <div key={key}>
                <label className="label">{label}</label>
                {type === 'select-type' ? (
                  <select required value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                    className="glass-input cursor-pointer">
                    <option value="" className="bg-slate-950">Select loan type</option>
                    {types.map(t => <option key={t.id} value={t.id} className="bg-slate-950">{t.typeName} — {t.interestRate}% p.a.</option>)}
                  </select>
                ) : type === 'select-account' ? (
                  <select required value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                    className="glass-input cursor-pointer">
                    <option value="" className="bg-slate-950">Select payout account</option>
                    {accounts.map(a => <option key={a.id} value={a.id} className="bg-slate-950">{a.accountNumber}</option>)}
                  </select>
                ) : (
                  <input type={type} value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                    className="glass-input" />
                )}
              </div>
            ))}
            <div>
              <label className="label">Employment Type</label>
              <select value={form.employmentType} onChange={e => setForm(f => ({...f, employmentType: e.target.value}))}
                className="glass-input cursor-pointer">
                {['SALARIED','SELF_EMPLOYED','BUSINESS','OTHER'].map(t => <option key={t} value={t} className="bg-slate-950">{t}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label">Purpose / Comments</label>
              <textarea rows={2} value={form.purpose} onChange={e => setForm(f => ({...f, purpose: e.target.value}))}
                placeholder="Briefly state the reason for this loan request..."
                className="glass-input" />
            </div>
            <div className="md:col-span-2 mt-2">
              <button type="submit" className="w-full btn-primary">Submit Application</button>
            </div>
          </form>
        </div>
      )}

      {/* Calculator */}
      {tab === 'calc' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="glass-card border border-white/5 p-6">
            <h2 className="font-extrabold text-white text-lg mb-6 flex items-center gap-2 border-b border-white/5 pb-4"><FaCalculator className="text-cyan-400" /> EMI Calculator</h2>
            <form onSubmit={calculate} className="space-y-5">
              <div>
                <label className="label">Loan Type</label>
                <select required value={calcForm.loanTypeId} onChange={e => setCalcForm(f => ({...f, loanTypeId: e.target.value}))}
                  className="glass-input cursor-pointer">
                  <option value="" className="bg-slate-950">Select</option>
                  {types.map(t => <option key={t.id} value={t.id} className="bg-slate-950">{t.typeName}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Loan Amount (₹)</label>
                <input type="number" required min="1000" value={calcForm.amount} onChange={e => setCalcForm(f => ({...f, amount: e.target.value}))}
                  className="glass-input" />
              </div>
              <div>
                <label className="label">Tenure (months)</label>
                <input type="number" required min="3" value={calcForm.tenureMonths} onChange={e => setCalcForm(f => ({...f, tenureMonths: e.target.value}))}
                  className="glass-input" />
              </div>
              <button type="submit" className="w-full btn-primary mt-2">Calculate EMI</button>
            </form>
          </div>
          
          {calcResult ? (
            <div className="bg-gradient-to-br from-blue-700 via-sky-600 to-cyan-500 rounded-[2rem] shadow-2xl p-6 text-white flex flex-col justify-between animate-fade-in relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full pointer-events-none -mr-8 -mt-8" />
              <div>
                <h2 className="font-extrabold text-lg mb-4 uppercase tracking-wider">Calculation Result</h2>
                <div className="text-center my-6">
                  <p className="text-[10px] opacity-75 uppercase tracking-wider font-semibold">Monthly EMI Installment</p>
                  <p className="text-4xl font-black">₹{calcResult.emi?.toLocaleString('en-IN')}</p>
                </div>
                <div className="space-y-2.5 text-xs border-t border-white/20 pt-4 font-mono">
                  <div className="flex justify-between"><span className="opacity-80">Principal</span><span className="font-bold">₹{calcResult.principal?.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span className="opacity-80">Interest Rate</span><span className="font-bold">{calcResult.interestRate}% p.a.</span></div>
                  <div className="flex justify-between"><span className="opacity-80">Tenure</span><span className="font-bold">{calcResult.tenureMonths} months</span></div>
                  <div className="flex justify-between"><span className="opacity-80">Total Interest</span><span className="font-bold">₹{calcResult.totalInterest?.toLocaleString('en-IN')}</span></div>
                  <div className="flex justify-between"><span className="opacity-80">Processing Fee</span><span className="font-bold">₹{calcResult.processingFee?.toLocaleString('en-IN')}</span></div>
                </div>
              </div>
              <div className="flex justify-between border-t border-white/20 pt-4 mt-6 font-bold text-sm">
                <span className="uppercase tracking-wider">Total Payable</span>
                <span className="text-lg font-black">₹{calcResult.totalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          ) : (
            <div className="glass-card border border-white/5 p-6 flex items-center justify-center text-slate-500 italic text-sm">
              Enter details and calculate to view EMI estimations.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Cards Page ────────────────────────────────────────────────
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
    <div className="space-y-6 page-transition">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white">My Cards</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Manage debit/credit limits, blocking, and card PINs</p>
        </div>
        <button onClick={() => setShowRequest(true)} className="btn-primary flex items-center gap-2 text-sm">
          <FaPlus /> Request Card
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(card => (
          <div key={card.id} className="space-y-4">
            {/* Card visual */}
            <div className={`bg-gradient-to-br ${cardBg[card.cardType]||'from-gray-600 to-gray-800'} rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl h-52 flex flex-col justify-between group`}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full pointer-events-none -mr-8 -mt-8 group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full pointer-events-none -ml-5 -mb-5" />
              
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-85">{card.cardType} CARD</span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider ${networkColor[card.cardNetwork]||'bg-gray-500'}`}>{card.cardNetwork}</span>
              </div>
              
              <div className="my-auto">
                <FaCreditCard className="text-3xl opacity-50 mb-3" />
                <p className="font-mono text-xl tracking-widest font-semibold text-slate-100">{card.cardNumber}</p>
              </div>
              
              <div className="flex justify-between text-xs">
                <div><p className="opacity-60 text-[9px] uppercase tracking-wider font-semibold">Card Holder</p><p className="font-bold">{card.cardHolderName}</p></div>
                <div><p className="opacity-60 text-[9px] uppercase tracking-wider font-semibold">Expires</p><p className="font-bold">{String(card.expiryMonth).padStart(2,'0')}/{card.expiryYear}</p></div>
              </div>

              {card.status !== 'ACTIVE' && (
                <div className="absolute inset-0 bg-black/75 flex items-center justify-center rounded-3xl backdrop-blur-[2px]">
                  <span className="bg-red-500/10 border border-red-500/30 text-red-400 font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest">{card.status}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="glass-card border border-white/5 p-4 flex flex-col justify-between">
              {card.cardType === 'CREDIT' && card.status !== 'REQUESTED' && (
                <div className="mb-4 pt-1 pb-2 border-b border-white/5">
                  <div className="flex justify-between text-xs mb-1.5 font-semibold">
                    <span className="text-slate-400">Credit Limit Utilization</span>
                    <span className="text-white">₹{card.outstandingBalance?.toLocaleString('en-IN')} / ₹{card.creditLimit?.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full bg-white/5 border border-white/5 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-400 h-full"
                      style={{ width: card.creditLimit ? `${(card.outstandingBalance/card.creditLimit)*100}%` : '0%' }} />
                  </div>
                </div>
              )}
              {card.status === 'REQUESTED' ? (
                <div className="flex items-center justify-center gap-2 py-3 text-yellow-400 text-xs font-bold border border-yellow-500/20 bg-yellow-500/10 rounded-xl">
                  <FaClock /> Awaiting Admin Approval
                </div>
              ) : (
                <div className="flex gap-3">
                  <button onClick={() => toggleBlock(card)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors
                      ${card.status === 'BLOCKED' ? 'bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'}`}>
                    {card.status === 'BLOCKED' ? <><FaUnlock /> Unblock</> : <><FaLock /> Block</>}
                  </button>
                  <button onClick={() => setShowPin(card.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 border border-white/10 bg-white/5 text-slate-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition-colors">
                    <FaKey /> Set PIN
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {cards.length === 0 && (
          <div className="col-span-3 glass-card text-center py-20 border border-white/5">
            <FaCreditCard className="text-5xl mx-auto mb-4 text-slate-700 animate-pulse" />
            <p className="text-slate-400 font-bold">No active cards found</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">Apply for Visa, MasterCard, or RuPay debit/credit cards linked to your accounts.</p>
          </div>
        )}
      </div>

      {/* Request Card Modal */}
      {showRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-frosted rounded-[2.5rem] p-8 w-full max-w-md modal-transition border border-white/10 shadow-2xl">
            <h2 className="font-extrabold text-xl text-white mb-6">Request New Card</h2>
            <form onSubmit={requestCard} className="space-y-5">
              <div>
                <label className="label">Linked Account</label>
                <select required value={form.accountId} onChange={e => setForm(f => ({...f, accountId: e.target.value}))}
                  className="glass-input cursor-pointer">
                  <option value="" className="bg-slate-950">Select account</option>
                  {accounts.map(a => <option key={a.id} value={a.id} className="bg-slate-950">{a.accountNumber}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Card Type</label>
                <select value={form.cardType} onChange={e => setForm(f => ({...f, cardType: e.target.value}))}
                  className="glass-input cursor-pointer">
                  <option value="DEBIT" className="bg-slate-950">Debit Card</option>
                  <option value="CREDIT" className="bg-slate-950">Credit Card</option>
                </select>
              </div>
              <div>
                <label className="label">Card Network</label>
                <select value={form.cardNetwork} onChange={e => setForm(f => ({...f, cardNetwork: e.target.value}))}
                  className="glass-input cursor-pointer">
                  <option value="RUPAY" className="bg-slate-950">RuPay</option>
                  <option value="VISA" className="bg-slate-950">Visa</option>
                  <option value="MASTERCARD" className="bg-slate-950">Mastercard</option>
                </select>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 btn-primary text-sm">Request</button>
                <button type="button" onClick={() => setShowRequest(false)} className="flex-1 btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Set PIN Modal */}
      {showPin && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-frosted rounded-[2.5rem] p-8 w-full max-w-sm modal-transition border border-white/10 shadow-2xl">
            <h2 className="font-extrabold text-xl text-white mb-6 flex items-center gap-2"><FaKey className="text-cyan-400" /> Set Card PIN</h2>
            <form onSubmit={setPin} className="space-y-5">
              <div>
                <label className="label">CVV (3 digits)</label>
                <input type="password" maxLength={3} required value={pinForm.cvv} onChange={e => setPinForm(f => ({...f, cvv: e.target.value}))}
                  placeholder="•••"
                  className="glass-input text-center tracking-widest text-lg font-bold" />
              </div>
              <div>
                <label className="label">New PIN (4 digits)</label>
                <input type="password" maxLength={4} required value={pinForm.pin} onChange={e => setPinForm(f => ({...f, pin: e.target.value}))}
                  placeholder="••••"
                  className="glass-input text-center tracking-widest text-lg font-bold" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 btn-primary text-sm">Set PIN</button>
                <button type="button" onClick={() => setShowPin(null)} className="flex-1 btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── UPI Page ──────────────────────────────────────────────────
export function UpiPage() {
  const [upiIds, setUpiIds]   = useState([]);
  const [otherUpiIds, setOtherUpiIds] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [tab, setTab]         = useState('ids');
  const [qrUrl, setQrUrl]     = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm]       = useState({ accountId:'', upiId:'' });
  const [sendForm, setSendForm] = useState({ fromUpiId:'', toUpiId:'', amount:'', description:'' });

  useEffect(() => {
    upiApi.getAll().then(r => setUpiIds(r.data.data || [])).catch(()=>{});
    accountApi.getAll().then(r => setAccounts((r.data.data||[]).filter(a=>a.status==='ACTIVE'))).catch(()=>{});
    upiApi.getOther().then(r => setOtherUpiIds(r.data.data || [])).catch(()=>{});
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
    <div className="space-y-6 page-transition">
      <div>
        <h1 className="text-2xl font-black text-white">Unified Payments Interface</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Make instant transfers and generate personal scan codes</p>
      </div>

      <div className="flex rounded-2xl bg-white/5 border border-white/5 p-1">
        {[['ids','My UPI IDs'],['send','Send Money'],['qr','QR Code']].map(([key,label]) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all duration-300
              ${tab===key ? 'bg-gradient-to-r from-[#005CFF] to-[#00BAF2] text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'ids' && (
        <div className="space-y-4">
          <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2 text-sm py-2 px-5">
            <FaPlus /> Create UPI ID
          </button>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            {upiIds.map(u => (
              <div key={u.id} className="glass-card glass-card-hover p-6 border border-white/5 flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-cyan-400 p-2.5 rounded-xl bg-white/5"><FaMobileAlt /></span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-white text-base">{u.upiId}</p>
                        {u.isDefault && <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] rounded-full uppercase tracking-wider font-bold">Default</span>}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 uppercase tracking-wider font-semibold">Linked: {u.linkedAccountNumber}</p>
                    </div>
                  </div>
                </div>
                <button onClick={() => { getQr(u.upiId); setTab('qr'); }} className="flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 uppercase tracking-wider">
                  <FaQrcode /> QR Code
                </button>
              </div>
            ))}
          </div>
          {upiIds.length === 0 && (
            <div className="glass-card text-center py-16 text-slate-500 font-bold border border-white/5">
              No active UPI IDs found.
            </div>
          )}
        </div>
      )}

      {tab === 'send' && (
        <div className="max-w-md mx-auto glass-card border border-white/5 p-6">
          <h2 className="font-extrabold text-white text-lg mb-6 flex items-center gap-2 border-b border-white/5 pb-4"><FaPaperPlane className="text-cyan-400" /> Send Money via UPI</h2>
          <form onSubmit={sendMoney} className="space-y-5">
            <div>
              <label className="label">From UPI ID</label>
              <select required value={sendForm.fromUpiId} onChange={e => setSendForm(f => ({...f, fromUpiId: e.target.value}))}
                className="glass-input cursor-pointer">
                <option value="" className="bg-slate-950">Select your UPI ID</option>
                {upiIds.map(u => <option key={u.id} value={u.upiId} className="bg-slate-950">{u.upiId}</option>)}
              </select>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Recipient UPI ID</label>
                <input required value={sendForm.toUpiId} onChange={e => setSendForm(f => ({...f, toUpiId: e.target.value}))}
                  placeholder="recipient@paytm"
                  className="glass-input" />
              </div>
              {otherUpiIds.length > 0 && (
                <div>
                  <label className="label text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Quick Select Other UPI IDs</label>
                  <select onChange={e => setSendForm(f => ({ ...f, toUpiId: e.target.value }))}
                    className="glass-input cursor-pointer text-xs" value={sendForm.toUpiId}>
                    <option value="" className="bg-slate-950">-- Select a UPI ID to auto-fill --</option>
                    {otherUpiIds.map(ou => (
                      <option key={ou.id} value={ou.upiId} className="bg-slate-950">
                        {ou.ownerName} — {ou.upiId}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div>
              <label className="label">Amount (₹)</label>
              <input type="number" required min="1" value={sendForm.amount} onChange={e => setSendForm(f => ({...f, amount: e.target.value}))}
                placeholder="Enter amount"
                className="glass-input" />
            </div>
            <div>
              <label className="label">Add a Note (Optional)</label>
              <input value={sendForm.description} onChange={e => setSendForm(f => ({...f, description: e.target.value}))}
                placeholder="Rent, dinner split, etc..."
                className="glass-input" />
            </div>
            <button type="submit" className="w-full btn-primary mt-2">Send Money</button>
          </form>
        </div>
      )}

      {tab === 'qr' && (
        <div className="max-w-sm mx-auto glass-card border border-white/5 p-6 text-center">
          <h2 className="font-extrabold text-white text-lg mb-6 flex items-center justify-center gap-2 border-b border-white/5 pb-4"><FaQrcode className="text-cyan-400" /> Receive UPI QR</h2>
          <div className="mb-6">
            <select onChange={e => e.target.value && getQr(e.target.value)}
              className="glass-input cursor-pointer">
              <option value="" className="bg-slate-950">Select UPI ID</option>
              {upiIds.map(u => <option key={u.id} value={u.upiId} className="bg-slate-950">{u.upiId}</option>)}
            </select>
          </div>
          {qrUrl ? (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-white p-4 rounded-[2rem] inline-block shadow-inner">
                <img src={qrUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
              </div>
              <a href={qrUrl} download="upi-qr.png" className="block text-cyan-400 hover:text-cyan-300 font-bold uppercase tracking-wider text-xs">Download QR Code</a>
            </div>
          ) : (
            <div className="py-12 text-slate-500">
              <FaQrcode className="text-6xl mx-auto mb-4 opacity-20" />
              <p className="text-sm font-semibold">Select a UPI ID above to render your scanner QR code.</p>
            </div>
          )}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-frosted rounded-[2.5rem] p-8 w-full max-w-sm modal-transition border border-white/10 shadow-2xl">
            <h2 className="font-extrabold text-xl text-white mb-6">Create UPI ID</h2>
            <form onSubmit={createUpi} className="space-y-5">
              <div>
                <label className="label">Link to Account</label>
                <select required value={form.accountId} onChange={e => setForm(f => ({...f, accountId: e.target.value}))}
                  className="glass-input cursor-pointer">
                  <option value="" className="bg-slate-950">Select account</option>
                  {accounts.map(a => <option key={a.id} value={a.id} className="bg-slate-950">{a.accountNumber}</option>)}
                </select>
              </div>
              <div>
                <label className="label">UPI ID string</label>
                <input required value={form.upiId} onChange={e => setForm(f => ({...f, upiId: e.target.value}))}
                  placeholder="e.g. name@paytm"
                  className="glass-input" />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="flex-1 btn-primary text-sm">Create</button>
                <button type="button" onClick={() => setShowCreate(false)} className="flex-1 btn-secondary text-sm">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
