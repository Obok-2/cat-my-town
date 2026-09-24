import { getAdmin } from '../auth.js';
import { MENU } from '../data/menu.js';
import { navigate } from '../router.js';
import brandMark from '../assets/brand-mark.png';
import '../styles/admin.css';

export default function AdminLayout({ activeRoute, onLogout, children }) {
  const admin = getAdmin();

  return (
    <div className="admin">
      <aside className="sidebar">
        <div className="brand sidebar__brand">
          <img className="brand__mark" src={brandMark} alt="" />
          <span>
            우리동네고양이 <small>ADMIN</small>
          </span>
        </div>

        <nav className="sidebar__nav">
          {MENU.map((item) => (
            <button
              key={item.route}
              type="button"
              className={`sidebar__link${item.route === activeRoute ? ' is-active' : ''}`}
              aria-current={item.route === activeRoute ? 'page' : undefined}
              onClick={() => navigate(item.route)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar__spacer" />
        <a href="/">앱 소개 사이트로</a>

        <div className="sidebar__profile">
          <div className="sidebar__avatar" />
          <div className="sidebar__who">
            <span>{admin?.name ?? '관리자'}</span>
            <small>{admin?.email ?? ''}</small>
          </div>
        </div>
        <button type="button" className="sidebar__logout" onClick={onLogout}>
          로그아웃
        </button>
      </aside>

      <main className="admin__main">{children}</main>
    </div>
  );
}
