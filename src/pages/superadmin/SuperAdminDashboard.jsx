import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Card, Button, Input } from '../../components/ui/Cards';
import { School, Users, CreditCard, Plus, Edit2, TrendingUp, Search, Calendar } from 'lucide-react';

export default function SuperAdminDashboard({ activeSection }) {
  const [schools, setSchools] = useState([]);
  const [students, setStudents] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Add/Edit School Form state
  const [showForm, setShowForm] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [schoolName, setSchoolName] = useState('');
  const [schoolAddress, setSchoolAddress] = useState('');
  const [schoolLogo, setSchoolLogo] = useState('');
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [branchInput, setBranchInput] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const schs = await db.schools.getAll();
    const stds = await db.students.getAll();
    const txs = await db.transactions.getAll();
    setSchools(schs);
    setStudents(stds);
    setTransactions(txs);
  };

  const handleCreateOrEditSchool = async (e) => {
    e.preventDefault();
    const branches = branchInput.split(',').map(b => b.trim()).filter(b => b);
    
    if (editingSchool) {
      await db.schools.edit(editingSchool.id, {
        name: schoolName,
        address: schoolAddress,
        logoUrl: schoolLogo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
        academicYear,
        branches
      });
    } else {
      await db.schools.add({
        name: schoolName,
        address: schoolAddress,
        logoUrl: schoolLogo || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
        academicYear,
        branches
      });
    }
    
    resetForm();
    await loadData();
  };

  const startEdit = (school) => {
    setEditingSchool(school);
    setSchoolName(school.name);
    setSchoolAddress(school.address);
    setSchoolLogo(school.logoUrl);
    setAcademicYear(school.academicYear);
    setBranchInput(school.branches.join(', '));
    setShowForm(true);
  };

  const resetForm = () => {
    setEditingSchool(null);
    setSchoolName('');
    setSchoolAddress('');
    setSchoolLogo('');
    setAcademicYear('2026-2027');
    setBranchInput('');
    setShowForm(false);
  };

  // Metrics
  const totalRecharge = transactions
    .filter(t => t.type === 'recharge' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSales = transactions
    .filter(t => t.type === 'purchase' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalCommission = (totalRecharge * 0.015).toFixed(2); // Mock 1.5% Razorpay/SaaS commission

  const filteredSchools = schools.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDashboard = () => (
    <div className="flex flex-col gap-6">
      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="bg-gradient-to-tr from-violet-600/10 to-indigo-600/10 border-violet-500/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg">
            <School className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Schools</span>
            <span className="text-2xl font-black">{schools.length}</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-tr from-fuchsia-600/10 to-pink-600/10 border-fuchsia-500/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-fuchsia-600 flex items-center justify-center text-white shadow-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Students</span>
            <span className="text-2xl font-black">{students.length}</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-tr from-emerald-600/10 to-teal-600/10 border-emerald-500/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">SaaS Platform GTV</span>
            <span className="text-2xl font-black">₹{totalRecharge}</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-tr from-blue-600/10 to-cyan-600/10 border-blue-500/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Est. Revenue (1.5%)</span>
            <span className="text-2xl font-black">₹{totalCommission}</span>
          </div>
        </Card>
      </div>

      {/* Visual Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Custom Bar Graph */}
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800 dark:text-white">GTV Analytics & Volume</h3>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-md">Last 7 Days</span>
          </div>
          {/* Custom bar chart using divs */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-slate-200 dark:border-slate-800 pb-2 px-2">
            {[
              { day: 'Mon', vol: 450, color: 'bg-indigo-500' },
              { day: 'Tue', vol: 620, color: 'bg-indigo-500' },
              { day: 'Wed', vol: 800, color: 'bg-indigo-500' },
              { day: 'Thu', vol: 300, color: 'bg-indigo-500' },
              { day: 'Fri', vol: 1200, color: 'bg-gradient-to-t from-violet-600 to-fuchsia-600' },
              { day: 'Sat', vol: 150, color: 'bg-indigo-500' },
              { day: 'Sun', vol: 0, color: 'bg-indigo-500' }
            ].map((d, i) => {
              const maxVol = 1200;
              const pct = d.vol > 0 ? (d.vol / maxVol) * 100 : 5;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">₹{d.vol}</span>
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-500 ${d.color}`}
                    style={{ height: `${pct}%` }}
                  />
                  <span className="text-xs font-semibold text-slate-400 mt-1">{d.day}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* System Health */}
        <Card>
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">Core Platform Health</h3>
          <div className="flex flex-col gap-4">
            <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold block text-slate-700 dark:text-slate-200">Payment Gateway</span>
                <span className="text-[10px] text-emerald-500 font-bold uppercase mt-0.5 inline-block">Online</span>
              </div>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            </div>

            <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold block text-slate-700 dark:text-slate-200">Database Cluster</span>
                <span className="text-[10px] text-emerald-500 font-bold uppercase mt-0.5 inline-block">Sync Normal</span>
              </div>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            </div>

            <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold block text-slate-700 dark:text-slate-200">Cloud Messaging API</span>
                <span className="text-[10px] text-emerald-500 font-bold uppercase mt-0.5 inline-block">Operational</span>
              </div>
              <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Transaction List */}
      <Card>
        <h3 className="font-bold text-slate-800 dark:text-white mb-4">SaaS Platform Global Sales History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Tx ID</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">School</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Gateway</th>
                <th className="py-3 px-4">Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 5).map((tx) => {
                const stud = students.find(s => s.id === tx.studentId);
                const sch = schools.find(s => s.id === tx.schoolId);
                return (
                  <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-500/5">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-200">{tx.id}</td>
                    <td className="py-3 px-4">{stud?.name || 'SaaS Parent'}</td>
                    <td className="py-3 px-4">{sch?.name || 'Greenwood'}</td>
                    <td className="py-3 px-4 font-bold">₹{tx.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tx.type === 'recharge' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize font-mono text-[10px]">{tx.paymentGateway || 'Wallet'}</td>
                    <td className="py-3 px-4 text-slate-400">{new Date(tx.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderSchools = () => (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search school by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)} className="px-4 py-2 text-xs">
          <Plus className="w-4 h-4" /> Add School
        </Button>
      </div>

      {/* School Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white dark:bg-slate-950 p-6 relative">
            <h3 className="font-bold text-lg mb-4">{editingSchool ? 'Edit School Details' : 'Register New School Branch'}</h3>
            <form onSubmit={handleCreateOrEditSchool} className="flex flex-col gap-4">
              <Input
                label="School Name"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="e.g. Greenwood International"
                required
              />
              <Input
                label="School Address"
                value={schoolAddress}
                onChange={(e) => setSchoolAddress(e.target.value)}
                placeholder="e.g. Bangalore Campus"
                required
              />
              <Input
                label="School Logo URL (Optional)"
                value={schoolLogo}
                onChange={(e) => setSchoolLogo(e.target.value)}
                placeholder="e.g. https://image.url/logo.png"
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Academic Year"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  placeholder="2026-2027"
                  required
                />
                <Input
                  label="Branches (Comma separated)"
                  value={branchInput}
                  onChange={(e) => setBranchInput(e.target.value)}
                  placeholder="Campus A, Campus B"
                />
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <Button type="button" variant="secondary" onClick={resetForm} className="px-4 py-2 text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="px-4 py-2 text-xs">
                  {editingSchool ? 'Save School' : 'Create School'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Schools Card Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSchools.map(school => (
          <Card key={school.id} className="flex flex-col justify-between border-slate-200 dark:border-slate-800">
            <div className="flex items-start gap-4">
              <img 
                src={school.logoUrl} 
                alt={school.name}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200 dark:border-slate-800 shadow"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-extrabold text-slate-800 dark:text-white text-md truncate">{school.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5 truncate">{school.address}</p>
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[9px] font-bold bg-violet-500/10 text-violet-500 px-2 py-0.5 rounded uppercase font-mono">
                    Year: {school.academicYear}
                  </span>
                  {school.branches?.map(b => (
                    <span key={b} className="text-[9px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-mono">
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-900 pt-4 mt-6">
              <Button variant="secondary" onClick={() => startEdit(school)} className="px-3 py-1.5 text-[10px]">
                <Edit2 className="w-3 h-3" /> Edit School
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderTransactions = () => (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Global Platform Audit Ledger</h3>
          <p className="text-xs text-slate-400">Verifying secure wallet movements across all schools and accounts</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-medium border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Tx ID</th>
              <th className="py-3 px-4">Wallet ID</th>
              <th className="py-3 px-4">Student</th>
              <th className="py-3 px-4">Amount</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Payment Method</th>
              <th className="py-3 px-4">Time Created</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => {
              const stud = students.find(s => s.id === tx.studentId);
              return (
                <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-500/5">
                  <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-200">{tx.id}</td>
                  <td className="py-3 px-4 font-mono">{tx.walletId}</td>
                  <td className="py-3 px-4 font-semibold">{stud?.name || 'SaaS Parent'}</td>
                  <td className="py-3 px-4 font-bold text-sm">₹{tx.amount}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tx.type === 'recharge' ? 'bg-emerald-500/10 text-emerald-400' : tx.type === 'purchase' ? 'bg-violet-500/10 text-violet-400' : 'bg-amber-500/10 text-amber-400'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                      {tx.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] capitalize">{tx.paymentGateway || 'Wallet Balance'}</td>
                  <td className="py-3 px-4 text-slate-400">{new Date(tx.createdAt).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );

  switch (activeSection) {
    case 'schools':
      return renderSchools();
    case 'transactions':
      return renderTransactions();
    case 'dashboard':
    default:
      return renderDashboard();
  }
}
