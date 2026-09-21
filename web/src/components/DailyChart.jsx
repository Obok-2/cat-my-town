export default function DailyChart({ data }) {
  return (
    <div className="card chart">
      <div className="card__head">
        <h2>일별 촬영 · 신규 등록</h2>
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
          <div key={d.day} className="chart__col">
            <div className="chart__pair">
              <div className="chart__bar" style={{ height: `${d.shots}%`, background: 'var(--primary)' }} />
              <div className="chart__bar" style={{ height: `${d.newCats}%`, background: 'var(--green)' }} />
            </div>
            <div className="chart__day">{d.day}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
