import { isLoggedIn } from './auth.js';
import { DEFAULT_ROUTE, MENU } from './data/menu.js';
import { isAdminPath, navigate, readRoute } from './router.js';

// 로그인 상태와 주소가 어긋나면 바로잡는다 (미로그인 → 로그인, 알 수 없는 주소 → 대시보드).
// React 밖에서 시작할 때 1회 등록한다(main.jsx).
function correctRoute() {
  if (!isAdminPath()) return;
  const route = readRoute();
  if (!isLoggedIn()) {
    if (route !== '') navigate('login', { replace: true });
  } else if (!MENU.some((item) => item.route === route)) {
    navigate(DEFAULT_ROUTE, { replace: true });
  }
}

export function startRouteGuard() {
  correctRoute();
  window.addEventListener('popstate', correctRoute);
}
