import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, School, Users, Wallet, ShoppingBag, 
  Settings, LogOut, UserCircle, Bell, ArrowLeftRight, CreditCard, Calendar 
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Sidebar({ activeTab, setActiveTab }) {
  const { currentUser, logout } = useAuth();

  if (!currentUser) return null;

  const role = currentUser.role;

  // Define links based on roles
  const menuItems = {
    super_admin: [
      { id: 'dashboard', label: 'Super Dashboard', icon: LayoutDashboard },
      { id: 'schools', label: 'Manage Schools', icon: School },
      { id: 'transactions', label: 'Global Ledger', icon: ArrowLeftRight },
      { id: 'profile', label: 'My Profile', icon: UserCircle }
    ],
    school_admin: [
      { id: 'dashboard', label: 'School Dashboard', icon: LayoutDashboard },
      { id: 'students', label: 'Manage Students', icon: Users },
      { id: 'vendors', label: 'Manage Vendors', icon: ShoppingBag },
      { id: 'attendance', label: 'School Attendance', icon: Calendar },
      { id: 'settings', label: 'School Settings', icon: Settings },
      { id: 'profile', label: 'My Profile', icon: UserCircle }
    ],
    parent: [
      { id: 'dashboard', label: 'Parent Dashboard', icon: LayoutDashboard },
      { id: 'recharge', label: 'Recharge Wallets', icon: CreditCard },
      { id: 'controls', label: 'Parental Controls', icon: Settings },
      { id: 'profile', label: 'My Profile', icon: UserCircle }
    ],
    student: [
      { id: 'dashboard', label: 'My Smart Card', icon: Wallet },
      { id: 'profile', label: 'My Profile', icon: UserCircle }
    ],
    canteen_vendor: [
      { id: 'dashboard', label: 'Canteen POS', icon: LayoutDashboard },
      { id: 'products', label: 'Menu Catalog', icon: ShoppingBag },
      { id: 'profile', label: 'My Profile', icon: UserCircle }
    ],
    stationery_vendor: [
      { id: 'dashboard', label: 'Stationery POS', icon: LayoutDashboard },
      { id: 'products', label: 'Book Inventory', icon: ShoppingBag },
      { id: 'profile', label: 'My Profile', icon: UserCircle }
    ],
    teacher: [
      { id: 'dashboard', label: 'Allowance Dashboard', icon: LayoutDashboard },
      { id: 'profile', label: 'My Profile', icon: UserCircle }
    ]
  };

  const currentMenu = menuItems[role] || [];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-400 flex flex-col justify-between h-screen sticky top-0 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
          <Wallet className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-white font-extrabold text-sm tracking-wide">School Wallet</h2>
          <span className="text-[9px] text-indigo-400 font-semibold tracking-wider uppercase">SaaS Cashless</span>
        </div>
      </div>

      {/* Roster list */}
      <nav className="flex-1 px-4 py-6 flex flex-col gap-1.5 overflow-y-auto">
        {currentMenu.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-md shadow-violet-500/10' 
                  : 'hover:bg-slate-800/60 hover:text-slate-200'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Footer Profile Info */}
      <div className="p-4 border-t border-slate-800 flex flex-col gap-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-violet-400">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-slate-200 truncate">{currentUser.name}</h4>
            <span className="text-[10px] text-slate-500 capitalize">{currentUser.role.replace('_', ' ')}</span>
          </div>
        </div>
        
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-red-500/10 hover:text-red-400 text-slate-400 transition-colors text-left cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out Session
        </button>
      </div>
    </aside>
  );
}
