import { isLoggedIn } from './auth.js';
import { DEFAULT_ROUTE, MENU } from './data/menu.js';
import { navigate, readRoute } from './router.js';

// 로그인 상태와 주소가 어긋나면 바로잡는다 (미로그인 → 로그인, 알 수 없는 주소 → 대시보드).
// React 밖에서 시작할 때 1회 등록한다(main.jsx).
function correctRoute() {
  const route = readRoute();
  if (!isLoggedIn()) {
    if (route !== 'login') navigate('login');
  } else if (!MENU.some((item) => item.route === route)) {
    navigate(DEFAULT_ROUTE);
  }
}

export function startRouteGuard() {
  correctRoute();
  window.addEventListener('hashchange', correctRoute);
}
