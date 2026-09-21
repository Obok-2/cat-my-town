import { useEffect, useState } from 'react';

// 외부 라이브러리 없이 쓰는 최소 해시 라우터 (#/dashboard 형태)
function readRoute() {
  return window.location.hash.replace(/^#\/?/, '');
}

export function useHashRoute() {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onChange = () => setRoute(readRoute());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  return route;
}

export function navigate(route) {
  window.location.hash = `/${route}`;
}
