import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setCsrfToken } from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, setState] = useState({ status: 'loading', user: null, notice: '' });

  const refresh = useCallback(async () => {
    try {
      const { user, csrfToken } = await api.get('/auth/me');
      setCsrfToken(csrfToken);
      setState({ status: 'signed-in', user, notice: '' });
    } catch (err) {
      setCsrfToken(null);
      setState({ status: 'signed-out', user: null, notice: err.status === 503 ? err.message : '' });
    }
  }, []);

  useEffect(() => {
    refresh();
    const onSignedOut = (e) => {
      setCsrfToken(null);
      setState({ status: 'signed-out', user: null, notice: e.detail || 'Your session has ended. Please sign in again.' });
    };
    window.addEventListener('admin:signed-out', onSignedOut);
    return () => window.removeEventListener('admin:signed-out', onSignedOut);
  }, [refresh]);

  const signIn = (user, csrfToken) => {
    setCsrfToken(csrfToken);
    setState({ status: 'signed-in', user, notice: '' });
  };

  const signOut = async () => {
    await api.post('/auth/logout').catch(() => {});
    setCsrfToken(null);
    setState({ status: 'signed-out', user: null, notice: 'You have been signed out.' });
  };

  return <AuthContext.Provider value={{ ...state, signIn, signOut, refresh }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
