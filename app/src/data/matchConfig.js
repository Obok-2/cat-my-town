// 매칭 결과 화면 분기 기준. 서버 연동 전까지는 앱 상수로 두고, 연동하면 서버 설정값으로 옮긴다.
// 기획안 §3-1 "신뢰도" 보정값과 마찬가지로 실제 사용 데이터를 보고 조정할 값이다.
export const MATCH_THRESHOLD = 0.6; // 일치율 60% 이상 → 기존 고양이 후보 선택 / 미만 → 새 고양이 등록
export const MAX_CANDIDATES = 3; // 후보 최대 개수

// scored: [{ cat, score(0~1) }]. 기준 이상만 남겨 일치율 높은 순으로 최대 MAX_CANDIDATES개.
export function selectCandidates(scored) {
  return scored
    .filter((item) => item.score >= MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_CANDIDATES);
}
