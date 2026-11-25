import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Cards';
import DigitalIDCard from '../../components/DigitalIDCard';
import { Wallet, ShieldAlert, CreditCard, CheckCircle, Download, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ParentDashboard({ activeSection }) {
  const { currentUser, refreshNotifications } = useAuth();
  const [children, setChildren] = useState([]);
  const [wallets, setWallets] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  
  // Recharge state
  const [selectedChild, setSelectedChild] = useState('');
  const [rechargeAmount, setRechargeAmount] = useState('200');
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [razorpayMethod, setRazorpayMethod] = useState('upi');
  const [rechargeSuccess, setRechargeSuccess] = useState(false);
  const [generatedReceipt, setGeneratedReceipt] = useState(null);

  // Controls state
  const [controlChild, setControlChild] = useState('');
  const [dailyLimit, setDailyLimit] = useState(150);
  const [weeklyLimit, setWeeklyLimit] = useState(800);
  const [monthlyLimit, setMonthlyLimit] = useState(3000);
  const [walletMode, setWalletMode] = useState('free'); // 'free' | 'controlled' | 'strict'
  const [lunchLimit, setLunchLimit] = useState(50);
  const [snacksLimit, setSnacksLimit] = useState(30);
  const [stationeryLimit, setStationeryLimit] = useState(20);
  const [autoRecharge, setAutoRecharge] = useState(false);
  const [allowEmergency, setAllowEmergency] = useState(false);
  const [categories, setCategories] = useState({});

  // Allocations state
  const [allocations, setAllocations] = useState({});

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  // Real-time polling for pending approvals (Strict Mode checkouts)
  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(async () => {
      const approvals = await db.pendingApprovals.getByParentId(currentUser.uid);
      setPendingApprovals(approvals);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser]);

  const loadData = async () => {
    const kids = await db.parents.getChildren(currentUser.uid);
    setChildren(kids);
    
    if (kids.length > 0) {
      if (!selectedChild) setSelectedChild(kids[0].id);
      if (!controlChild) {
        setControlChild(kids[0].id);
        loadChildControls(kids[0].id);
      }
    }

    const wlts = {};
    const allocs = {};
    for (const kid of kids) {
      const w = await db.wallets.getByStudentId(kid.id);
      if (w) {
        wlts[kid.id] = w;
        allocs[kid.id] = w.balance;
      }
    }
    setWallets(wlts);
    setAllocations(allocs);

    const txs = await db.transactions.getByParentId(currentUser.uid);
    setTransactions(txs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));

    const approvals = await db.pendingApprovals.getByParentId(currentUser.uid);
    setPendingApprovals(approvals);
  };

  const loadChildControls = async (childId) => {
    const w = await db.wallets.getByStudentId(childId);
    if (w) {
      setDailyLimit(w.dailyLimit || 150);
      setWeeklyLimit(w.weeklyLimit || 800);
      setMonthlyLimit(w.monthlyLimit || 3000);
      setWalletMode(w.mode || 'free');
      if (w.categoryLimits) {
        setLunchLimit(w.categoryLimits['Lunch'] || 50);
        setSnacksLimit(w.categoryLimits['Snacks'] || 30);
        setStationeryLimit(w.categoryLimits['Stationery'] || 20);
      }
      setAutoRecharge(w.autoRecharge || false);
      setAllowEmergency(w.allowEmergency || false);
      setCategories(w.categoryRestrictions || {});
    }
  };

  const handleChildControlChange = (childId) => {
    setControlChild(childId);
    loadChildControls(childId);
  };

  const handleSaveLimits = async (e) => {
    e.preventDefault();
    const w = wallets[controlChild];
    if (!w) return;

    await db.wallets.updateLimits(w.id, {
      dailyLimit: Number(dailyLimit),
      weeklyLimit: Number(weeklyLimit),
      monthlyLimit: Number(monthlyLimit)
    });

    await db.wallets.updateConfigRules(w.id, {
      mode: walletMode,
      autoRecharge,
      allowEmergency,
      categoryLimits: {
        'Lunch': Number(lunchLimit),
        'Snacks': Number(snacksLimit),
        'Stationery': Number(stationeryLimit)
      }
    });
    
    alert('Wallet controls and spending limits updated successfully!');
    await loadData();
  };

  const handleToggleCategory = async (catName) => {
    const w = wallets[controlChild];
    if (!w) return;

    const updatedCategories = {
      ...categories,
      [catName]: !categories[catName]
    };
    setCategories(updatedCategories);

    await db.wallets.updateRestrictions(w.id, { [catName]: updatedCategories[catName] });
    await loadData();
  };

  const handleToggleFreeze = async (childId) => {
    const w = wallets[childId];
    if (!w) return;
    const isFrozen = w.status === 'frozen';
    await db.wallets.freeze(w.id, !isFrozen);
    await loadData();
  };

  // Reallocate pooled family balances
  const handleReallocateBalances = async (e) => {
    e.preventDefault();
    try {
      await db.wallets.allocateFamilyBalance(currentUser.uid, allocations);
      alert('Family balance pool re-allocated successfully!');
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Approval Handlers
  const handleApproveRequest = async (approvalId) => {
    try {
      await db.pendingApprovals.approve(approvalId);
      alert('Purchase request approved! Transaction processing.');
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRejectRequest = async (approvalId) => {
    try {
      await db.pendingApprovals.reject(approvalId);
      alert('Purchase request denied.');
      await loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  // Razorpay simulated handlers
  const handleOpenRazorpay = (e) => {
    e.preventDefault();
    if (!selectedChild || !rechargeAmount || Number(rechargeAmount) <= 0) {
      alert('Please select a student and enter a valid amount');
      return;
    }
    setShowRazorpay(true);
  };

  const handleCompletePayment = async () => {
    const kid = children.find(c => c.id === selectedChild);
    const w = wallets[selectedChild];
    if (!kid || !w) return;

    setShowRazorpay(false);
    setRechargeSuccess(true);

    await db.wallets.recharge(w.id, Number(rechargeAmount), currentUser.uid);
    await refreshNotifications();

    const receipt = {
      receiptNo: 'REC-' + Math.floor(100000 + Math.random()*900000),
      studentName: kid.name,
      amount: rechargeAmount,
      date: new Date().toLocaleString(),
      paymentId: 'pay_RPZ_' + Math.random().toString(36).substr(2, 9),
      method: razorpayMethod.toUpperCase()
    };
    setGeneratedReceipt(receipt);
    setRechargeAmount('200');

    await loadData();
  };

  const exportTransactionsToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Transaction ID,Student ID,Amount,Type,Status,Payment Method,Description,Date\n";
    
    transactions.forEach(tx => {
      const kid = children.find(c => c.id === tx.studentId);
      csvContent += `${tx.id},${kid?.name || 'Self'},₹${tx.amount},${tx.type},${tx.status},${tx.paymentGateway || 'Wallet'},${tx.description},${tx.createdAt}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Parent_Wallet_Report_${currentUser.name.replace(/\s+/g, '')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateAISpendInsights = () => {
    const insights = [];

    children.forEach(kid => {
      const kidTx = transactions.filter(t => t.studentId === kid.id && t.type === 'purchase' && t.status === 'success');
      const w = wallets[kid.id];
      
      // Calculate category distributions
      const catTotals = {};
      let totalSpend = 0;
      kidTx.forEach(t => {
        t.items?.forEach(item => {
          const cost = item.price * item.quantity;
          catTotals[item.category] = (catTotals[item.category] || 0) + cost;
          totalSpend += cost;
        });
      });

      // Insight 1: Recess Snacks spend > 50%
      const snacksSpend = (catTotals['Snacks'] || 0) + (catTotals['Chips'] || 0) + (catTotals['Chocolates'] || 0) + (catTotals['Soft Drinks'] || 0) + (catTotals['Juice'] || 0);
      if (totalSpend > 0 && (snacksSpend / totalSpend) >= 0.5) {
        const pct = Math.round((snacksSpend / totalSpend) * 100);
        insights.push({
          id: `snack_${kid.id}`,
          studentName: kid.name,
          type: 'warning',
          title: `High Snack Consumption Alert`,
          body: `${kid.name} has spent ${pct}% of their recess budget on snacks & sweets. Consider setting category limits under Parental Controls.`,
          action: 'controls'
        });
      }

      // Insight 2: Low Wallet balance
      if (w && w.balance < 100) {
        insights.push({
          id: `low_bal_${kid.id}`,
          studentName: kid.name,
          type: 'warning',
          title: `Low Smart Card Balance`,
          body: `${kid.name}'s wallet balance is low (₹${w.balance}). Enable Auto-Recharge to prevent check-out failures.`,
          action: 'controls'
        });
      }

      // Insight 3: Frozen Wallet
      if (w && w.status === 'frozen') {
        insights.push({
          id: `frozen_${kid.id}`,
          studentName: kid.name,
          type: 'danger',
          title: `Smart Card Blocked`,
          body: `${kid.name}'s card wallet is currently frozen. Checkout transactions will fail. Click to unfreeze.`,
          action: 'dashboard'
        });
      }
    });

    // Insight 4: General savings tips / cashback
    const monthlySpend = transactions
      .filter(t => {
        const txDate = new Date(t.createdAt);
        const now = new Date();
        return t.type === 'purchase' && t.status === 'success' && txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + t.amount, 0);

    if (monthlySpend > 0) {
      if (monthlySpend < 500) {
        insights.push({
          id: 'cashback_tip',
          studentName: 'General',
          type: 'info',
          title: 'Monthly Spend Target',
          body: `Spend ₹${500 - monthlySpend} more this month to claim the ₹25 monthly cashback reward!`,
          action: 'dashboard'
        });
      } else {
        insights.push({
          id: 'cashback_earned',
          studentName: 'General',
          type: 'success',
          title: 'Monthly Cashback Secured',
          body: `Great! You've crossed the ₹500 monthly spend threshold. ₹25 cashback has been credited to your family account.`,
          action: 'dashboard'
        });
      }
    } else {
      insights.push({
        id: 'default_tip',
        studentName: 'General',
        type: 'info',
        title: 'Recess Spend Controls',
        body: 'You can customize allowed items like soft drinks or chips individually per card in Parental Controls.',
        action: 'controls'
      });
    }

    return insights;
  };

  const renderDashboard = () => (
    <div className="flex flex-col gap-6">
      {/* Strict Mode One-Time Approvals Panel */}
      {pendingApprovals.length > 0 && (
        <Card className="border-fuchsia-500/20 bg-fuchsia-500/5 select-none animate-pulse">
          <h3 className="font-extrabold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-fuchsia-500" />
            Strict Mode: Pending Purchase Approvals
          </h3>
          <p className="text-xs text-slate-400 mb-4">A student is scanning a payment. Verify and approve checkout within 5 minutes.</p>
          <div className="flex flex-col gap-3">
            {pendingApprovals.map(req => {
              const kid = children.find(c => c.id === req.studentId);
              return (
                <div key={req.id} className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-white uppercase">
                      {kid?.name || 'Student'} Checkout Request
                    </span>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-1">
                      {req.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}
                    </p>
                    <span className="text-xs font-bold text-fuchsia-500 mt-1.5 block">
                      Total cost: ₹{req.amount}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleApproveRequest(req.id)} className="bg-emerald-500 hover:bg-emerald-600 text-xs py-2 px-4">
                      Approve
                    </Button>
                    <Button onClick={() => handleRejectRequest(req.id)} variant="secondary" className="hover:bg-red-500/10 hover:text-red-500 text-xs py-2 px-4">
                      Reject
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 flex flex-col justify-between p-6 bg-gradient-to-tr from-violet-600/10 to-indigo-600/10 border-violet-500/10">
          <div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-violet-500" />
              Family Balance Pool
            </h3>
            <p className="text-xs text-slate-400 mt-1">Sum of all active student smart cards linked to your account</p>
          </div>
          <div className="mt-8 flex items-baseline gap-2">
            <span className="text-4xl font-black text-slate-800 dark:text-white">
              ₹{Object.values(wallets).reduce((sum, w) => sum + w.balance, 0)}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Available Float</span>
          </div>
        </Card>

        {/* Quick action buttons */}
        <Card className="flex flex-col gap-3 justify-center">
          <Button variant="primary" onClick={() => activeSection = 'recharge'} className="w-full">
            <CreditCard className="w-4 h-4" /> Quick Recharge UPI
          </Button>
          <Button variant="secondary" onClick={exportTransactionsToCSV} className="w-full">
            <Download className="w-4 h-4" /> Export Spending Report
          </Button>
        </Card>
      </div>

      {/* AI Spending Insights Card */}
      <Card className="relative overflow-hidden border-violet-500/20 bg-gradient-to-tr from-slate-900/60 via-indigo-950/20 to-fuchsia-950/30">
        {/* Glow element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-fuchsia-600/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative flex items-center justify-between mb-4 border-b border-slate-800/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-violet-500/15 border border-violet-500/25 rounded-xl">
              <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-white flex items-center gap-2">
                AI Spend Recommendations
              </h3>
              <p className="text-[11px] text-slate-400">Automated spending heuristics and card optimization suggestions</p>
            </div>
          </div>
          <Badge status="info" className="text-[9px] font-black tracking-widest px-2.5 py-0.5">
            Active Engine
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {generateAISpendInsights().map((insight) => (
            <motion.div
              key={insight.id}
              whileHover={{ scale: 1.01 }}
              className="p-4 rounded-2xl bg-white/5 dark:bg-slate-950/60 border border-slate-200/50 dark:border-slate-850 hover:border-violet-500/40 transition-all flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                    {insight.studentName} Control
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    insight.type === 'danger' ? 'bg-red-500/15 text-red-450' :
                    insight.type === 'warning' ? 'bg-amber-500/15 text-amber-400' :
                    insight.type === 'success' ? 'bg-emerald-500/15 text-emerald-400' :
                    'bg-blue-500/15 text-blue-400'
                  }`}>
                    {insight.title}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed font-medium">
                  {insight.body}
                </p>
              </div>
              
              {insight.action && (
                <div className="flex justify-end mt-1">
                  <button
                    onClick={() => {
                      if (insight.action === 'controls') {
                        alert(`Tip: Scroll down and select the Parental Controls tab to configure Category limits for this card.`);
                      } else {
                        alert(`Tip: Scroll down or click the Smart Card controls to activate card states.`);
                      }
                    }}
                    className="text-[10px] font-bold text-violet-400 hover:text-violet-300 transition-colors cursor-pointer flex items-center gap-1 bg-transparent border-none"
                  >
                    Resolve Rule Option &rarr;
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Children smart ID cards */}
      <div>
        <h3 className="font-bold text-lg mb-4 text-slate-800 dark:text-white">Linked Kid Smart Cards</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {children.map(kid => {
            const w = wallets[kid.id];
            return (
              <Card key={kid.id} className="flex flex-col md:flex-row items-center gap-6 border-slate-200 dark:border-slate-800">
                <div className="flex-1 w-full flex justify-center">
                  <DigitalIDCard student={kid} wallet={w} />
                </div>
                <div className="flex-1 w-full flex flex-col gap-4 justify-center">
                  <div>
                    <h4 className="font-extrabold text-lg">{kid.name}</h4>
                    <p className="text-xs text-slate-400">{kid.class} • Roll {kid.rollNumber}</p>
                    <span className="text-[10px] font-bold font-mono text-violet-500 mt-1 inline-block uppercase bg-violet-500/10 px-2 py-0.5 rounded">
                      {w?.mode || 'Free'} Mode
                    </span>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Card Status:</span>
                      <span className="font-bold text-emerald-400 capitalize flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Active
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Wallet Status:</span>
                      <Badge status={w?.status === 'active' ? 'success' : 'danger'}>
                        {w?.status || 'active'}
                      </Badge>
                    </div>
                  </div>

                  <Button 
                    variant={w?.status === 'active' ? 'danger' : 'success'} 
                    onClick={() => handleToggleFreeze(kid.id)}
                    className="w-full py-2 text-xs"
                  >
                    {w?.status === 'active' ? 'Freeze Smart Wallet' : 'Unfreeze Wallet'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Child transaction log */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-slate-800 dark:text-white">Recent Kids Purchases</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Tx ID</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Category / Shop</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.slice(0, 10).map((tx) => {
                const kid = children.find(c => c.id === tx.studentId);
                return (
                  <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-500/5">
                    <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-200">{tx.id}</td>
                    <td className="py-3 px-4 font-bold">{kid?.name || 'Student'}</td>
                    <td className="py-3 px-4 truncate max-w-[200px]">{tx.description}</td>
                    <td className="py-3 px-4 font-bold text-sm">₹{tx.amount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tx.type === 'recharge' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : tx.type === 'purchase' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' : tx.type === 'refund' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-500' : tx.status === 'refunded' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-red-500/10 text-red-500'}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{new Date(tx.createdAt).toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderRecharge = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Recharge input card */}
      <Card>
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-violet-500" />
          UPI Razorpay Recharge
        </h3>
        <form onSubmit={handleOpenRazorpay} className="flex flex-col gap-4">
          <Select
            label="Select Student Smart Card"
            value={selectedChild}
            onChange={(e) => setSelectedChild(e.target.value)}
            options={children.map(c => ({ value: c.id, label: c.name }))}
            required
          />
          <Input
            label="Recharge Amount (₹)"
            type="number"
            value={rechargeAmount}
            onChange={(e) => setRechargeAmount(e.target.value)}
            min="1"
            max="10000"
            required
          />
          
          <div className="flex flex-col gap-2 mt-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Select Payment Mode</span>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRazorpayMethod('upi')}
                className={`p-3.5 border rounded-2xl flex flex-col items-center gap-1 transition-all text-xs font-bold ${razorpayMethod === 'upi' ? 'border-violet-500 bg-violet-500/5 text-violet-500' : 'border-slate-200 dark:border-slate-800'}`}
              >
                <span>UPI Payment</span>
                <span className="text-[10px] text-slate-400 font-normal">GPay / PhonePe / Paytm</span>
              </button>
              <button
                type="button"
                onClick={() => setRazorpayMethod('card')}
                className={`p-3.5 border rounded-2xl flex flex-col items-center gap-1 transition-all text-xs font-bold ${razorpayMethod === 'card' ? 'border-violet-500 bg-violet-500/5 text-violet-500' : 'border-slate-200 dark:border-slate-800'}`}
              >
                <span>Credit/Debit Card</span>
                <span className="text-[10px] text-slate-400 font-normal">Visa / MasterCard / RuPay</span>
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full mt-4 py-3">
            Load Razorpay Checkout
          </Button>
        </form>
      </Card>

      {/* Multi-Child Family Wallet Allocation tool */}
      <Card>
        <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
          <Wallet className="w-5 h-5 text-violet-500" />
          Distribute Family Wallet Funds
        </h3>
        <p className="text-xs text-slate-400 mb-4">Set exact balances for each child from your pool of funds</p>
        <form onSubmit={handleReallocateBalances} className="flex flex-col gap-4">
          {children.map(kid => (
            <div key={kid.id} className="flex items-center justify-between gap-4 bg-slate-100/40 dark:bg-slate-900/40 p-3.5 border border-slate-200 dark:border-slate-850 rounded-2xl">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-350">{kid.name}</span>
              <div className="w-32">
                <input
                  type="number"
                  value={allocations[kid.id] || 0}
                  onChange={(e) => setAllocations({ ...allocations, [kid.id]: e.target.value })}
                  className="w-full px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-bold text-right focus:border-violet-500"
                  required
                />
              </div>
            </div>
          ))}
          <Button type="submit" variant="secondary" className="w-full mt-2 py-2.5">
            Save Balances Distribution
          </Button>
        </form>
      </Card>

      {/* Razorpay Gateway Modal Simulator */}
      {showRazorpay && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl p-6 relative overflow-hidden"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
              <div>
                <h4 className="text-white font-extrabold text-sm tracking-wide">Razorpay Checkout</h4>
                <p className="text-[10px] text-slate-400">School Wallet Gateway Merchant</p>
              </div>
              <span className="text-xs bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-0.5 rounded-full font-bold">
                Test Mode
              </span>
            </div>

            <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-950/60 mb-5 border border-slate-800">
              <span className="text-xs text-slate-400">Payable Amount:</span>
              <span className="text-2xl font-black text-white">₹{rechargeAmount}</span>
            </div>

            <div className="flex flex-col gap-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold text-center block">
                Simulated {razorpayMethod.toUpperCase()} transaction gateway
              </span>

              <Button onClick={handleCompletePayment} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold">
                Approve Payment (Simulate OTP)
              </Button>
              <Button variant="secondary" onClick={() => setShowRazorpay(false)} className="w-full py-3">
                Decline & Cancel
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Receipt generator */}
      {rechargeSuccess && generatedReceipt && (
        <Card className="lg:col-span-2 border-emerald-500/20 bg-emerald-500/5 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-emerald-500">
            <CheckCircle className="w-6 h-6 animate-bounce" />
            <h3 className="font-extrabold text-lg">Transaction Complete</h3>
          </div>
          
          <div className="p-5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col gap-3.5 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="font-bold">Receipt ID:</span>
              <span className="font-mono text-slate-800 dark:text-white font-bold">{generatedReceipt.receiptNo}</span>
            </div>
            <div className="flex justify-between">
              <span>Student Beneficiary:</span>
              <span className="text-slate-800 dark:text-white font-bold">{generatedReceipt.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span>Amount Transferred:</span>
              <span className="text-emerald-500 font-extrabold">₹{generatedReceipt.amount}</span>
            </div>
            <div className="flex justify-between">
              <span>Razorpay ID:</span>
              <span className="font-mono text-[10px]">{generatedReceipt.paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span>Date & Timestamp:</span>
              <span>{generatedReceipt.date}</span>
            </div>
          </div>
          <Button variant="secondary" onClick={() => setRechargeSuccess(false)} className="w-full">
            Dismiss Receipt
          </Button>
        </Card>
      )}
    </div>
  );

  const renderControls = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Selection */}
      <Card className="lg:col-span-1">
        <h3 className="font-bold text-slate-800 dark:text-white mb-4">Choose Child</h3>
        <div className="flex flex-col gap-2">
          {children.map(kid => (
            <button
              key={kid.id}
              onClick={() => handleChildControlChange(kid.id)}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition-all ${controlChild === kid.id ? 'bg-violet-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200'}`}
            >
              {kid.name}
            </button>
          ))}
        </div>
      </Card>

      {/* Middle/Right Controls settings */}
      {controlChild && wallets[controlChild] && (
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Limits & Rules config form */}
          <Card>
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-violet-500" />
              Configure Wallet Rules & General Limits
            </h3>
            <form onSubmit={handleSaveLimits} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Smart Wallet Mode"
                  value={walletMode}
                  onChange={(e) => setWalletMode(e.target.value)}
                  options={[
                    { value: 'free', label: 'Free Mode (No spending rules)' },
                    { value: 'controlled', label: 'Controlled Mode (Enforce Category caps)' },
                    { value: 'strict', label: 'Strict Mode (Every checkout needs OTP/approval)' }
                  ]}
                />
                <Input
                  label="Daily Max Limit (₹)"
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Weekly Max Limit (₹)"
                  type="number"
                  value={weeklyLimit}
                  onChange={(e) => setWeeklyLimit(e.target.value)}
                  required
                />
                <Input
                  label="Monthly Max Limit (₹)"
                  type="number"
                  value={monthlyLimit}
                  onChange={(e) => setMonthlyLimit(e.target.value)}
                  required
                />
              </div>

              {/* Advanced Auto-recharge and Emergency overdraft */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-200 dark:border-slate-800/80 pt-4 mt-1">
                <label className="flex items-center gap-3.5 p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRecharge}
                    onChange={(e) => setAutoRecharge(e.target.checked)}
                    className="w-4 h-4 accent-violet-600"
                  />
                  <div>
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-350 block">Auto-Recharge</span>
                    <span className="text-[10px] text-slate-400">Instantly loads ₹500 if wallet drops below ₹100</span>
                  </div>
                </label>

                <label className="flex items-center gap-3.5 p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowEmergency}
                    onChange={(e) => setAllowEmergency(e.target.checked)}
                    className="w-4 h-4 accent-violet-600"
                  />
                  <div>
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-350 block">Emergency Wallet Buffer</span>
                    <span className="text-[10px] text-slate-400">Allows up to -₹100 overdraft for meals</span>
                  </div>
                </label>
              </div>

              {/* Spending Rules Engine: Category caps */}
              {walletMode === 'controlled' && (
                <div className="border-t border-slate-200 dark:border-slate-800/80 pt-4 mt-1">
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-3">Spending Rules: Daily Category Caps</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input
                      label="Lunch Max Limit (₹)"
                      type="number"
                      value={lunchLimit}
                      onChange={(e) => setLunchLimit(e.target.value)}
                    />
                    <Input
                      label="Snacks Max Limit (₹)"
                      type="number"
                      value={snacksLimit}
                      onChange={(e) => setSnacksLimit(e.target.value)}
                    />
                    <Input
                      label="Stationery Max Limit (₹)"
                      type="number"
                      value={stationeryLimit}
                      onChange={(e) => setStationeryLimit(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end border-t border-slate-100 dark:border-slate-900 pt-4 mt-2">
                <Button type="submit" className="px-5 py-2.5 text-xs">
                  Save Rules & Toggles
                </Button>
              </div>
            </form>
          </Card>

          {/* Category allowances */}
          <Card>
            <h3 className="font-bold text-lg mb-1.5">Category Allowances & Blocks</h3>
            <p className="text-xs text-slate-400 mb-4">Uncheck items to block transactions in these categories at checkouts.</p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.keys(categories).map((catName) => {
                const allowed = categories[catName];
                return (
                  <button
                    key={catName}
                    type="button"
                    onClick={() => handleToggleCategory(catName)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${allowed ? 'border-emerald-500/30 bg-emerald-500/5 text-slate-800 dark:text-white' : 'border-red-500/30 bg-red-500/5 text-red-550 dark:text-red-400'}`}
                  >
                    <span className="text-xs font-bold">{catName}</span>
                    <span className="text-[10px] font-bold uppercase">
                      {allowed ? 'Allow' : 'Banned'}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  switch (activeSection) {
    case 'recharge':
      return renderRecharge();
    case 'controls':
      return renderControls();
    case 'dashboard':
    default:
      return renderDashboard();
  }
}
