import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button, Card, Input } from '../../components/ui/Cards';
import { ShieldCheck, Mail, Lock, Phone, KeyRound, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const { login } = useAuth();
  const [method, setMethod] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    if (!phone) {
      setError('Please enter a valid phone number');
      return;
    }
    setOtpSent(true);
    setError('');
  };

  const handleOtpLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      // For demo, we verify phone with any OTP, login as Parent
      if (otp === '123456' || otp === '1234') {
        await login('parent@wallet.com', 'password123');
      } else {
        throw new Error('Invalid OTP. Use "1234" for testing.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSuccess(true);
  };

  // Quick Login Helper
  const quickLogin = async (demoEmail) => {
    setError('');
    setIsLoading(true);
    try {
      await login(demoEmail, 'password123');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { name: 'Super Admin', email: 'superadmin@wallet.com', color: 'from-pink-500 to-rose-500' },
    { name: 'School Admin', email: 'schooladmin@wallet.com', color: 'from-amber-500 to-orange-500' },
    { name: 'Parent', email: 'parent@wallet.com', color: 'from-emerald-500 to-teal-500' },
    { name: 'Student', email: 'student@wallet.com', color: 'from-blue-500 to-indigo-500' },
    { name: 'Canteen', email: 'canteen@wallet.com', color: 'from-violet-500 to-purple-500' },
    { name: 'Bookstore', email: 'stationery@wallet.com', color: 'from-fuchsia-500 to-violet-500' }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4 relative overflow-hidden bg-slate-900">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-fuchsia-600/10 blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        {/* Brand Logo Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/25 mb-3">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">School Wallet</h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-semibold">Cashless Campus Smart Wallet</p>
        </div>

        {/* Login Card */}
        <Card className="bg-slate-950/60 border-slate-800 p-8 shadow-2xl">
          {/* Methods Tabs */}
          <div className="flex border-b border-slate-800 mb-6">
            <button
              onClick={() => { setMethod('email'); setError(''); }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 text-center transition-all ${method === 'email' ? 'border-violet-500 text-white' : 'border-transparent text-slate-400'}`}
            >
              Email Login
            </button>
            <button
              onClick={() => { setMethod('otp'); setError(''); }}
              className={`flex-1 pb-3 text-sm font-bold border-b-2 text-center transition-all ${method === 'otp' ? 'border-violet-500 text-white' : 'border-transparent text-slate-400'}`}
            >
              Mobile OTP
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-semibold text-red-400">
              {error}
            </div>
          )}

          {/* Email Form */}
          {method === 'email' && !showForgot && (
            <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
              <div className="relative">
                <Mail className="absolute left-3.5 top-10 w-4 h-4 text-slate-400" />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="name@school.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 text-white"
                  required
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-10 w-4 h-4 text-slate-400" />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 text-white"
                  required
                />
              </div>

              <div className="flex justify-end mt-1">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                >
                  Forgot Password?
                </button>
              </div>

              <Button type="submit" disabled={isLoading} className="w-full mt-2">
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          )}

          {/* OTP Form */}
          {method === 'otp' && (
            <form onSubmit={otpSent ? handleOtpLogin : handleSendOtp} className="flex flex-col gap-4">
              {!otpSent ? (
                <>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-10 w-4 h-4 text-slate-400" />
                    <Input
                      label="Mobile Number"
                      type="tel"
                      placeholder="e.g. +91 99999 99903"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 text-white"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full mt-2">
                    Send Verification OTP
                  </Button>
                </>
              ) : (
                <>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-10 w-4 h-4 text-slate-400" />
                    <Input
                      label="Enter OTP"
                      type="text"
                      placeholder="Enter '1234' for testing"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="pl-10 text-white"
                      required
                    />
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[10px] text-slate-400">OTP sent to {phone}</span>
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="text-xs text-violet-400 hover:text-violet-300 font-semibold"
                    >
                      Change Number
                    </button>
                  </div>
                  <Button type="submit" disabled={isLoading} className="w-full mt-2">
                    {isLoading ? 'Verifying...' : 'Verify & Log In'}
                  </Button>
                </>
              )}
            </form>
          )}

          {/* Forgot Password Simulator */}
          {showForgot && (
            <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
              <h3 className="font-bold text-white text-md">Reset Password</h3>
              <p className="text-xs text-slate-400">Enter your email and we'll send you a password reset simulation link.</p>

              {forgotSuccess ? (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold">
                  A password reset simulation link has been sent! Check your email.
                </div>
              ) : (
                <div className="relative">
                  <Mail className="absolute left-3.5 top-10 w-4 h-4 text-slate-400" />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="name@school.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="pl-10 text-white"
                    required
                  />
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => { setShowForgot(false); setForgotSuccess(false); }} 
                  className="flex-1"
                >
                  Back
                </Button>
                {!forgotSuccess && (
                  <Button type="submit" className="flex-1">
                    Send Link
                  </Button>
                )}
              </div>
            </form>
          )}
        </Card>

        {/* Demo Quick Logins Section */}
        <div className="mt-8">
          <div className="flex items-center gap-2 mb-4 justify-center">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Demo Testing Profiles</h3>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            {demoAccounts.map(account => (
              <button
                key={account.name}
                onClick={() => quickLogin(account.email)}
                disabled={isLoading}
                className={`p-3 rounded-2xl bg-gradient-to-br ${account.color} bg-opacity-10 border border-white/5 hover:border-white/20 transition-all text-left group cursor-pointer shadow-lg`}
              >
                <div className="text-[10px] font-bold text-white uppercase tracking-wider group-hover:scale-[1.01] transition-transform">{account.name}</div>
                <div className="text-[9px] text-white/70 font-mono mt-0.5 select-none">{account.email}</div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
