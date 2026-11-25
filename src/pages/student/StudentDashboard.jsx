import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { Card, Badge } from '../../components/ui/Cards';
import DigitalIDCard from '../../components/DigitalIDCard';
import { ArrowUpRight, ArrowDownRight, Wallet, ShoppingCart } from 'lucide-react';

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const [student, setStudent] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    const stds = await db.students.getAll();
    const currentStudent = stds.find(s => s.id === currentUser.studentId || s.parentId === currentUser.uid) || stds[0];
    
    if (currentStudent) {
      setStudent(currentStudent);
      const w = await db.wallets.getByStudentId(currentStudent.id);
      setWallet(w);
      const txs = await db.transactions.getByStudentId(currentStudent.id);
      setTransactions(txs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto p-4 md:p-6">
      {/* 3D Smart Card side pane */}
      <div className="lg:col-span-5 flex flex-col items-center">
        <h3 className="font-extrabold text-lg text-slate-800 dark:text-white mb-2 self-start">My Student Smart Card</h3>
        <p className="text-xs text-slate-400 mb-6 self-start">Click the card to flip it and present your payment QR to vendors.</p>
        
        {student && (
          <DigitalIDCard student={student} wallet={wallet} />
        )}
      </div>

      {/* Transaction ledger list */}
      <div className="lg:col-span-7 flex flex-col gap-6 w-full">
        <div>
          <h3 className="font-extrabold text-lg text-slate-800 dark:text-white">Recent Transactions</h3>
          <p className="text-xs text-slate-400 mt-1">Real-time ledger of snack recharges, purchases, and refunds</p>
        </div>

        <Card>
          <div className="flex flex-col gap-4">
            {transactions.length > 0 ? (
              transactions.map(tx => {
                const isRecharge = tx.type === 'recharge';
                const isRefund = tx.type === 'refund';
                return (
                  <div 
                    key={tx.id} 
                    className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isRecharge ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : isRefund ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-violet-500/10 text-violet-500 border-violet-500/20'}`}>
                        {isRecharge ? <Wallet className="w-5 h-5" /> : <ShoppingCart className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[240px]">
                          {tx.description}
                        </h4>
                        <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                          {new Date(tx.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-sm font-extrabold block ${isRecharge || isRefund ? 'text-emerald-500' : 'text-slate-800 dark:text-white'}`}>
                        {isRecharge || isRefund ? '+' : '-'}₹{tx.amount}
                      </span>
                      <span className={`text-[9px] font-bold uppercase ${tx.status === 'success' ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {tx.status}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                No transaction log registered
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
