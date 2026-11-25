import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Cards';
import { Users, CreditCard, ShoppingBag, Plus, Upload, Search, Edit2, ShieldAlert, Sparkles, Calendar, ArrowLeftRight, CheckCircle } from 'lucide-react';

export default function SchoolAdminDashboard({ activeSection }) {
  const [students, setStudents] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [settlementLogs, setSettlementLogs] = useState([]);
  const [vendorBalances, setVendorBalances] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Student Forms states
  const [showStudentForm, setShowStudentForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentName, setStudentName] = useState('');
  const [admNumber, setAdmNumber] = useState('');
  const [studentClass, setStudentClass] = useState('Class 8');
  const [studentDiv, setStudentDiv] = useState('Div A');
  const [studentRoll, setStudentRoll] = useState('');
  const [studentPhoto, setStudentPhoto] = useState('');
  const [parentSelect, setParentSelect] = useState('u_parent');

  // Bulk Import state
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkCsvText, setBulkCsvText] = useState('');
  const [bulkImportResult, setBulkImportResult] = useState('');

  // School settings state
  const [school, setSchool] = useState(null);
  const [academicYear, setAcademicYear] = useState('2026-2027');
  const [schoolName, setSchoolName] = useState('');
  const [schoolLogo, setSchoolLogo] = useState('');

  useEffect(() => {
    loadData();
  }, [activeSection]);

  const loadData = async () => {
    const schs = await db.schools.getAll();
    const gr = schs.find(s => s.id === 'sch_greenwood') || schs[0];
    if (gr) {
      setSchool(gr);
      setSchoolName(gr.name);
      setSchoolLogo(gr.logoUrl);
      setAcademicYear(gr.academicYear);
    }

    const stds = await db.students.getAll('sch_greenwood');
    const vnds = await db.vendors.getAll();
    const txs = await db.transactions.getBySchoolId('sch_greenwood');
    const atts = await db.attendance.getLogs();
    const sets = await db.settlements.getLogs();
    
    // Fetch wallets for active students
    const wlts = [];
    for (const st of stds) {
      const w = await db.wallets.getByStudentId(st.id);
      if (w) wlts.push(w);
    }

    // Fetch settlements balances
    const balances = {};
    for (const v of vnds) {
      const b = await db.settlements.getVendorBalance(v.uid);
      balances[v.uid] = b;
    }

    setStudents(stds);
    setVendors(vnds);
    setTransactions(txs);
    setWallets(wlts);
    setAttendanceLogs(atts.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
    setSettlementLogs(sets.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)));
    setVendorBalances(balances);
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (editingStudent) {
      await db.students.edit(editingStudent.id, {
        name: studentName,
        admissionNumber: admNumber,
        class: studentClass,
        division: studentDiv,
        rollNumber: studentRoll,
        photoUrl: studentPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200'
      });
    } else {
      const customQr = `SW-GREENWOOD-${Math.floor(10000 + Math.random()*90000)}`;
      await db.students.add({
        name: studentName,
        admissionNumber: admNumber,
        class: studentClass,
        division: studentDiv,
        rollNumber: studentRoll,
        schoolId: 'sch_greenwood',
        parentId: parentSelect,
        photoUrl: studentPhoto || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200',
        qrCodeData: customQr,
        status: 'active'
      });
    }
    resetStudentForm();
    await loadData();
  };

  const startStudentEdit = (student) => {
    setEditingStudent(student);
    setStudentName(student.name);
    setAdmNumber(student.admissionNumber);
    setStudentClass(student.class);
    setStudentDiv(student.division);
    setStudentRoll(student.rollNumber);
    setStudentPhoto(student.photoUrl);
    setParentSelect(student.parentId);
    setShowStudentForm(true);
  };

  const toggleStudentStatus = async (student) => {
    const nextStatus = student.status === 'active' ? 'inactive' : 'active';
    await db.students.edit(student.id, { status: nextStatus });
    await loadData();
  };

  const resetStudentForm = () => {
    setEditingStudent(null);
    setStudentName('');
    setAdmNumber('');
    setStudentClass('Class 8');
    setStudentDiv('Div A');
    setStudentRoll('');
    setStudentPhoto('');
    setParentSelect('u_parent');
    setShowStudentForm(false);
  };

  const handleBulkImport = async (e) => {
    e.preventDefault();
    if (!bulkCsvText.trim()) return;

    try {
      const lines = bulkCsvText.trim().split('\n');
      const parsedStudents = [];
      
      for (const line of lines) {
        const parts = line.split(',');
        if (parts.length >= 2) {
          parsedStudents.push({
            name: parts[0].trim(),
            admissionNumber: parts[1]?.trim() || '',
            class: parts[2]?.trim() || 'Class 6',
            division: parts[3]?.trim() || 'Div A',
            rollNumber: parts[4]?.trim() || '1'
          });
        }
      }

      const imported = await db.students.bulkImport(parsedStudents, 'sch_greenwood');
      setBulkImportResult(`Successfully imported ${imported.length} student records!`);
      setBulkCsvText('');
      setTimeout(() => {
        setBulkImportResult('');
        setShowBulkImport(false);
      }, 2000);
      await loadData();
    } catch (err) {
      setBulkImportResult(`Error: ${err.message}`);
    }
  };

  const handleSchoolSettings = async (e) => {
    e.preventDefault();
    if (!school) return;
    await db.schools.edit(school.id, {
      name: schoolName,
      logoUrl: schoolLogo,
      academicYear
    });
    alert('School settings updated!');
    await loadData();
  };

  // Attendance simulators
  const handleSimulateAttendance = async (studentId, type) => {
    try {
      await db.attendance.logCheckIn(studentId, type);
      alert(`Attendance recorded successfully. Parent notified.`);
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Vendor Payout Settlement
  const handleProcessSettlement = async (vendorId) => {
    try {
      await db.settlements.settle(vendorId);
      alert('Outstanding funds settled and paid to vendor account!');
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const totalWalletBalances = wallets.reduce((sum, w) => sum + w.balance, 0);
  const totalCanteenSales = transactions
    .filter(t => t.vendorId === 'u_canteen' && t.type === 'purchase')
    .reduce((sum, t) => sum + t.amount, 0);

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderDashboard = () => (
    <div className="flex flex-col gap-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-600 flex items-center justify-center text-white shadow-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Students</span>
            <span className="text-2xl font-black">{students.length}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Total Wallets Float</span>
            <span className="text-2xl font-black">₹{totalWalletBalances}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-fuchsia-600 flex items-center justify-center text-white shadow-lg">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Canteen GTV</span>
            <span className="text-2xl font-black">₹{totalCanteenSales}</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold block">Active Vendors</span>
            <span className="text-2xl font-black">{vendors.length}</span>
          </div>
        </Card>
      </div>

      {/* Analytics Graph Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">Daily Sales Graph</h3>
          <div className="h-64 flex items-end justify-between gap-3 pt-6 border-b border-slate-200 dark:border-slate-800 pb-2 px-2">
            {[
              { label: '08:00', sales: 150 },
              { label: '10:00', sales: 420 },
              { label: '12:00', sales: 850 },
              { label: '14:00', sales: 530 },
              { label: '16:00', sales: 120 }
            ].map((s, i) => {
              const maxS = 1000;
              const pct = (s.sales / maxS) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-500">₹{s.sales}</span>
                  <div className="w-full rounded-t-lg bg-gradient-to-t from-violet-600 to-indigo-500" style={{ height: `${pct}%` }} />
                  <span className="text-xs font-semibold text-slate-400 mt-1">{s.label}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Core settings */}
        <Card>
          <h3 className="font-bold text-slate-800 dark:text-white mb-4">Onboarding Summary</h3>
          <div className="flex flex-col gap-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2.5">
              <span>Academic Session:</span>
              <span className="text-slate-800 dark:text-white font-extrabold">{academicYear}</span>
            </div>
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-900 pb-2.5">
              <span>Check-ins Today:</span>
              <span className="text-slate-800 dark:text-white font-extrabold">{attendanceLogs.length} logs</span>
            </div>
            <div className="flex justify-between">
              <span>Settlement Payouts:</span>
              <span className="text-slate-800 dark:text-white font-extrabold">{settlementLogs.length} settle events</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/40 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
        <div className="relative flex-1 w-full max-w-sm">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name or ADM number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="secondary" onClick={() => setShowBulkImport(true)} className="flex-1 sm:flex-initial px-4 py-2 text-xs">
            <Upload className="w-4 h-4" /> Bulk Import
          </Button>
          <Button variant="primary" onClick={() => setShowStudentForm(true)} className="flex-1 sm:flex-initial px-4 py-2 text-xs">
            <Plus className="w-4 h-4" /> Add Student
          </Button>
        </div>
      </div>

      {showStudentForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white dark:bg-slate-950 p-6 relative shadow-2xl">
            <h3 className="font-bold text-lg mb-4">{editingStudent ? 'Edit Student Details' : 'Register New Student Card'}</h3>
            <form onSubmit={handleStudentSubmit} className="flex flex-col gap-4">
              <Input
                label="Student Name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="e.g. Ameen Doe"
                required
              />
              <Input
                label="Admission Card Number"
                value={admNumber}
                onChange={(e) => setAdmNumber(e.target.value)}
                placeholder="e.g. GIS-2026-99"
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Select
                  label="Grade/Class"
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value)}
                  options={[
                    { value: 'Class 5', label: 'Class 5' },
                    { value: 'Class 6', label: 'Class 6' },
                    { value: 'Class 7', label: 'Class 7' },
                    { value: 'Class 8', label: 'Class 8' },
                    { value: 'Class 9', label: 'Class 9' }
                  ]}
                />
                <Select
                  label="Division"
                  value={studentDiv}
                  onChange={(e) => setStudentDiv(e.target.value)}
                  options={[
                    { value: 'Div A', label: 'Div A' },
                    { value: 'Div B', label: 'Div B' },
                    { value: 'Div C', label: 'Div C' }
                  ]}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Roll Number"
                  value={studentRoll}
                  onChange={(e) => setStudentRoll(e.target.value)}
                  placeholder="e.g. 14"
                  required
                />
                <Input
                  label="Photo URL (Optional)"
                  value={studentPhoto}
                  onChange={(e) => setStudentPhoto(e.target.value)}
                  placeholder="e.g. https://unsplash.com/student.jpg"
                />
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <Button type="button" variant="secondary" onClick={resetStudentForm} className="px-4 py-2 text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="px-4 py-2 text-xs">
                  {editingStudent ? 'Save Changes' : 'Generate Smart Card'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {showBulkImport && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white dark:bg-slate-950 p-6 relative">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-bold text-lg">CSV/Excel Bulk Onboarding</h3>
                <p className="text-xs text-slate-400">Onboard multiple student smart cards simultaneously</p>
              </div>
            </div>

            {bulkImportResult && (
              <div className="mb-4 p-3 bg-violet-500/10 text-violet-500 rounded-xl text-xs font-semibold">
                {bulkImportResult}
              </div>
            )}

            <form onSubmit={handleBulkImport} className="flex flex-col gap-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col gap-1 text-[11px] font-mono leading-relaxed text-slate-600 dark:text-slate-400">
                <span className="font-bold flex items-center gap-1 text-slate-800 dark:text-white">
                  <Sparkles className="w-3.5 h-3.5 text-violet-500" />
                  Format Template (CSV): Name, AdmissionNumber, Class, Division, RollNumber
                </span>
                <span>Ameen Doe, GIS2024-0042, Class 8, Div A, 14</span>
                <span>Aisha Doe, GIS2024-0099, Class 5, Div B, 02</span>
              </div>

              <textarea
                rows={6}
                value={bulkCsvText}
                onChange={(e) => setBulkCsvText(e.target.value)}
                placeholder="Paste CSV rows here..."
                className="w-full p-4 border border-slate-300 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900 text-xs font-mono focus:ring-1 focus:ring-violet-500"
                required
              />

              <div className="flex gap-3 justify-end mt-2">
                <Button type="button" variant="secondary" onClick={() => setShowBulkImport(false)} className="px-4 py-2 text-xs">
                  Close
                </Button>
                <Button type="submit" className="px-4 py-2 text-xs">
                  Process Import List
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Student Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Admission No</th>
                <th className="py-3 px-4">Class/Div</th>
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">Wallet Balance</th>
                <th className="py-3 px-4">Wallet Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(st => {
                const w = wallets.find(wl => wl.studentId === st.id);
                return (
                  <tr key={st.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-500/5">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={st.photoUrl} 
                          alt={st.name} 
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow"
                        />
                        <div>
                          <div className="font-extrabold text-slate-800 dark:text-white">{st.name}</div>
                          <span className="text-[10px] font-mono text-slate-400">{st.qrCodeData}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold">{st.admissionNumber}</td>
                    <td className="py-3 px-4">{st.class} - {st.division}</td>
                    <td className="py-3 px-4 font-bold">{st.rollNumber}</td>
                    <td className="py-3 px-4 font-extrabold text-sm text-slate-800 dark:text-white">₹{w?.balance ?? 0}</td>
                    <td className="py-3 px-4">
                      <Badge status={w?.status === 'active' ? 'success' : 'danger'}>
                        {w?.status || 'active'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="secondary" onClick={() => startStudentEdit(st)} className="px-2.5 py-1 text-[10px]">
                          Edit
                        </Button>
                        <Button 
                          variant={st.status === 'active' ? 'danger' : 'success'} 
                          onClick={() => toggleStudentStatus(st)}
                          className="px-2.5 py-1 text-[10px]"
                        >
                          {st.status === 'active' ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderVendors = () => (
    <div className="flex flex-col gap-6">
      {/* Payout Settlements view */}
      <Card>
        <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Vendor Outlets & Settlements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {vendors.map(v => {
            const b = vendorBalances[v.uid] || { gross: 0, settled: 0, outstanding: 0 };
            return (
              <div key={v.uid} className="p-5 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col justify-between gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white text-base">{v.storeName}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Manager: {v.name}</p>
                  </div>
                  <Badge status={v.status === 'active' ? 'success' : 'danger'}>
                    {v.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-2 border-t border-b border-slate-100 dark:border-slate-900 py-3.5 text-center text-xs font-semibold text-slate-500">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider block">GTV Sales</span>
                    <span className="text-slate-800 dark:text-white font-bold text-sm block mt-1">₹{b.gross}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider block">Payouts</span>
                    <span className="text-slate-800 dark:text-white font-bold text-sm block mt-1">₹{b.settled}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase tracking-wider block text-violet-500">Outstanding</span>
                    <span className="text-violet-600 dark:text-violet-400 font-extrabold text-sm block mt-1">₹{b.outstanding}</span>
                  </div>
                </div>

                <Button 
                  disabled={b.outstanding <= 0} 
                  onClick={() => handleProcessSettlement(v.uid)}
                  className="w-full text-xs py-2 bg-gradient-to-r from-violet-600 to-indigo-600 disabled:opacity-50"
                >
                  <CreditCard className="w-4 h-4" /> Settle Vendor Account
                </Button>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Settlements logs table */}
      <Card>
        <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-violet-500" />
          SaaS Payout Settlements History
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Settlement ID</th>
                <th className="py-3 px-4">Merchant Store</th>
                <th className="py-3 px-4">Payout Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Processed Date</th>
              </tr>
            </thead>
            <tbody>
              {settlementLogs.map(s => {
                const vendor = vendors.find(v => v.uid === s.vendorId);
                return (
                  <tr key={s.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-500/5">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-200">{s.id}</td>
                    <td className="py-3 px-4 font-bold">{vendor ? vendor.storeName : 'Outlet'}</td>
                    <td className="py-3 px-4 font-extrabold text-sm">₹{s.amount}</td>
                    <td className="py-3 px-4">
                      <Badge status="success">Completed</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{new Date(s.timestamp).toLocaleString()}</td>
                  </tr>
                );
              })}
              {settlementLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-slate-400 font-medium">No payout settlement logs yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderAttendance = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Simulation roster */}
      <Card className="lg:col-span-7">
        <h3 className="font-bold text-lg mb-1">Check-in / Attendance Simulator</h3>
        <p className="text-xs text-slate-400 mb-4">Simulate card check-in on entering/leaving school, which notifies parents and rewards good attendance (+₹20).</p>
        
        <div className="flex flex-col gap-3">
          {students.map(st => (
            <div key={st.id} className="p-4 bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <img src={st.photoUrl} className="w-10 h-10 rounded-full object-cover border" alt="" />
                <div>
                  <h4 className="font-bold text-xs">{st.name}</h4>
                  <span className="text-[10px] text-slate-400 block">{st.class} • ADM: {st.admissionNumber}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleSimulateAttendance(st.id, 'in')} className="bg-emerald-500 hover:bg-emerald-600 text-[10px] py-1.5 px-3">
                  Scan Check-In
                </Button>
                <Button onClick={() => handleSimulateAttendance(st.id, 'out')} variant="secondary" className="hover:bg-violet-500/10 hover:text-violet-500 text-[10px] py-1.5 px-3">
                  Scan Check-Out
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Attendance log audit */}
      <Card className="lg:col-span-5">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-violet-500" />
          Today's Check-in Feed
        </h3>

        <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto pr-1">
          {attendanceLogs.map(log => (
            <div key={log.id} className="p-3 bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-850 rounded-2xl flex justify-between items-center text-xs">
              <div>
                <span className="font-bold text-slate-800 dark:text-white block">{log.studentName}</span>
                <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <Badge status={log.type === 'in' ? 'success' : 'info'}>
                {log.type === 'in' ? 'Entered School' : 'Left School'}
              </Badge>
            </div>
          ))}
          {attendanceLogs.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400 font-medium">No check-in entries logged today.</div>
          )}
        </div>
      </Card>
    </div>
  );

  const renderSettings = () => (
    <Card className="max-w-xl">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
        <ShieldAlert className="w-5 h-5 text-violet-500" />
        School Profile & Settings
      </h3>
      <form onSubmit={handleSchoolSettings} className="flex flex-col gap-4">
        <Input
          label="School Name"
          value={schoolName}
          onChange={(e) => setSchoolName(e.target.value)}
          required
        />
        <Input
          label="School Logo URL"
          value={schoolLogo}
          onChange={(e) => setSchoolLogo(e.target.value)}
          required
        />
        <Input
          label="Current Academic Year"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          required
        />
        <Button type="submit" className="w-full mt-4">
          Save Settings
        </Button>
      </form>
    </Card>
  );

  switch (activeSection) {
    case 'students':
      return renderStudents();
    case 'vendors':
      return renderVendors();
    case 'attendance':
      return renderAttendance();
    case 'settings':
      return renderSettings();
    case 'dashboard':
    default:
      return renderDashboard();
  }
}
