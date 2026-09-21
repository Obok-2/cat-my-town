// 목업 a10 "레벨" 등급표. 등급은 새로 만난(등록한) 고양이 수로 올라간다 — 같은 고양이를 다시 만나도 오르지 않는다.
// 기존 README §레벨/도감 시스템 표(초보 캣워처~고양이 마스터)와 다르다. 목업이 더 최신이라 목업을 따랐다.
export const LEVELS = [
  { level: 1, title: '산책 초보', min: 1 },
  { level: 2, title: '골목 탐험가', min: 5 },
  { level: 3, title: '골목 스카우터', min: 12 },
  { level: 4, title: '동네 관찰자', min: 16 },
  { level: 5, title: '고양이 박사', min: 30 },
];

// ratio: 현재 등급 안에서 다음 등급까지의 진행률(0~1). 최고 등급은 1.
export function computeLevel(catCount) {
  const current = [...LEVELS].reverse().find((l) => catCount >= l.min);
  if (!current) {
    return { level: 0, title: LEVELS[0].title, catCount, ratio: 0, remainToNext: LEVELS[0].min - catCount };
  }
  const next = LEVELS.find((l) => l.level === current.level + 1);
  if (!next) {
    return { level: current.level, title: current.title, catCount, ratio: 1, remainToNext: 0 };
  }
  return {
    level: current.level,
    title: current.title,
    catCount,
    ratio: (catCount - current.min) / (next.min - current.min),
    remainToNext: next.min - catCount,
  };
}
