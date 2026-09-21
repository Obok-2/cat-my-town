import { useSyncExternalStore } from 'react';

// 외부 라이브러리 없이 쓰는 최소 해시 라우터 (#/dashboard 형태)
export function readRoute() {
  return window.location.hash.replace(/^#\/?/, '');
}

function subscribe(onChange) {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

export function useHashRoute() {
  return useSyncExternalStore(subscribe, readRoute);
}

export function navigate(route) {
  window.location.hash = `/${route}`;
}
