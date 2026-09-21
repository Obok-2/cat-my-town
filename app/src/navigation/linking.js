import { getPathFromState as defaultGetPathFromState } from '@react-navigation/native';

// 웹에서 화면 이동에 맞춰 주소(URL)가 바뀌게 하는 설정. 네이티브 앱에서는 prefixes가 비어 있어 딥링크로 쓰이지 않는다.
// Capture(촬영 결과 → 이름 짓기 팝업)는 일부러 여기에 넣지 않는다 — 사진이 라우트 파라미터로 오가는데, 그걸 주소에 넣으면
// 웹에서는 아주 긴 data URI가 주소창에 박히고 새로고침하면 사진이 사라지기 때문이다.
export const linking = {
  prefixes: [],
  config: {
    screens: {
      Auth: 'login',
      Tabs: {
        path: '',
        screens: {
          Camera: 'camera',
          Collection: 'collection',
          Level: 'level',
        },
      },
      CatDetail: 'cat/:catId',
      Profile: 'profile',
    },
  },
  // 팝업이 열려 있는 동안에는 팝업 아래 화면(보통 /camera)의 주소를 그대로 유지한다.
  getPathFromState(state, config) {
    const routes = state.routes.filter((route) => route.name !== 'Capture');
    if (routes.length === state.routes.length || routes.length === 0) {
      return defaultGetPathFromState(state, config);
    }
    return defaultGetPathFromState(
      { ...state, routes, index: Math.min(state.index ?? routes.length - 1, routes.length - 1) },
      config
    );
  },
};

const TITLES = {
  Auth: '로그인',
  Camera: '촬영',
  Collection: '도감',
  Level: '레벨',
  CatDetail: '고양이 상세',
  Profile: '내 정보',
  MatchResult: '매칭 결과',
  Naming: '이름 짓기',
};

// 웹 탭 제목: "도감 · 우리동네고양이". 뒤로 가기·팝업 닫기 뒤에도 갱신되도록 App.js가 내비게이션 상태가 바뀔 때마다 호출한다.
export function formatDocumentTitle(route) {
  const title = TITLES[route?.name];
  return title ? `${title} · 우리동네고양이` : '우리동네고양이';
}
