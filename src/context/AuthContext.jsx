import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../services/db';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Read current user session from database on load
  useEffect(() => {
    const user = db.auth.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      loadNotifications(user.uid);
    }
    setLoading(false);
  }, []);

  const loadNotifications = async (userId) => {
    try {
      const list = await db.notifications.getByUserId(userId);
      setNotifications(list);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    try {
      const user = await db.auth.login(email, password);
      setCurrentUser(user);
      await loadNotifications(user.uid);
      return user;
    } catch (error) {
      setLoading(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await db.auth.logout();
      setCurrentUser(null);
      setNotifications([]);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates) => {
    try {
      const updatedUser = await db.auth.updateProfile(updates);
      setCurrentUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Failed to update profile:', error);
      throw error;
    }
  };

  const refreshNotifications = async () => {
    if (currentUser) {
      await loadNotifications(currentUser.uid);
    }
  };

  const value = {
    currentUser,
    loading,
    notifications,
    login,
    logout,
    updateProfile,
    refreshNotifications
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
