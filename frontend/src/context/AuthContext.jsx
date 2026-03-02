import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', { refreshToken });
    } catch (_) { /* ignore */ }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasPermission = (permission) => {
    if (!user) return false;
    const perms = {
      ADMIN: ['all'],
      BRANCH_MANAGER: ['branches:read', 'products:read', 'products:create', 'products:update', 'invoices:read', 'invoices:create', 'invoices:refund', 'inventory:read', 'inventory:adjust', 'inventory:count', 'transfers:read', 'transfers:create', 'transfers:approve', 'reports:read', 'reports:export', 'users:read', 'customers:read', 'customers:create', 'customers:update', 'activity:read'],
      CASHIER: ['products:read', 'invoices:read', 'invoices:create', 'customers:read', 'customers:create', 'inventory:read'],
      WAREHOUSE: ['products:read', 'products:create', 'products:update', 'inventory:read', 'inventory:adjust', 'inventory:count', 'transfers:read', 'transfers:create'],
      VIEWER: ['products:read', 'invoices:read', 'inventory:read', 'branches:read', 'reports:read'],
    };
    const userPerms = perms[user.role] || [];
    return userPerms.includes('all') || userPerms.includes(permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}
