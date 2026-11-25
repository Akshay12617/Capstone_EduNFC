import React, { useState, useEffect } from 'react';
import { Camera, Search, UserCheck, AlertTriangle, X } from 'lucide-react';
import { db } from '../services/db';
import { Button, Card, Input } from './ui/Cards';

export default function QRScanner({ onScanSuccess }) {
  const [isActive, setIsActive] = useState(false);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [scanStatus, setScanStatus] = useState({ state: 'idle', message: '' });

  useEffect(() => {
    // Fetch all active students to populate the simulator dropdown
    db.students.getAll().then(setStudents);
  }, []);

  const handleSimulateScan = async (studentCode) => {
    setScanStatus({ state: 'scanning', message: 'Scanning QR Code...' });
    
    // Simulate short network delay
    setTimeout(async () => {
      try {
        const student = await db.students.getByQRCode(studentCode);
        if (!student) {
          throw new Error('Invalid QR Code. Student not found.');
        }
        
        const wallet = await db.wallets.getByStudentId(student.id);
        if (!wallet) {
          throw new Error('Wallet not initialized for this student.');
        }

        if (student.status !== 'active') {
          throw new Error('Student account is deactivated.');
        }

        if (wallet.status === 'frozen') {
          throw new Error('Student wallet has been frozen by the parent.');
        }

        setScanStatus({ state: 'success', message: `Scanned: ${student.name}` });
        onScanSuccess(student);
        
        // Reset status after short delay
        setTimeout(() => {
          setScanStatus({ state: 'idle', message: '' });
          setIsActive(false);
        }, 1500);

      } catch (err) {
        setScanStatus({ state: 'error', message: err.message });
      }
    }, 1000);
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="relative overflow-hidden border-violet-500/20 dark:border-violet-500/10">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <Camera className="w-5 h-5 text-violet-500" />
            QR Code Scanner POS
          </h3>
          <p className="text-xs text-slate-400">Scan student smart ID card to check out items</p>
        </div>
        {!isActive ? (
          <Button variant="primary" onClick={() => setIsActive(true)} className="px-4 py-2 text-xs">
            Start Scanner
          </Button>
        ) : (
          <Button variant="secondary" onClick={() => setIsActive(false)} className="px-2.5 py-1 text-xs">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isActive ? (
        <div className="flex flex-col md:flex-row gap-6 mt-2">
          {/* Simulated Scanner Viewport */}
          <div className="flex-1 aspect-video md:aspect-[4/3] rounded-2xl bg-black border-2 border-dashed border-violet-500/40 relative overflow-hidden flex flex-col items-center justify-center min-h-[200px]">
            {/* Blinking Scanning grid and laser */}
            <div className="absolute inset-4 border border-violet-500/20 rounded-xl pointer-events-none flex items-center justify-center">
              <div className="w-48 h-48 border-2 border-violet-500/50 rounded-xl relative">
                {/* Scanner Corners */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-violet-400 -mt-0.5 -ml-0.5"></div>
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-violet-400 -mt-0.5 -mr-0.5"></div>
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-violet-400 -mb-0.5 -ml-0.5"></div>
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-violet-400 -mb-0.5 -mr-0.5"></div>
                
                {/* Laser animation */}
                {scanStatus.state === 'scanning' && (
                  <div className="absolute left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_#ef4444] animate-bounce"></div>
                )}
              </div>
            </div>

            {/* Camera feed overlay / feedback */}
            {scanStatus.state === 'idle' && (
              <div className="text-center p-4 z-10">
                <Camera className="w-10 h-10 text-slate-600 mx-auto mb-2 animate-pulse" />
                <p className="text-xs text-slate-500">Align student QR card inside frame</p>
              </div>
            )}

            {scanStatus.state === 'scanning' && (
              <div className="text-center p-4 z-10 bg-black/60 backdrop-blur-sm inset-0 absolute flex flex-col justify-center items-center">
                <div className="w-8 h-8 rounded-full border-4 border-violet-500 border-t-transparent animate-spin mb-3"></div>
                <p className="text-sm font-semibold text-white">{scanStatus.message}</p>
              </div>
            )}

            {scanStatus.state === 'success' && (
              <div className="text-center p-4 z-10 bg-emerald-950/80 backdrop-blur-sm inset-0 absolute flex flex-col justify-center items-center">
                <UserCheck className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
                <p className="text-sm font-bold text-white">{scanStatus.message}</p>
              </div>
            )}

            {scanStatus.state === 'error' && (
              <div className="text-center p-4 z-10 bg-red-950/80 backdrop-blur-sm inset-0 absolute flex flex-col justify-center items-center">
                <AlertTriangle className="w-12 h-12 text-red-400 mb-2" />
                <p className="text-xs font-semibold text-red-200 mb-3 px-4">{scanStatus.message}</p>
                <Button variant="secondary" onClick={() => setScanStatus({ state: 'idle', message: '' })} className="px-3 py-1.5 text-xs">
                  Retry Scan
                </Button>
              </div>
            )}
          </div>

          {/* POS Simulator Controller */}
          <div className="flex-1 flex flex-col gap-4">
            <div>
              <span className="text-[10px] font-bold text-violet-500 dark:text-violet-400 uppercase tracking-widest">POS Scanner Simulator</span>
              <h4 className="font-bold text-slate-700 dark:text-slate-200 mt-0.5">Simulate Student Scan</h4>
              <p className="text-xs text-slate-400">Search student name or click a student below to instantly trigger a barcode/QR scan.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search students to simulate scan..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl text-sm focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              />
            </div>

            <div className="max-h-[160px] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl divide-y divide-slate-100 dark:divide-slate-800">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <button
                    key={student.id}
                    onClick={() => handleSimulateScan(student.qrCodeData)}
                    disabled={scanStatus.state === 'scanning'}
                    className="w-full text-left px-4 py-2.5 hover:bg-violet-500/5 dark:hover:bg-violet-500/10 flex items-center justify-between transition-colors disabled:opacity-50"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{student.name}</div>
                      <div className="text-[10px] text-slate-400">{student.class} • {student.admissionNumber}</div>
                    </div>
                    <span className="text-[9px] font-mono bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded">
                      Scan QR
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-slate-400">No students found</div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="py-8 text-center flex flex-col items-center justify-center">
          <Camera className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-2" />
          <h4 className="font-semibold text-slate-700 dark:text-slate-300">Scanner is Deactivated</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-[280px]">Start the scanner POS to checkout items or search/select students directly.</p>
        </div>
      )}
    </Card>
  );
}
