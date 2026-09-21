// design/우리동네고양이_목업.pdf 기준 웜톤 크림 + 오렌지 강조 팔레트.
// 다크모드는 페이지7 "#1E1B18 기반 · 살구색 강조" 캡션을 기준으로 잡음.
// 목업이 정확한 헥스값을 명시하지 않아 근사치임 — 실제 제품화 시 디자이너 확인 필요.

export const light = {
  bg: '#F7F1E6',
  card: '#FBF6EC',
  cardAlt: '#F1E6D3',
  border: '#E8DCC8',
  text: '#3A3227',
  textMuted: '#8C8171',
  primary: '#DC7B3E',
  primarySoft: '#F1C9A6',
  onPrimary: '#FFFFFF',
  tagPeach: '#F5D9BE',
  tagMint: '#D7E9D6',
  tagBlue: '#D9E6EC',
  danger: '#C0524B',
  overlay: 'rgba(30, 27, 24, 0.55)',
};

export const dark = {
  bg: '#1E1B18',
  card: '#2A251F',
  cardAlt: '#332C24',
  border: '#3A332A',
  text: '#F1E9DC',
  textMuted: '#B3A896',
  primary: '#E8925A',
  primarySoft: '#4A3B2C',
  onPrimary: '#1E1B18',
  tagPeach: '#4A3B2C',
  tagMint: '#33402F',
  tagBlue: '#2B3A40',
  danger: '#E08A83',
  overlay: 'rgba(0, 0, 0, 0.65)',
};

export function paletteFor(scheme) {
  return scheme === 'dark' ? dark : light;
}
