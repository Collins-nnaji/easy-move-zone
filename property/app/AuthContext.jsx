import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth } from './auth';
import { setAuthSession, api } from './api';
import { shortlist } from './utils/shortlist';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      const session = await auth.getSession();
      if (session && session.user) {
        setUser(session.user);
        setAuthSession(session.user);
        api.account.saved().then((r) => shortlist.merge(r.listings)).catch(() => {});
        // Subscriptions removed — all features are free
        setIsPro(true);
      } else {
        setUser(null);
        setAuthSession(null);
        setIsPro(true); // Always true — no subscription required
      }
    } catch {
      setUser(null);
      setAuthSession(null);
      setIsPro(true);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const signInWithGoogle = async () => {
    await auth.signInWithGoogle();
  };
  // Clear the signed-in state at once (so nothing keeps showing the account
  // while the request runs), then sign out on the server and reload at `/`.
  const signOut = async () => {
    setUser(null);
    setAuthSession(null);
    await auth.signOut();
  };

  const signUpWithEmail = async (email, password, name) => {
    const data = await auth.signUpWithEmail(email, password, name);
    await checkSession();
    return data;
  };

  const signInWithEmail = async (email, password) => {
    const data = await auth.signInWithEmail(email, password);
    await checkSession();
    return data;
  };

  return (
    <AuthContext.Provider value={{ user, loading, isPro, signInWithGoogle, signInWithEmail, signUpWithEmail, signOut, refreshAuth: checkSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
