import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

const roleColors = {
  admin: 'badge-purple',
  manager: 'badge-blue',
  employee: 'badge-green',
};

const roleDescriptions = {
  admin: 'Full access to all modules, user management, and system configuration.',
  manager: 'Access to HR, Inventory, Sales, and Reports. Can add/edit but not delete.',
  employee: 'Read-only access to Inventory. Limited dashboard view.',
};

export default function Profile() {
  const { user, updateUser } = useAuth();

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return toast.error('Name is required');
    setProfileLoading(true);
    try {
      const res = await authAPI.updateProfile(profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error('Please fill in all fields');
    if (pwForm.newPassword.length < 6) return toast.error('New password must be at least 6 characters');
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    setPwLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your account settings</p>
      </div>

      {/* Account Overview Card */}
      <div className="glass-card p-5 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-600 to-purple-700 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-600/30">
          <span className="text-white text-2xl font-display font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <h2 className="font-display text-lg font-bold text-white">{user?.name}</h2>
          <p className="text-sm text-slate-400">{user?.email}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`badge ${roleColors[user?.role]}`}>{user?.role}</span>
            <span className="badge badge-green">Active</span>
          </div>
        </div>
      </div>

      {/* Role Permissions */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold text-white text-sm mb-2">Role Permissions</h3>
        <p className="text-sm text-slate-400">{roleDescriptions[user?.role]}</p>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {user?.role === 'admin' && (
            <>
              <div className="text-xs p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-center">Full Read/Write</div>
              <div className="text-xs p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-center">User Management</div>
              <div className="text-xs p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-center">Delete Access</div>
            </>
          )}
          {user?.role === 'manager' && (
            <>
              <div className="text-xs p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-center">Read/Write Access</div>
              <div className="text-xs p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-center">Reports Access</div>
              <div className="text-xs p-2 bg-slate-700/40 border border-slate-700/30 rounded-lg text-slate-500 text-center line-through">No Delete</div>
            </>
          )}
          {user?.role === 'employee' && (
            <>
              <div className="text-xs p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-center">View Inventory</div>
              <div className="text-xs p-2 bg-slate-700/40 border border-slate-700/30 rounded-lg text-slate-500 text-center line-through">No HR Access</div>
              <div className="text-xs p-2 bg-slate-700/40 border border-slate-700/30 rounded-lg text-slate-500 text-center line-through">No Sales Access</div>
            </>
          )}
        </div>
      </div>

      {/* Update Profile */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold text-white text-sm mb-4">Update Profile</h3>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Email Address</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
              className="form-input"
            />
          </div>
          <button type="submit" disabled={profileLoading} className="btn-primary">
            {profileLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            Save Changes
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold text-white text-sm mb-4">Change Password</h3>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="form-label">Current Password</label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="Enter current password"
                className="form-input pr-16"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                {showPw ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
          <div>
            <label className="form-label">New Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={pwForm.newPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
              placeholder="Min. 6 characters"
              className="form-input"
            />
          </div>
          <div>
            <label className="form-label">Confirm New Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={pwForm.confirmPassword}
              onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
              placeholder="Repeat new password"
              className="form-input"
            />
          </div>
          <button type="submit" disabled={pwLoading} className="btn-primary">
            {pwLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : null}
            Change Password
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="glass-card p-5">
        <h3 className="font-display font-semibold text-white text-sm mb-3">Account Information</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">User ID</p>
            <p className="font-mono text-xs text-slate-400 break-all">{user?._id}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Member Since</p>
            <p className="text-slate-300">{new Date(user?.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
