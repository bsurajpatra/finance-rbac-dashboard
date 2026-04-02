import { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../api/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Re-hydrate the native user state cleanly from local scope immediately upon load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        // Cleanly terminate expired payloads relying strictly on Unix signatures
        if (decoded.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser(decoded);
        }
      } catch (err) {
        logout();
      }
    }
    setLoading(false);
  }, []);

  /**
   * 🎯 Global Inactivity Listener
   * Monitors mouse and keyboard interactions across the entire viewport.
   * Forces a session purge if no activity is detected for 10 minutes.
   */
  useEffect(() => {
    let inactivityTimer;

    const resetTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      
      // Auto-logout after 10 minutes of total idle time
      inactivityTimer = setTimeout(() => {
        if (user) {
          console.log('[Security Audit] Inactivity threshold reached. Terminating session.');
          logout();
        }
      }, 10 * 60 * 1000); 
    };

    if (user) {
      // Bind listeners globally across the window architecture
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keypress', resetTimer);
      window.addEventListener('scroll', resetTimer);
      window.addEventListener('click', resetTimer);

      resetTimer(); // Initialize on boot
    }

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [user]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', res.data.token);
    setUser(jwtDecode(res.data.token)); // Update React runtime memory with the extracted identity
  };

  const register = async (name, email, password) => {
    await api.post('/auth/register', { name, email, password });
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
