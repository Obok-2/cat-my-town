const RADIUS = 42;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 263.9

export default function MatchDonut({ confirmed, corrected, highScoreRate }) {
  const rate = confirmed / (confirmed + corrected);

  return (
    <div className="card donut">
      <h2>AI 매칭 확정 결과</h2>

      <div className="donut__body">
        <div className="donut__ring">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="var(--track-donut)" strokeWidth="14" />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="14"
              strokeDasharray={`${CIRCUMFERENCE * rate} ${CIRCUMFERENCE}`}
            />
          </svg>
          <div className="donut__center">
            <strong>{Math.round(rate * 100)}%</strong>
            <span>수락률</span>
          </div>
        </div>

        <div className="donut__legend">
          <div>
            <i className="legend__dot" style={{ background: 'var(--primary)' }} />
            같은 고양이 확정 <b>{confirmed.toLocaleString()}</b>
          </div>
          <div>
            <i className="legend__dot" style={{ background: 'var(--track-donut)' }} />
            새 고양이로 정정 <b>{corrected.toLocaleString()}</b>
          </div>
          <p>
            제안 일치율 80%↑ 구간의
            <br />
            수락률은 <b>{highScoreRate}%</b>
          </p>
        </div>
      </div>

      <div className="donut__note">정정 데이터는 다음 모델 재학습 큐로 전송됩니다.</div>
    </div>
  );
}
