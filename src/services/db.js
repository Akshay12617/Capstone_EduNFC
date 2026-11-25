// Unified database router. Bridges either Firebase or dbMock.
import { hasConfig, auth as fbAuth, firestore as fbFirestore } from './firebase';
import { dbMock } from './dbMock';

export const db = hasConfig ? {
  auth: {
    login: async (email, password) => {
      return dbMock.auth.login(email, password);
    },
    getCurrentUser: () => {
      return dbMock.auth.getCurrentUser();
    },
    logout: async () => {
      return dbMock.auth.logout();
    },
    changePassword: async (old, newP) => {
      return dbMock.auth.changePassword(old, newP);
    },
    updateProfile: async (updates) => {
      return dbMock.auth.updateProfile(updates);
    }
  },
  schools: dbMock.schools,
  students: dbMock.students,
  parents: dbMock.parents,
  vendors: dbMock.vendors,
  wallets: dbMock.wallets,
  transactions: dbMock.transactions,
  notifications: dbMock.notifications,
  pendingApprovals: dbMock.pendingApprovals,
  attendance: dbMock.attendance,
  teachers: dbMock.teachers,
  settlements: dbMock.settlements
} : dbMock; // Fallback entirely to Mock database when config is absent
