// ============================================================
// src/services/api.js  — Axios instance + all API calls
// ============================================================
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const API = axios.create({ baseURL });

// Attach token
API.interceptors.request.use(config => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Refresh token on 401
API.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refresh = localStorage.getItem('refreshToken');
        const { data } = await axios.post(`${baseURL}/auth/refresh`, { refreshToken: refresh });
        localStorage.setItem('accessToken', data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return API(original);
      } catch { localStorage.clear(); window.location.href = '/login'; }
    }
    return Promise.reject(err);
  }
);

// ── Auth ───────────────────────────────────────────────────
export const authApi = {
  register: (data) => API.post('/auth/register', data),
  login:    (data) => API.post('/auth/login', data),
  forgotPassword: (email) => API.post('/auth/forgot-password', { email }),
  resetPassword:  (data)  => API.post('/auth/reset-password', data),
  refresh:  (token) => API.post('/auth/refresh', { refreshToken: token }),
};

// ── User ───────────────────────────────────────────────────
export const userApi = {
  getProfile:        ()    => API.get('/users/me'),
  updateProfile:     (d)   => API.put('/users/me', d),
  submitKyc:         (d)   => API.post('/users/kyc', d),
  getKycStatus:      ()    => API.get('/users/kyc'),
  getBeneficiaries:  ()    => API.get('/users/beneficiaries'),
  addBeneficiary:    (d)   => API.post('/users/beneficiaries', d),
  removeBeneficiary: (id)  => API.delete(`/users/beneficiaries/${id}`),
  uploadAvatar:      (f)   => API.post('/users/me/avatar', f, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// ── Accounts ───────────────────────────────────────────────
export const accountApi = {
  getAll:         ()    => API.get('/accounts'),
  getById:        (id)  => API.get(`/accounts/${id}`),
  open:           (d)   => API.post('/accounts/open', d),
  close:          (id)  => API.patch(`/accounts/${id}/close`),
  getTypes:       ()    => API.get('/accounts/types'),
  getBranches:    ()    => API.get('/accounts/branches'),
  getStatement:   (d)   => API.post('/accounts/statement', d, { responseType: 'blob' }),
};

// ── Transactions ────────────────────────────────────────────
export const txnApi = {
  deposit:          (d)      => API.post('/transactions/deposit', d),
  withdraw:         (d)      => API.post('/transactions/withdraw', d),
  transfer:         (d)      => API.post('/transactions/transfer', d),
  getHistory:       (p=0,s=20) => API.get(`/transactions?page=${p}&size=${s}`),
  getByRef:         (ref)    => API.get(`/transactions/${ref}`),
  search:           (params) => API.get('/transactions/search', { params }),
  getReceipt:       (ref)    => API.get(`/transactions/${ref}/receipt`, { responseType: 'blob' }),
  schedule:         (d)      => API.post('/transactions/schedule', d),
  getScheduled:     ()       => API.get('/transactions/scheduled'),
};

// ── Loans ───────────────────────────────────────────────────
export const loanApi = {
  getTypes:       ()             => API.get('/loans/types'),
  calculate:      (p)            => API.get('/loans/calculate', { params: p }),
  apply:          (d)            => API.post('/loans/apply', d),
  getApplications:()             => API.get('/loans/applications'),
  getLoans:       ()             => API.get('/loans'),
  getEmiSchedule: (id)           => API.get(`/loans/${id}/emi-schedule`),
  payEmi:         (id, accountId)=> API.post(`/loans/${id}/pay-emi?accountId=${accountId}`),
};

// ── Cards ───────────────────────────────────────────────────
export const cardApi = {
  getAll:         ()    => API.get('/cards'),
  request:        (d)   => API.post('/cards/request', d),
  block:          (id,d)=> API.patch(`/cards/${id}/block`, d),
  unblock:        (id)  => API.patch(`/cards/${id}/unblock`),
  setPin:         (d)   => API.post('/cards/set-pin', d),
  getAnalytics:   (id)  => API.get(`/cards/${id}/analytics`),
  updateSettings: (id,d)=> API.patch(`/cards/${id}/settings`, d),
};

// ── UPI ─────────────────────────────────────────────────────
export const upiApi = {
  getAll:        ()     => API.get('/upi'),
  create:        (d)    => API.post('/upi', d),
  getQr:         (id)   => API.get(`/upi/${id}/qr`, { responseType: 'blob' }),
  send:          (d)    => API.post('/upi/send', d),
  requestMoney:  (d)    => API.post('/upi/request', d),
  getHistory:    (p=0)  => API.get(`/upi/history?page=${p}`),
  delete:        (id)   => API.delete(`/upi/${id}`),
};

// ── Notifications ───────────────────────────────────────────
export const notifApi = {
  getAll:        (p=0)  => API.get(`/notifications?page=${p}`),
  getUnreadCount:()     => API.get('/notifications/unread-count'),
  markAllRead:   ()     => API.patch('/notifications/mark-all-read'),
};

// ── Admin ────────────────────────────────────────────────────
export const adminApi = {
  getDashboard:         ()       => API.get('/admin/dashboard'),
  getCustomers:         (p,s,q)  => API.get(`/admin/customers?page=${p}&size=${s}&search=${q||''}`),
  activateCustomer:     (id)     => API.patch(`/admin/customers/${id}/activate`),
  deactivateCustomer:   (id)     => API.patch(`/admin/customers/${id}/deactivate`),
  unlockCustomer:       (id)     => API.patch(`/admin/customers/${id}/unlock`),
  getPendingKyc:        (p)      => API.get(`/admin/kyc/pending?page=${p}`),
  verifyKyc:            (id,d)   => API.patch(`/admin/kyc/${id}/verify`, d),
  getPendingLoans:      (p)      => API.get(`/admin/loans/pending?page=${p}`),
  reviewLoan:           (d)      => API.post('/admin/loans/review', d),
  getAllTransactions:    (p)      => API.get(`/admin/transactions?page=${p}`),
  getSummaryReport:     (f,t)    => API.get(`/admin/reports/summary?from=${f}&to=${t}`),
  getAllAccounts:        (p)      => API.get(`/admin/accounts?page=${p}`),
  getBranches:          ()       => API.get('/admin/branches'),
  createBranch:         (d)      => API.post('/admin/branches', d),
  getEmployees:         (p)      => API.get(`/admin/employees?page=${p}`),
};

export default API;
