import AsyncStorage from '@react-native-async-storage/async-storage';
import { computeLevel } from './levels';
import seedData from './seed.json';

const DAY_MS = 24 * 60 * 60 * 1000;

// ⚠️ 로컬 전용 목 데이터 레이어. server/ 가 비어있어 실제 API가 없다 — 기기 안 AsyncStorage에만 쌓인다.
// 데이터 모양은 design/우리동네고양이_목업.pdf 8페이지 "DATA SHAPE"를 그대로 따른다.
const KEYS = {
  cats: '@cat-my-town/cats',
  sightings: '@cat-my-town/sightings',
};

// 기획안 §위치: 정밀 좌표는 저장하지 않고 뭉갠 좌표만 쓴다. 소수점 5자리(약 1m)까지만 남긴다.
// (schema.sql의 sightings.latitude/longitude NUMERIC(8,5)와 같은 자릿수)
function roundCoord(value) {
  return Math.round(value * 1e5) / 1e5;
}

function newId(prefix) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

async function readJson(key, fallback) {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  return AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getCats() {
  return readJson(KEYS.cats, []);
}

export async function getCatById(catId) {
  const cats = await getCats();
  return cats.find((c) => c.id === catId) ?? null;
}

export async function getSightings() {
  return readJson(KEYS.sightings, []);
}

export async function getSightingsByCat(catId) {
  const sightings = await getSightings();
  return sightings.filter((s) => s.catId === catId).sort((a, b) => b.takenAt - a.takenAt);
}

export async function getUserLevelInfo() {
  const cats = await getCats();
  return computeLevel(cats.length);
}

// 신규 개체 등록 (매칭 결과 "아니에요, 새로운 고양이예요" → 이름 짓기 완료 시)
export async function registerNewCat({ name, tags, photoUri, memo }) {
  const cats = await getCats();
  const sightings = await getSightings();
  const beforeLevel = computeLevel(cats.length);

  const cat = {
    id: newId('cat'),
    name,
    tags: tags ?? [],
    photoUri: photoUri ?? null,
    sightingCount: 1,
    firstSeenAt: Date.now(),
  };
  const sighting = {
    id: newId('sighting'),
    catId: cat.id,
    photoUri: photoUri ?? null,
    takenAt: Date.now(),
    lat: null,
    lng: null,
    order: 1,
    memo: memo ?? '',
  };

  const nextCats = [cat, ...cats];
  await writeJson(KEYS.cats, nextCats);
  await writeJson(KEYS.sightings, [sighting, ...sightings]);

  const afterLevel = computeLevel(nextCats.length);
  return { cat, leveledUp: afterLevel.level > beforeLevel.level, levelInfo: afterLevel };
}

// 기존 개체 재목격 (매칭 결과 "맞아요, 같은 고양이예요")
export async function addSightingToCat(catId, { photoUri }) {
  const cats = await getCats();
  const sightings = await getSightings();
  const target = cats.find((c) => c.id === catId);
  if (!target) throw new Error('등록되지 않은 고양이입니다.');

  const catSightingCount = sightings.filter((s) => s.catId === catId).length;
  const sighting = {
    id: newId('sighting'),
    catId,
    photoUri: photoUri ?? null,
    takenAt: Date.now(),
    lat: null,
    lng: null,
    order: catSightingCount + 1,
    memo: '',
  };

  const nextCats = cats.map((c) =>
    c.id === catId ? { ...c, sightingCount: c.sightingCount + 1 } : c
  );
  await writeJson(KEYS.cats, nextCats);
  await writeJson(KEYS.sightings, [sighting, ...sightings]);

  return { cat: nextCats.find((c) => c.id === catId), sighting };
}

// ⚠️ 개발용 가라 데이터. seed.json의 이름·태그는 목업(design/우리동네고양이 UIUX 목업)의
// 예시 데이터를 그대로 가져왔다. 기존 도감을 통째로 덮어쓴다 — 확인 화면(ProfileScreen)에서만 호출.
export async function seedDemoData() {
  const now = Date.now();
  const cats = [];
  const sightings = [];

  for (const seedCat of seedData.cats) {
    const catId = newId('cat');
    const explicit = seedData.sightingsByCatName[seedCat.name] ?? [];
    const entries = [...explicit];
    while (entries.length < seedCat.sightingCount) {
      const spread = Math.max(seedCat.firstSeenDaysAgo, 1);
      entries.push({ daysAgo: Math.floor(Math.random() * spread), memo: '' });
    }
    entries.sort((a, b) => b.daysAgo - a.daysAgo);

    entries.forEach((entry, i) => {
      // 고양이별 기준 좌표에서 조금씩 흩어서 핀이 겹치지 않게 한다(약 ±250m).
      const spreadDeg = 0.0022;
      sightings.push({
        id: newId('sighting'),
        catId,
        photoUri: null,
        takenAt: now - entry.daysAgo * DAY_MS,
        lat: roundCoord(seedCat.lat + (Math.random() - 0.5) * spreadDeg),
        lng: roundCoord(seedCat.lng + (Math.random() - 0.5) * spreadDeg),
        order: i + 1,
        memo: entry.memo ?? '',
      });
    });

    cats.push({
      id: catId,
      name: seedCat.name,
      tags: seedCat.tags,
      photoUri: null,
      sightingCount: seedCat.sightingCount,
      firstSeenAt: now - seedCat.firstSeenDaysAgo * DAY_MS,
    });
  }

  await writeJson(KEYS.cats, cats);
  await writeJson(KEYS.sightings, sightings);
  return cats;
}

export async function clearAllCats() {
  await writeJson(KEYS.cats, []);
  await writeJson(KEYS.sightings, []);
}
