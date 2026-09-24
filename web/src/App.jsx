import { useCallback, useState } from 'react';
import { isLoggedIn, logout } from './auth.js';
import { DEFAULT_ROUTE, MENU } from './data/menu.js';
import { navigate, useRoute } from './router.js';
import AdminLayout from './components/AdminLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import WipPage from './pages/WipPage.jsx';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn);
  const route = useRoute();
  // 알 수 없는 주소는 대시보드로 보여준다. 주소창 자체는 routeGuard.js가 바로잡는다.
  const menuItem = MENU.find((item) => item.route === route) ?? MENU.find((item) => item.route === DEFAULT_ROUTE);

  // 로그아웃 버튼과 토큰 만료(서버 401)에서 같이 쓴다. 대시보드 조회 함수의 의존성이라 고정해 둔다.
  const handleLogout = useCallback(() => {
    logout();
    setLoggedIn(false);
    navigate('login');
  }, []);

  if (!loggedIn) {
    return (
      <LoginPage
        onLogin={() => {
          setLoggedIn(true);
          navigate(DEFAULT_ROUTE);
        }}
      />
    );
  }

  return (
    <AdminLayout activeRoute={menuItem.route} onLogout={handleLogout}>
      {menuItem.ready ? <DashboardPage onUnauthorized={handleLogout} /> : <WipPage title={menuItem.label} />}
    </AdminLayout>
  );
}
