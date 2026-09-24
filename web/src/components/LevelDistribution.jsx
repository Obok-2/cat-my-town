import { LEVEL_TITLES } from '../data/levels.js';

// levels: [{ level: 0~5, userCount }] — 막대 길이는 가장 많은 레벨 대비 비율
export default function LevelDistribution({ levels }) {
  const max = Math.max(1, ...levels.map((l) => l.userCount));

  return (
    <div className="card">
      <h2>사용자 레벨 분포</h2>
      <div className="levels">
        {levels.map((level) => (
          <div key={level.level} className="levels__item">
            <div className="levels__row">
              <span>
                {level.level === 0 ? LEVEL_TITLES[0] : `${LEVEL_TITLES[level.level]} Lv.${level.level}`}
              </span>
              <span>{level.userCount.toLocaleString('ko-KR')}명</span>
            </div>
            <div className="levels__track">
              <div className="levels__fill" style={{ width: `${(level.userCount / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
