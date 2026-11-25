import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Input } from '../../components/ui/Cards';
import { User, Mail, Phone, Lock, Save, ShieldAlert } from 'lucide-react';

export default function Profile() {
  const { currentUser, updateProfile } = useAuth();
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phoneNumber || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateDetails = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg({ type: '', text: '' });
    try {
      await updateProfile({ name, phoneNumber: phone });
      setMsg({ type: 'success', text: 'Profile details updated successfully!' });
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update details.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setMsg({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    setMsg({ type: 'success', text: 'Password simulated change successful!' });
    setOldPassword('');
    setNewPassword('');
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 flex flex-col gap-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Account Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your credentials, role privileges, and notification details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info Left Card */}
        <Card className="flex flex-col items-center text-center justify-between p-8 bg-slate-900/10 border-slate-200 dark:border-slate-800">
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-violet-600/10 flex items-center justify-center text-violet-500 border border-violet-500/20 shadow-inner">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{currentUser?.name}</h3>
              <span className="text-xs font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full mt-1.5 inline-block">
                {currentUser?.role.replace('_', ' ')}
              </span>
            </div>
          </div>

          <div className="w-full mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 flex flex-col gap-3 text-left">
            <div className="flex items-center gap-2 text-xs">
              <Mail className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400 truncate">{currentUser?.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <Phone className="w-4 h-4 text-slate-400" />
              <span className="text-slate-500 dark:text-slate-400">{currentUser?.phoneNumber || 'No phone set'}</span>
            </div>
            {currentUser?.schoolId && (
              <div className="flex items-center gap-2 text-xs">
                <ShieldAlert className="w-4 h-4 text-slate-400" />
                <span className="text-slate-500 dark:text-slate-400">School ID: {currentUser.schoolId}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Update Forms */}
        <div className="md:col-span-2 flex flex-col gap-6">
          {msg.text && (
            <div className={`p-4 rounded-xl text-xs font-semibold border ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {msg.text}
            </div>
          )}

          {/* Details Form */}
          <Card>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-violet-500" />
              Profile Details
            </h3>
            <form onSubmit={handleUpdateDetails} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" disabled={isLoading} className="px-5 py-2 text-xs">
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </Card>

          {/* Password Form */}
          <Card>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-violet-500" />
              Change Password
            </h3>
            <form onSubmit={handleChangePassword} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
              <Input
                label="New Password"
                type="password"
                placeholder="Min 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <div className="md:col-span-2 flex justify-end">
                <Button type="submit" variant="secondary" className="px-5 py-2 text-xs">
                  Change Password
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
