import { useEffect, useState } from 'react';
import { isLoggedIn, logout } from './auth.js';
import { DEFAULT_ROUTE, MENU } from './data/menu.js';
import { navigate, useHashRoute } from './router.js';
import AdminLayout from './components/AdminLayout.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import WipPage from './pages/WipPage.jsx';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(isLoggedIn);
  const route = useHashRoute();
  const menuItem = MENU.find((item) => item.route === route);

  // 로그인 상태와 주소가 어긋나면 바로잡는다 (미로그인 → 로그인, 알 수 없는 주소 → 대시보드)
  useEffect(() => {
    if (!loggedIn) {
      if (route !== 'login') navigate('login');
    } else if (!menuItem) {
      navigate(DEFAULT_ROUTE);
    }
  }, [loggedIn, route, menuItem]);

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

  if (!menuItem) return null;

  const handleLogout = () => {
    logout();
    setLoggedIn(false);
    navigate('login');
  };

  return (
    <AdminLayout activeRoute={menuItem.route} onLogout={handleLogout}>
      {menuItem.ready ? <DashboardPage /> : <WipPage title={menuItem.label} />}
    </AdminLayout>
  );
}
