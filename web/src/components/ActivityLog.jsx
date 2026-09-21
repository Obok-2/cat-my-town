export default function ActivityLog({ rows }) {
  return (
    <div className="card">
      <div className="card__head">
        <h2>최근 활동</h2>
        {/* 전체 보기 페이지는 아직 없음 — 작업 중 화면(사용자 메뉴)으로 연결하지 않고 표시만 유지 */}
        <span className="activity__all">전체 보기</span>
      </div>

      <div className="activity__row activity__row--head">
        <div>시각</div>
        <div>이벤트</div>
        <div>일치율</div>
        <div>사용자</div>
      </div>

      <div className="activity__list">
        {rows.map((row) => (
          <div key={`${row.time}-${row.user}`} className="activity__row">
            <div className="activity__time">{row.time}</div>
            <div>{row.event}</div>
            <div className="activity__score">{row.score}</div>
            <div className="activity__user">{row.user}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
