// ============================================================
// src/pages/SpendingInsightsPage.jsx  — AI Spending Analysis
// ============================================================

import { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import {
  FaChartPie,
  FaCheckCircle,
  FaExclamationTriangle,
  FaLightbulb,
  FaShieldAlt,
  FaSpinner,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { accountApi, txnApi } from '../services/api';


Chart.register(...registerables);

const COLORS = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#84cc16'];

export function SpendingInsightsPage() {
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts]         = useState([]);
  const [insights, setInsights]         = useState(null);
  const [loading, setLoading]           = useState(false);
  const [aiLoading, setAiLoading]       = useState(false);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [txnRes, accRes] = await Promise.all([
        txnApi.getHistory(0, 100),
        accountApi.getAll()
      ]);
      setTransactions(txnRes.data.data?.content || []);
      setAccounts(accRes.data.data || []);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  }

  // ── Compute local analytics ──────────────────────────────
  const debits    = transactions.filter(t => t.transactionType === 'WITHDRAWAL' || t.transactionType === 'TRANSFER' || t.transactionType === 'UPI_DEBIT' || t.transactionType === 'EMI_DEBIT');
  const credits   = transactions.filter(t => t.transactionType === 'DEPOSIT'   || t.transactionType === 'UPI_CREDIT');
  const totalSpent  = debits.reduce((s, t)  => s + (t.amount || 0), 0);
  const totalEarned = credits.reduce((s, t) => s + (t.amount || 0), 0);

  // Group by type
  const spendByType = debits.reduce((acc, t) => {
    const key = t.transactionType.replace('_', ' ');
    acc[key] = (acc[key] || 0) + (t.amount || 0);
    return acc;
  }, {});

  // Monthly spend (last 6 months)
  const monthly = {};
  transactions.forEach(t => {
    if (!t.initiatedAt) return;
    const month = new Date(t.initiatedAt).toLocaleString('en-IN', { month: 'short', year: '2-digit' });
    if (!monthly[month]) monthly[month] = { debit: 0, credit: 0 };
    if (t.transactionType === 'WITHDRAWAL' || t.transactionType === 'TRANSFER' || t.transactionType === 'UPI_DEBIT')
      monthly[month].debit += (t.amount || 0);
    else if (t.transactionType === 'DEPOSIT' || t.transactionType === 'UPI_CREDIT')
      monthly[month].credit += (t.amount || 0);
  });
  const months = Object.keys(monthly).slice(-6);

  const barData = {
    labels: months,
    datasets: [
      { label: 'Credit', data: months.map(m => monthly[m]?.credit || 0), backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 4 },
      { label: 'Debit',  data: months.map(m => monthly[m]?.debit  || 0), backgroundColor: 'rgba(239,68,68,0.7)',  borderRadius: 4 },
    ]
  };

  const donutData = {
    labels: Object.keys(spendByType),
    datasets: [{ data: Object.values(spendByType), backgroundColor: COLORS }]
  };

  // ── AI Insights ──────────────────────────────────────────
  async function getAiInsights() {
    setAiLoading(true);
    const summary = `
Total transactions: ${transactions.length}
Total spent: ₹${totalSpent.toLocaleString('en-IN')}
Total earned: ₹${totalEarned.toLocaleString('en-IN')}
Spending breakdown: ${JSON.stringify(spendByType)}
Number of accounts: ${accounts.length}
Total balance: ₹${accounts.reduce((s,a) => s+(a.balance||0), 0).toLocaleString('en-IN')}
    `.trim();

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are a financial advisor AI. Analyze this customer's banking data and provide 3-5 actionable spending insights and recommendations. Be specific, concise, and helpful.\n\nCustomer data:\n${summary}\n\nProvide insights as a JSON array with objects having "title" and "description" fields. Return ONLY valid JSON, no markdown.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || '[]';
      const cleaned = text.replace(/```json|```/g, '').trim();
      setInsights(JSON.parse(cleaned));
    } catch (err) {
      toast.error('AI insights unavailable');
      setInsights([
        { title: 'Monitor Your Withdrawals', description: `You've spent ₹${totalSpent.toLocaleString('en-IN')} recently. Consider setting a monthly budget.` },
        { title: 'Savings Opportunity', description: totalEarned > totalSpent ? `Great! You earned more than you spent. Consider opening a Fixed Deposit with the surplus.` : `Your spending exceeds income. Review recurring transfers and withdrawals.` },
        { title: 'EMI Management', description: 'Check your loan EMI schedule to avoid overdue payments and maintain a good credit profile.' },
      ]);
    } finally { setAiLoading(false); }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white">Spending Insights</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered analysis of your financial activity</p>
        </div>
        <button onClick={getAiInsights} disabled={aiLoading}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
          {aiLoading ? <FaSpinner className="animate-spin" /> : <FaLightbulb />}
          {aiLoading ? 'Analyzing...' : 'Get AI Insights'}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-5 text-white">
          <p className="text-sm opacity-80">Total Credited</p>
          <p className="text-2xl font-bold">₹{totalEarned.toLocaleString('en-IN')}</p>
          <p className="text-xs opacity-70 mt-1">{credits.length} transactions</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-rose-600 rounded-xl p-5 text-white">
          <p className="text-sm opacity-80">Total Debited</p>
          <p className="text-2xl font-bold">₹{totalSpent.toLocaleString('en-IN')}</p>
          <p className="text-xs opacity-70 mt-1">{debits.length} transactions</p>
        </div>
        <div className={`bg-gradient-to-br ${totalEarned >= totalSpent ? 'from-blue-500 to-blue-700' : 'from-orange-500 to-orange-700'} rounded-xl p-5 text-white`}>
          <p className="text-sm opacity-80">Net Flow</p>
          <p className="text-2xl font-bold">₹{Math.abs(totalEarned - totalSpent).toLocaleString('en-IN')}</p>
          <p className="text-xs opacity-70 mt-1">{totalEarned >= totalSpent ? '↑ Net positive' : '↓ Net negative'}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="font-semibold dark:text-white mb-4">Monthly Cash Flow</h2>
          {months.length > 0
            ? <Bar data={barData} options={{ responsive: true, plugins: { legend: { position: 'top' } } }} />
            : <p className="text-gray-400 text-center py-12">No data available</p>}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="font-semibold dark:text-white mb-4">Spending by Category</h2>
          {Object.keys(spendByType).length > 0
            ? <Doughnut data={donutData} options={{ responsive: true, plugins: { legend: { position: 'right' } } }} />
            : <p className="text-gray-400 text-center py-12">No spending data</p>}
        </div>
      </div>

      {/* AI Insights */}
      {insights && (
        <div className="space-y-3">
          <h2 className="font-semibold dark:text-white flex items-center gap-2">
            <FaLightbulb className="text-yellow-500" /> AI Recommendations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {insights.map((insight, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border-l-4 border-purple-500">
                <h3 className="font-semibold dark:text-white text-sm mb-2">{insight.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{insight.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent transaction table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="font-semibold dark:text-white mb-4">Recent Activity</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-gray-400 text-xs border-b dark:border-gray-700">
              <th className="pb-2 text-left">Date</th>
              <th className="pb-2 text-left">Type</th>
              <th className="pb-2 text-right">Amount</th>
              <th className="pb-2 text-left">Status</th>
            </tr></thead>
            <tbody>
              {transactions.slice(0, 10).map(t => (
                <tr key={t.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                  <td className="py-2 text-gray-500 dark:text-gray-400 text-xs">{t.initiatedAt ? new Date(t.initiatedAt).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="py-2 dark:text-gray-300">{t.transactionType?.replace('_',' ')}</td>
                  <td className={`py-2 text-right font-medium ${t.transactionType === 'DEPOSIT' || t.transactionType === 'UPI_CREDIT' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.transactionType === 'DEPOSIT' || t.transactionType === 'UPI_CREDIT' ? '+' : '-'}₹{t.amount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-2">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${t.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.status}</span>
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

// ============================================================
// src/pages/FraudDetectionPage.jsx — Fraud Monitoring
// ============================================================

export function FraudDetectionPage() {
  const [transactions, setTransactions] = useState([]);
  const [flagged, setFlagged]           = useState([]);
  const [analyzing, setAnalyzing]       = useState(false);
  const [aiReport, setAiReport]         = useState(null);

  useEffect(() => { loadAndAnalyze(); }, []);

  async function loadAndAnalyze() {
    setAnalyzing(true);
    try {
      const res = await txnApi.getHistory(0, 50);
      const txns = res.data.data?.content || [];
      setTransactions(txns);

      // Rule-based local fraud detection
      const suspicious = [];

      // Rule 1: Large transactions > ₹50,000
      txns.filter(t => t.amount > 50000 && t.status === 'SUCCESS').forEach(t =>
        suspicious.push({ ...t, reason: 'Large transaction (> ₹50,000)', risk: 'HIGH' }));

      // Rule 2: Multiple transactions in same minute (simulated)
      const byMinute = {};
      txns.forEach(t => {
        if (!t.initiatedAt) return;
        const key = new Date(t.initiatedAt).toISOString().substring(0, 16);
        byMinute[key] = (byMinute[key] || 0) + 1;
      });
      Object.entries(byMinute).filter(([, count]) => count >= 3).forEach(([minute]) => {
        const minuteTxns = txns.filter(t => t.initiatedAt?.startsWith(minute));
        minuteTxns.forEach(t => {
          if (!suspicious.find(s => s.id === t.id))
            suspicious.push({ ...t, reason: 'Multiple transactions within same minute', risk: 'MEDIUM' });
        });
      });

      // Rule 3: Failed transactions (potential probing)
      const failed = txns.filter(t => t.status === 'FAILED');
      if (failed.length >= 2) {
        failed.forEach(t => {
          if (!suspicious.find(s => s.id === t.id))
            suspicious.push({ ...t, reason: 'Repeated failed transaction', risk: 'MEDIUM' });
        });
      }

      setFlagged(suspicious);
    } catch { }
    finally { setAnalyzing(false); }
  }

  async function getAiAnalysis() {
    setAnalyzing(true);
    const summary = {
      total: transactions.length,
      flagged: flagged.length,
      highRisk: flagged.filter(f => f.risk === 'HIGH').length,
      mediumRisk: flagged.filter(f => f.risk === 'MEDIUM').length,
      flaggedDetails: flagged.slice(0, 5).map(f => ({ ref: f.transactionRef, amount: f.amount, reason: f.reason }))
    };

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 800,
          messages: [{
            role: 'user',
            content: `You are a banking fraud detection AI. Analyze this transaction summary and provide a brief risk assessment with recommendations.\n\nData: ${JSON.stringify(summary)}\n\nRespond with JSON: { "riskLevel": "LOW|MEDIUM|HIGH", "summary": "...", "recommendations": ["..."] }. Return ONLY valid JSON.`
          }]
        })
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || '{}';
      setAiReport(JSON.parse(text.replace(/```json|```/g, '').trim()));
    } catch {
      setAiReport({
        riskLevel: flagged.length > 3 ? 'HIGH' : flagged.length > 0 ? 'MEDIUM' : 'LOW',
        summary: `${flagged.length} suspicious transactions detected out of ${transactions.length} total.`,
        recommendations: [
          'Review all flagged high-value transactions.',
          'Enable two-factor authentication for large transfers.',
          'Set up transaction limits for daily withdrawals.',
        ]
      });
    } finally { setAnalyzing(false); }
  }

  const riskColor = { HIGH: 'text-red-600 bg-red-100', MEDIUM: 'text-yellow-600 bg-yellow-100', LOW: 'text-green-600 bg-green-100' };
  const reportBg  = { HIGH: 'from-red-600 to-red-800', MEDIUM: 'from-yellow-500 to-orange-600', LOW: 'from-green-500 to-emerald-600' };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2"><FaShieldAlt className="text-blue-500" /> Fraud Detection</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Rule-based + AI-powered transaction monitoring</p>
        </div>
        <button onClick={getAiAnalysis} disabled={analyzing}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50">
          {analyzing ? <FaSpinner className="animate-spin" /> : <FaShieldAlt />}
          {analyzing ? 'Analyzing...' : 'Run AI Analysis'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 text-center">
          <FaCheckCircle className="text-4xl text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold dark:text-white">{transactions.length - flagged.length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Clean Transactions</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 text-center">
          <FaExclamationTriangle className="text-4xl text-yellow-500 mx-auto mb-2" />
          <p className="text-2xl font-bold dark:text-white">{flagged.filter(f=>f.risk==='MEDIUM').length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Medium Risk</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 text-center">
          <FaShieldAlt className="text-4xl text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold dark:text-white">{flagged.filter(f=>f.risk==='HIGH').length}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">High Risk</p>
        </div>
      </div>

      {/* AI Report */}
      {aiReport && (
        <div className={`bg-gradient-to-r ${reportBg[aiReport.riskLevel] || reportBg.LOW} rounded-xl p-6 text-white`}>
          <div className="flex items-center gap-3 mb-3">
            <FaShieldAlt className="text-2xl" />
            <div>
              <p className="font-bold text-lg">AI Risk Assessment: {aiReport.riskLevel}</p>
              <p className="text-sm opacity-80">{aiReport.summary}</p>
            </div>
          </div>
          <ul className="space-y-1 mt-3">
            {aiReport.recommendations?.map((r, i) => (
              <li key={i} className="text-sm flex items-start gap-2"><span className="opacity-70">→</span> {r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Flagged Transactions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b dark:border-gray-700">
          <h2 className="font-semibold dark:text-white">Flagged Transactions ({flagged.length})</h2>
        </div>
        {flagged.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <FaCheckCircle className="text-4xl mx-auto mb-3 text-green-400" />
            <p>No suspicious transactions detected</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>{['Ref','Type','Amount','Status','Reason','Risk'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {flagged.map((t, i) => (
                  <tr key={i} className="hover:bg-red-50 dark:hover:bg-red-900/10">
                    <td className="px-4 py-3 font-mono text-xs dark:text-gray-300">{t.transactionRef}</td>
                    <td className="px-4 py-3 dark:text-gray-300">{t.transactionType?.replace('_',' ')}</td>
                    <td className="px-4 py-3 font-semibold dark:text-white">₹{t.amount?.toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${t.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{t.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400">{t.reason}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${riskColor[t.risk] || ''}`}>{t.risk}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
