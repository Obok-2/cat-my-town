import AsyncStorage from '@react-native-async-storage/async-storage';
import { computeLevel } from './levels';
import seedData from './seed.json';

const DAY_MS = 24 * 60 * 60 * 1000;

// ⚠️ 로컬 전용 목 데이터 레이어. server/ 가 비어있어 실제 API가 없다 — 기기 안 AsyncStorage에만 쌓인다.
// 데이터 모양은 design/우리동네고양이_목업.pdf 8페이지 "DATA SHAPE"를 그대로 따른다.
const KEYS = {
  user: '@cat-my-town/user',
  cats: '@cat-my-town/cats',
  sightings: '@cat-my-town/sightings',
};

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

export async function getUser() {
  return readJson(KEYS.user, { loggedIn: false, displayName: null });
}

// 목업 9페이지: 회원가입 없이 구글 소셜 로그인 버튼 하나. 실제 Firebase 연동 전까지는
// 버튼을 누르면 바로 로그인 처리하는 자리표시자다.
export async function loginWithGoogleMock(displayName = '산책자') {
  const user = { loggedIn: true, displayName };
  await writeJson(KEYS.user, user);
  return user;
}

export async function logout() {
  const user = { loggedIn: false, displayName: null };
  await writeJson(KEYS.user, user);
  return user;
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
      sightings.push({
        id: newId('sighting'),
        catId,
        photoUri: null,
        takenAt: now - entry.daysAgo * DAY_MS,
        lat: null,
        lng: null,
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
