import { useSyncExternalStore } from 'react';

export function isAdminPath() {
  return /^\/admin(?:\/|$)/.test(window.location.pathname);
}

// 관리자는 /admin 아래에서만 동작한다. 홍보 페이지의 해시는 섹션 이동에 사용한다.
export function readRoute() {
  return window.location.pathname.replace(/^\/admin\/?/, '').replace(/\/$/, '');
}

function subscribe(onChange) {
  window.addEventListener('popstate', onChange);
  return () => window.removeEventListener('popstate', onChange);
}

export function useRoute() {
  return useSyncExternalStore(subscribe, readRoute);
}

export function navigate(route, { replace = false } = {}) {
  const path = route === 'login' ? '/admin' : `/admin/${route}`;
  window.history[replace ? 'replaceState' : 'pushState'](null, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}
