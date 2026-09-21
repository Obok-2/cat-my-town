# 우리동네고양이 앱 REST API 인터페이스 정의서

## 1. 문서 개요

### 1.1 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 우리동네고양이 앱 REST API 인터페이스 정의서 |
| 대상 | 모바일 앱(`app/`) ↔ 백엔드(`server/`) |
| 버전 / 상태 | v0.1 / **초안(검토 전)** — 서버 컨트롤러가 아직 없어 모든 인터페이스가 **미구현** |
| 작성일 | 2026-09-21 |
| 기준 자료 | 앱 코드(`app/src/data/store.js`·`levels.js`·`matchConfig.js`), 새 UIUX 목업(a0~a10), `산출물/schema.sql`, `README.md` |
| 제외 범위 | 관리자 웹(`web/`)용 API — 관리자 인증·통계는 별도 문서 |

### 1.2 표기 규칙

| 표기 | 의미 |
|---|---|
| 필수 | `Y` 반드시 보냄 / `N` 생략 가능 |
| `Long` | 64비트 정수(DB `BIGINT`) |
| `Integer` | 32비트 정수 |
| `Decimal` | 소수 |
| `String` | 문자열(UTF-8). 괄호는 허용 길이, 예: `String(1~12)` |
| `Boolean` | `true` / `false` |
| `DateTime` | ISO 8601 + 오프셋 (`2026-09-21T18:24:00+09:00`) |
| `Array<T>` | T의 배열 |
| null 허용 | 응답 표의 `Null` 열이 `Y`면 값이 `null`일 수 있음 |

### 1.3 문서 이력

| 버전 | 일자 | 내용 |
|---|---|---|
| v0.1 | 2026-09-21 | 최초 작성(초안) |

---

## 2. 공통 사항

### 2.1 통신 규약

| 항목 | 내용 |
|---|---|
| Base URL | `/api/v1` (로컬: `http://localhost:8080/api/v1`) |
| 프로토콜 | HTTP/1.1 REST. 운영은 HTTPS |
| 데이터 형식 | JSON(UTF-8). 사진 업로드(IF-MATCH-001)만 `multipart/form-data` |
| 타임존 | Asia/Seoul (`+09:00`) |
| ID | 숫자(`Long`). 단, 매칭 ID(`matchId`)는 UUID 문자열 |

### 2.2 인증·소유 범위

| 항목 | 내용 |
|---|---|
| 인증 방식 | Firebase Authentication(Google). 앱이 받은 **Firebase ID 토큰**을 `Authorization: Bearer <토큰>` 헤더로 보낸다 |
| 서버 검증 | Firebase Admin으로 토큰을 검증하고 `google_uid`로 사용자(`users`)를 찾는다 |
| 인증 제외 | 없음 — 모든 인터페이스가 인증 필요(로그인 IF-AUTH-001도 토큰을 보낸다) |
| 소유 범위 | 도감은 **사용자별로 완전히 분리**. 모든 조회·검색은 로그인한 사용자의 데이터로만 제한한다 |
| 타인 데이터 | 다른 사용자의 고양이·매칭에 접근하면 존재하지 않는 것처럼 `404`(존재 여부를 알리지 않기 위해 `403`을 쓰지 않음) |
| 로그아웃 | Firebase `signOut()`만 하면 되고 서버 호출은 없다(서버는 토큰만 검증하는 무상태) |

### 2.3 공통 요청 헤더

| 헤더 | 필수 | 값 | 설명 |
|---|---|---|---|
| `Authorization` | Y | `Bearer <Firebase ID 토큰>` | 인증 |
| `Content-Type` | 본문이 있을 때 Y | `application/json` 또는 `multipart/form-data` | |
| `Accept` | N | `application/json` | |

### 2.4 공통 응답 규칙

| 항목 | 내용 |
|---|---|
| 성공 | 별도 래퍼 없이 **리소스 JSON을 그대로** 반환한다. 본문이 없는 성공은 `204` |
| 일치율(`score`) | **0~100** 숫자(소수 2자리). 앱 목데이터는 0~1이라 연동 시 ×100 기준으로 통일 |
| 사진 URL(`photoUrl`) | 사진은 **비공개 버킷(MinIO)** 에 있고, `photoUrl`은 **만료되는 presigned URL**(예: 1시간). 앱은 그대로 이미지 주소로 쓴다 |
| 좌표 | 정밀 좌표는 저장·응답하지 않는다. **뭉갠 좌표**(소수 5자리 미만으로 절삭)만 다룬다 |
| 목록 | 페이징 없음(MVP, 개인 도감이라 수가 적음). 정렬은 각 인터페이스에 명시 |

### 2.5 공통 에러 응답 형식

```json
{ "code": "MATCH_EXPIRED", "message": "매칭 시간이 지났어요. 다시 촬영해 주세요." }
```

| 항목 | 타입 | 설명 |
|---|---|---|
| `code` | String | 에러 식별 코드(아래 표) |
| `message` | String | 사용자에게 그대로 보여줄 수 있는 한글 문구 |

### 2.6 공통 에러 코드

| HTTP | code | 발생 조건 | 앱 처리 |
|---|---|---|---|
| 400 | `INVALID_REQUEST` | 필수값 누락·형식/길이 위반(이름 비었음 등) | 입력 화면에 메시지 표시 |
| 401 | `UNAUTHORIZED` | 토큰 없음·만료·위조 | Firebase 토큰 갱신 후 1회 재시도, 실패하면 로그인 화면 |
| 404 | `NOT_FOUND` | 없는 리소스(남의 것 포함) | 도감으로 돌아가기 |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 | "잠시 후 다시 시도" |

> 각 인터페이스에서만 발생하는 에러 코드(`MATCH_*`, `NO_CAT_DETECTED` 등)는 해당 인터페이스 표에 적는다.

### 2.7 공통 데이터 객체

여러 인터페이스의 응답에 공통으로 쓰는 객체.

**User**

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `id` | Long | N | 사용자 ID |
| `displayName` | String | Y | 앱에 보여줄 이름(닉네임) |
| `level` | Integer | N | 캐싱된 레벨(0=미등록, 1~5) |
| `createdAt` | DateTime | N | 가입 일시 |

**LevelInfo**

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `level` | Integer | N | 현재 레벨(0=고양이 0마리, 1~5) |
| `title` | String | N | 등급 이름. 0마리면 Lv.1 이름("산책 초보") |
| `catCount` | Integer | N | 등록한 고양이 수 |
| `ratio` | Decimal | N | 현재 등급 안에서 다음 등급까지의 진행률(0~1). 최고 등급이면 `1` |
| `remainToNext` | Integer | N | 다음 등급까지 남은 마리 수. 최고 등급이면 `0` |
| `nextTitle` | String | Y | 다음 등급 이름. 최고 등급이면 `null` |

**Cat**

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `id` | Long | N | 고양이 ID |
| `name` | String | N | 사용자가 지어준 이름 |
| `tags` | Array<String> | N | 특징 태그(없으면 빈 배열) |
| `photoUrl` | String | Y | 대표 사진 = **첫 목격(등록 시) 사진** |
| `sightingCount` | Integer | N | 만난 횟수(목격 기록 수) |
| `createdAt` | DateTime | N | 첫 만남(등록) 일시 |

**Sighting**

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `id` | Long | N | 목격 ID |
| `seq` | Integer | N | 그 고양이의 몇 번째 만남인지(1부터). 서버가 계산 — 타임라인의 ①②③ 번호 |
| `photoUrl` | String | N | 촬영 사진 |
| `takenAt` | DateTime | N | 촬영 일시 |
| `memo` | String | Y | 목격 메모(최대 200자) |
| `latitude` | Decimal | Y | 뭉갠 위도 |
| `longitude` | Decimal | Y | 뭉갠 경도 |

**Candidate** (매칭 후보)

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `catId` | Long | N | 후보 고양이 ID |
| `name` | String | N | 이름 |
| `photoUrl` | String | Y | 대표 사진 |
| `tags` | Array<String> | N | 특징 태그 |
| `sightingCount` | Integer | N | 만난 횟수 |
| `score` | Decimal | N | 보정된 일치율(0~100) |

---

## 3. 인터페이스 목록

| 인터페이스 ID | 인터페이스명 | Method | URL | 호출 화면 | 우선순위 | 상태 |
|---|---|---|---|---|---|---|
| IF-AUTH-001 | 로그인/가입 처리 | POST | `/auth/login` | 로그인(a1) | 필수 | 미구현 |
| IF-ME-001 | 내 정보 조회 | GET | `/me` | 앱 시작, 내 정보 | 필수 | 미구현 |
| IF-ME-002 | 내 레벨 조회 | GET | `/me/level` | 도감(a6), 레벨(a10) | 필수 | 미구현 |
| IF-ME-003 | 이번 주 만난 수 조회 | GET | `/me/stats/week` | 홈 카메라(a2) | 필수 | 미구현 |
| IF-ME-004 | 회원 탈퇴 | DELETE | `/me` | 내 정보 | 후순위 | 미구현 |
| IF-CFG-001 | 등급표 조회 | GET | `/levels` | 레벨(a10) | 필수 | 미구현 |
| IF-CFG-002 | 앱 설정 조회 | GET | `/config/app` | 매칭 결과(a3·a4), 이름 짓기(a5) | 필수 | 미구현 |
| IF-CAT-001 | 도감 목록 조회 | GET | `/cats` | 도감(a6) | 필수 | 미구현 |
| IF-CAT-002 | 고양이 상세 조회 | GET | `/cats/{catId}` | 고양이 상세(a7) | 필수 | 미구현 |
| IF-CAT-003 | 목격 기록 목록 조회 | GET | `/cats/{catId}/sightings` | 고양이 상세(a7) | 필수 | 미구현 |
| IF-CAT-004 | 고양이 정보 수정 | PATCH | `/cats/{catId}` | 고양이 상세 ⋯ 메뉴 | 선택(앱 미구현) | 미구현 |
| IF-CAT-005 | 고양이 삭제 | DELETE | `/cats/{catId}` | 고양이 상세 ⋯ 메뉴 | 선택(앱 미구현) | 미구현 |
| IF-MATCH-001 | AI 매칭 요청 | POST | `/matches` | 홈 카메라(a2) → 매칭 결과(a3·a4) | 필수 | 미구현 |
| IF-MATCH-002 | 기존 고양이로 확정 | POST | `/matches/{matchId}/confirm` | 매칭 결과(a3) | 필수 | 미구현 |
| IF-MATCH-003 | 새 고양이 등록 | POST | `/matches/{matchId}/register` | 이름 짓기(a5), 레벨업(a8) | 필수 | 미구현 |
| IF-DEV-001 | 데모 데이터 채우기 | POST | `/dev/seed` | 내 정보(개발용) | 개발 전용 | 미구현 |
| IF-DEV-002 | 도감 비우기 | DELETE | `/dev/cats` | 내 정보(개발용) | 개발 전용 | 미구현 |

### 촬영 흐름 (IF-MATCH-001~003)

사진은 IF-MATCH-001에서 **한 번만** 올린다. 서버가 `matchId`로 사진·임베딩·후보·AI 태그를 임시 보관(30분)하고, 이후 단계는 `matchId`만 보낸다.

```
POST /matches ─┬─► candidates 1~3명 ─┬─ POST /matches/{id}/confirm   (이 고양이예요)
               │                     └─ POST /matches/{id}/register  (새로운 고양이예요 → 이름 짓기)
               └─► candidates 비어 있음 ── POST /matches/{id}/register (새로운 친구를 발견했어요!)
```

---

## 4. 인터페이스 상세

### IF-AUTH-001 로그인/가입 처리

| 항목 | 내용 |
|---|---|
| 설명 | 앱이 구글 로그인(Firebase)으로 ID 토큰을 받은 직후 1회 호출한다. `users`에 해당 `google_uid`가 없으면 새로 만든다(별도 회원가입 화면 없음) |
| Method / URL | `POST /api/v1/auth/login` |
| 호출 화면 | 로그인(a1) |

**Request** — Header: `Authorization`(공통) / Path·Query·Body: 없음

**Response `200`**

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `user` | User | N | 사용자 정보(2.7) |
| `isNewUser` | Boolean | N | 이번 호출로 가입되었으면 `true` |

**에러**: `401 UNAUTHORIZED`

```json
{ "user": { "id": 1, "displayName": "산책자", "level": 3, "createdAt": "2026-04-02T09:00:00+09:00" }, "isNewUser": false }
```

---

### IF-ME-001 내 정보 조회

| 항목 | 내용 |
|---|---|
| 설명 | 로그인한 사용자의 정보를 조회한다(앱 재시작 후 로그인 상태 복원용) |
| Method / URL | `GET /api/v1/me` |
| 호출 화면 | 앱 시작, 내 정보 |

**Request** — 없음(헤더만)

**Response `200`**: `User`(2.7)

**에러**: `401 UNAUTHORIZED`

---

### IF-ME-002 내 레벨 조회

| 항목 | 내용 |
|---|---|
| 설명 | 도감 상단 카드·레벨 탭이 쓰는 현재 등급/진행률. 등급은 **새로 등록한 고양이 수** 기준이며(같은 고양이를 다시 만나도 오르지 않음) 등록 시점에 `users.level`에 캐싱된 값을 기준으로 한다 |
| Method / URL | `GET /api/v1/me/level` |
| 호출 화면 | 도감(a6), 레벨(a10) — 화면에 돌아올 때마다 다시 호출 |

**Request** — 없음

**Response `200`**: `LevelInfo`(2.7)

**에러**: `401 UNAUTHORIZED`

```json
{ "level": 3, "title": "골목 스카우터", "catCount": 13, "ratio": 0.25, "remainToNext": 3, "nextTitle": "동네 관찰자" }
```

---

### IF-ME-003 이번 주 만난 수 조회

| 항목 | 내용 |
|---|---|
| 설명 | 홈 카메라 하단 "이번 주에 N마리를 만났어요" 문구용. 최근 7일 기준 |
| Method / URL | `GET /api/v1/me/stats/week` |
| 호출 화면 | 홈 카메라(a2) — 화면에 돌아올 때마다 다시 호출 |

**Request** — 없음

**Response `200`**

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `sightingCount` | Integer | N | 최근 7일 목격(촬영) 횟수 |
| `catCount` | Integer | N | 최근 7일 동안 만난 **서로 다른 고양이 수** |

- 화면 문구가 "마리"이므로 `catCount`를 쓰는 게 맞다. 현재 앱은 횟수(`sightingCount` 상당)를 세고 있다(7장 참고)

**에러**: `401 UNAUTHORIZED`

---

### IF-ME-004 회원 탈퇴

| 항목 | 내용 |
|---|---|
| 설명 | 사용자와 그 사용자의 고양이·목격 기록·태그·사진을 **모두 삭제**한다(`ON DELETE CASCADE` + MinIO 사진 삭제). 되돌릴 수 없다. 스토어 정책상 앱 안 탈퇴가 필요해서 넣은 것으로 MVP에서는 후순위 |
| Method / URL | `DELETE /api/v1/me` |
| 호출 화면 | 내 정보 |

**Request** — 없음 / **Response `204`** — 본문 없음 / **에러**: `401 UNAUTHORIZED`

---

### IF-CFG-001 등급표 조회

| 항목 | 내용 |
|---|---|
| 설명 | 레벨 탭의 등급표 전체. 거의 바뀌지 않는 값이라 앱이 캐시해도 된다. 서버가 정본이며 앱의 `levels.js` 상수를 대체한다 |
| Method / URL | `GET /api/v1/levels` |
| 호출 화면 | 레벨(a10) |

**Request** — 없음

**Response `200`**

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `levels` | Array<Object> | N | 등급 목록(낮은 등급부터) |
| `levels[].level` | Integer | N | 등급 번호(1~5) |
| `levels[].title` | String | N | 등급 이름 |
| `levels[].minCats` | Integer | N | 이 등급이 되는 최소 등록 고양이 수 |

**에러**: `401 UNAUTHORIZED`

```json
{ "levels": [
  { "level": 1, "title": "산책 초보",     "minCats": 1 },
  { "level": 2, "title": "골목 탐험가",   "minCats": 5 },
  { "level": 3, "title": "골목 스카우터", "minCats": 12 },
  { "level": 4, "title": "동네 관찰자",   "minCats": 16 },
  { "level": 5, "title": "고양이 박사",   "minCats": 30 }
] }
```

---

### IF-CFG-002 앱 설정 조회

| 항목 | 내용 |
|---|---|
| 설명 | 앱에 하드코딩되어 있던 매칭 기준값(`matchConfig.js`)과 입력 제한을 서버 값으로 옮긴 것. 값을 조정해도 앱 배포가 필요 없다 |
| Method / URL | `GET /api/v1/config/app` |
| 호출 화면 | 매칭 결과(a3·a4), 이름 짓기(a5) — 앱 시작 시 1회 조회 후 캐시 |

**Request** — 없음

**Response `200`**

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `matchThreshold` | Integer | N | 일치율이 이 값 이상인 고양이만 후보로 보여준다(현재 40) |
| `matchHigh` | Integer | N | 이 값 이상이면 초록 "매우 비슷해요", 미만이면 주황 "조금 비슷해요"(현재 70) |
| `maxCandidates` | Integer | N | 후보 최대 인원(현재 3) |
| `nameMaxLength` | Integer | N | 고양이 이름 최대 글자 수(현재 12) |

**에러**: `401 UNAUTHORIZED`

```json
{ "matchThreshold": 40, "matchHigh": 70, "maxCandidates": 3, "nameMaxLength": 12 }
```

---

### IF-CAT-001 도감 목록 조회

| 항목 | 내용 |
|---|---|
| 설명 | 내가 등록한 고양이 전체(필터·검색 없음). **최근 등록한 순**으로 정렬한다 |
| Method / URL | `GET /api/v1/cats` |
| 호출 화면 | 도감(a6) — 화면에 돌아올 때마다 다시 호출(등록 직후 바로 반영되어야 함) |

**Request** — 없음

**Response `200`**

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `cats` | Array<Cat> | N | 고양이 목록(0마리면 빈 배열) |

**에러**: `401 UNAUTHORIZED`

```json
{ "cats": [
  { "id": 12, "name": "양말이", "tags": ["턱시도", "코 옆 흰 점"], "photoUrl": "https://…", "sightingCount": 7, "createdAt": "2026-04-02T09:00:00+09:00" }
] }
```

---

### IF-CAT-002 고양이 상세 조회

| 항목 | 내용 |
|---|---|
| 설명 | 고양이 한 마리의 기본 정보 |
| Method / URL | `GET /api/v1/cats/{catId}` |
| 호출 화면 | 고양이 상세(a7) |

**Request**

| 구분 | 항목 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| Path | `catId` | Long | Y | 고양이 ID |

**Response `200`**: `Cat`(2.7)

**에러**: `401 UNAUTHORIZED`, `404 NOT_FOUND`

---

### IF-CAT-003 목격 기록 목록 조회

| 항목 | 내용 |
|---|---|
| 설명 | 목격 타임라인과 미니맵 핀이 함께 쓴다. **최신순** |
| Method / URL | `GET /api/v1/cats/{catId}/sightings` |
| 호출 화면 | 고양이 상세(a7) |

**Request**

| 구분 | 항목 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| Path | `catId` | Long | Y | 고양이 ID |

**Response `200`**

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `sightings` | Array<Sighting> | N | 목격 기록(최신순) |

**에러**: `401 UNAUTHORIZED`, `404 NOT_FOUND`

```json
{ "sightings": [
  { "id": 301, "seq": 7, "photoUrl": "https://…", "takenAt": "2026-09-14T18:24:00+09:00",
    "memo": "놀이터 미끄럼틀 밑", "latitude": 37.56512, "longitude": 126.97831 }
] }
```

---

### IF-CAT-004 고양이 정보 수정 (선택)

| 항목 | 내용 |
|---|---|
| 설명 | 이름·태그를 수정한다. 보낸 필드만 바꾼다. 목업 a7의 "⋯" 메뉴가 생기면 사용(앱 미구현) |
| Method / URL | `PATCH /api/v1/cats/{catId}` |
| 호출 화면 | 고양이 상세 ⋯ 메뉴 |

**Request**

| 구분 | 항목 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| Path | `catId` | Long | Y | 고양이 ID |
| Body | `name` | String(1~12) | N | 새 이름 |
| Body | `tags` | Array<String(1~30)> | N | 새 태그 전체(통째로 교체, 중복 불가) |

- `name`과 `tags` 중 **하나 이상** 필요

**Response `200`**: `Cat`(수정 후)

**에러**: `400 INVALID_REQUEST`, `401 UNAUTHORIZED`, `404 NOT_FOUND`

---

### IF-CAT-005 고양이 삭제 (선택)

| 항목 | 내용 |
|---|---|
| 설명 | 고양이와 그 목격 기록·태그·사진을 삭제한다. 삭제 후 **레벨이 다시 계산**된다 |
| Method / URL | `DELETE /api/v1/cats/{catId}` |
| 호출 화면 | 고양이 상세 ⋯ 메뉴 |

**Request**: Path `catId`(Long, 필수) / **Response `204`** — 본문 없음 / **에러**: `401 UNAUTHORIZED`, `404 NOT_FOUND`

---

### IF-MATCH-001 AI 매칭 요청

| 항목 | 내용 |
|---|---|
| 설명 | 사진을 올려 AI 매칭을 시작한다. 서버는 ① 이미지 임베딩 생성(Voyage AI) → ② 내 고양이들과 유사도 검색(pgvector, **내 것만**) → ③ 일치율 보정 → ④ 기준(`matchThreshold`) 이상만 높은 순으로 최대 `maxCandidates`명 선택 → ⑤ 특징 태그 판별(Claude)을 수행한다. **AI 호출이 있어 수 초 걸릴 수 있다**(앱은 로딩 표시) |
| Method / URL | `POST /api/v1/matches` |
| 호출 화면 | 홈 카메라(a2) 셔터 → 매칭 결과(a3·a4) |
| Content-Type | `multipart/form-data` |

**Request Body**

| 항목 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `photo` | File(JPEG, 최대 10MB) | Y | 촬영 사진(앱은 `expo-camera` quality 0.7) |
| `takenAt` | DateTime | N | 촬영 시각. 없으면 서버 시각 |
| `latitude` | Decimal | N | 촬영 위도. 서버가 뭉개서 저장 |
| `longitude` | Decimal | N | 촬영 경도. 서버가 뭉개서 저장 |

**Response `201`**

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `matchId` | String(UUID) | N | 매칭 ID. 이후 단계에서 사용, **한 번만 확정 가능** |
| `expiresAt` | DateTime | N | 만료 시각(생성 후 30분) |
| `photoUrl` | String | N | 올린 사진 |
| `tags` | Array<String> | N | AI가 찾은 특징 태그(없으면 빈 배열) |
| `candidates` | Array<Candidate> | N | 후보(일치율 높은 순). **빈 배열이면 "새로운 친구를 발견했어요!"(a4)** |

**에러**

| HTTP | code | 발생 조건 |
|---|---|---|
| 400 | `INVALID_REQUEST` | `photo` 누락·형식 오류 |
| 401 | `UNAUTHORIZED` | 토큰 오류 |
| 413 | `PAYLOAD_TOO_LARGE` | 사진이 10MB 초과 |
| 422 | `NO_CAT_DETECTED` | 사진에서 고양이를 찾지 못함 |
| 503 | `MATCH_UNAVAILABLE` | AI 서버(Voyage/Claude) 장애 |

```json
{
  "matchId": "b1f0c6a2-7d3e-4c1a-9a55-0d6f2f4c9e11",
  "expiresAt": "2026-09-21T18:54:00+09:00",
  "photoUrl": "https://…",
  "tags": ["턱시도 무늬", "코 옆 흰 점", "스코티시폴드로 추정"],
  "candidates": [
    { "catId": 12, "name": "양말이", "photoUrl": "https://…", "tags": ["턱시도"], "sightingCount": 6, "score": 84.0 },
    { "catId": 15, "name": "구름",   "photoUrl": "https://…", "tags": ["장모 흰냥"], "sightingCount": 3, "score": 61.0 }
  ]
}
```

---

### IF-MATCH-002 기존 고양이로 확정

| 항목 | 내용 |
|---|---|
| 설명 | 후보 카드의 **[이 고양이예요]**. 선택한 고양이에 목격 기록을 추가한다. 기존 고양이의 목격만 늘어나므로 **레벨은 바뀌지 않는다** |
| Method / URL | `POST /api/v1/matches/{matchId}/confirm` |
| 호출 화면 | 매칭 결과(a3) |

**Request**

| 구분 | 항목 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| Path | `matchId` | String(UUID) | Y | IF-MATCH-001의 `matchId` |
| Body | `catId` | Long | Y | 선택한 고양이. 그 매칭의 `candidates` 안에 있어야 함 |
| Body | `memo` | String(0~200) | N | 목격 메모 |

**Response `201`**

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `cat` | Cat | N | 갱신된 고양이(`sightingCount` 증가) |
| `sighting` | Sighting | N | 새로 만들어진 목격 기록 |

**에러**

| HTTP | code | 발생 조건 |
|---|---|---|
| 400 | `INVALID_CANDIDATE` | `catId`가 그 매칭의 후보에 없음 |
| 404 | `NOT_FOUND` | 없는 `matchId`(남의 것 포함) |
| 409 | `MATCH_ALREADY_RESOLVED` | 이미 확정/등록된 매칭(중복 탭·재시도) |
| 410 | `MATCH_EXPIRED` | 매칭 만료(30분 경과) |

```json
{ "cat": { "id": 12, "name": "양말이", "tags": ["턱시도"], "photoUrl": "https://…", "sightingCount": 7, "createdAt": "2026-04-02T09:00:00+09:00" },
  "sighting": { "id": 302, "seq": 7, "photoUrl": "https://…", "takenAt": "2026-09-21T18:24:00+09:00", "memo": null, "latitude": null, "longitude": null } }
```

---

### IF-MATCH-003 새 고양이 등록

| 항목 | 내용 |
|---|---|
| 설명 | **[새로운 고양이예요]**(또는 후보 없음) → 이름 짓기 화면의 **[도감에 등록하기]**. 새 고양이(`cats`)와 첫 목격(`sightings`), 태그(`cat_tags`)를 만들고 이 사진의 임베딩을 **대표 임베딩**으로 저장한다. `users.level` 캐시도 갱신한다 |
| Method / URL | `POST /api/v1/matches/{matchId}/register` |
| 호출 화면 | 이름 짓기(a5), 레벨업 팝업(a8) |

**Request**

| 구분 | 항목 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| Path | `matchId` | String(UUID) | Y | IF-MATCH-001의 `matchId` |
| Body | `name` | String(1~12) | Y | 고양이 이름. 공백만은 불가. 최대 길이는 IF-CFG-002 `nameMaxLength` |
| Body | `tags` | Array<String(1~30)> | N | 사용자가 수정·추가한 최종 태그(AI 제안 `tags`를 편집). 같은 고양이에 중복 불가 |
| Body | `memo` | String(0~200) | N | 첫 만남 메모 |

**Response `201`**

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `cat` | Cat | N | 새로 등록된 고양이 |
| `sighting` | Sighting | N | 첫 목격 기록(`seq`=1) |
| `levelUp.leveledUp` | Boolean | N | 이번 등록으로 등급이 올랐으면 `true` → 앱이 **레벨업 팝업(a8)** 표시 |
| `levelUp.level` | LevelInfo | N | 등록 후 레벨 정보. 팝업 문구·진행바를 이 값으로 채운다(`GET /me/level`을 다시 부르지 않아도 됨) |

**에러**: `400 INVALID_REQUEST`(이름 규칙 위반 등), `404 NOT_FOUND`, `409 MATCH_ALREADY_RESOLVED`, `410 MATCH_EXPIRED`

```json
{
  "cat": { "id": 21, "name": "양말이", "tags": ["턱시도", "한쪽 귀 끝이 잘림"], "photoUrl": "https://…", "sightingCount": 1, "createdAt": "2026-09-21T18:24:00+09:00" },
  "sighting": { "id": 303, "seq": 1, "photoUrl": "https://…", "takenAt": "2026-09-21T18:24:00+09:00", "memo": "골목 담벼락 위에서 졸고 있었다", "latitude": null, "longitude": null },
  "levelUp": { "leveledUp": true, "level": { "level": 2, "title": "골목 탐험가", "catCount": 5, "ratio": 0.0, "remainToNext": 7, "nextTitle": "골목 스카우터" } }
}
```

---

### IF-DEV-001 / IF-DEV-002 개발 전용

| 항목 | IF-DEV-001 | IF-DEV-002 |
|---|---|---|
| 설명 | 데모 데이터(양말이·치즈·구름·까망이·삼색이·귀돌이)로 내 도감을 **덮어써서 채운다** | 내 도감(고양이·목격 기록)을 **전부 비운다** |
| Method / URL | `POST /api/v1/dev/seed` | `DELETE /api/v1/dev/cats` |
| 호출 화면 | 내 정보의 "데모 데이터 채우기" 버튼(`__DEV__`에서만 보임) | 내 정보의 "도감 비우기" 버튼(`__DEV__`에서만 보임) |
| Response | `200` `{ "catCount": 6 }` | `204` 본문 없음 |
| 에러 | `401 UNAUTHORIZED` | `401 UNAUTHORIZED` |

> **로컬(개발) 프로필에서만 열리고 운영에는 존재하지 않아야 한다.**

---

## 5. 화면 ↔ 인터페이스 매핑

| 화면 | 진입 시 호출 | 사용자 동작 시 호출 |
|---|---|---|
| 스플래시(a0) | — | (Firebase 로그인 상태만 확인) |
| 로그인(a1) | — | Firebase 구글 로그인 → IF-AUTH-001 |
| 홈 카메라(a2) | IF-ME-003 | 셔터 → IF-MATCH-001 |
| 매칭 결과(a3·a4) | (IF-CFG-002는 앱 시작 시 1회 캐시) | [이 고양이예요] → IF-MATCH-002 / [새로운 고양이예요]·[이름 짓기] → 이름 짓기 화면 이동 |
| 이름 짓기(a5) | — | [도감에 등록하기] → IF-MATCH-003 |
| 레벨업 팝업(a8) | — | IF-MATCH-003 응답의 `levelUp`으로 표시 |
| 도감(a6) | IF-CAT-001, IF-ME-002 | 카드 탭 → 상세로 이동 |
| 고양이 상세(a7) | IF-CAT-002, IF-CAT-003 | — |
| 레벨(a10) | IF-ME-002, IF-CFG-001 | — |
| 내 정보 | IF-ME-001 | 로그아웃(Firebase만) / (개발) IF-DEV-001·002 |

---

## 6. 앱 코드 대응 (`store.js` → API)

서버를 붙일 때 `app/src/data/store.js`·`mockMatch.js`의 함수를 아래처럼 API 호출로 바꾼다.

| 지금(목데이터) | 서버 연동 후 |
|---|---|
| `loginWithGoogleMock` / `getUser` | Firebase 로그인 + IF-AUTH-001 / IF-ME-001 |
| `logout` | Firebase `signOut()` (서버 호출 없음) |
| `getCats` | IF-CAT-001 |
| `getCatById` | IF-CAT-002 |
| `getSightings`(이번 주 계산) | IF-ME-003 |
| `getSightingsByCat` | IF-CAT-003 |
| `getUserLevelInfo` + `levels.js`의 `computeLevel` | IF-ME-002 (계산은 서버) |
| `levels.js`의 `LEVELS` 상수 | IF-CFG-001 |
| `matchConfig.js`의 상수 | IF-CFG-002 |
| `mockMatchAgainstExisting` | IF-MATCH-001 |
| `addSightingToCat` | IF-MATCH-002 |
| `registerNewCat` | IF-MATCH-003 |
| `seedDemoData` / `clearAllCats` | IF-DEV-001 / IF-DEV-002 |

앱이 바뀌는 부분(현재 코드 대비):
- **사진 값**: 지금은 기기 파일 경로(`photoUri`)를 화면들이 넘기지만, 서버 연동 후에는 촬영 직후 IF-MATCH-001로 올리고 이후 화면은 **`matchId`만** 넘긴다(사진 재업로드 없음). 결과 화면은 응답의 `photoUrl`로 사진을 표시한다.
- **일치율 단위**: 앱 `score`(0~1) → API `score`(0~100). `MatchCandidateCard`의 `score >= MATCH_HIGH` 비교를 `matchHigh`(70) 기준으로 맞춘다.
- **`selectCandidates`**: 후보 걸러내기·정렬·최대 3명은 서버가 하므로 앱의 `selectCandidates`는 필요 없어진다.

---

## 7. 미결 사항

| # | 항목 | 내용 |
|---|---|---|
| 1 | 대표 사진 | `cats` 테이블에는 사진 컬럼이 없다. 이 문서는 **첫 목격 사진 = 대표 사진**으로 가정했다(현재 앱 동작과 같음). "대표 사진 바꾸기"를 넣으려면 `cats`에 컬럼이 필요하다 |
| 2 | `matchId` 임시 보관 | 사진·임베딩·후보를 30분간 들고 있어야 한다. 메모리(단일 서버면 충분) / DB 임시 테이블 / Redis 중 구현 때 결정. `match_logs`·`match_candidates`는 **통계용이라 이 흐름에 필수가 아니며**(삭제 여부는 별도 논의), 통계를 남긴다면 `confirm`/`register` 시점에 서버 안에서 기록하고 API에는 나타나지 않는다 |
| 3 | 사진 접근 방식 | presigned URL(이 문서 기준) vs 서버가 대신 내려주는 `GET /photos/{id}`(매번 인증). 로컬 개발에서는 폰이 MinIO(`9000`)에 직접 접근할 수 있어야 presigned URL이 동작한다(같은 Wi-Fi + 호스트 IP 필요) |
| 4 | "이번 주 N마리" | 목격 횟수와 서로 다른 고양이 수 중 무엇을 보여줄지. 문구는 "마리"라 `catCount`가 맞다(현재 앱은 횟수를 셈) |
| 5 | Claude 매칭 설명 | README의 Claude "매칭 설명" 자연어 문장은 새 목업에 표시할 자리가 없어 응답에서 뺐다. 필요하면 `candidates[].explanation` 필드를 추가한다 |
| 6 | 일치율 보정 | README의 min-max 보정 `LOWER_BOUND`/`UPPER_BOUND`는 실제 테스트로 정해야 한다. 기준값(40/70)은 IF-CFG-002만 고치면 앱 수정 없이 바뀐다 |
| 7 | 직접 고르기 | 후보가 하나도 없을 때 도감에서 수동으로 고양이를 고르는 진입점은 목업에도 없다. 필요해지면 `POST /cats/{catId}/sightings`(사진 직접 업로드) 같은 인터페이스가 추가된다 |
| 8 | 태그 개수 제한 | 고양이 한 마리당 태그 최대 개수는 정하지 않았다(글자 수는 1~30자) |
| 9 | 오프라인 | 촬영·매칭은 항상 온라인 전제. 오프라인 촬영 후 나중에 올리는 기능은 고려하지 않았다 |
