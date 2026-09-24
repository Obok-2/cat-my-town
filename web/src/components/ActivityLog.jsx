import { formatDateTime } from '../utils/format.js';

// rows: [{ userId, email(가린 값), lastLoginAt }] — 최근에 로그인한 사용자
export default function ActivityLog({ rows }) {
  return (
    <div className="card">
      <div className="card__head">
        <h2>최근 로그인</h2>
      </div>

      <div className="activity__row activity__row--head">
        <div>마지막 로그인</div>
        <div>사용자</div>
        <div>ID</div>
      </div>

      <div className="activity__list">
        {rows.length === 0 && <p className="activity__empty">아직 로그인 기록이 없습니다.</p>}
        {rows.map((row) => (
          <div key={row.userId} className="activity__row">
            <div className="activity__time">{formatDateTime(row.lastLoginAt)}</div>
            <div>{row.email}</div>
            <div className="activity__user">u_{row.userId}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
