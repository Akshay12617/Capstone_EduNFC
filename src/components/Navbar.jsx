import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Sun, Moon, CheckCircle } from 'lucide-react';
import { db } from '../services/db';

export default function Navbar({ activeTab }) {
  const { currentUser, notifications, refreshNotifications } = useAuth();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize theme mode on mount
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark') || 
                   localStorage.getItem('theme') === 'dark';
    setIsDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDarkMode;
    setIsDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleMarkAllRead = async () => {
    if (!currentUser) return;
    await db.notifications.markAllRead(currentUser.uid);
    await refreshNotifications();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard Overview',
      schools: 'Schools Directory',
      students: 'Students Directory',
      vendors: 'Vendors Registry',
      attendance: 'School Attendance Feed',
      settings: 'Portal Settings',
      recharge: 'Add Wallet Funds',
      controls: 'Spending & Category Allowances',
      products: 'Inventory & Product Catalog',
      transactions: 'Transaction Audit Ledger',
      profile: 'User Settings'
    };
    return titles[activeTab] || 'Dashboard';
  };

  return (
    <header className="h-16 px-6 bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Title */}
      <div>
        <h2 className="font-extrabold text-lg tracking-tight text-slate-800 dark:text-white capitalize">
          {getPageTitle()}
        </h2>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 relative">
        {/* Dark Mode Switcher */}
        <button
          onClick={toggleTheme}
          className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors flex items-center justify-center cursor-pointer border border-slate-200/40 dark:border-slate-800/40"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications Icon & Count */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors flex items-center justify-center cursor-pointer border border-slate-200/40 dark:border-slate-800/40"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-[10px] text-white font-bold rounded-full flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-3 w-80 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-900 shadow-2xl p-4 flex flex-col gap-2 z-50">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-900 pb-2">
                <span className="text-xs font-extrabold uppercase tracking-wide text-slate-400">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead} 
                    className="text-[10px] text-violet-500 hover:text-violet-400 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Message List */}
              <div className="max-h-64 overflow-y-auto flex flex-col gap-2.5 py-1">
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id} 
                      className={`p-3 rounded-xl text-left transition-colors flex flex-col gap-0.5 border ${notif.read ? 'bg-transparent border-transparent' : 'bg-violet-500/5 dark:bg-violet-500/10 border-violet-500/10'}`}
                    >
                      <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center justify-between">
                        {notif.title}
                        {!notif.read && <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>}
                      </h4>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-normal">{notif.body}</p>
                      <span className="text-[9px] text-slate-400 font-mono mt-1">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400 font-medium">
                    No notifications yet
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
