import { DEFAULT_ROUTE } from '../data/menu.js';
import { navigate } from '../router.js';

// 아직 만들지 않은 메뉴 — 자리만 잡아둔 블러 화면 위에 "작업 중" 안내를 띄운다.
export default function WipPage({ title }) {
  return (
    <div className="wip">
      <div className="wip__backdrop" aria-hidden="true">
        <div className="wip__head">
          <div className="wip__bar wip__bar--title" />
          <div className="wip__bar wip__bar--sub" />
        </div>
        <div className="wip__grid wip__grid--4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="wip__card wip__card--short" />
          ))}
        </div>
        <div className="wip__grid wip__grid--2">
          <div className="wip__card wip__card--tall" />
          <div className="wip__card wip__card--tall" />
        </div>
        <div className="wip__card wip__card--table" />
      </div>

      <div className="wip__overlay" role="status">
        <div className="wip__message">
          <div className="wip__label">{title}</div>
          <h2>아직 작업 중인 페이지입니다</h2>
          <p>곧 만나볼 수 있도록 준비하고 있어요.</p>
          <button type="button" className="btn-primary wip__back" onClick={() => navigate(DEFAULT_ROUTE)}>
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
