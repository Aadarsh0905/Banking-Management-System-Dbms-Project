// ============================================================
// src/pages/ProfilePage.jsx
// ============================================================

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  FaBell,
  FaCamera,
  FaCheckCircle,
  FaClock,
  FaEdit,
  FaIdCard,
  FaPlus,
  FaTrash,
  FaUser,
  FaUsers,
  FaUniversity,
} from 'react-icons/fa';
import { useAuth } from '../context/Contexts';
import { notifApi, userApi, accountApi } from '../services/api';


export function ProfilePage() {
  const { user, fetchProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', gender: '' });
  const [uploading, setUploading] = useState(false);
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    if (user) setForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone, gender: user.gender });
  }, [user]);

  useEffect(() => {
    accountApi.getAll()
      .then(r => setAccounts(r.data.data || []))
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to load accounts in profile');
      });
  }, []);

  async function updateProfile(e) {
    e.preventDefault();
    try {
      await userApi.updateProfile(form);
      await fetchProfile();
      toast.success('Profile updated!');
      setEditing(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update'); }
  }

  async function handleAvatarUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await userApi.uploadAvatar(formData);
      await fetchProfile();
      toast.success('Avatar uploaded!');
    } catch (err) { toast.error('Upload failed'); }
    finally { setUploading(false); }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">My Profile</h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider font-semibold">Manage your personal settings and KYC state</p>
      </div>

      {/* Avatar */}
      <div className="glass-card text-center relative overflow-hidden">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <img src={user?.profilePictureUrl || 'https://via.placeholder.com/100'} alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-white/10" />
          <label className="absolute bottom-0 right-0 bg-gradient-to-tr from-blue-600 to-cyan-500 text-white p-2 rounded-full cursor-pointer hover:from-blue-500 hover:to-cyan-400 transition-all shadow-md">
            <FaCamera />
            <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
        <h2 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h2>
        <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
      </div>

      {/* Profile Info */}
      <div className="glass-card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-extrabold text-white flex items-center gap-2 text-base"><FaUser className="text-cyan-400" /> Personal Information</h2>
          <button onClick={() => setEditing(!editing)} className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            {editing ? 'Cancel' : <><FaEdit /> Edit</>}
          </button>
        </div>

        {editing ? (
          <form onSubmit={updateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">First Name</label>
              <input value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))}
                className="glass-input" />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))}
                className="glass-input" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                className="glass-input" />
            </div>
            <div>
              <label className="label">Gender</label>
              <select value={form.gender} onChange={e => setForm(f => ({...f, gender: e.target.value}))}
                className="w-full bg-slate-900/60 border border-cyan-500/10 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 rounded-2xl px-4 py-3 text-white focus:outline-none transition-all duration-300 text-sm cursor-pointer">
                <option value="MALE" className="bg-slate-950">Male</option>
                <option value="FEMALE" className="bg-slate-950">Female</option>
                <option value="OTHER" className="bg-slate-950">Other</option>
              </select>
            </div>
            <div className="md:col-span-2 mt-2">
              <button type="submit" className="w-full btn-primary text-sm">Save Changes</button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div><p className="text-slate-500 font-medium">First Name</p><p className="font-semibold text-slate-200 mt-1">{user?.firstName}</p></div>
            <div><p className="text-slate-500 font-medium">Last Name</p><p className="font-semibold text-slate-200 mt-1">{user?.lastName}</p></div>
            <div><p className="text-slate-500 font-medium">Email</p><p className="font-semibold text-slate-200 mt-1">{user?.email}</p></div>
            <div><p className="text-slate-500 font-medium">Phone</p><p className="font-semibold text-slate-200 mt-1">{user?.phone}</p></div>
            <div><p className="text-slate-500 font-medium">Gender</p><p className="font-semibold text-slate-200 mt-1 uppercase">{user?.gender}</p></div>
            <div><p className="text-slate-500 font-medium">Member Since</p><p className="font-semibold text-slate-200 mt-1">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p></div>
          </div>
        )}
      </div>

      {/* Account Status */}
      <div className="glass-card">
        <h2 className="font-extrabold text-white text-base mb-4">Security & Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className={`w-2.5 h-2.5 rounded-full ${user?.isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-slate-300">{user?.isActive ? 'Account Active' : 'Account Inactive'}</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className={`w-2.5 h-2.5 rounded-full ${user?.isLocked ? 'bg-red-400' : 'bg-green-400'}`}></div>
            <span className="text-slate-300">{user?.isLocked ? 'Account Locked' : 'Account Unlocked'}</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className={`w-2.5 h-2.5 rounded-full ${user?.emailVerified ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`}></div>
            <span className="text-slate-300">{user?.emailVerified ? 'Email Verified' : 'Email Verification Pending'}</span>
          </div>
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className={`w-2.5 h-2.5 rounded-full ${user?.kycStatus === 'VERIFIED' ? 'bg-green-400' : 'bg-yellow-400 animate-pulse'}`}></div>
            <span className="text-slate-300">KYC Status: {user?.kycStatus || 'NOT SUBMITTED'}</span>
          </div>
        </div>
      </div>

      {/* Opened Bank Accounts */}
      <div className="glass-card">
        <h2 className="font-extrabold text-white mb-6 flex items-center gap-2 text-base">
          <FaUniversity className="text-cyan-400" /> Opened Bank Accounts
        </h2>
        {accounts.length === 0 ? (
          <p className="text-slate-500 text-sm">No opened bank accounts found.</p>
        ) : (
          <div className="space-y-3">
            {accounts.map(acc => (
              <div key={acc.id} className="flex justify-between items-center p-4 bg-white/[0.02] border border-white/5 hover:border-white/10 rounded-2xl transition-all">
                <div>
                  <p className="font-bold text-sm text-white">{acc.accountType}</p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{acc.accountNumber} — {acc.branchName}</p>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm text-cyan-400">₹{acc.availableBalance?.toLocaleString('en-IN')}</p>
                  <span className={`inline-block px-2 py-0.5 text-[9px] font-bold rounded-full uppercase tracking-wider mt-1 ${
                    acc.status === 'ACTIVE' ? 'bg-cyan-500/10 text-cyan-400' :
                    acc.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400' :
                    acc.status === 'PENDING_CLOSE' ? 'bg-orange-500/10 text-orange-400' :
                    acc.status === 'FROZEN' ? 'bg-blue-500/10 text-blue-400' :
                    acc.status === 'CLOSED' ? 'bg-red-500/10 text-red-400' :
                    'bg-white/5 text-slate-400'
                  }`}>{acc.status === 'PENDING_CLOSE' ? 'Closure Pending' : acc.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// src/pages/KycPage.jsx
// ============================================================

export function KycPage() {
  const { fetchProfile } = useAuth();
  const [kyc, setKyc] = useState(null);
  const [form, setForm] = useState({ aadhaarNumber: '', panNumber: '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadKyc();
  }, []);

  async function loadKyc() {
    try {
      const res = await userApi.getKycStatus();
      setKyc(res.data.data);
      if (res.data.data?.status === 'PENDING' || res.data.data?.status === 'NOT_SUBMITTED') {
        setSubmitted(false);
      } else {
        setSubmitted(true);
      }
    } catch {
      setKyc({ status: 'NOT_SUBMITTED' });
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  }

  async function submitKyc(e) {
    e.preventDefault();
    try {
      await userApi.submitKyc(form);
      toast.success('KYC submitted for verification!');
      setSubmitted(true);
      if (fetchProfile) await fetchProfile();
      await loadKyc();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
  }

  if (loading) return <div className="flex justify-center items-center h-96"><div className="spinner" /></div>;

  const statusIcon = {
    VERIFIED: <FaCheckCircle className="text-green-500 text-2xl" />,
    SUBMITTED: <FaClock className="text-yellow-500 text-2xl" />,
    PENDING: <FaClock className="text-cyan-400 text-2xl" />,
    REJECTED: <span className="text-red-500 text-2xl">✕</span>,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">KYC Verification</h1>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white shadow-indigo-600/10">
        <div className="flex items-center gap-4">
          {statusIcon[kyc?.status] || statusIcon.PENDING}
          <div>
            <p className="text-sm opacity-80">Current Status</p>
            <p className="text-2xl font-bold capitalize">{kyc?.status || 'Not Submitted'}</p>
          </div>
        </div>
      </div>

      {kyc?.status === 'VERIFIED' ? (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
          <h2 className="font-semibold text-green-400 mb-2">✓ KYC Verified</h2>
          <p className="text-sm text-slate-300">Your KYC has been verified successfully. You can access all banking services.</p>
        </div>
      ) : kyc?.status === 'REJECTED' ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
          <h2 className="font-semibold text-red-400 mb-2">KYC Rejected</h2>
          <p className="text-sm text-slate-300">Your KYC application was rejected. Please submit again with correct documents.</p>
          <button onClick={() => setSubmitted(false)} className="mt-3 text-red-400 text-sm hover:underline">Resubmit KYC</button>
        </div>
      ) : kyc?.status === 'SUBMITTED' ? (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6">
          <h2 className="font-semibold text-yellow-400 mb-2">Under Review</h2>
          <p className="text-sm text-slate-300">Your KYC is under review. This usually takes 1-2 business days.</p>
        </div>
      ) : null}

      {!submitted && kyc?.status !== 'VERIFIED' && (
        <div className="glass-card">
          <h2 className="font-semibold dark:text-white mb-4 flex items-center gap-2"><FaIdCard /> Submit KYC Documents</h2>
          <form onSubmit={submitKyc} className="space-y-4">
            <div>
              <label className="label">Aadhaar Number</label>
              <input required value={form.aadhaarNumber} onChange={e => setForm(f => ({...f, aadhaarNumber: e.target.value}))}
                placeholder="12-digit Aadhaar number" maxLength={12}
                className="glass-input" />
            </div>
            <div>
              <label className="label">PAN Card</label>
              <input required value={form.panNumber} onChange={e => setForm(f => ({...f, panNumber: e.target.value.toUpperCase()}))}
                placeholder="10-character PAN" maxLength={10} style={{ textTransform: 'uppercase' }}
                className="glass-input" />
            </div>
            <div>
              <label className="label">Address Line 1</label>
              <input required value={form.addressLine1} onChange={e => setForm(f => ({...f, addressLine1: e.target.value}))}
                className="glass-input" />
            </div>
            <div>
              <label className="label">Address Line 2 (optional)</label>
              <input value={form.addressLine2} onChange={e => setForm(f => ({...f, addressLine2: e.target.value}))}
                className="glass-input" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">City</label>
                <input required value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))}
                  className="glass-input" />
              </div>
              <div>
                <label className="label">State</label>
                <input required value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))}
                  className="glass-input" />
              </div>
            </div>
            <div>
              <label className="label">Pincode</label>
              <input required value={form.pincode} onChange={e => setForm(f => ({...f, pincode: e.target.value}))}
                maxLength={6}
                className="glass-input" />
            </div>
            <button type="submit" className="w-full btn-primary text-sm">Submit for Verification</button>
          </form>
        </div>
      )}
    </div>
  );
}

// ============================================================
// src/pages/BeneficiariesPage.jsx
// ============================================================

export function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ nickname: '', accountNumber: '', ifscCode: '', bankName: '', beneficiaryName: '' });

  useEffect(() => { loadBeneficiaries(); }, []);

  async function loadBeneficiaries() {
    try {
      const res = await userApi.getBeneficiaries();
      setBeneficiaries(res.data.data || []);
    } catch { toast.error('Failed to load beneficiaries'); }
  }

  async function addBeneficiary(e) {
    e.preventDefault();
    try {
      await userApi.addBeneficiary(form);
      toast.success('Beneficiary added!');
      setForm({ nickname: '', accountNumber: '', ifscCode: '', bankName: '', beneficiaryName: '' });
      setShowAdd(false);
      await loadBeneficiaries();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  }

  async function removeBeneficiary(id) {
    if (!confirm('Remove this beneficiary?')) return;
    try {
      await userApi.removeBeneficiary(id);
      toast.success('Beneficiary removed');
      await loadBeneficiaries();
    } catch { toast.error('Failed to remove'); }
  }

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-white">Beneficiaries</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 btn-primary py-2 px-4 text-sm">
          <FaPlus /> Add Beneficiary
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {beneficiaries.map(b => (
          <div key={b.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold dark:text-white">{b.nickname}</h3>
              <button onClick={() => removeBeneficiary(b.id)} className="text-red-500 hover:text-red-700 p-1">
                <FaTrash className="text-sm" />
              </button>
            </div>
            <div className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              <p><span className="font-medium">Name:</span> {b.beneficiaryName}</p>
              <p><span className="font-medium">Account:</span> {b.accountNumber}</p>
              <p><span className="font-medium">IFSC:</span> {b.ifscCode}</p>
              {b.bankName && <p><span className="font-medium">Bank:</span> {b.bankName}</p>}
            </div>
          </div>
        ))}
        {beneficiaries.length === 0 && (
          <div className="col-span-3 text-center py-12 text-gray-400">
            <FaUsers className="text-5xl mx-auto mb-3 opacity-30" />
            <p>No beneficiaries added yet</p>
          </div>
        )}
      </div>

      {showAdd && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md modal-transition">
            <h2 className="font-bold text-lg dark:text-white mb-4">Add Beneficiary</h2>
            <form onSubmit={addBeneficiary} className="space-y-4">
              <input required value={form.nickname} onChange={e => setForm(f => ({...f, nickname: e.target.value}))}
                placeholder="Nickname (e.g., Mom, Brother)"
                className="glass-input" />
              <input required value={form.beneficiaryName} onChange={e => setForm(f => ({...f, beneficiaryName: e.target.value}))}
                placeholder="Full Name"
                className="glass-input" />
              <input required value={form.accountNumber} onChange={e => setForm(f => ({...f, accountNumber: e.target.value}))}
                placeholder="Account Number"
                className="glass-input" />
              <input required value={form.ifscCode} onChange={e => setForm(f => ({...f, ifscCode: e.target.value}))}
                placeholder="IFSC Code"
                className="glass-input" />
              <input value={form.bankName} onChange={e => setForm(f => ({...f, bankName: e.target.value}))}
                placeholder="Bank Name (optional)"
                className="glass-input" />
              <div className="flex gap-3 mt-4">
                <button type="submit" className="flex-1 btn-primary text-sm py-2">Add</button>
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 btn-secondary text-sm py-2">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// src/pages/NotificationsPage.jsx
// ============================================================

export function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadNotifications(); }, [page]);

  async function loadNotifications() {
    setLoading(true);
    try {
      const res = await notifApi.getAll(page);
      const data = res.data.data;
      setNotifications(data?.content || []);
      setTotal(data?.totalPages || 0);
    } catch { }
    finally { setLoading(false); }
  }

  async function markAllRead() {
    try {
      await notifApi.markAllRead();
      await loadNotifications();
    } catch { }
  }

  const channelIcon = { EMAIL: '📧', SMS: '📱', IN_APP: '🔔' };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-white">Notifications</h1>
        {notifications.some(n => n.status !== 'READ') && (
          <button onClick={markAllRead} className="text-sm text-cyan-400 hover:text-cyan-300 font-bold hover:underline">Mark all as read</button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><div className="spinner" /></div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <FaBell className="text-5xl mx-auto mb-3 opacity-30" />
          <p>No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`rounded-3xl p-5 border ${n.status === 'READ' ? 'bg-white/[0.02] border-white/5' : 'bg-cyan-500/5 border-cyan-500/25'}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-lg">{channelIcon[n.channel] || '📌'}</span>
                  <div className="flex-1">
                    <p className={`font-medium ${n.status === 'READ' ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>{n.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(n.createdAt).toLocaleString('en-IN', {dateStyle:'short',timeStyle:'short'})}</p>
                  </div>
                </div>
                {n.status === 'READ' && <FaCheckCircle className="text-green-500 mt-1" />}
              </div>
            </div>
          ))}
        </div>
      )}

      {total > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="px-4 py-2 border rounded-lg disabled:opacity-40 dark:border-gray-600 dark:text-white">Previous</button>
          <span className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">Page {page + 1} of {total}</span>
          <button disabled={page >= total - 1} onClick={() => setPage(p => p + 1)} className="px-4 py-2 border rounded-lg disabled:opacity-40 dark:border-gray-600 dark:text-white">Next</button>
        </div>
      )}
    </div>
  );
}
