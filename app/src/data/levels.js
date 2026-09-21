// 기획안 §3-3 레벨/도감 시스템. 관리자 CMS 목업(6페이지)의 "산책 초보/동네 관찰자/고양이 박사"는
// 대시보드 예시 수치일 뿐이고, 기획안 표가 정본이라 그걸 따른다.
export const LEVELS = [
  { level: 1, title: '초보 캣워처', min: 1, max: 4 },
  { level: 2, title: '동네 탐정', min: 5, max: 9 },
  { level: 3, title: '골목 스카우터', min: 10, max: 19 },
  { level: 4, title: '고양이 마스터', min: 20, max: Infinity },
];

export function computeLevel(catCount) {
  if (catCount <= 0) {
    return { level: 0, title: LEVELS[0].title, catCount, ratio: 0, remainToNext: LEVELS[0].min };
  }
  const bracket = LEVELS.find((l) => catCount >= l.min && catCount <= l.max) ?? LEVELS[LEVELS.length - 1];
  const span = bracket.max === Infinity ? bracket.min : bracket.max - bracket.min + 1;
  const progressed = catCount - bracket.min + 1;
  const ratio = bracket.max === Infinity ? 1 : Math.min(1, progressed / span);
  const remainToNext = bracket.max === Infinity ? 0 : bracket.max - catCount + 1;
  return { level: bracket.level, title: bracket.title, catCount, ratio, remainToNext };
}
