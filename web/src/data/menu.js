// 사이드바 메뉴 — 현재 구현된 페이지는 dashboard 뿐, 나머지는 "작업 중" 화면으로 연결된다.
export const MENU = [
  { route: 'dashboard', label: '대시보드', ready: true },
  { route: 'users', label: '사용자', ready: false },
  { route: 'cats', label: '등록 고양이', ready: false },
  { route: 'matching', label: 'AI 매칭 품질', ready: false },
  { route: 'reports', label: '신고 · 문의', ready: false },
  { route: 'settings', label: '설정', ready: false },
];

export const DEFAULT_ROUTE = 'dashboard';
