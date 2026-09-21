import { selectCandidates } from './matchConfig';

// ⚠️ 목데이터 — 실제 매칭이 아니다.
// 기획안 §3-1의 진짜 파이프라인(Voyage AI 임베딩 + pgvector 코사인 유사도 + Claude 설명 생성)은
// server/ 가 아직 비어 있어 쓸 수 없다. 백엔드가 생기기 전까지 화면 흐름만 검증하는 자리표시자.
export const TRAIT_TAG_POOL = [
  '턱시도',
  '삼색이',
  '치즈 태비',
  '고등어 태비',
  '올블랙',
  '올화이트',
  '코숏',
  '스코티시폴드로 추정',
  '페르시안으로 추정',
  '한쪽 귀 끝이 접힘',
];

function pickRandomTags(count) {
  const pool = [...TRAIT_TAG_POOL];
  const picked = [];
  while (picked.length < count && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

// cats: 현재 사용자가 등록한 고양이 목록. 등록된 고양이마다 무작위 일치율(0.35 ~ 0.95)을 매기고,
// 기준(MATCH_THRESHOLD) 이상인 것만 일치율 높은 순으로 최대 3개를 candidates 로 돌려준다.
// candidates 가 비어 있으면(신규 사용자이거나 전부 기준 미만) 새 고양이로 취급한다.
export function mockMatchAgainstExisting(cats) {
  const tags = pickRandomTags(2);
  const scored = (cats ?? []).map((cat) => ({
    cat,
    score: Math.round((Math.random() * 0.6 + 0.35) * 100) / 100,
  }));
  return { tags, candidates: selectCandidates(scored) };
}
