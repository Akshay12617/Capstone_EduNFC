import React from 'react';
import { motion } from 'framer-motion';

// Glassmorphic Card
export const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`glass rounded-2xl p-6 shadow-lg border border-white/10 dark:border-white/5 transition-all duration-300 hover:shadow-xl ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Premium Animated Button
export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseStyle = "px-5 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md";
  const variants = {
    primary: "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:from-violet-500 hover:to-fuchsia-500 focus:ring-2 focus:ring-violet-400 focus:ring-offset-2",
    secondary: "bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700",
    danger: "bg-red-500 text-white hover:bg-red-600",
    success: "bg-emerald-500 text-white hover:bg-emerald-600",
    glass: "bg-white/10 dark:bg-slate-900/40 text-slate-800 dark:text-slate-200 border border-white/10 hover:bg-white/20 dark:hover:bg-slate-800/60"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Form Text Input
export const Input = React.forwardRef(({ label, error, className = '', ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</label>}
      <input
        ref={ref}
        className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 rounded-xl text-sm transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:text-white ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <span className="text-xs font-medium text-red-500">{error.message || error}</span>}
    </div>
  );
});

Input.displayName = 'Input';

// Custom Dropdown Selection
export const Select = React.forwardRef(({ label, options, error, className = '', ...props }, ref) => {
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{label}</label>}
      <select
        ref={ref}
        className={`w-full px-4 py-3 bg-white/50 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 rounded-xl text-sm transition-all focus:border-violet-500 focus:ring-1 focus:ring-violet-500 dark:text-white appearance-none cursor-pointer ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-white">
            {opt.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs font-medium text-red-500">{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';

// Status Tag Badge
export const Badge = ({ children, status = 'success', className = '', ...props }) => {
  const base = "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 shadow-sm";
  const styles = {
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    danger: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    info: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20"
  };

  return (
    <span className={`${base} ${styles[status]} ${className}`} {...props}>
      {children}
    </span>
  );
};
