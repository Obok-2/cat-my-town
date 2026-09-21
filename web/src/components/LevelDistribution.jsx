export default function LevelDistribution({ levels }) {
  return (
    <div className="card">
      <h2>사용자 레벨 분포</h2>
      <div className="levels">
        {levels.map((level) => (
          <div key={level.name} className="levels__item">
            <div className="levels__row">
              <span>{level.name}</span>
              <span>{level.users}</span>
            </div>
            <div className="levels__track">
              <div className="levels__fill" style={{ width: `${level.width}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
