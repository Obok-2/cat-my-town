// 대시보드 목데이터 — w2 목업의 수치 그대로. 서버 연동 전까지 정적 값이다.
export const dashboard = {
  asOf: '2026.09.21 09:40',

  kpis: [
    { label: '누적 사용자', value: '8,412', delta: '▲ 3.2% (30일)' },
    { label: '등록된 고양이', value: '19,073', delta: '▲ 5.8% (30일)' },
    { label: '오늘 촬영', value: '1,286', delta: '▲ 128건 (어제 대비)' },
    { label: '평균 제안 일치율', value: '81.4%', delta: '▲ 1.1%p (30일)' },
  ],

  // shots / newCats: 막대 높이(%)
  daily: [
    { day: '15', shots: 39, newCats: 11 },
    { day: '16', shots: 46, newCats: 14 },
    { day: '17', shots: 36, newCats: 8 },
    { day: '18', shots: 60, newCats: 19 },
    { day: '19', shots: 70, newCats: 24 },
    { day: '20', shots: 93, newCats: 28 },
    { day: '21', shots: 82, newCats: 18 },
  ],

  matching: {
    confirmed: 1284, // 같은 고양이 확정
    corrected: 396, // 새 고양이로 정정
    highScoreRate: 91, // 일치율 80%↑ 구간 수락률
  },

  // width: 막대 길이(%)
  levels: [
    { name: '산책 초보 Lv.1', users: '3,940명', width: 88 },
    { name: '골목 스카우터 Lv.3', users: '2,610명', width: 62 },
    { name: '동네 관찰자 Lv.5', users: '1,188명', width: 30 },
    { name: '고양이 박사 Lv.7', users: '674명', width: 17 },
  ],

  activity: [
    { time: '09:38', event: '같은 고양이로 확정', score: '92%', user: 'u_10241' },
    { time: '09:36', event: '새 고양이 등록', score: '—', user: 'u_08817' },
    { time: '09:31', event: '새 고양이로 정정', score: '78%', user: 'u_11902' },
    { time: '09:27', event: '같은 고양이로 확정', score: '85%', user: 'u_04410' },
    { time: '09:22', event: '레벨업 (Lv.3)', score: '—', user: 'u_07733' },
  ],
};
