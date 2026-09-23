import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getMyProfile, loginWithGoogle } from '../api/authApi';
import { signInWithGoogle, signOutFromGoogle } from '../auth/googleAuth';
import { getAccessToken, removeAccessToken, saveAccessToken } from '../storage/tokenStorage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState({ loggedIn: false, displayName: null });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function restoreLogin() {
      try {
        const accessToken = await getAccessToken();
        if (!accessToken) return;
        const response = await getMyProfile();
        setUser({ loggedIn: true, ...response.data.data });
      } catch {
        await removeAccessToken();
      } finally {
        setReady(true);
      }
    }

    restoreLogin();
  }, []);

  const login = useCallback(async () => {
    const googleIdToken = await signInWithGoogle();
    if (!googleIdToken) return false;

    const response = await loginWithGoogle(googleIdToken);
    const loginData = response.data.data;
    await saveAccessToken(loginData.accessToken);
    setUser({ loggedIn: true, ...loginData.user });
    return true;
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOutFromGoogle();
    } finally {
      await removeAccessToken();
      setUser({ loggedIn: false, displayName: null });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, logout }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
