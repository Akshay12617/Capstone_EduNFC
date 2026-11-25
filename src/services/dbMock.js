// In-memory / LocalStorage database simulator for School Wallet SaaS

const SEED_DATA = {
  users: [
    {
      uid: 'u_super_admin',
      name: 'Sarah Connor',
      email: 'superadmin@wallet.com',
      role: 'super_admin',
      phoneNumber: '+919999999901',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      uid: 'u_school_admin',
      name: 'Principal Davis',
      email: 'schooladmin@wallet.com',
      role: 'school_admin',
      schoolId: 'sch_greenwood',
      phoneNumber: '+919999999902',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      uid: 'u_parent',
      name: 'John Doe',
      email: 'parent@wallet.com',
      role: 'parent',
      schoolId: 'sch_greenwood',
      phoneNumber: '+919999999903',
      status: 'active',
      createdAt: new Date().toISOString(),
      linkedStudents: ['std_ameen', 'std_aisha']
    },
    {
      uid: 'u_student_ameen',
      name: 'Ameen Doe',
      email: 'student@wallet.com',
      role: 'student',
      schoolId: 'sch_greenwood',
      parentId: 'u_parent',
      studentId: 'std_ameen',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      uid: 'u_canteen',
      name: 'Bob the Chef',
      email: 'canteen@wallet.com',
      role: 'canteen_vendor',
      schoolId: 'sch_greenwood',
      storeName: 'Greenwood Canteen',
      phoneNumber: '+919999999904',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      uid: 'u_stationery',
      name: 'Alice Stationery',
      email: 'stationery@wallet.com',
      role: 'stationery_vendor',
      schoolId: 'sch_greenwood',
      storeName: 'Greenwood Book & Pen Store',
      phoneNumber: '+919999999905',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      uid: 'u_teacher_1',
      name: 'Mr. Clark (Teacher)',
      email: 'teacher@wallet.com',
      role: 'teacher',
      schoolId: 'sch_greenwood',
      phoneNumber: '+919999999906',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ],
  schools: [
    {
      id: 'sch_greenwood',
      name: 'Greenwood International School',
      logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
      address: '12 Sector, Palm Drive, Bangalore',
      academicYear: '2026-2027',
      branches: ['Main Campus', 'Junior Campus'],
      createdAt: new Date().toISOString()
    }
  ],
  students: [
    {
      id: 'std_ameen',
      name: 'Ameen Doe',
      admissionNumber: 'GIS2024-0042',
      class: 'Class 8',
      division: 'Div A',
      rollNumber: '14',
      schoolId: 'sch_greenwood',
      parentId: 'u_parent',
      photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200',
      qrCodeData: 'SW-GREENWOOD-2024-0042',
      walletId: 'w_ameen',
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'std_aisha',
      name: 'Aisha Doe',
      admissionNumber: 'GIS2024-0099',
      class: 'Class 5',
      division: 'Div B',
      rollNumber: '02',
      schoolId: 'sch_greenwood',
      parentId: 'u_parent',
      photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=200',
      qrCodeData: 'SW-GREENWOOD-2024-0099',
      walletId: 'w_aisha',
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ],
  wallets: [
    {
      id: 'w_ameen',
      studentId: 'std_ameen',
      balance: 450,
      status: 'active',
      mode: 'free', // 'free' | 'controlled' | 'strict'
      dailyLimit: 150,
      weeklyLimit: 800,
      monthlyLimit: 3000,
      categoryLimits: {
        'Lunch': 50,
        'Snacks': 30,
        'Stationery': 20
      },
      autoRecharge: false,
      autoRechargeAmount: 500,
      allowEmergency: false,
      categoryRestrictions: {
        'Snacks': true,
        'Lunch': true,
        'Juice': true,
        'Water': true,
        'Stationery': true,
        'Books': true,
        'Chips': false,
        'Chocolates': false,
        'Soft Drinks': false
      },
      updatedAt: new Date().toISOString()
    },
    {
      id: 'w_aisha',
      studentId: 'std_aisha',
      balance: 620,
      status: 'active',
      mode: 'free',
      dailyLimit: 100,
      weeklyLimit: 600,
      monthlyLimit: 2500,
      categoryLimits: {
        'Lunch': 50,
        'Snacks': 30,
        'Stationery': 20
      },
      autoRecharge: false,
      autoRechargeAmount: 500,
      allowEmergency: false,
      categoryRestrictions: {
        'Snacks': true,
        'Lunch': true,
        'Juice': true,
        'Water': true,
        'Stationery': true,
        'Books': true,
        'Chips': false,
        'Chocolates': false,
        'Soft Drinks': false
      },
      updatedAt: new Date().toISOString()
    }
  ],
  teacherWallets: [
    {
      id: 'w_teacher_1',
      teacherId: 'u_teacher_1',
      allowances: {
        'Event': 1000,
        'Food': 500,
        'Travel': 1500
      },
      updatedAt: new Date().toISOString()
    }
  ],
  products: [
    // Canteen products
    {
      id: 'prod_1',
      schoolId: 'sch_greenwood',
      vendorId: 'u_canteen',
      name: 'Veg Puff',
      price: 20,
      category: 'Snacks',
      inventory: 50,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_2',
      schoolId: 'sch_greenwood',
      vendorId: 'u_canteen',
      name: 'Chicken Roll',
      price: 60,
      category: 'Snacks',
      inventory: 35,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_3',
      schoolId: 'sch_greenwood',
      vendorId: 'u_canteen',
      name: 'Premium Lunch (Thali)',
      price: 80,
      category: 'Lunch',
      inventory: 100,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_4',
      schoolId: 'sch_greenwood',
      vendorId: 'u_canteen',
      name: 'Mango Juice 250ml',
      price: 25,
      category: 'Juice',
      inventory: 40,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_5',
      schoolId: 'sch_greenwood',
      vendorId: 'u_canteen',
      name: 'Water Bottle 1L',
      price: 15,
      category: 'Water',
      inventory: 200,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_6',
      schoolId: 'sch_greenwood',
      vendorId: 'u_canteen',
      name: 'Potato Chips Pack',
      price: 15,
      category: 'Chips',
      inventory: 75,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_7',
      schoolId: 'sch_greenwood',
      vendorId: 'u_canteen',
      name: 'Dairy Milk Chocolate',
      price: 30,
      category: 'Chocolates',
      inventory: 80,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_8',
      schoolId: 'sch_greenwood',
      vendorId: 'u_canteen',
      name: 'Pepsi Soft Drink',
      price: 20,
      category: 'Soft Drinks',
      inventory: 60,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    // Stationery products
    {
      id: 'prod_9',
      schoolId: 'sch_greenwood',
      vendorId: 'u_stationery',
      name: 'Classmate Notebook 120pg',
      price: 45,
      category: 'Books',
      inventory: 150,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_10',
      schoolId: 'sch_greenwood',
      vendorId: 'u_stationery',
      name: 'Parker Vector Pen',
      price: 150,
      category: 'Stationery',
      inventory: 15,
      status: 'active',
      createdAt: new Date().toISOString()
    },
    {
      id: 'prod_11',
      schoolId: 'sch_greenwood',
      vendorId: 'u_stationery',
      name: 'Geometry Instrument Box',
      price: 120,
      category: 'Stationery',
      inventory: 30,
      status: 'active',
      createdAt: new Date().toISOString()
    }
  ],
  transactions: [
    {
      id: 'tx_1',
      walletId: 'w_ameen',
      studentId: 'std_ameen',
      parentId: 'u_parent',
      schoolId: 'sch_greenwood',
      vendorId: 'u_canteen',
      amount: 20,
      type: 'purchase',
      status: 'success',
      items: [{ productId: 'prod_1', name: 'Veg Puff', price: 20, category: 'Snacks', quantity: 1 }],
      description: 'Purchased Veg Puff from Canteen',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString() // 2 hours ago
    },
    {
      id: 'tx_2',
      walletId: 'w_ameen',
      studentId: 'std_ameen',
      parentId: 'u_parent',
      schoolId: 'sch_greenwood',
      vendorId: 'u_canteen',
      amount: 15,
      type: 'purchase',
      status: 'success',
      items: [{ productId: 'prod_5', name: 'Water Bottle 1L', price: 15, category: 'Water', quantity: 1 }],
      description: 'Purchased Water Bottle 1L from Canteen',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString() // 1 day ago
    },
    {
      id: 'tx_3',
      walletId: 'w_ameen',
      studentId: 'std_ameen',
      parentId: 'u_parent',
      schoolId: 'sch_greenwood',
      amount: 500,
      type: 'recharge',
      status: 'success',
      paymentGateway: 'razorpay',
      gatewayPaymentId: 'pay_OM8123h1293a',
      description: 'Wallet Recharge via Razorpay UPI',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString() // 2 days ago
    },
    {
      id: 'tx_4',
      walletId: 'w_aisha',
      studentId: 'std_aisha',
      parentId: 'u_parent',
      schoolId: 'sch_greenwood',
      vendorId: 'u_stationery',
      amount: 45,
      type: 'purchase',
      status: 'success',
      items: [{ productId: 'prod_9', name: 'Classmate Notebook 120pg', price: 45, category: 'Books', quantity: 1 }],
      description: 'Purchased Classmate Notebook 120pg from Stationery',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString() // 5 hours ago
    }
  ],
  notifications: [
    {
      id: 'nt_1',
      userId: 'u_parent',
      title: 'Purchase Made',
      body: 'Ameen purchased Veg Puff for ₹20. Remaining Balance: ₹450.',
      read: false,
      type: 'purchase',
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
    },
    {
      id: 'nt_2',
      userId: 'u_parent',
      title: 'Wallet Recharge Successful',
      body: '₹500 has been successfully added to Ameen\'s wallet.',
      read: true,
      type: 'recharge',
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
    }
  ],
  pendingApprovals: [],
  attendanceLogs: [],
  settlementLogs: [],
  settings: {
    globalChargeRate: 1.5,
    allowRegistration: true
  }
};

const getDB = () => {
  const data = localStorage.getItem('school_wallet_db');
  if (!data) {
    localStorage.setItem('school_wallet_db', JSON.stringify(SEED_DATA));
    return SEED_DATA;
  }
  return JSON.parse(data);
};

const saveDB = (data) => {
  localStorage.setItem('school_wallet_db', JSON.stringify(data));
};

export const dbMock = {
  // Authentication Simulated DB Actions
  auth: {
    login: async (email, password) => {
      const db = getDB();
      const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (!user) {
        throw new Error('User not found. Try one of the quick login users.');
      }
      if (password === 'wrong') {
        throw new Error('Invalid credentials.');
      }
      localStorage.setItem('school_wallet_current_user', JSON.stringify(user));
      return user;
    },
    getCurrentUser: () => {
      const data = localStorage.getItem('school_wallet_current_user');
      return data ? JSON.parse(data) : null;
    },
    logout: async () => {
      localStorage.removeItem('school_wallet_current_user');
      return true;
    },
    changePassword: async (oldPass, newPass) => {
      return true;
    },
    updateProfile: async (updates) => {
      const db = getDB();
      const currentUser = JSON.parse(localStorage.getItem('school_wallet_current_user'));
      if (!currentUser) throw new Error('Not authenticated');

      const userIdx = db.users.findIndex(u => u.uid === currentUser.uid);
      if (userIdx !== -1) {
        db.users[userIdx] = { ...db.users[userIdx], ...updates };
        saveDB(db);
        localStorage.setItem('school_wallet_current_user', JSON.stringify(db.users[userIdx]));
        return db.users[userIdx];
      }
      throw new Error('User record not found');
    }
  },

  // Schools Simulated DB Actions
  schools: {
    getAll: async () => {
      return getDB().schools;
    },
    add: async (school) => {
      const db = getDB();
      const newSchool = {
        ...school,
        id: 'sch_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };
      db.schools.push(newSchool);
      saveDB(db);
      return newSchool;
    },
    edit: async (id, updates) => {
      const db = getDB();
      const idx = db.schools.findIndex(s => s.id === id);
      if (idx !== -1) {
        db.schools[idx] = { ...db.schools[idx], ...updates };
        saveDB(db);
        return db.schools[idx];
      }
      throw new Error('School not found');
    }
  },

  // Students Simulated DB Actions
  students: {
    getAll: async (schoolId) => {
      const db = getDB();
      if (schoolId) {
        return db.students.filter(s => s.schoolId === schoolId);
      }
      return db.students;
    },
    getById: async (id) => {
      const db = getDB();
      return db.students.find(s => s.id === id);
    },
    getByQRCode: async (qrCode) => {
      const db = getDB();
      // Remove any timestamp token for validation
      const cleanQR = qrCode.split('_TIME_')[0];
      return db.students.find(s => s.qrCodeData === cleanQR);
    },
    add: async (student) => {
      const db = getDB();
      const studentId = student.id || 'std_' + Math.random().toString(36).substr(2, 9);
      const walletId = 'w_' + studentId.split('_')[1];
      
      const newStudent = {
        ...student,
        id: studentId,
        walletId,
        createdAt: new Date().toISOString()
      };

      const studentEmail = `${student.name.toLowerCase().replace(/\s+/g, '')}@school.com`;
      const newUser = {
        uid: 'u_' + studentId,
        name: student.name,
        email: studentEmail,
        role: 'student',
        schoolId: student.schoolId,
        studentId: studentId,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      const newWallet = {
        id: walletId,
        studentId,
        balance: 0,
        status: 'active',
        mode: 'free',
        dailyLimit: 150,
        weeklyLimit: 800,
        monthlyLimit: 3000,
        categoryLimits: {
          'Lunch': 50,
          'Snacks': 30,
          'Stationery': 20
        },
        autoRecharge: false,
        autoRechargeAmount: 500,
        allowEmergency: false,
        categoryRestrictions: {
          'Snacks': true,
          'Lunch': true,
          'Juice': true,
          'Water': true,
          'Stationery': true,
          'Books': true,
          'Chips': false,
          'Chocolates': false,
          'Soft Drinks': false
        },
        updatedAt: new Date().toISOString()
      };

      db.students.push(newStudent);
      db.users.push(newUser);
      db.wallets.push(newWallet);
      
      if (student.parentId) {
        const parentIdx = db.users.findIndex(u => u.uid === student.parentId);
        if (parentIdx !== -1) {
          if (!db.users[parentIdx].linkedStudents) db.users[parentIdx].linkedStudents = [];
          db.users[parentIdx].linkedStudents.push(studentId);
        }
      }

      saveDB(db);
      return newStudent;
    },
    edit: async (id, updates) => {
      const db = getDB();
      const idx = db.students.findIndex(s => s.id === id);
      if (idx !== -1) {
        db.students[idx] = { ...db.students[idx], ...updates };
        saveDB(db);
        return db.students[idx];
      }
      throw new Error('Student not found');
    },
    bulkImport: async (studentsArray, schoolId) => {
      const db = getDB();
      const added = [];
      for (const st of studentsArray) {
        const studentId = 'std_' + Math.random().toString(36).substr(2, 9);
        const walletId = 'w_' + studentId.split('_')[1];
        
        const newStudent = {
          id: studentId,
          name: st.name,
          admissionNumber: st.admissionNumber || ('ADM' + Math.floor(1000 + Math.random()*9000)),
          class: st.class || 'Class 6',
          division: st.division || 'Div A',
          rollNumber: st.rollNumber || String(Math.floor(1 + Math.random()*40)),
          schoolId,
          parentId: st.parentId || 'u_parent',
          photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=200',
          qrCodeData: `SW-GREENWOOD-${Math.floor(100000 + Math.random()*900000)}`,
          walletId,
          status: 'active',
          createdAt: new Date().toISOString()
        };

        const newWallet = {
          id: walletId,
          studentId,
          balance: 0,
          status: 'active',
          mode: 'free',
          dailyLimit: 150,
          weeklyLimit: 800,
          monthlyLimit: 3000,
          categoryLimits: {
            'Lunch': 50,
            'Snacks': 30,
            'Stationery': 20
          },
          autoRecharge: false,
          autoRechargeAmount: 500,
          allowEmergency: false,
          categoryRestrictions: {
            'Snacks': true,
            'Lunch': true,
            'Juice': true,
            'Water': true,
            'Stationery': true,
            'Books': true,
            'Chips': false,
            'Chocolates': false,
            'Soft Drinks': false
          },
          updatedAt: new Date().toISOString()
        };

        db.students.push(newStudent);
        db.wallets.push(newWallet);
        added.push(newStudent);

        const parentIdx = db.users.findIndex(u => u.uid === newStudent.parentId);
        if (parentIdx !== -1) {
          if (!db.users[parentIdx].linkedStudents) db.users[parentIdx].linkedStudents = [];
          db.users[parentIdx].linkedStudents.push(studentId);
        }
      }
      saveDB(db);
      return added;
    }
  },

  // Parents Simulated DB Actions
  parents: {
    getAll: async () => {
      const db = getDB();
      return db.users.filter(u => u.role === 'parent');
    },
    getChildren: async (parentId) => {
      const db = getDB();
      const parent = db.users.find(u => u.uid === parentId);
      if (!parent || !parent.linkedStudents) return [];
      return db.students.filter(s => parent.linkedStudents.includes(s.id));
    }
  },

  // Vendors & Products Simulated DB Actions
  vendors: {
    getAll: async () => {
      return getDB().users.filter(u => u.role.includes('vendor'));
    },
    getProducts: async (vendorId) => {
      const db = getDB();
      if (vendorId) {
        return db.products.filter(p => p.vendorId === vendorId);
      }
      return db.products;
    },
    addProduct: async (product) => {
      const db = getDB();
      const newProduct = {
        ...product,
        id: 'prod_' + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      };
      db.products.push(newProduct);
      saveDB(db);
      return newProduct;
    },
    editProduct: async (id, updates) => {
      const db = getDB();
      const idx = db.products.findIndex(p => p.id === id);
      if (idx !== -1) {
        db.products[idx] = { ...db.products[idx], ...updates };
        saveDB(db);
        return db.products[idx];
      }
      throw new Error('Product not found');
    },
    deleteProduct: async (id) => {
      const db = getDB();
      db.products = db.products.filter(p => p.id !== id);
      saveDB(db);
      return true;
    }
  },

  // Wallets Simulated DB Actions
  wallets: {
    getByStudentId: async (studentId) => {
      const db = getDB();
      return db.wallets.find(w => w.studentId === studentId);
    },
    getById: async (id) => {
      const db = getDB();
      return db.wallets.find(w => w.id === id);
    },
    updateLimits: async (walletId, limits) => {
      const db = getDB();
      const idx = db.wallets.findIndex(w => w.id === walletId);
      if (idx !== -1) {
        db.wallets[idx] = { ...db.wallets[idx], ...limits, updatedAt: new Date().toISOString() };
        saveDB(db);
        return db.wallets[idx];
      }
      throw new Error('Wallet not found');
    },
    updateConfigRules: async (walletId, rules) => {
      const db = getDB();
      const idx = db.wallets.findIndex(w => w.id === walletId);
      if (idx !== -1) {
        db.wallets[idx] = { ...db.wallets[idx], ...rules, updatedAt: new Date().toISOString() };
        saveDB(db);
        return db.wallets[idx];
      }
      throw new Error('Wallet not found');
    },
    updateRestrictions: async (walletId, restrictions) => {
      const db = getDB();
      const idx = db.wallets.findIndex(w => w.id === walletId);
      if (idx !== -1) {
        db.wallets[idx].categoryRestrictions = { 
          ...db.wallets[idx].categoryRestrictions, 
          ...restrictions 
        };
        db.wallets[idx].updatedAt = new Date().toISOString();
        saveDB(db);
        return db.wallets[idx];
      }
      throw new Error('Wallet not found');
    },
    freeze: async (walletId, freezeState) => {
      const db = getDB();
      const idx = db.wallets.findIndex(w => w.id === walletId);
      if (idx !== -1) {
        db.wallets[idx].status = freezeState ? 'frozen' : 'active';
        db.wallets[idx].updatedAt = new Date().toISOString();
        saveDB(db);
        return db.wallets[idx];
      }
      throw new Error('Wallet not found');
    },
    allocateFamilyBalance: async (parentId, allocations) => {
      const db = getDB();
      // allocations format: { studentId: amount }
      for (const studentId in allocations) {
        const amt = Number(allocations[studentId]);
        const wIdx = db.wallets.findIndex(w => w.studentId === studentId);
        if (wIdx !== -1) {
          db.wallets[wIdx].balance = amt;
          db.wallets[wIdx].updatedAt = new Date().toISOString();
        }
      }
      saveDB(db);
      return true;
    },
    recharge: async (walletId, amount, parentId) => {
      const db = getDB();
      const walletIdx = db.wallets.findIndex(w => w.id === walletId);
      if (walletIdx === -1) throw new Error('Wallet not found');
      
      const wallet = db.wallets[walletIdx];
      const student = db.students.find(s => s.id === wallet.studentId);
      
      wallet.balance += Number(amount);
      wallet.updatedAt = new Date().toISOString();

      const tx = {
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        walletId: walletId,
        studentId: wallet.studentId,
        parentId: parentId,
        schoolId: student ? student.schoolId : 'sch_greenwood',
        amount: Number(amount),
        type: 'recharge',
        status: 'success',
        paymentGateway: 'razorpay',
        gatewayPaymentId: 'pay_' + Math.random().toString(36).substr(2, 9),
        description: `Wallet recharge via UPI`,
        createdAt: new Date().toISOString()
      };

      const notification = {
        id: 'nt_' + Math.random().toString(36).substr(2, 9),
        userId: parentId,
        title: 'Wallet Recharge Successful',
        body: `₹${amount} has been successfully added to ${student?.name}'s wallet. Current Balance: ₹${wallet.balance}.`,
        read: false,
        type: 'recharge',
        createdAt: new Date().toISOString()
      };

      db.transactions.push(tx);
      db.notifications.push(notification);
      saveDB(db);
      return wallet;
    },
    processPurchase: async (studentId, items, vendorId, options = {}) => {
      const db = getDB();
      const student = db.students.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found');
      if (student.status !== 'active') throw new Error('Student account is inactive');

      const walletIdx = db.wallets.findIndex(w => w.studentId === studentId);
      if (walletIdx === -1) throw new Error('Student has no wallet linked');

      const wallet = db.wallets[walletIdx];
      if (wallet.status === 'frozen') throw new Error('Wallet is blocked/frozen');

      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Face verify check
      if (options.faceVerified === false) {
        throw new Error('Face Verification: Identity mismatch. Checkout rejected.');
      }

      // Fraud Mitigations
      const nowTime = new Date();
      const oneMinAgo = new Date(Date.now() - 60000);
      const twoMinAgo = new Date(Date.now() - 120000);
      
      const purchaseHistory = db.transactions.filter(t => 
        t.studentId === studentId && 
        t.type === 'purchase' && 
        t.status === 'success'
      );

      const oneMinPurchases = purchaseHistory.filter(t => new Date(t.createdAt) >= oneMinAgo);
      if (oneMinPurchases.length >= 3) {
        db.wallets[walletIdx].status = 'frozen';
        saveDB(db);
        throw new Error('FRAUD TRIGGERED: Velocity alert (Too many transactions). Wallet temporarily locked.');
      }

      const twoMinPurchases = purchaseHistory.filter(t => new Date(t.createdAt) >= twoMinAgo);
      const totalTwoMin = twoMinPurchases.reduce((sum, t) => sum + t.amount, 0);
      if (totalTwoMin + totalAmount > 200 && twoMinPurchases.length > 0) {
        db.wallets[walletIdx].status = 'frozen';
        saveDB(db);
        throw new Error('FRAUD TRIGGERED: Velocity alert (Impossible Spending limit exceeded). Wallet locked.');
      }

      // Category restrictions check
      for (const item of items) {
        const allowed = wallet.categoryRestrictions[item.category];
        if (allowed === false) {
          throw new Error(`Category Blocked: "${item.category}" is blocked by parent controls.`);
        }
      }

      // Time restrictions
      if (!options.bypassTimeRules) {
        const hour = nowTime.getHours();
        for (const item of items) {
          if (item.category === 'Lunch') {
            if (hour < 12 || hour >= 14) {
              throw new Error('Time restriction: Lunch menu allowed only between 12:00 PM - 2:00 PM.');
            }
          } else if (['Snacks', 'Chips', 'Chocolates', 'Soft Drinks', 'Juice'].includes(item.category)) {
            if (hour < 8 || hour >= 10) {
              throw new Error('Time restriction: Snacks allowed only between 8:00 AM - 10:00 AM.');
            }
          } else if (['Stationery', 'Books'].includes(item.category)) {
            if (hour < 9 || hour >= 16) {
              throw new Error('Time restriction: Stationery billing allowed only between 9:00 AM - 4:00 PM.');
            }
          }
        }
      }

      // Parent spending rules (Category Caps)
      if (wallet.mode === 'controlled' && wallet.categoryLimits) {
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        const todayPurchases = purchaseHistory.filter(t => new Date(t.createdAt) >= startOfDay);
        
        const catSpent = {};
        todayPurchases.forEach(t => {
          t.items?.forEach(itm => {
            catSpent[itm.category] = (catSpent[itm.category] || 0) + (itm.price * itm.quantity);
          });
        });

        for (const item of items) {
          const limit = wallet.categoryLimits[item.category];
          if (limit !== undefined) {
            const currentSpent = catSpent[item.category] || 0;
            if (currentSpent + (item.price * item.quantity) > limit) {
              throw new Error(`Rules Engine: Daily cap for "${item.category}" is ₹${limit}. Already spent: ₹${currentSpent}. Blocked.`);
            }
          }
        }
      }

      // Strict mode approval check
      if (wallet.mode === 'strict' && !options.parentApproved) {
        const approvalId = 'app_' + Math.random().toString(36).substr(2, 9);
        const request = {
          id: approvalId,
          studentId,
          items,
          amount: totalAmount,
          vendorId,
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 300000).toISOString() // 5 min
        };
        if (!db.pendingApprovals) db.pendingApprovals = [];
        db.pendingApprovals.push(request);

        const parentNotif = {
          id: 'nt_' + Math.random().toString(36).substr(2, 9),
          userId: student.parentId,
          title: 'Awaiting Strict Approval',
          body: `${student.name} wants to purchase items for ₹${totalAmount}. Tap to approve in 5 mins.`,
          read: false,
          type: 'approval_request',
          approvalId,
          createdAt: new Date().toISOString()
        };
        db.notifications.push(parentNotif);
        saveDB(db);
        throw new Error(`Strict Mode: Transaction is pending parent approval (ID: ${approvalId}).`);
      }

      // Spend general limits checks (Daily limit check)
      const startOfDay = new Date();
      startOfDay.setHours(0,0,0,0);
      const todayTotalSpent = purchaseHistory.filter(t => new Date(t.createdAt) >= startOfDay).reduce((sum, t) => sum + t.amount, 0);
      if (wallet.dailyLimit && (todayTotalSpent + totalAmount) > wallet.dailyLimit) {
        throw new Error(`Spending limit exceeded. Daily limit is ₹${wallet.dailyLimit}. Spent today: ₹${todayTotalSpent}.`);
      }

      // Balance & Overdraft checks
      let remainingBalance = wallet.balance - totalAmount;
      if (remainingBalance < 0) {
        if (wallet.allowEmergency && remainingBalance >= -100) {
          // Allowed overdraft
          console.log('Overdraft buffer verified.');
        } else {
          throw new Error(`Insufficient funds. Balance: ₹${wallet.balance}. Required: ₹${totalAmount}. ${wallet.allowEmergency ? 'Overdraft cap exceeded (-₹100).' : ''}`);
        }
      }

      // Commit purchase
      wallet.balance = remainingBalance;
      wallet.updatedAt = new Date().toISOString();

      // Deduct product inventory
      for (const item of items) {
        const pIdx = db.products.findIndex(p => p.id === item.productId);
        if (pIdx !== -1) {
          db.products[pIdx].inventory = Math.max(0, db.products[pIdx].inventory - item.quantity);
        }
      }

      const tx = {
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        walletId: wallet.id,
        studentId: studentId,
        parentId: student.parentId,
        schoolId: student.schoolId,
        vendorId: vendorId,
        amount: totalAmount,
        type: 'purchase',
        status: 'success',
        items,
        description: `Purchased ${items.map(i => `${i.name} (x${i.quantity})`).join(', ')}`,
        createdAt: new Date().toISOString()
      };
      db.transactions.push(tx);

      // Cashback system check (spend >= ₹500 in current month gets ₹25 cashback once per month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      const monthlyPurchases = db.transactions.filter(t => {
        const txDate = new Date(t.createdAt);
        return t.studentId === studentId && 
               t.type === 'purchase' && 
               t.status === 'success' &&
               txDate.getMonth() === currentMonth && 
               txDate.getFullYear() === currentYear;
      });
      
      const monthlySpend = monthlyPurchases.reduce((sum, t) => sum + t.amount, 0);

      if (monthlySpend >= 500) {
        // Check if cashback was already given in the current month
        const hasReceivedCashbackThisMonth = db.transactions.some(t => {
          const txDate = new Date(t.createdAt);
          return t.studentId === studentId && 
                 t.type === 'reward' && 
                 t.description.includes('Cashback') &&
                 txDate.getMonth() === currentMonth && 
                 txDate.getFullYear() === currentYear;
        });

        if (!hasReceivedCashbackThisMonth) {
          // Add ₹25 cashback to wallet
          wallet.balance += 25;
          
          const cashbackTx = {
            id: 'tx_' + Math.random().toString(36).substr(2, 9),
            walletId: wallet.id,
            studentId,
            parentId: student.parentId,
            schoolId: student.schoolId,
            amount: 25,
            type: 'reward',
            status: 'success',
            description: 'Monthly Spend Reward (₹25 Cashback)',
            createdAt: new Date().toISOString()
          };
          db.transactions.push(cashbackTx);

          db.notifications.push({
            id: 'nt_' + Math.random().toString(36).substr(2, 9),
            userId: student.parentId,
            title: 'Cashback Earned!',
            body: `Congratulations! ${student.name} spent over ₹500 this month. ₹25 cashback credited. New Balance: ₹${wallet.balance}.`,
            read: false,
            type: 'reward',
            createdAt: new Date().toISOString()
          });
        }
      }

      // Parent alert
      const vendor = db.users.find(u => u.uid === vendorId);
      const storeName = vendor ? (vendor.storeName || vendor.name) : 'Outlet';
      const notification = {
        id: 'nt_' + Math.random().toString(36).substr(2, 9),
        userId: student.parentId,
        title: 'Purchase Made',
        body: `${student.name} purchased ${items[0].name}${items.length > 1 ? ` & ${items.length - 1} items` : ''} for ₹${totalAmount} from ${storeName}. Balance: ₹${wallet.balance}.`,
        read: false,
        type: 'purchase',
        createdAt: new Date().toISOString()
      };
      db.notifications.push(notification);

      // Auto-Recharge check
      if (wallet.autoRecharge && wallet.balance < 100) {
        const rechargeAmt = wallet.autoRechargeAmount || 500;
        wallet.balance += rechargeAmt;

        const autoRechargeTx = {
          id: 'tx_' + Math.random().toString(36).substr(2, 9),
          walletId: wallet.id,
          studentId,
          parentId: student.parentId,
          schoolId: student.schoolId,
          amount: rechargeAmt,
          type: 'recharge',
          status: 'success',
          paymentGateway: 'auto_pay',
          description: `Auto-Recharge Executed (< ₹100)`,
          createdAt: new Date().toISOString()
        };
        db.transactions.push(autoRechargeTx);

        db.notifications.push({
          id: 'nt_' + Math.random().toString(36).substr(2, 9),
          userId: student.parentId,
          title: 'Auto-Recharge Triggered',
          body: `Wallet dropped below ₹100. Auto-recharged ₹${rechargeAmt} for ${student.name}. New Balance: ₹${wallet.balance}.`,
          read: false,
          type: 'recharge',
          createdAt: new Date().toISOString()
        });
      }

      saveDB(db);
      return wallet;
    }
  },

  // One-time Approval Center
  pendingApprovals: {
    getByParentId: async (parentId) => {
      const db = getDB();
      if (!db.pendingApprovals) return [];
      const parent = db.users.find(u => u.uid === parentId);
      if (!parent || !parent.linkedStudents) return [];
      
      // Clean expired
      const now = new Date();
      db.pendingApprovals = db.pendingApprovals.filter(a => new Date(a.expiresAt) > now);
      saveDB(db);

      return db.pendingApprovals.filter(a => parent.linkedStudents.includes(a.studentId));
    },
    approve: async (approvalId) => {
      const db = getDB();
      if (!db.pendingApprovals) return false;
      const idx = db.pendingApprovals.findIndex(a => a.id === approvalId);
      if (idx === -1) throw new Error('Transaction request expired.');

      const req = db.pendingApprovals[idx];
      db.pendingApprovals.splice(idx, 1);
      saveDB(db);

      await dbMock.wallets.processPurchase(req.studentId, req.items, req.vendorId, { parentApproved: true });
      return true;
    },
    reject: async (approvalId) => {
      const db = getDB();
      if (!db.pendingApprovals) return false;
      const idx = db.pendingApprovals.findIndex(a => a.id === approvalId);
      if (idx === -1) return false;

      const req = db.pendingApprovals[idx];
      db.pendingApprovals.splice(idx, 1);
      
      const student = db.students.find(s => s.id === req.studentId);
      db.notifications.push({
        id: 'nt_' + Math.random().toString(36).substr(2, 9),
        userId: student ? student.parentId : '',
        title: 'Request Rejected',
        body: `You rejected a purchase request of ₹${req.amount} for ${student?.name}.`,
        read: false,
        type: 'recharge',
        createdAt: new Date().toISOString()
      });

      saveDB(db);
      return true;
    }
  },

  // Attendance Check-in tracker
  attendance: {
    getLogs: async () => {
      return getDB().attendanceLogs || [];
    },
    logCheckIn: async (studentId, type) => {
      const db = getDB();
      const student = db.students.find(s => s.id === studentId);
      if (!student) throw new Error('Student not found');

      const newLog = {
        id: 'att_' + Math.random().toString(36).substr(2, 9),
        studentId,
        studentName: student.name,
        type,
        timestamp: new Date().toISOString()
      };
      if (!db.attendanceLogs) db.attendanceLogs = [];
      db.attendanceLogs.push(newLog);

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      db.notifications.push({
        id: 'nt_' + Math.random().toString(36).substr(2, 9),
        userId: student.parentId,
        title: 'Attendance Log',
        body: `${student.name} ${type === 'in' ? 'entered' : 'left'} school at ${timeStr}.`,
        read: false,
        type: 'attendance',
        createdAt: new Date().toISOString()
      });

      // Reward on Entry: +₹20 (limit once per day)
      if (type === 'in') {
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        const todayEntries = db.attendanceLogs.filter(l => l.studentId === studentId && l.type === 'in' && new Date(l.timestamp) >= startOfDay);
        
        if (todayEntries.length === 1) {
          const wIdx = db.wallets.findIndex(w => w.studentId === studentId);
          if (wIdx !== -1) {
            db.wallets[wIdx].balance += 20;
            db.transactions.push({
              id: 'tx_' + Math.random().toString(36).substr(2, 9),
              walletId: db.wallets[wIdx].id,
              studentId,
              parentId: student.parentId,
              schoolId: student.schoolId,
              amount: 20,
              type: 'reward',
              status: 'success',
              description: 'Daily Attendance Reward Credit',
              createdAt: new Date().toISOString()
            });

            db.notifications.push({
              id: 'nt_' + Math.random().toString(36).substr(2, 9),
              userId: student.parentId,
              title: 'Wallet Reward Credited',
              body: `Attendance Credit (+₹20) loaded to ${student.name}'s wallet. Balance: ₹${db.wallets[wIdx].balance}.`,
              read: false,
              type: 'reward',
              createdAt: new Date().toISOString()
            });
          }
        }
      }

      saveDB(db);
      return newLog;
    }
  },

  // Teacher Wallet System
  teachers: {
    getWallet: async (teacherId) => {
      const db = getDB();
      if (!db.teacherWallets) {
        db.teacherWallets = [{
          id: 'w_teacher_1',
          teacherId: 'u_teacher_1',
          allowances: { 'Event': 1000, 'Food': 500, 'Travel': 1500 },
          updatedAt: new Date().toISOString()
        }];
        saveDB(db);
      }
      return db.teacherWallets.find(w => w.teacherId === teacherId) || db.teacherWallets[0];
    },
    updateAllowance: async (teacherId, allowanceType, amount) => {
      const db = getDB();
      const idx = db.teacherWallets.findIndex(w => w.teacherId === teacherId);
      if (idx !== -1) {
        db.teacherWallets[idx].allowances[allowanceType] = Number(amount);
        db.teacherWallets[idx].updatedAt = new Date().toISOString();
        saveDB(db);
        return db.teacherWallets[idx];
      }
      throw new Error('Teacher wallet not found');
    },
    recordExpense: async (teacherId, allowanceType, amount, description) => {
      const db = getDB();
      if (!db.teacherWallets) {
        db.teacherWallets = [{
          id: 'w_teacher_1',
          teacherId: 'u_teacher_1',
          allowances: { 'Event': 1000, 'Food': 500, 'Travel': 1500 },
          updatedAt: new Date().toISOString()
        }];
      }
      
      let walletIdx = db.teacherWallets.findIndex(w => w.teacherId === teacherId);
      if (walletIdx === -1) {
        db.teacherWallets.push({
          id: 'w_' + teacherId,
          teacherId,
          allowances: { 'Event': 1000, 'Food': 500, 'Travel': 1500 },
          updatedAt: new Date().toISOString()
        });
        walletIdx = db.teacherWallets.length - 1;
      }
      
      const wallet = db.teacherWallets[walletIdx];
      if (wallet.allowances[allowanceType] === undefined) {
        throw new Error(`Allowance type "${allowanceType}" not found.`);
      }
      if (wallet.allowances[allowanceType] < Number(amount)) {
        throw new Error(`Insufficient allowance funds for "${allowanceType}". Available: ₹${wallet.allowances[allowanceType]}`);
      }
      
      wallet.allowances[allowanceType] -= Number(amount);
      wallet.updatedAt = new Date().toISOString();
      
      const tx = {
        id: 'tx_teach_' + Math.random().toString(36).substr(2, 9),
        walletId: wallet.id,
        teacherId,
        amount: Number(amount),
        type: 'expense',
        status: 'success',
        description: `Logged expense: ${description} (${allowanceType})`,
        createdAt: new Date().toISOString()
      };
      
      db.transactions.push(tx);
      saveDB(db);
      return wallet;
    }
  },

  // Settlement Engine
  settlements: {
    getVendorBalance: async (vendorId) => {
      const db = getDB();
      const txs = db.transactions.filter(t => t.vendorId === vendorId && t.status === 'success' && t.type === 'purchase');
      const gross = txs.reduce((sum, t) => sum + t.amount, 0);

      const settlements = db.settlementLogs ? db.settlementLogs.filter(s => s.vendorId === vendorId) : [];
      const settled = settlements.reduce((sum, s) => sum + s.amount, 0);

      return {
        gross,
        settled,
        outstanding: gross - settled
      };
    },
    settle: async (vendorId) => {
      const db = getDB();
      const balances = await dbMock.settlements.getVendorBalance(vendorId);
      if (balances.outstanding <= 0) throw new Error('No outstanding payouts.');

      const newLog = {
        id: 'set_' + Math.random().toString(36).substr(2, 9),
        vendorId,
        amount: balances.outstanding,
        timestamp: new Date().toISOString(),
        status: 'completed'
      };

      if (!db.settlementLogs) db.settlementLogs = [];
      db.settlementLogs.push(newLog);

      db.auditLogs = db.auditLogs || [];
      db.auditLogs.push({
        id: 'aud_' + Math.random().toString(36).substr(2, 9),
        action: 'vendor_settlement',
        details: `Settle payouts of ₹${balances.outstanding} for vendor ${vendorId}`,
        timestamp: new Date().toISOString()
      });

      saveDB(db);
      return newLog;
    },
    getLogs: async () => {
      return getDB().settlementLogs || [];
    }
  },

  // Transactions Simulated DB Actions
  transactions: {
    getAll: async () => {
      return getDB().transactions;
    },
    getByParentId: async (parentId) => {
      const db = getDB();
      return db.transactions.filter(t => t.parentId === parentId);
    },
    getByStudentId: async (studentId) => {
      const db = getDB();
      return db.transactions.filter(t => t.studentId === studentId);
    },
    getByVendorId: async (vendorId) => {
      const db = getDB();
      return db.transactions.filter(t => t.vendorId === vendorId);
    },
    getBySchoolId: async (schoolId) => {
      const db = getDB();
      return db.transactions.filter(t => t.schoolId === schoolId);
    },
    refund: async (transactionId) => {
      const db = getDB();
      const txIdx = db.transactions.findIndex(t => t.id === transactionId);
      if (txIdx === -1) throw new Error('Transaction not found');
      
      const tx = db.transactions[txIdx];
      if (tx.status === 'refunded') throw new Error('Transaction is already refunded');
      if (tx.type !== 'purchase') throw new Error('Only purchases can be refunded');

      const walletIdx = db.wallets.findIndex(w => w.id === tx.walletId);
      if (walletIdx === -1) throw new Error('Wallet not found');

      db.wallets[walletIdx].balance += tx.amount;
      db.wallets[walletIdx].updatedAt = new Date().toISOString();
      tx.status = 'refunded';

      const refundTx = {
        id: 'tx_' + Math.random().toString(36).substr(2, 9),
        walletId: tx.walletId,
        studentId: tx.studentId,
        parentId: tx.parentId,
        schoolId: tx.schoolId,
        vendorId: tx.vendorId,
        amount: tx.amount,
        type: 'refund',
        status: 'success',
        description: `Refund for Transaction ${transactionId}`,
        createdAt: new Date().toISOString()
      };

      const student = db.students.find(s => s.id === tx.studentId);
      const notification = {
        id: 'nt_' + Math.random().toString(36).substr(2, 9),
        userId: tx.parentId,
        title: 'Refund Processed',
        body: `Refund of ₹${tx.amount} processed for ${student?.name}. New Wallet Balance: ₹${db.wallets[walletIdx].balance}.`,
        read: false,
        type: 'refund',
        createdAt: new Date().toISOString()
      };

      db.transactions.push(refundTx);
      db.notifications.push(notification);
      saveDB(db);
      return db.wallets[walletIdx];
    }
  },

  // Notifications Simulated DB Actions
  notifications: {
    getByUserId: async (userId) => {
      const db = getDB();
      return db.notifications
        .filter(n => n.userId === userId)
        .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    },
    markAllRead: async (userId) => {
      const db = getDB();
      db.notifications.forEach(n => {
        if (n.userId === userId) n.read = true;
      });
      saveDB(db);
      return true;
    }
  }
};
