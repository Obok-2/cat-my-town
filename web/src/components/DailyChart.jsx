// data: [{ day: '2026-09-24', sightingCount, newCatCount }] — 막대 높이는 7일 중 최댓값 대비 비율
export default function DailyChart({ data }) {
  const max = Math.max(1, ...data.map((d) => Math.max(d.sightingCount, d.newCatCount)));
  const height = (count) => (count === 0 ? 0 : Math.max(3, (count / max) * 100));

  return (
    <div className="card chart">
      <div className="card__head">
        <h2>일별 촬영 · 신규 등록 (최근 7일)</h2>
        <div className="legend">
          <span>
            <i className="legend__dot" style={{ background: 'var(--primary)' }} />
            촬영
          </span>
          <span>
            <i className="legend__dot" style={{ background: 'var(--green)' }} />
            신규 고양이
          </span>
        </div>
      </div>

      <div className="chart__bars">
        {data.map((d) => (
          <div key={d.day} className="chart__col" title={`${d.day} · 촬영 ${d.sightingCount} · 신규 ${d.newCatCount}`}>
            <div className="chart__pair">
              <div className="chart__bar" style={{ height: `${height(d.sightingCount)}%`, background: 'var(--primary)' }} />
              <div className="chart__bar" style={{ height: `${height(d.newCatCount)}%`, background: 'var(--green)' }} />
            </div>
            <div className="chart__day">{String(d.day).slice(8, 10)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
