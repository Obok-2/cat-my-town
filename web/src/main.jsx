import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import LandingPage from './pages/LandingPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import { isAdminPath } from './router.js';
import { startRouteGuard } from './routeGuard.js';
import './styles/base.css';

const adminPage = isAdminPath();
const privacyPage = /^\/privacy\/?$/.test(window.location.pathname);
if (adminPage) startRouteGuard();
document.title = adminPage ? '우리동네고양이 ADMIN' : privacyPage ? '개인정보 처리 안내 — 우리동네고양이' : '우리동네고양이 — 산책이 도감이 되는 순간';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {adminPage ? <App /> : privacyPage ? <PrivacyPage /> : <LandingPage />}
  </StrictMode>,
);
