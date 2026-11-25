import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Cards';
import { motion } from 'framer-motion';
import { Wallet, Calendar, Coffee, Car, ShieldAlert, CheckCircle2, History, ListCollapse, PlusCircle } from 'lucide-react';

// Default budget references
const ALLOWANCE_BUDGETS = {
  'Event': 1000,
  'Food': 500,
  'Travel': 1500
};

export default function TeacherDashboard({ activeSection }) {
  const { currentUser } = useAuth();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  
  // Form Expense State
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('Event');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (currentUser) {
      loadTeacherData();
    }
  }, [currentUser]);

  const loadTeacherData = async () => {
    try {
      const wlt = await db.teachers.getWallet(currentUser.uid);
      setWallet(wlt);

      const allTxs = await db.transactions.getAll();
      const teacherTxs = allTxs.filter(t => t.teacherId === currentUser.uid);
      setTransactions(teacherTxs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } catch (err) {
      console.error('Error loading teacher data:', err);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!expenseAmount || Number(expenseAmount) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid expense amount.' });
      return;
    }
    if (!expenseDesc.trim()) {
      setMessage({ type: 'error', text: 'Please enter a valid description for the expense.' });
      return;
    }

    try {
      await db.teachers.recordExpense(currentUser.uid, expenseCategory, Number(expenseAmount), expenseDesc);
      setMessage({ type: 'success', text: `Successfully logged ₹${expenseAmount} against ${expenseCategory} allowance.` });
      setExpenseAmount('');
      setExpenseDesc('');
      await loadTeacherData();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to log expense.' });
    }
  };

  const getAllowanceIcon = (type) => {
    switch (type) {
      case 'Food': return <Coffee className="w-6 h-6 text-amber-500" />;
      case 'Travel': return <Car className="w-6 h-6 text-emerald-500" />;
      case 'Event':
      default:
        return <PlusCircle className="w-6 h-6 text-violet-500" />;
    }
  };

  const getProgressBarColor = (percentage) => {
    if (percentage > 50) return 'from-emerald-500 to-teal-500';
    if (percentage > 20) return 'from-amber-500 to-orange-500';
    return 'from-rose-500 to-red-500';
  };

  const renderDashboard = () => {
    if (!wallet) {
      return (
        <div className="py-12 text-center text-slate-400 font-medium">
          Loading allowance details...
        </div>
      );
    }

    return (
      <div className="flex flex-col gap-6">
        {/* Banner Alert if budget is low */}
        {Object.keys(wallet.allowances).some(k => wallet.allowances[k] < 100) && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center gap-3 text-xs font-semibold select-none">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>Attention: One or more of your allowances has dropped below ₹100. Consider submitting receipt reports for settlement re-allocations.</span>
          </div>
        )}

        {/* Allowances Progress Grid */}
        <div>
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-4">Allowance Progress Meters</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.keys(wallet.allowances).map((key) => {
              const current = wallet.allowances[key];
              const total = ALLOWANCE_BUDGETS[key] || 1000;
              const percent = Math.min(100, Math.max(0, (current / total) * 100));

              return (
                <Card key={key} className="flex flex-col justify-between p-6 bg-slate-900/40 border-slate-800/80">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">{key} Budget</span>
                      <h4 className="text-2xl font-black text-slate-800 dark:text-white mt-1">₹{current}</h4>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/30">
                      {getAllowanceIcon(key)}
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-400 mb-2">
                      <span>{percent.toFixed(0)}% Left</span>
                      <span>₹{total - current} Spent / ₹{total} Max</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800/80 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percent}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className={`h-full rounded-full bg-gradient-to-r ${getProgressBarColor(percent)}`}
                      />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Expense Log Form & Recents */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Form Card */}
          <Card className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">Log Corporate Expense</h3>
              <p className="text-xs text-slate-400 mb-4">Record teacher disbursements directly from your active balance allocation.</p>
            </div>

            {message.text && (
              <div className={`p-4 rounded-xl text-xs font-semibold border mb-4 ${message.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleExpenseSubmit} className="flex flex-col gap-4">
              <Select
                label="Allowance Category"
                value={expenseCategory}
                onChange={(e) => setExpenseCategory(e.target.value)}
                options={Object.keys(wallet.allowances).map(k => ({ value: k, label: `${k} (Remaining: ₹${wallet.allowances[k]})` }))}
                required
              />

              <Input
                label="Expense Amount (₹)"
                type="number"
                value={expenseAmount}
                onChange={(e) => setExpenseAmount(e.target.value)}
                placeholder="e.g. 150"
                min="1"
                required
              />

              <Input
                label="Expense Description / Purpose"
                value={expenseDesc}
                onChange={(e) => setExpenseDesc(e.target.value)}
                placeholder="e.g. Taxi fare to workshop, Meal check with guest"
                required
              />

              <Button type="submit" className="w-full mt-2 py-3 bg-violet-600 hover:bg-violet-700">
                Log Reimbursement
              </Button>
            </form>
          </Card>

          {/* History Card */}
          <Card className="lg:col-span-7">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-violet-500" />
              Corporate Expense Ledger
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-medium border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Tx ID</th>
                    <th className="py-3 px-4">Purpose</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Logged Time</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions.map(tx => (
                      <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-500/5">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-200">{tx.id}</td>
                        <td className="py-3 px-4 truncate max-w-[200px]">{tx.description}</td>
                        <td className="py-3 px-4 font-extrabold text-slate-800 dark:text-white">₹{tx.amount}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400">
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{new Date(tx.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="py-8 text-center text-slate-400">
                        No expenses logged. Use the corporate expense form to record taxi, event, or food reimbursements.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  switch (activeSection) {
    case 'dashboard':
    default:
      return renderDashboard();
  }
}
