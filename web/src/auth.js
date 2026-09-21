// 임시 인증: 백엔드(server/)가 아직 없어 이메일·비밀번호가 채워져 있으면 통과시킨다.
// 서버 연동 시 login()만 실제 API 호출로 교체하면 된다.
const KEY = 'cat-admin-session';

export function isLoggedIn() {
  try {
    return Boolean(localStorage.getItem(KEY) || sessionStorage.getItem(KEY));
  } catch {
    return false;
  }
}

export function login({ email, password, remember }) {
  if (!email.trim() || !password) {
    return { ok: false, message: '이메일과 비밀번호를 입력해 주세요.' };
  }
  const value = JSON.stringify({ email: email.trim(), at: Date.now() });
  try {
    (remember ? localStorage : sessionStorage).setItem(KEY, value);
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
