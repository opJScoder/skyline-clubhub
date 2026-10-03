import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!localStorage.getItem('token'));

  const refresh = async () => {
    try { setUser((await api.get('/auth/me')).data.user); }
    catch { localStorage.removeItem('token'); setUser(null); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (localStorage.getItem('token')) refresh(); }, []);

  const authenticate = async (path, body) => {
    const { data } = await api.post(path, body);
    localStorage.setItem('token', data.token); setUser(data.user);
  };
  const login = (email, password) => authenticate('/auth/login', { email, password });
  const register = body => authenticate('/auth/register', body);
  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  const isActiveMember = !!user && user.membershipStatus === 'active' && new Date(user.membershipExpiresAt) > new Date();
  return <Ctx.Provider value={{ user, loading, login, register, logout, refresh, isActiveMember }}>{children}</Ctx.Provider>;
}
