import { useState } from 'react';
import { dashboard } from '../data/dashboard.js';
import { downloadCsv } from '../utils/csv.js';
import KpiCard from '../components/KpiCard.jsx';
import DailyChart from '../components/DailyChart.jsx';
import MatchDonut from '../components/MatchDonut.jsx';
import LevelDistribution from '../components/LevelDistribution.jsx';
import ActivityLog from '../components/ActivityLog.jsx';

const PERIODS = [
  { key: '7d', label: '최근 7일' },
  { key: '30d', label: '최근 30일' },
];

function exportCsv() {
  const { kpis, daily, matching, levels, activity } = dashboard;
  downloadCsv('dashboard.csv', [
    ['기준 시각', dashboard.asOf],
    [],
    ['KPI', '값', '변화'],
    ...kpis.map((k) => [k.label, k.value, k.delta]),
    [],
    ['일자', '촬영(%)', '신규 고양이(%)'],
    ...daily.map((d) => [d.day, d.shots, d.newCats]),
    [],
    ['AI 매칭', '건수'],
    ['같은 고양이 확정', matching.confirmed],
    ['새 고양이로 정정', matching.corrected],
    [],
    ['레벨', '사용자'],
    ...levels.map((l) => [l.name, l.users]),
    [],
    ['시각', '이벤트', '일치율', '사용자'],
    ...activity.map((a) => [a.time, a.event, a.score, a.user]),
  ]);
}

export default function DashboardPage() {
  // 목데이터 단계라 기간을 바꿔도 수치는 그대로다. 서버 연동 시 period로 조회한다.
  const [period, setPeriod] = useState('30d');

  return (
    <div className="dash">
      <header className="dash__head">
        <div>
          <h1>대시보드</h1>
          <p>{dashboard.asOf} 기준 · 5분마다 갱신</p>
        </div>
        <div className="dash__tools">
          {PERIODS.map((p) => (
            <button
              key={p.key}
              type="button"
              className={`chip${period === p.key ? ' is-active' : ''}`}
              aria-pressed={period === p.key}
              onClick={() => setPeriod(p.key)}
            >
              {p.label}
            </button>
          ))}
          <button type="button" className="chip" onClick={exportCsv}>
            CSV 내보내기
          </button>
        </div>
      </header>

      <section className="dash__kpis">
        {dashboard.kpis.map((kpi) => (
          <KpiCard key={kpi.label} {...kpi} />
        ))}
      </section>

      <section className="dash__row dash__row--chart">
        <DailyChart data={dashboard.daily} />
        <MatchDonut {...dashboard.matching} />
      </section>

      <section className="dash__row dash__row--log">
        <LevelDistribution levels={dashboard.levels} />
        <ActivityLog rows={dashboard.activity} />
      </section>
    </div>
  );
}
