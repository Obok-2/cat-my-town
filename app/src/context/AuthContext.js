import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getUser, loginWithGoogleMock, logout as logoutStore } from '../data/store';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ loggedIn: false, displayName: null });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getUser().then((u) => {
      setUser(u);
      setReady(true);
    });
  }, []);

  const login = useCallback(async () => {
    const u = await loginWithGoogleMock();
    setUser(u);
  }, []);

  const logout = useCallback(async () => {
    const u = await logoutStore();
    setUser(u);
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
