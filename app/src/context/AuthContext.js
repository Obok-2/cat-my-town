import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getMyProfile, loginWithGoogle, withdrawAccount } from '../api/authApi';
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

  // 탈퇴 요청이 실패해도(네트워크 오류 등) 로컬 로그인 상태는 그대로 두어, 호출한 화면이 실패를 알리고
  // 사용자가 다시 시도할 수 있게 한다. 성공한 뒤에는 로그아웃과 동일하게 로컬 정리를 한다.
  const withdraw = useCallback(async () => {
    await withdrawAccount();
    try {
      await signOutFromGoogle();
    } finally {
      await removeAccessToken();
      setUser({ loggedIn: false, displayName: null });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, ready, login, logout, withdraw }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
