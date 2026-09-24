import { loginAdmin } from './api/adminApi.js';

// 관리자 로그인: 서버(/admin/auth/login)가 발급한 관리자 토큰과 만료 시각을 브라우저 저장소에 둔다.
// "이 브라우저 기억하기"를 켜면 localStorage, 아니면 탭을 닫을 때 사라지는 sessionStorage.
const KEY = 'cat-admin-session';

function readSession() {
  try {
    const raw = localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function getAccessToken() {
  const session = readSession();
  if (!session?.accessToken || Date.now() >= session.expiresAt) return null;
  return session.accessToken;
}

// 로그인한 관리자 정보 { id, email, name, role } — 사이드바 프로필 표시용
export function getAdmin() {
  return readSession()?.admin ?? null;
}

export function isLoggedIn() {
  return Boolean(getAccessToken());
}

export async function login({ email, password, remember }) {
  if (!email.trim() || !password) {
    return { ok: false, message: '이메일과 비밀번호를 입력해 주세요.' };
  }

  let loginData;
  try {
    const response = await loginAdmin(email.trim(), password);
    loginData = response.data.data;
  } catch (error) {
    return {
      ok: false,
      message: error.response?.data?.message || '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.',
    };
  }

  const session = {
    accessToken: loginData.accessToken,
    expiresAt: Date.now() + loginData.expiresIn * 1000,
    admin: loginData.admin,
  };
  try {
    logout();
    (remember ? localStorage : sessionStorage).setItem(KEY, JSON.stringify(session));
  } catch {
    return { ok: false, message: '브라우저 저장소를 사용할 수 없어 로그인할 수 없습니다.' };
  }
  return { ok: true };
}

export function logout() {
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(KEY);
  } catch {
    /* 저장소 접근 불가 — 무시 */
  }
}
