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
} from 'react-icons/fa';
import { useAuth } from '../context/Contexts';
import { notifApi, userApi } from '../services/api';


export function ProfilePage() {
  const { user, fetchProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', gender: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) setForm({ firstName: user.firstName, lastName: user.lastName, phone: user.phone, gender: user.gender });
  }, [user]);

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
      <h1 className="text-2xl font-bold dark:text-white">My Profile</h1>

      {/* Avatar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-8 text-center">
        <div className="relative w-24 h-24 mx-auto mb-4">
          <img src={user?.profilePictureUrl || 'https://via.placeholder.com/100'} alt="Avatar"
            className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 dark:border-blue-900" />
          <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
            <FaCamera />
            <input type="file" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} className="hidden" />
          </label>
        </div>
        <h2 className="text-xl font-semibold dark:text-white">{user?.firstName} {user?.lastName}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
      </div>

      {/* Profile Info */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold dark:text-white flex items-center gap-2"><FaUser /> Personal Information</h2>
          <button onClick={() => setEditing(!editing)} className="text-sm text-blue-600 hover:underline">
            {editing ? 'Cancel' : <FaEdit className="inline mr-1" />}
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        {editing ? (
          <form onSubmit={updateProfile} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">First Name</label>
              <input value={form.firstName} onChange={e => setForm(f => ({...f, firstName: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Last Name</label>
              <input value={form.lastName} onChange={e => setForm(f => ({...f, lastName: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Phone</label>
              <input value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Gender</label>
              <select value={form.gender} onChange={e => setForm(f => ({...f, gender: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="col-span-2">
              <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">Save Changes</button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-500 dark:text-gray-400">First Name</p><p className="font-medium dark:text-white">{user?.firstName}</p></div>
            <div><p className="text-gray-500 dark:text-gray-400">Last Name</p><p className="font-medium dark:text-white">{user?.lastName}</p></div>
            <div><p className="text-gray-500 dark:text-gray-400">Email</p><p className="font-medium dark:text-white">{user?.email}</p></div>
            <div><p className="text-gray-500 dark:text-gray-400">Phone</p><p className="font-medium dark:text-white">{user?.phone}</p></div>
            <div><p className="text-gray-500 dark:text-gray-400">Gender</p><p className="font-medium dark:text-white">{user?.gender}</p></div>
            <div><p className="text-gray-500 dark:text-gray-400">Member Since</p><p className="font-medium dark:text-white">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</p></div>
          </div>
        )}
      </div>

      {/* Account Status */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="font-semibold dark:text-white mb-4">Account Status</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="dark:text-gray-300">{user?.isActive ? 'Account Active' : 'Account Inactive'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${user?.isLocked ? 'bg-red-500' : 'bg-green-500'}`}></div>
            <span className="dark:text-gray-300">{user?.isLocked ? 'Account Locked' : 'Account Unlocked'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${user?.emailVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="dark:text-gray-300">{user?.emailVerified ? 'Email Verified' : 'Email Pending'}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${user?.kycStatus === 'VERIFIED' ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="dark:text-gray-300">KYC: {user?.kycStatus || 'PENDING'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// src/pages/KycPage.jsx
// ============================================================

export function KycPage() {
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
      if (res.data.data?.status === 'PENDING') {
        setSubmitted(false);
      } else {
        setSubmitted(true);
      }
    } catch {
      setKyc({ status: 'NOT_SUBMITTED' });
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
      await loadKyc();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
  }

  if (loading) return <div className="flex justify-center items-center h-96"><div className="spinner" /></div>;

  const statusIcon = {
    VERIFIED: <FaCheckCircle className="text-green-500 text-2xl" />,
    SUBMITTED: <FaClock className="text-yellow-500 text-2xl" />,
    PENDING: <FaClock className="text-blue-500 text-2xl" />,
    REJECTED: <span className="text-red-500 text-2xl">✕</span>,
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">KYC Verification</h1>

      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center gap-4">
          {statusIcon[kyc?.status] || statusIcon.PENDING}
          <div>
            <p className="text-sm opacity-80">Current Status</p>
            <p className="text-2xl font-bold capitalize">{kyc?.status || 'Not Submitted'}</p>
          </div>
        </div>
      </div>

      {kyc?.status === 'VERIFIED' ? (
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-6">
          <h2 className="font-semibold text-green-700 dark:text-green-400 mb-2">✓ KYC Verified</h2>
          <p className="text-sm text-green-600 dark:text-green-300">Your KYC has been verified successfully. You can access all banking services.</p>
        </div>
      ) : kyc?.status === 'REJECTED' ? (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-6">
          <h2 className="font-semibold text-red-700 dark:text-red-400 mb-2">KYC Rejected</h2>
          <p className="text-sm text-red-600 dark:text-red-300">Your KYC application was rejected. Please submit again with correct documents.</p>
          <button onClick={() => setSubmitted(false)} className="mt-3 text-red-600 dark:text-red-400 text-sm hover:underline">Resubmit KYC</button>
        </div>
      ) : kyc?.status === 'SUBMITTED' ? (
        <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <h2 className="font-semibold text-yellow-700 dark:text-yellow-400 mb-2">Under Review</h2>
          <p className="text-sm text-yellow-600 dark:text-yellow-300">Your KYC is under review. This usually takes 1-2 business days.</p>
        </div>
      ) : null}

      {!submitted && kyc?.status !== 'VERIFIED' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
          <h2 className="font-semibold dark:text-white mb-4 flex items-center gap-2"><FaIdCard /> Submit KYC Documents</h2>
          <form onSubmit={submitKyc} className="space-y-4">
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Aadhaar Number</label>
              <input required value={form.aadhaarNumber} onChange={e => setForm(f => ({...f, aadhaarNumber: e.target.value}))}
                placeholder="12-digit Aadhaar number" maxLength={12}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">PAN Card</label>
              <input required value={form.panNumber} onChange={e => setForm(f => ({...f, panNumber: e.target.value}))}
                placeholder="10-character PAN" maxLength={10} style={{ textTransform: 'uppercase' }}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Address Line 1</label>
              <input required value={form.addressLine1} onChange={e => setForm(f => ({...f, addressLine1: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Address Line 2 (optional)</label>
              <input value={form.addressLine2} onChange={e => setForm(f => ({...f, addressLine2: e.target.value}))}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">City</label>
                <input required value={form.city} onChange={e => setForm(f => ({...f, city: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium dark:text-gray-300 mb-1">State</label>
                <input required value={form.state} onChange={e => setForm(f => ({...f, state: e.target.value}))}
                  className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-gray-300 mb-1">Pincode</label>
              <input required value={form.pincode} onChange={e => setForm(f => ({...f, pincode: e.target.value}))}
                maxLength={6}
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg">Submit for Verification</button>
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
        <h1 className="text-2xl font-bold dark:text-white">Beneficiaries</h1>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
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
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="font-bold text-lg dark:text-white mb-4">Add Beneficiary</h2>
            <form onSubmit={addBeneficiary} className="space-y-3">
              <input required value={form.nickname} onChange={e => setForm(f => ({...f, nickname: e.target.value}))}
                placeholder="Nickname (e.g., Mom, Brother)"
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
              <input required value={form.beneficiaryName} onChange={e => setForm(f => ({...f, beneficiaryName: e.target.value}))}
                placeholder="Full Name"
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
              <input required value={form.accountNumber} onChange={e => setForm(f => ({...f, accountNumber: e.target.value}))}
                placeholder="Account Number"
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
              <input required value={form.ifscCode} onChange={e => setForm(f => ({...f, ifscCode: e.target.value}))}
                placeholder="IFSC Code"
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
              <input value={form.bankName} onChange={e => setForm(f => ({...f, bankName: e.target.value}))}
                placeholder="Bank Name (optional)"
                className="w-full border rounded-lg px-3 py-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm" />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm">Add</button>
                <button type="button" onClick={() => setShowAdd(false)} className="flex-1 border rounded-lg py-2 dark:border-gray-600 dark:text-white text-sm">Cancel</button>
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
        <h1 className="text-2xl font-bold dark:text-white">Notifications</h1>
        {notifications.some(n => n.status !== 'READ') && (
          <button onClick={markAllRead} className="text-sm text-blue-600 hover:underline">Mark all as read</button>
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
            <div key={n.id} className={`rounded-lg p-4 border ${n.status === 'READ' ? 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'}`}>
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
