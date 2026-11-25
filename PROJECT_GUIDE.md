# School Wallet - SaaS Smart Card Project Guide

Welcome to the **School Wallet** project! This guide provides an overview of the codebase, directories, database structures, business rules, and instructions on how to run and test all aspects of the application.

---

## 💻 Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons, React Router.
- **Backend:** Firebase (Authentication, Firestore, Storage, Cloud Functions, Hosting).
- **Fallback Engine:** Custom LocalStorage simulator (`dbMock.js`) pre-seeded with sandbox data.

---

## 📂 Project Directory Structure

```text
school-wallet/
├── firebase.json            # Firebase Hosting configuration
├── firestore.rules          # Security rules for Firestore databases
├── index.html               # App entry point
├── package.json             # Core dependencies and run scripts
├── vite.config.js           # Vite bundler configurations
└── src/
    ├── App.css
    ├── App.jsx              # Client router and core viewport
    ├── index.css            # Base stylesheet (Tailwind integrations)
    ├── main.jsx             # React client bootstrap
    ├── assets/              # Static vector graphic files
    ├── components/
    │   ├── DigitalIDCard.jsx # 3D rotating RFID Card simulator with live dynamic QR
    │   ├── Navbar.jsx        # Responsive utility header
    │   ├── QRScanner.jsx     # POS Laser scan simulator
    │   ├── Sidebar.jsx       # Multi-role navigation sidebar
    │   └── ui/
    │       └── Cards.jsx     # Shared premium glassmorphic UI components
    ├── context/
    │   └── AuthContext.jsx   # Client-side user auth state & session manager
    ├── pages/
    │   ├── auth/
    │   │   ├── Login.jsx     # Premium login with Quick Switch buttons
    │   │   └── Profile.jsx   # Profile modification module
    │   ├── parent/
    │   │   └── ParentDashboard.jsx # Parental controls, limits, AI insights
    │   ├── schooladmin/
    │   │   └── SchoolAdminDashboard.jsx # CSV bulk roster and attendance tools
    │   ├── student/
    │   │   └── StudentDashboard.jsx # ID display card and invoice history
    │   ├── superadmin/
    │   │   └── SuperAdminDashboard.jsx # SaaS statistics, branch and school manager
    │   ├── teacher/
    │   │   └── TeacherDashboard.jsx # Allowance progress meters and expense logs
    │   └── vendor/
    │       └── VendorDashboard.jsx # Vendor POS, catalog, connections toggle
    └── services/
        ├── db.js            # Unified DB router (Firebase <=> dbMock)
        ├── dbMock.js        # Offline storage mock database engine
        └── firebase.js      # Live Firebase SDK initializer
```

---

## 🔧 Core Business Logic & Rules Engine

### 1. Spending Rules & Wallet Modes
Enforced in `dbMock.js` inside `processPurchase`:
- **Free Mode:** Standard purchase validation against wallet balance.
- **Controlled Mode:** Checks daily category limits (Lunch, Snacks, Stationery).
- **Strict Mode:** Pushes purchase checkouts to a parent approval queue that expires after 5 minutes.

### 2. Cashback Rewards
- Pushes a ₹25 cashback reward into the student's wallet when their monthly spend equals or crosses ₹500.

### 3. Fraud Prevention locks
- **Velocity checks:** Temporarily freezes the wallet if a student attempts $\ge 3$ transactions in under a minute, or if spent amounts exceed ₹200 within 2 minutes.

### 4. Daily Attendance Credit
- Crediting check-ins (+₹20) once daily when student scans at the school gates, sending instant entry notifications to parents.

### 5. Teacher Allowance Wallets
- Dedicated allowances for Event (₹1000), Food (₹500), and Travel (₹1500) items, with corporate logging controls and historical reimbursement registers.

---

## 🧪 Quick Test Credentials

No password is required (any password will succeed) when using the test emails:

1. **Super Admin:** `superadmin@wallet.com`
2. **School Admin:** `schooladmin@wallet.com`
3. **Parent:** `parent@wallet.com` (Links to kids: **Ameen** & **Aisha**)
4. **Student:** `student@wallet.com` (Ameen Doe)
5. **Canteen Vendor:** `canteen@wallet.com`
6. **Bookstore Vendor:** `stationery@wallet.com`
7. **Teacher:** `teacher@wallet.com` (Mr. Clark)

---

## 🚦 Verification Commands

To check the production build compilation validity:
```bash
npm run build
```

To run the development server locally:
```bash
npm run dev
```
Open `http://localhost:5173` to test.
