import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, ShieldCheck, RefreshCw, Wallet } from 'lucide-react';

export default function DigitalIDCard({ student, wallet }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [qrToken, setQrToken] = useState('');

  useEffect(() => {
    if (!student?.qrCodeData) return;

    // Generate initial time seed token
    const initialSeed = Math.floor(Date.now() / 30000);
    setQrToken(`${student.qrCodeData}_TIME_${initialSeed}`);

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          const nextSeed = Math.floor(Date.now() / 30000);
          setQrToken(`${student.qrCodeData}_TIME_${nextSeed}`);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [student?.qrCodeData]);
  
  // 3D Tilt motion values
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Transform values for rotation
  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  const handleMouseMove = (event) => {
    const card = event.currentTarget;
    const box = card.getBoundingClientRect();
    const width = box.width;
    const height = box.height;
    const mouseX = event.clientX - box.left - width / 2;
    const mouseY = event.clientY - box.top - height / 2;
    x.set(mouseX);
    y.set(mouseY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      {/* 3D Container */}
      <div 
        className="relative w-[340px] h-[500px] cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <motion.div
          className="w-full h-full relative preserve-3d duration-700"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* FRONT OF CARD */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-indigo-950 via-slate-900 to-fuchsia-950 border border-white/10 glow-card flex flex-col justify-between p-6">
            {/* Holographic reflection lines */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none transform -skew-y-12 scale-150 transition-transform duration-1000 group-hover:translate-y-full" />
            
            {/* Header: School Name & Chip */}
            <div className="flex justify-between items-start z-10">
              <div>
                <h4 className="text-white font-bold text-sm leading-tight tracking-wide">GREENWOOD</h4>
                <p className="text-[10px] text-indigo-400 font-semibold tracking-widest uppercase">International School</p>
              </div>
              <div className="w-10 h-7 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-lg flex items-center justify-center opacity-85 shadow-md">
                <CreditCard className="w-6 h-6 text-indigo-900" />
              </div>
            </div>

            {/* Profile Section */}
            <div className="flex flex-col items-center justify-center gap-4 z-10">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-300" />
                <img 
                  src={student?.photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200"} 
                  alt={student?.name}
                  className="relative w-28 h-28 rounded-full object-cover border-2 border-white/20"
                />
              </div>
              <div className="text-center">
                <h3 className="text-white font-extrabold text-xl tracking-wide">{student?.name}</h3>
                <span className="text-xs text-indigo-300 font-semibold uppercase bg-indigo-900/40 px-3 py-1 rounded-full border border-indigo-500/20 mt-1 inline-block">
                  Student
                </span>
              </div>
            </div>

            {/* Student Meta Details */}
            <div className="grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center z-10">
              <div>
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Class</span>
                <span className="text-xs text-white font-bold">{student?.class}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Division</span>
                <span className="text-xs text-white font-bold">{student?.division}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider block">Roll No</span>
                <span className="text-xs text-white font-bold">{student?.rollNumber}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-white/5 pt-3 z-10">
              <span className="font-mono">{student?.admissionNumber || 'ADM-2026-0000'}</span>
              <div className="flex items-center gap-1 text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified</span>
              </div>
            </div>
          </div>

          {/* BACK OF CARD */}
          <div className="absolute inset-0 w-full h-full backface-hidden rounded-3xl overflow-hidden shadow-2xl bg-gradient-to-br from-fuchsia-950 via-slate-900 to-indigo-950 border border-white/10 glow-card flex flex-col justify-between p-6 transform rotate-y-180">
            {/* Header */}
            <div className="flex justify-between items-center z-10">
              <div>
                <h4 className="text-white font-bold text-sm tracking-wide">DIGITAL SMART QR</h4>
                <p className="text-[9px] text-fuchsia-400 uppercase tracking-widest font-semibold">Scan to Make Payment</p>
              </div>
              <div className="text-[10px] text-indigo-300 font-semibold bg-indigo-950/60 border border-indigo-500/20 px-2 py-0.5 rounded-md">
                SECURE WALLET
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center justify-center gap-2 z-10 bg-white p-4.5 rounded-2xl shadow-xl w-48 h-48 mx-auto self-center">
              <QRCodeSVG 
                value={qrToken || "SW-SAMPLE"}
                size={120}
                level="H"
                includeMargin={false}
              />
              <div className="text-[9px] font-bold text-slate-500 flex items-center gap-1 select-none">
                <span className="w-1.5 h-1.5 bg-fuchsia-500 rounded-full animate-ping"></span>
                Rotates in {timeLeft}s
              </div>
            </div>

            {/* Wallet Info Display */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 flex items-center justify-center text-violet-400 border border-violet-500/20">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">Wallet Balance</span>
                  <span className="text-lg text-white font-black">₹{wallet?.balance ?? 0}</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${wallet?.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                {wallet?.status || 'active'}
              </span>
            </div>

            {/* Instructions */}
            <p className="text-[9px] text-slate-400 text-center font-medium leading-relaxed z-10">
              For security, do not share this QR screenshot. Present this screen to the vendor checkout to purchase canteen food and stationery.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Helper trigger info */}
      <div className="flex items-center gap-1.5 text-xs font-semibold text-violet-500 dark:text-violet-400">
        <RefreshCw className="w-3 h-3 animate-spin-slow" />
        <span>Click card to reveal payment QR Code</span>
      </div>
    </div>
  );
}
