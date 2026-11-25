import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { useAuth } from '../../context/AuthContext';
import { Card, Button, Input, Select, Badge } from '../../components/ui/Cards';
import QRScanner from '../../components/QRScanner';
import { ShoppingCart, ShoppingBag, Plus, Trash2, RotateCcw, ShieldAlert, Sparkles, Wifi, WifiOff, CloudLightning } from 'lucide-react';

export default function VendorDashboard({ activeSection }) {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [cart, setCart] = useState([]);
  
  // Product Form State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodCategory, setProdCategory] = useState('Snacks');
  const [prodInventory, setProdInventory] = useState('50');

  // Advanced features states
  const [isOnline, setIsOnline] = useState(true);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [scannedStudent, setScannedStudent] = useState(null); // Face check trigger
  const [awaitingApproval, setAwaitingApproval] = useState(null); // Approval listener trigger
  const [checkoutMessage, setCheckoutMessage] = useState({ type: '', text: '' });
  const [syncStatus, setSyncStatus] = useState('');

  useEffect(() => {
    if (currentUser) {
      loadData();
      // Load offline queue if exists
      const cached = localStorage.getItem(`offline_queue_${currentUser.uid}`);
      if (cached) setOfflineQueue(JSON.parse(cached));
    }
  }, [currentUser]);

  // Strict Mode Parent Approval polling listener
  useEffect(() => {
    if (!awaitingApproval) return;
    
    const pollInterval = setInterval(async () => {
      try {
        const txs = await db.transactions.getByVendorId(currentUser.uid);
        // Look for any success transaction matching this approval Id or time/student
        const matched = txs.find(t => 
          t.studentId === awaitingApproval.student.id && 
          new Date(t.createdAt) >= new Date(awaitingApproval.time) &&
          t.status === 'success'
        );

        if (matched) {
          setCheckoutMessage({ type: 'success', text: `Transaction approved by parent! ₹${awaitingApproval.amount} deducted.` });
          setAwaitingApproval(null);
          setCart([]);
          await loadData();
          clearInterval(pollInterval);
        }

        // Check if approval record expired (cleared from DB pending approvals list)
        const approvals = await db.pendingApprovals.getByParentId('u_parent'); // Demo parent check
        const stillPending = approvals.find(a => a.studentId === awaitingApproval.student.id);
        if (!stillPending && !matched) {
          setCheckoutMessage({ type: 'error', text: 'Transaction request expired or rejected by parent.' });
          setAwaitingApproval(null);
          clearInterval(pollInterval);
        }

      } catch (err) {
        console.error('Error polling approval:', err);
      }
    }, 2500);

    return () => clearInterval(pollInterval);
  }, [awaitingApproval]);

  const loadData = async () => {
    const prods = await db.vendors.getProducts(currentUser.uid);
    const txs = await db.transactions.getByVendorId(currentUser.uid);
    setProducts(prods);
    setTransactions(txs.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)));
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    if (editingProduct) {
      await db.vendors.editProduct(editingProduct.id, {
        name: prodName,
        price: Number(prodPrice),
        category: prodCategory,
        inventory: Number(prodInventory)
      });
    } else {
      await db.vendors.addProduct({
        schoolId: currentUser.schoolId || 'sch_greenwood',
        vendorId: currentUser.uid,
        name: prodName,
        price: Number(prodPrice),
        category: prodCategory,
        inventory: Number(prodInventory),
        status: 'active'
      });
    }
    resetProductForm();
    await loadData();
  };

  const startProductEdit = (product) => {
    setEditingProduct(product);
    setProdName(product.name);
    setProdPrice(product.price);
    setProdCategory(product.category);
    setProdInventory(product.inventory);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await db.vendors.deleteProduct(id);
      await loadData();
    }
  };

  const resetProductForm = () => {
    setEditingProduct(null);
    setProdName('');
    setProdPrice('');
    setProdCategory(currentUser.role === 'canteen_vendor' ? 'Snacks' : 'Books');
    setProdInventory('50');
    setShowProductForm(false);
  };

  // Cart Management
  const addToCart = (product) => {
    setCheckoutMessage({ type: '', text: '' });
    if (product.inventory <= 0) {
      alert('Product is out of stock!');
      return;
    }

    const exist = cart.find(c => c.productId === product.id);
    if (exist) {
      if (exist.quantity >= product.inventory) {
        alert('Cannot add more. Inventory limit reached.');
        return;
      }
      setCart(cart.map(c => c.productId === product.id ? { ...c, quantity: c.quantity + 1 } : c));
    } else {
      setCart([...cart, { productId: product.id, name: product.name, price: product.price, category: product.category, quantity: 1 }]);
    }
  };

  const updateCartQty = (productId, delta) => {
    const exist = cart.find(c => c.productId === productId);
    if (!exist) return;
    const prod = products.find(p => p.id === productId);

    const nextQty = exist.quantity + delta;
    if (nextQty <= 0) {
      setCart(cart.filter(c => c.productId !== productId));
    } else {
      if (delta > 0 && prod && nextQty > prod.inventory) {
        alert('Cannot add more. Inventory limit reached.');
        return;
      }
      setCart(cart.map(c => c.productId === productId ? { ...c, quantity: nextQty } : c));
    }
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(c => c.productId !== productId));
  };

  // QR Scanning trigger: store scanned student details to pop up face check
  const handleScanSuccess = (student) => {
    setCheckoutMessage({ type: '', text: '' });
    if (cart.length === 0) {
      setCheckoutMessage({ type: 'error', text: 'Cart is empty. Add items first.' });
      return;
    }
    setScannedStudent(student);
  };

  // Confirm face matches and process payment
  const handleConfirmFace = async () => {
    const student = scannedStudent;
    setScannedStudent(null);

    // Enforce time override or test controls inside checkout checks
    const totalAmount = cart.reduce((sum, c) => sum + (c.price * c.quantity), 0);

    if (!isOnline) {
      // Offline POS Cache Checkout
      const offlineTx = {
        id: 'off_tx_' + Math.random().toString(36).substr(2, 9),
        studentId: student.id,
        studentName: student.name,
        items: [...cart],
        amount: totalAmount,
        createdAt: new Date().toISOString()
      };
      
      const newQueue = [...offlineQueue, offlineTx];
      setOfflineQueue(newQueue);
      localStorage.setItem(`offline_queue_${currentUser.uid}`, JSON.stringify(newQueue));
      
      setCheckoutMessage({ type: 'success', text: `Offline checkout saved! Deducted ₹${totalAmount} from local cached card.` });
      setCart([]);
      return;
    }

    try {
      await db.wallets.processPurchase(student.id, cart, currentUser.uid);
      setCheckoutMessage({ type: 'success', text: `Checkout successful! ₹${totalAmount} deducted from ${student.name}'s wallet.` });
      setCart([]);
      await loadData();
    } catch (err) {
      if (err.message.includes('Strict Mode')) {
        // Enforce strict approval listener
        setAwaitingApproval({
          student,
          amount: totalAmount,
          time: new Date().toISOString()
        });
      } else {
        setCheckoutMessage({ type: 'error', text: err.message || 'Checkout failed.' });
      }
    }
  };

  // Offline queue syncing
  const handleSyncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    setSyncStatus('Syncing cached offline checkouts...');
    
    let successCount = 0;
    let failedCount = 0;
    const errors = [];

    for (const tx of offlineQueue) {
      try {
        await db.wallets.processPurchase(tx.studentId, tx.items, currentUser.uid, { bypassTimeRules: true });
        successCount++;
      } catch (err) {
        failedCount++;
        errors.push(`${tx.studentName}: ${err.message}`);
      }
    }

    setSyncStatus(`Sync complete. Successfully processed ${successCount} orders. Failed: ${failedCount}.`);
    setOfflineQueue([]);
    localStorage.removeItem(`offline_queue_${currentUser.uid}`);
    
    if (errors.length > 0) {
      alert(`Sync warnings:\n` + errors.join('\n'));
    }

    setTimeout(() => setSyncStatus(''), 4000);
    await loadData();
  };

  const handleRefund = async (transactionId) => {
    if (confirm('Verify: Issue immediate refund for this purchase?')) {
      try {
        await db.transactions.refund(transactionId);
        alert('Refund processed successfully!');
        await loadData();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalSalesVolume = transactions
    .filter(t => t.status === 'success' && t.type === 'purchase')
    .reduce((sum, t) => sum + t.amount, 0);

  const productCategories = currentUser.role === 'canteen_vendor' 
    ? ['Snacks', 'Lunch', 'Juice', 'Water', 'Chips', 'Chocolates', 'Soft Drinks']
    : ['Stationery', 'Books'];

  const renderPOS = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* POS Cart Catalog */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Offline Sync alert banner */}
        {!isOnline && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-between text-xs font-semibold select-none">
            <span className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              Store operating in OFFLINE mode. Orders cached locally.
            </span>
            {offlineQueue.length > 0 && (
              <span className="bg-amber-500 text-slate-900 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                {offlineQueue.length} Cached
              </span>
            )}
          </div>
        )}

        {isOnline && offlineQueue.length > 0 && (
          <div className="p-3 bg-yellow-500/15 border border-yellow-500/30 text-yellow-600 dark:text-yellow-400 rounded-2xl flex items-center justify-between text-xs font-semibold select-none">
            <span className="flex items-center gap-2">
              <Wifi className="w-4 h-4 animate-bounce" />
              Internet reconnected. You have {offlineQueue.length} cached offline orders.
            </span>
            <Button onClick={handleSyncOfflineQueue} className="py-1 px-3 bg-yellow-500 text-slate-900 text-[10px] font-bold">
              Sync Orders Now
            </Button>
          </div>
        )}

        {syncStatus && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl text-xs font-semibold">
            {syncStatus}
          </div>
        )}

        {checkoutMessage.text && (
          <div className={`p-4 rounded-xl text-xs font-semibold border ${checkoutMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
            {checkoutMessage.text}
          </div>
        )}

        {/* Strict Mode approval spinner overlay */}
        {awaitingApproval && (
          <Card className="border-fuchsia-500/30 bg-fuchsia-500/5 select-none flex flex-col justify-center items-center py-10">
            <div className="w-10 h-10 border-4 border-fuchsia-500 border-t-transparent animate-spin rounded-full mb-4"></div>
            <h4 className="font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4.5 h-4.5 text-fuchsia-500" />
              Strict Mode: Awaiting Parent OTP/Approval
            </h4>
            <p className="text-xs text-slate-400 text-center mt-1.5 max-w-[280px]">
              Approval alert dispatched to {awaitingApproval.student.name}'s parent. POS checkout will auto-complete once approved.
            </p>
            <Button variant="secondary" onClick={() => setAwaitingApproval(null)} className="mt-5 text-[10px] py-1 px-3">
              Cancel Waiting
            </Button>
          </Card>
        )}

        <Card>
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Store Catalog</h3>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-slate-400 font-bold uppercase">POS Connection:</span>
              <button 
                onClick={() => setIsOnline(!isOnline)} 
                className={`flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border transition-colors ${isOnline ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500' : 'border-amber-500/20 bg-amber-500/10 text-amber-500'}`}
              >
                {isOnline ? (
                  <>
                    <Wifi className="w-3 h-3" /> Online
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3 h-3" /> Offline
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {products.map(prod => (
              <button
                key={prod.id}
                onClick={() => addToCart(prod)}
                className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl text-left flex flex-col justify-between h-28 hover:border-violet-500 hover:bg-violet-500/5 transition-all cursor-pointer shadow-sm"
              >
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 dark:text-white truncate">{prod.name}</h4>
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-semibold mt-0.5">{prod.category}</span>
                </div>
                <div className="flex justify-between items-end w-full mt-2">
                  <span className="font-bold text-sm text-violet-500 dark:text-violet-400">₹{prod.price}</span>
                  <span className={`text-[9px] font-bold ${prod.inventory > 10 ? 'text-slate-400' : prod.inventory > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                    Stock: {prod.inventory}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </Card>

        {/* QR Code Scanner integration */}
        {cart.length > 0 && !awaitingApproval && (
          <QRScanner onScanSuccess={handleScanSuccess} />
        )}
      </div>

      {/* Cart side pane */}
      <div className="lg:col-span-4 flex flex-col gap-6 sticky top-20">
        <Card className="flex flex-col justify-between max-h-[500px]">
          <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-3">
            <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-violet-500" />
              Active Cart Checklist
            </h3>
            <span className="bg-slate-100 dark:bg-slate-900 text-slate-500 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-3">
            {cart.length > 0 ? (
              cart.map((item) => (
                <div key={item.productId} className="flex justify-between items-center gap-3 bg-slate-50 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 p-3 rounded-xl">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{item.name}</h4>
                    <span className="text-[10px] text-slate-400">₹{item.price} each</span>
                  </div>
                  
                  <div className="flex items-center gap-2.5">
                    <button 
                      onClick={() => updateCartQty(item.productId, -1)}
                      className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs hover:bg-slate-300 transition-colors"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                    <button 
                      onClick={() => updateCartQty(item.productId, 1)}
                      className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs hover:bg-slate-300 transition-colors"
                    >
                      +
                    </button>
                    <button 
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-500 hover:text-red-400 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                Add products from catalog to start POS billing
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 flex flex-col gap-3 mt-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500 font-medium">Checkout Total:</span>
              <span className="text-xl font-black text-violet-500 dark:text-violet-400">₹{cartTotal}</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Face Verification Modal Popup */}
      {scannedStudent && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 flex flex-col items-center justify-between text-center gap-6 shadow-2xl relative"
          >
            {/* Header */}
            <div>
              <span className="text-[10px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest block">Security Gateway</span>
              <h4 className="text-white font-extrabold text-lg mt-0.5">Premium Face Verification</h4>
            </div>

            {/* Profile Avatar */}
            <div className="relative group">
              <div className="absolute -inset-1.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur opacity-75 animate-pulse" />
              <img 
                src={scannedStudent.photoUrl} 
                alt={scannedStudent.name}
                className="relative w-36 h-36 rounded-full object-cover border-4 border-slate-950"
              />
            </div>

            {/* Meta */}
            <div>
              <h3 className="text-white font-black text-xl">{scannedStudent.name}</h3>
              <p className="text-xs text-slate-400">{scannedStudent.class} • ADM No: {scannedStudent.admissionNumber}</p>
              
              <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-2xl mt-4 max-w-[280px] text-left">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">Confirm details match student at cashier</span>
                <span className="text-[11px] text-slate-350 leading-relaxed block mt-1">This prevents smart card sharing or screenshot spoofing.</span>
              </div>
            </div>

            {/* Trigger actions */}
            <div className="w-full flex flex-col gap-2.5">
              <Button onClick={handleConfirmFace} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold">
                Confirm Photo Match
              </Button>
              <Button variant="secondary" onClick={() => setScannedStudent(null)} className="w-full py-3">
                Reject / Cancel Identity
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );

  const renderProducts = () => (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-slate-800 dark:text-white">Store Inventory Catalog</h3>
        <Button variant="primary" onClick={() => setShowProductForm(true)} className="px-4 py-2 text-xs">
          <Plus className="w-4 h-4" /> Add New Product
        </Button>
      </div>

      {showProductForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg bg-white dark:bg-slate-950 p-6 relative">
            <h3 className="font-bold text-lg mb-4">{editingProduct ? 'Edit Catalog Product' : 'Register New Catalog Product'}</h3>
            <form onSubmit={handleProductSubmit} className="flex flex-col gap-4">
              <Input
                label="Product Name"
                value={prodName}
                onChange={(e) => setProdName(e.target.value)}
                placeholder="e.g. Veg Puff, Classmate Note"
                required
              />
              <Input
                label="Unit Price (₹)"
                type="number"
                value={prodPrice}
                onChange={(e) => setProdPrice(e.target.value)}
                placeholder="e.g. 25"
                required
              />
              <Select
                label="Product Category"
                value={prodCategory}
                onChange={(e) => setProdCategory(e.target.value)}
                options={productCategories.map(cat => ({ value: cat, label: cat }))}
                required
              />
              <Input
                label="Initial Stock Inventory"
                type="number"
                value={prodInventory}
                onChange={(e) => setProdInventory(e.target.value)}
                required
              />
              <div className="flex gap-3 justify-end mt-4">
                <Button type="button" variant="secondary" onClick={resetProductForm} className="px-4 py-2 text-xs">
                  Cancel
                </Button>
                <Button type="submit" className="px-4 py-2 text-xs">
                  {editingProduct ? 'Save Product' : 'Add to Catalog'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Inventory table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Stock count</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-500/5">
                  <td className="py-3 px-4 font-bold text-slate-700 dark:text-slate-200">{p.name}</td>
                  <td className="py-3 px-4 font-semibold text-slate-400 uppercase tracking-wider font-mono text-[10px]">{p.category}</td>
                  <td className="py-3 px-4 font-bold text-sm">₹{p.price}</td>
                  <td className="py-3 px-4">
                    <span className={`font-bold font-mono text-sm ${p.inventory > 10 ? 'text-slate-700 dark:text-slate-300' : p.inventory > 0 ? 'text-amber-500' : 'text-red-500'}`}>
                      {p.inventory} units
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <Badge status={p.inventory > 0 ? 'success' : 'danger'}>
                      {p.inventory > 0 ? 'In Stock' : 'Out of Stock'}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Button variant="secondary" onClick={() => startProductEdit(p)} className="px-2.5 py-1 text-[10px]">
                        Edit Stock
                      </Button>
                      <Button variant="danger" onClick={() => handleDeleteProduct(p.id)} className="px-2.5 py-1 text-[10px]">
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );

  const renderSalesHistory = () => (
    <Card>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white">Checkout Ledger</h3>
          <p className="text-xs text-slate-400">Total Revenue volume generated: ₹{totalSalesVolume}</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-medium border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
              <th className="py-3 px-4">Tx ID</th>
              <th className="py-3 px-4">Beneficiary Student ID</th>
              <th className="py-3 px-4">Deducted Amount</th>
              <th className="py-3 px-4">Items count</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Checkout Time</th>
              <th className="py-3 px-4">Refund Trigger</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-900 hover:bg-slate-500/5">
                <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-200">{tx.id}</td>
                <td className="py-3 px-4 font-mono">{tx.studentId}</td>
                <td className="py-3 px-4 font-extrabold text-sm text-slate-800 dark:text-white">₹{tx.amount}</td>
                <td className="py-3 px-4">{tx.items?.reduce((sum, i) => sum + i.quantity, 0) || 1} items</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${tx.status === 'success' ? 'bg-emerald-500/10 text-emerald-400' : tx.status === 'refunded' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-red-500/10 text-red-500'}`}>
                    {tx.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-slate-400">{new Date(tx.createdAt).toLocaleString()}</td>
                <td className="py-3 px-4">
                  {tx.status === 'success' && tx.type === 'purchase' && (
                    <Button variant="secondary" onClick={() => handleRefund(tx.id)} className="px-2 py-1 text-[10px] flex items-center gap-1">
                      <RotateCcw className="w-3 h-3" /> Issue Refund
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  switch (activeSection) {
    case 'products':
      return renderProducts();
    case 'transactions':
      return renderSalesHistory();
    case 'dashboard':
    default:
      return renderPOS();
  }
}
