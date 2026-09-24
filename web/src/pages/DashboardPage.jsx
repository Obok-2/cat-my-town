import { useCallback, useEffect, useState } from 'react';
import { getDashboard } from '../api/adminApi.js';
import { getAccessToken } from '../auth.js';
import { LEVEL_TITLES } from '../data/levels.js';
import { downloadCsv } from '../utils/csv.js';
import { formatDateTime } from '../utils/format.js';
import KpiCard from '../components/KpiCard.jsx';
import DailyChart from '../components/DailyChart.jsx';
import LevelDistribution from '../components/LevelDistribution.jsx';
import ActivityLog from '../components/ActivityLog.jsx';

const numberFormat = new Intl.NumberFormat('ko-KR');

function buildKpis(summary) {
  const diff = summary.todaySightings - summary.yesterdaySightings;
  const todayDelta = diff === 0 ? '어제와 같음' : `${diff > 0 ? '▲' : '▼'} ${numberFormat.format(Math.abs(diff))}건 (어제 대비)`;
  const activeRate = summary.totalUsers > 0 ? Math.round((summary.activeUsers7d / summary.totalUsers) * 100) : 0;

  return [
    { label: '누적 사용자', value: numberFormat.format(summary.totalUsers), delta: `최근 30일 +${numberFormat.format(summary.newUsers30d)}` },
    { label: '등록된 고양이', value: numberFormat.format(summary.totalCats), delta: `최근 30일 +${numberFormat.format(summary.newCats30d)}` },
    { label: '오늘 촬영', value: numberFormat.format(summary.todaySightings), delta: todayDelta },
    { label: '7일 활성 사용자', value: numberFormat.format(summary.activeUsers7d), delta: `전체의 ${activeRate}%` },
  ];
}

function exportCsv(data) {
  const kpis = buildKpis(data.summary);
  downloadCsv('dashboard.csv', [
    ['기준 시각', formatDateTime(data.asOf)],
    [],
    ['KPI', '값', '변화'],
    ...kpis.map((k) => [k.label, k.value, k.delta]),
    [],
    ['일자', '촬영', '신규 고양이'],
    ...data.daily.map((d) => [d.day, d.sightingCount, d.newCatCount]),
    [],
    ['레벨', '사용자'],
    ...data.levels.map((l) => [`Lv.${l.level} ${LEVEL_TITLES[l.level] ?? ''}`, l.userCount]),
    [],
    ['마지막 로그인', '사용자', 'ID'],
    ...data.activity.map((a) => [formatDateTime(a.lastLoginAt), a.email, a.userId]),
  ]);
}

export default function DashboardPage({ onUnauthorized }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const load = useCallback(async () => {
    const accessToken = getAccessToken();
    if (!accessToken) {
      onUnauthorized();
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await getDashboard(accessToken);
      setData(response.data.data);
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        onUnauthorized();
        return;
      }
      setErrorMessage(error.response?.data?.message || '대시보드를 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }, [onUnauthorized]);

  // 화면에 들어올 때 한 번 불러온다. load는 onUnauthorized(App에서 고정)에만 의존해 다시 돌지 않는다.
  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="dash">
      <header className="dash__head">
        <div>
          <h1>대시보드</h1>
          <p>{data ? `${formatDateTime(data.asOf)} 기준` : '불러오는 중…'}</p>
        </div>
        <div className="dash__tools">
          <button type="button" className="chip" onClick={load} disabled={loading}>
            {loading ? '불러오는 중…' : '새로고침'}
          </button>
          <button type="button" className="chip" onClick={() => exportCsv(data)} disabled={!data}>
            CSV 내보내기
          </button>
        </div>
      </header>

      {errorMessage && (
        <p className="dash__status" role="alert">
          {errorMessage}
        </p>
      )}

      {data && (
        <>
          <section className="dash__kpis">
            {buildKpis(data.summary).map((kpi) => (
              <KpiCard key={kpi.label} {...kpi} />
            ))}
          </section>

          <section className="dash__row">
            <DailyChart data={data.daily} />
          </section>

          <section className="dash__row dash__row--log">
            <LevelDistribution levels={data.levels} />
            <ActivityLog rows={data.activity} />
          </section>
        </>
      )}
    </div>
  );
}
