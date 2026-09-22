# 우리동네고양이 앱 REST API 인터페이스 정의서

## 1. 문서 개요

### 1.1 문서 정보

| 항목 | 내용 |
|---|---|
| 문서명 | 우리동네고양이 앱 REST API 인터페이스 정의서 |
| 대상 | 모바일 앱(`app/`) ↔ 백엔드(`server/`) |
| 버전 / 상태 | v0.4 / **초안(검토 전)** — 촬영 분석과 신규 고양이 등록을 포함해 구현 진행 중 |
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
| v0.2 | 2026-09-21 | 공통 응답을 `ResponseApi` 형태로 변경, 앱용 URL을 `/app/...` 체계로 변경, 도감 화면 API 2개 확정·구현 (아래 1.4) |

### 1.4 v0.2 변경 사항과 후속 정리

| 변경 | 내용 | 아직 반영 안 된 부분 |
|---|---|---|
| 공통 응답 | 모든 API가 `{ result, message, code, data }` 형태(2.4~2.6) | 각 인터페이스 표의 문자열 에러 코드(`MATCH_EXPIRED` 등)는 이름 표기용이며, 응답의 `code`는 숫자다. 업무별 숫자 코드는 확정 시 추가 |
| URL | 앱용 API는 `/app/{collection\|camera\|level}` 아래에 둔다 | 도감 화면 API 2개만 새 주소로 고쳤고, 나머지 인터페이스는 구현할 때 `/app/...`으로 옮긴다(로그인·내 정보의 위치도 미정) |
| 레벨 계산 | 서버는 등록 고양이 **개수만** 주고 등급·진행률은 앱이 계산한다(레벨 화면은 IF-LVL-001, 도감 화면은 IF-ME-002) | 등급표 API(IF-CFG-001)는 불필요해졌고, 새 고양이 등록 응답(IF-MATCH-003)의 `levelUp`(등급 정보 객체)은 `catCount`만 주는 방식으로 단순화할 예정 |
| 대표 사진 | `cats`에 사진 경로를 중복 저장하지 않고 가장 오래된 `sightings.photo_url`을 대표 사진으로 사용한다 | — |

---

## 2. 공통 사항

### 2.1 통신 규약

| 항목 | 내용 |
|---|---|
| Base URL | 앱용 API는 `/app` 아래(로컬: `http://localhost:8080/app/...`). 구현된 인터페이스는 새 주소로 적었고, 나머지는 이전 표기(`/api/v1/...`)이며 구현할 때 옮긴다(1.4) |
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
| 응답 형태 | 성공·실패 모두 공통 형태 `ResponseApi`(2.5)로 응답하고, 실제 데이터는 `data`에 담는다 |
| 일치율(`score`) | **0~100** 숫자(소수 2자리). 앱 목데이터는 0~1이라 연동 시 ×100 기준으로 통일 |
| 사진 URL(`photoUrl`) | 사진은 **비공개 버킷(MinIO)** 에 있고, `photoUrl`은 소유권을 확인해 이미지를 내려주는 `/app/photo`의 완전한 URL이다. 앱은 그대로 이미지 주소로 쓴다 |
| 좌표 | 정밀 좌표는 저장·응답하지 않는다. **뭉갠 좌표**(소수 5자리 미만으로 절삭)만 다룬다 |
| 목록 | 페이징 없음(MVP, 개인 도감이라 수가 적음). 정렬은 각 인터페이스에 명시 |

### 2.5 공통 응답 형식 (`ResponseApi`)

```json
{ "result": "SUCCESS", "message": "SUCCESS", "code": 200, "data": { "catCount": 12 } }
```

```json
{ "result": "FAIL", "message": "잘못된 요청입니다.", "code": 400, "data": null }
```

| 항목 | 타입 | 설명 |
|---|---|---|
| `result` | String | `SUCCESS` 성공 / `FAIL` 업무 처리 실패(잘못된 요청·인증·없는 리소스 등) / `ERROR` 시스템 오류 |
| `message` | String | 성공은 `SUCCESS`, 실패·오류는 사용자에게 그대로 보여줄 수 있는 한글 문구 |
| `code` | Integer | 성공 `200`, 실패는 HTTP 상태와 같은 숫자(400·401·404·405…), 시스템 오류 `500`. 업무별 세부 코드는 확정 시 추가 |
| `data` | Object | 응답 데이터. 실패·오류이면 `null` |

- 이 문서의 각 인터페이스 "Response" 표는 **`data` 안의 내용**을 설명한다.
- **HTTP 상태와 `result`의 관계**: `SUCCESS`→2xx, `FAIL`→4xx, `ERROR`→500. 본문의 `code`와 HTTP 상태는 같은 값이다.
- 시스템 오류(`ERROR`)의 `message`는 일반 문구만 내려가고 상세 원인·스택트레이스는 서버 로그에만 남긴다.

### 2.6 공통 에러

| HTTP | `result` | `code` | 발생 조건 | 앱 처리 |
|---|---|---|---|---|
| 400 | `FAIL` | 400 | 필수값 누락·형식/길이 위반·잘못된 헤더 값 | 입력 화면에 `message` 표시 |
| 401 | `FAIL` | 401 | 토큰 없음·만료·위조 | Firebase 토큰 갱신 후 1회 재시도, 실패하면 로그인 화면 |
| 404 | `FAIL` | 404 | 없는 주소·없는 리소스(남의 것 포함) | 도감으로 돌아가기 |
| 405 | `FAIL` | 405 | 지원하지 않는 HTTP 메서드 | — |
| 500 | `ERROR` | 500 | 서버 내부 오류 | "잠시 후 다시 시도" |

> 각 인터페이스에서만 발생하는 에러(`MATCH_*`, `NO_CAT_DETECTED` 등)는 해당 인터페이스 표에 적는다. 그 표의 영문 코드는 에러 종류를 부르는 이름이고 실제 `code`는 숫자다.

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
| IF-ME-002 | 수집 수 조회 | GET | `/app/collection/count` | 도감(a6) | 필수 | **구현** |
| IF-LVL-001 | 레벨용 수집 수 조회 | GET | `/app/level/count` | 레벨(a10) | 필수 | **구현** |
| IF-ME-003 | 이번 주 만난 수 조회 | GET | `/me/stats/week` | 홈 카메라(a2) | 필수 | 미구현 |
| IF-ME-004 | 회원 탈퇴 | DELETE | `/me` | 내 정보 | 후순위 | 미구현 |
| IF-CFG-001 | 등급표 조회 | GET | `/levels` | 레벨(a10) | ~~필수~~ 불필요(앱이 등급표 보유, 1.4) | — |
| IF-CFG-002 | 앱 설정 조회 | GET | `/config/app` | 매칭 결과(a3·a4), 이름 짓기(a5) | 필수 | 미구현 |
| IF-CAT-001 | 도감 목록 조회 | GET | `/app/collection/cats` | 도감(a6) | 필수 | **구현** |
| IF-CAT-002 | 고양이 정보 조회 | GET | `/app/cat/detail?catId=` | 고양이 상세(a7) | 필수 | **구현** |
| IF-CAT-003 | 목격 타임라인 조회(페이지네이션) | GET | `/app/cat/sightings?catId=&page=` | 고양이 상세(a7) | 필수 | **구현** |
| IF-CAT-006 | 지도 마커 조회 | GET | `/app/cat/markers?catId=` | 고양이 상세(a7) | 필수 | **구현** |
| IF-CAT-004 | 고양이 정보 수정 | PATCH | `/cats/{catId}` | 고양이 상세 ⋯ 메뉴 | 선택(앱 미구현) | 미구현 |
| IF-CAT-005 | 고양이 삭제 | DELETE | `/cats/{catId}` | 고양이 상세 ⋯ 메뉴 | 선택(앱 미구현) | 미구현 |
| IF-PHOTO-001 | 사진 조회 | GET | `/app/photo?catId=` 또는 `/app/photo?sightingId=` | 대표 사진·목격 타임라인 | 필수 | **구현** |
| IF-MATCH-001 | 촬영 이미지 분석 | POST | `/app/camera/analyze` | 홈 카메라(a2) → 매칭 결과(a3·a4) | 필수 | **구현** |
| IF-MATCH-002 | 기존 고양이로 확정 | POST | `/app/cat/sighting` | 매칭 결과(a3) | 필수 | **구현** |
| IF-MATCH-003 | 새 고양이 등록 | POST | `/app/cat/register` | 이름 짓기(a5), 레벨업(a8) | 필수 | **구현** |
| IF-DEV-001 | 데모 데이터 채우기 | POST | `/dev/seed` | 내 정보(개발용) | 개발 전용 | 미구현 |
| IF-DEV-002 | 도감 비우기 | DELETE | `/dev/cats` | 내 정보(개발용) | 개발 전용 | 미구현 |

### 촬영 흐름 (IF-MATCH-001~003)

현재 IF-MATCH-001은 사진을 저장하지 않지만 Voyage 임베딩을 서버 메모리에 30분간 보관하고 `analysisId`를 돌려준다.
IF-MATCH-002·003은 MinIO 저장을 위해 분석 사진을 multipart로 다시 전송하지만, `analysisId`로 임베딩을 재사용하여
Voyage API는 한 번만 호출한다. 서버 재시작·30분 만료 후에는 다시 촬영해야 한다.

```
POST /app/camera/analyze ─┬─► NOT_CAT       (고양이 아님)
                         ├─► NEW_CAT       (신규 고양이)
                         └─► EXISTING_CAT  (기존 후보 최대 3마리)

현재 MVP 확정 ───────┬─► POST /app/cat/sighting  (이 고양이예요)
                         └─► POST /app/cat/register  (새로운 고양이예요)
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

### IF-ME-002 수집 수 조회

| 항목 | 내용 |
|---|---|
| 설명 | 내가 등록한 고양이 수. 앱이 이 값으로 등급(레벨)·진행률·다음 등급까지 남은 수를 **직접 계산**한다(등급 기준 1·5·12·16·30마리는 앱 `levels.js`). 등급은 **새로 등록한 고양이 수** 기준이라 같은 고양이를 다시 만나도 오르지 않는다 |
| Method / URL | `GET /app/collection/count` |
| 호출 화면 | 도감(a6) — 화면에 돌아올 때마다 다시 호출. 레벨 화면은 별도 API(IF-LVL-001)를 쓴다 |
| 구현 상태 | **구현·검증 완료**(단위 테스트 + 로컬 DB 실제 호출) |

**Request** — 헤더 `X-User-Id`(임시 사용자 식별, 기본 1. Firebase 인증을 붙이면 토큰으로 대체). 파라미터·본문 없음

**Response `200`** — `data`

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `catCount` | Integer | N | 등록한 고양이 수(없으면 0) |

**에러**: `400 FAIL`(`X-User-Id` 형식 오류)

```json
{ "result": "SUCCESS", "message": "SUCCESS", "code": 200, "data": { "catCount": 12 } }
```

---

### IF-LVL-001 레벨용 수집 수 조회

| 항목 | 내용 |
|---|---|
| 설명 | 레벨 탭(a10) 전용. 내가 등록한 고양이 수만 준다. 앱이 이 값과 `levels.js`의 등급표(1·5·12·16·30마리)로 현재 등급·진행률·"N마리 남음"·등급표 뱃지(달성/지금 여기)를 **모두 계산**한다. 등급은 **새로 등록한 고양이 수** 기준이라 같은 고양이를 다시 만나도 오르지 않는다 |
| Method / URL | `GET /app/level/count` |
| 호출 화면 | 레벨(a10) — 탭에 돌아올 때마다 다시 호출 |
| 구현 상태 | **구현**(단위 테스트 5개 통과). 실제 DB 호출은 미확인(Docker가 꺼져 있었음) — 쿼리는 IF-ME-002와 동일 |

**Request** — 헤더 `X-User-Id`(임시 사용자 식별, 기본 1). 파라미터·본문 없음

**Response `200`** — `data`

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `catCount` | Integer | N | 등록한 고양이 수(없으면 0) |

**에러**: `400 FAIL`(`X-User-Id` 형식 오류)

```json
{ "result": "SUCCESS", "message": "SUCCESS", "code": 200, "data": { "catCount": 12 } }
```

- IF-ME-002와 응답·쿼리가 같지만, 화면별로 API를 나누기로 해서 따로 둔다(도감은 `/app/collection`, 레벨은 `/app/level`).

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
| 설명 | 내가 등록한 고양이 전체(필터·검색·페이징 없음). **최근 등록한 순**으로 정렬한다 |
| Method / URL | `GET /app/collection/cats` |
| 호출 화면 | 도감(a6) — 화면에 돌아올 때마다 다시 호출(등록 직후 바로 반영되어야 함) |
| 구현 상태 | **구현·검증 완료**(단위 테스트 + 로컬 DB 실제 호출) |

**Request** — 헤더 `X-User-Id`(임시, IF-ME-002와 동일). 파라미터·본문 없음

**Response `200`** — `data`

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `cats` | Array | N | 고양이 목록(0마리면 빈 배열) |
| `cats[].id` | Long | N | 고양이 ID |
| `cats[].name` | String | N | 이름 |
| `cats[].photoUrl` | String | Y | 대표 사진을 바로 표시할 수 있는 `/app/photo?catId=` URL |
| `cats[].sightingCount` | Integer | N | 만난 횟수(목격 기록 수) |
| `cats[].tags` | Array<String> | N | 특징 태그(추가한 순서, 없으면 빈 배열). 앱 카드는 첫 번째만 표시 |

**에러**: `400 FAIL`(`X-User-Id` 형식 오류)

```json
{ "result": "SUCCESS", "message": "SUCCESS", "code": 200, "data": { "cats": [
  { "id": 2, "name": "치즈", "photoUrl": "http://192.168.0.4:8080/app/photo?catId=2", "sightingCount": 12, "tags": ["치즈 태비"] },
  { "id": 1, "name": "양말이", "photoUrl": "http://192.168.0.4:8080/app/photo?catId=1", "sightingCount": 7, "tags": ["턱시도", "코 옆 흰 점"] }
] } }
```

---

### IF-CAT-002 고양이 정보 조회

| 항목 | 내용 |
|---|---|
| 설명 | 고양이 상세(a7) 상단의 기본 정보. `catId`가 이 사용자 소유가 아니면(존재 자체도) **404** — 다른 사용자 고양이인지 여부를 알려주지 않는다 |
| Method / URL | `GET /app/cat/detail` |
| 호출 화면 | 고양이 상세(a7) |
| 구현 상태 | **구현**(단위 테스트 + 로컬 DB 실제 호출로 검증) |

**Request** — 헤더 `X-User-Id`(임시, 기본 1)

| 구분 | 항목 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| Query | `catId` | Long | Y | 고양이 ID |

**Response `200`** — `data`

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `id` | Long | N | 고양이 ID |
| `name` | String | N | 이름 |
| `photoUrl` | String | N | 앱에서 바로 표시할 수 있는 대표 사진 URL |
| `tags` | Array<String> | N | 특징 태그 |
| `sightingCount` | Integer | N | 목격 횟수 |
| `firstSeenAt` | DateTime | N | 첫 만남(등록) 일시 |

**에러**: `400 FAIL`(`catId` 누락), `404 FAIL`(없거나 내 고양이가 아님)

```json
{ "result": "SUCCESS", "message": "SUCCESS", "code": 200,
  "data": { "id": 12, "name": "양말이", "photoUrl": "http://192.168.0.4:8080/app/photo?catId=12",
    "tags": ["턱시도", "코 옆 흰 점"], "sightingCount": 7, "firstSeenAt": "2026-04-05T09:00:00+09:00" } }
```

---

### IF-CAT-003 목격 타임라인 조회 (페이지네이션)

| 항목 | 내용 |
|---|---|
| 설명 | 목격 타임라인 전용(무한스크롤). 최신순, **한 번에 10건**. `seq`는 이 고양이의 전체 목격 기록 중 몇 번째 만남인지(오래된 순 1부터) —
  IF-CAT-006(지도 마커)의 `seq`와 채번 기준이 같아서 지도·타임라인 번호가 서로 맞는다. `catId`가 있어도 소유자가 아니면 404, 소유자인데 목격이 0건이면 200 + 빈 배열 |
| Method / URL | `GET /app/cat/sightings` |
| 호출 화면 | 고양이 상세(a7) |
| 구현 상태 | **구현**(단위 테스트 + 로컬 DB 실제 호출로 검증) |

**Request** — 헤더 `X-User-Id`(임시, 기본 1)

| 구분 | 항목 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| Query | `catId` | Long | Y | 고양이 ID |
| Query | `page` | Integer | N | 0부터. 생략하면 0. 음수는 0으로 처리 |

**Response `200`** — `data`

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `sightings` | Array<Object> | N | 목격 기록 최대 10건(최신순) |
| `sightings[].id` | Long | N | 목격 ID |
| `sightings[].seq` | Integer | N | 몇 번째 만남(오래된 순 1부터) |
| `sightings[].photoUrl` | String | N | 앱에서 바로 표시할 수 있는 목격 사진 URL |
| `sightings[].takenAt` | DateTime | N | 촬영일시 |
| `sightings[].memo` | String | Y | 메모 |
| `sightings[].tags` | Array<String> | N | 해당 목격에서 기록한 특징 태그(최대 5개) |
| `hasMore` | Boolean | N | `true`면 다음 페이지(`page+1`)를 더 불러올 수 있음 |

**에러**: `400 FAIL`(`catId` 누락), `404 FAIL`(없거나 내 고양이가 아님)

```json
{ "result": "SUCCESS", "message": "SUCCESS", "code": 200,
  "data": { "sightings": [
    { "id": 301, "seq": 7, "photoUrl": "https://…", "takenAt": "2026-09-14T18:24:00+09:00", "memo": "놀이터 미끄럼틀 밑", "tags": ["졸고 있음", "빨간 목줄"] }
  ], "hasMore": true } }
```

---

### IF-CAT-006 지도 마커 조회

| 항목 | 내용 |
|---|---|
| 설명 | 고양이 상세(a7) 미니맵 핀 전용. **좌표가 있는 목격만** 전부 준다(페이지네이션 없음 — 지도는 한 번에 그린다). `seq`는 IF-CAT-003과 같은
  채번 기준(전체 목격 중 몇 번째, 좌표 없는 것도 순번에 포함되지만 결과에는 안 나옴). 최신순 정렬이라 `markers[0]`이 최근 목격 |
| Method / URL | `GET /app/cat/markers` |
| 호출 화면 | 고양이 상세(a7) |
| 구현 상태 | **구현**(단위 테스트 + 로컬 DB 실제 호출로 검증) |

**Request** — 헤더 `X-User-Id`(임시, 기본 1)

| 구분 | 항목 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| Query | `catId` | Long | Y | 고양이 ID |

**Response `200`** — `data`

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `markers` | Array<Object> | N | 좌표 있는 목격만(최신순) |
| `markers[].id` | Long | N | 목격 ID |
| `markers[].seq` | Integer | N | 몇 번째 만남(오래된 순 1부터) |
| `markers[].latitude` | Decimal | N | 위도(뭉갠 좌표) |
| `markers[].longitude` | Decimal | N | 경도(뭉갠 좌표) |
| `markers[].takenAt` | DateTime | N | 촬영일시 |
| `markers[].memo` | String | Y | 메모 |
| `markers[].photoUrl` | String | N | 앱에서 바로 표시할 수 있는 목격 사진 URL |

**에러**: `400 FAIL`(`catId` 누락), `404 FAIL`(없거나 내 고양이가 아님)

```json
{ "result": "SUCCESS", "message": "SUCCESS", "code": 200,
  "data": { "markers": [
    { "id": 301, "seq": 7, "latitude": 37.56512, "longitude": 126.97831,
      "takenAt": "2026-09-14T18:24:00+09:00", "memo": "놀이터 미끄럼틀 밑",
      "photoUrl": "http://192.168.0.4:8080/app/photo?sightingId=301" }
  ] } }
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

### IF-PHOTO-001 사진 조회

| 항목 | 내용 |
|---|---|
| 설명 | `catId`이면 첫 목격의 대표 사진을, `sightingId`이면 해당 목격 사진을 조회한다. 사용자 소유권을 확인한 뒤 MinIO 객체를 이미지 리소스로 내려준다 |
| Method / URL | `GET /app/photo?catId=` 또는 `GET /app/photo?sightingId=` |
| 호출 화면 | 도감 카드·매칭 후보·고양이 상세·지도 팝업·목격 타임라인 |

**Request**

| 구분 | 항목 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| Header | `X-User-Id` | Long | N | 임시 사용자 ID. 생략 시 `1` |
| Query | `catId` | Long | 조건부 | 대표 사진을 조회할 고양이 ID |
| Query | `sightingId` | Long | 조건부 | 개별 사진을 조회할 목격 ID |

`catId`와 `sightingId` 중 정확히 하나만 보낸다. 목록·상세·타임라인 API의 `photoUrl`은 이 API의 완전한 URL을 반환하므로 앱은 그대로 이미지 source에 사용한다.

**Response `200`**: `Content-Type: image/jpeg` 또는 `image/png`, `Content-Disposition: inline`, 본문은 이미지 리소스이며 개인 캐시로 1시간 보관한다.

**에러**

| HTTP | code | 발생 조건 |
|---|---|---|
| 400 | `400` | 두 ID가 모두 없거나 모두 전달됨·형식 오류 |
| 404 | `404` | 고양이·목격·사진이 없거나 현재 사용자 소유가 아니거나 MinIO 객체가 없음 |
| 503 | `503` | MinIO 사진 저장소를 사용할 수 없음 |

---

### IF-MATCH-001 촬영 이미지 분석

| 항목 | 내용 |
|---|---|
| 설명 | 사진을 올려 고양이 여부와 기존 개체 후보를 분석한다. 서버는 ① DJL ImageNet 분류로 고양이 여부 판별 → ② 등록 고양이가 있으면 Voyage AI 이미지 임베딩 생성 → ③ 내 고양이별 목격 임베딩 유사도 상위 2개의 평균 검색(pgvector, **내 것만**) → ④ 일치율 보정 → ⑤ 고양이별 하나의 후보만 기준 이상·높은 순으로 최대 3마리를 반환한다. **AI 호출이 있어 수 초 걸릴 수 있다** |
| Method / URL | `POST /app/camera/analyze` |
| 호출 화면 | 홈 카메라(a2) 셔터 → 매칭 결과(a3·a4) |
| Content-Type | `multipart/form-data` |

**Request Body**

| 항목 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `photo` | File(JPEG/PNG, 최대 10MB) | Y | 판별할 촬영 사진 |

**Response `200`** (`ResponseApi.data`)

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `status` | String | N | `NOT_CAT` / `NEW_CAT` / `EXISTING_CAT` |
| `cat` | Boolean | N | 고양이 판별 여부 |
| `detectedLabel` | String | N | ImageNet 최상위 판별 라벨 |
| `catProbability` | Decimal | N | 고양이 클래스 확률(0~100) |
| `analysisId` | String(UUID) | Y | 생성된 임베딩을 30분 내 확정·등록에서 재사용하는 ID. `NOT_CAT`·등록 고양이 0마리인 첫 `NEW_CAT`은 `null` |
| `candidates` | Array<Candidate> | N | `EXISTING_CAT`일 때만 최대 3마리, 나머지는 빈 배열 |

**에러**

| HTTP | code | 발생 조건 |
|---|---|---|
| 400 | `400` | `photo` 누락·형식 오류 |
| 413 | `413` | 사진이 10MB 초과 |
| 503 | `503` | DJL 모델·Voyage AI를 사용할 수 없거나 기존 고양이의 목격 임베딩이 준비되지 않음 |

```json
{
  "result": "SUCCESS",
  "message": "SUCCESS",
  "code": 200,
  "data": {
    "status": "EXISTING_CAT",
    "cat": true,
    "detectedLabel": "n02123045 tabby, tabby cat",
    "catProbability": 78.4,
    "candidates": [
      { "catId": 12, "name": "양말이", "photoUrl": "https://…", "tags": ["턱시도"], "sightingCount": 6, "score": 84.0 }
    ]
  }
}
```

> 현재 분석 API는 사진을 임시 보관하지 않는다. 기존 고양이 확정과 신규 등록 모두
> 분석 사진을 다시 전송하는 MVP 인터페이스로 구현했다.

---

### IF-MATCH-002 기존 고양이로 확정

| 항목 | 내용 |
|---|---|
| 설명 | 후보 카드의 **[이 고양이예요]**를 누른 뒤 목격 기록 작성 화면에서 메모·특징·위치를 확인하고 저장한다. 선택한 고양이에 사진·Voyage AI 임베딩·목격 기록을 추가하며 **레벨은 바뀌지 않는다** |
| Method / URL | `POST /app/cat/sighting` (`multipart/form-data`) |
| 호출 화면 | 목격 기록 작성 |

**Request**

| 구분 | 항목 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| Header | `X-User-Id` | Long | N | 임시 사용자 ID. 생략 시 `1` |
| Part | `file` | File[] | Y | 분석에 사용한 JPEG/PNG 사진 정확히 1장 |
| Part | `contents` | JSON String | Y | `{"analysisId":"UUID","catId":12,"tags":["턱시도"],"memo":"","latitude":37.12345,"longitude":127.12345}`. `catId`는 현재 사용자 소유여야 함 |
| `contents.tags` | Array<String(1~30)> | N | 해당 목격에서 관찰한 특징. 중복 제거, 최대 5개, 쉼표 사용 불가 |
| `contents.memo` | String(0~200) | N | 목격 당시 메모 |
| `contents.latitude` | Decimal(-90~90) | N | 촬영 위치 위도. 경도와 함께 보내며 소수점 5자리로 저장 |
| `contents.longitude` | Decimal(-180~180) | N | 촬영 위치 경도. 위도와 함께 보내며 소수점 5자리로 저장 |

**Response `200`** (`ResponseApi.data`)

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `catId` | Long | N | 선택한 고양이 ID |
| `sightingId` | Long | N | 새로 만들어진 목격 ID |
| `name` | String | N | 고양이 이름 |
| `photoUrl` | String | N | 앱에서 바로 표시할 수 있는 목격 사진 URL |
| `sightingCount` | Integer | N | 추가 후 누적 목격 횟수 |

**에러**

| HTTP | code | 발생 조건 |
|---|---|---|
| 400 | `400` | 사진이 1장이 아니거나 `contents`·`catId`·파일 형식이 잘못됨 |
| 400 | `400` | `analysisId`가 없거나 만료되었거나 다른 사용자의 것임 |
| 404 | `404` | 고양이가 없거나 현재 사용자 소유가 아님 |
| 413 | `413` | 사진이 10MB 초과 |
| 503 | `503` | Voyage AI 또는 MinIO 사진 저장소를 사용할 수 없음 |

```json
{
  "result": "SUCCESS",
  "message": "SUCCESS",
  "code": 200,
  "data": {
    "catId": 12,
    "sightingId": 302,
    "name": "양말이",
    "photoUrl": "http://192.168.0.4:8080/app/photo?sightingId=302",
    "sightingCount": 7
  }
}
```

> 현재 MVP의 `analysisId`는 임베딩만 보관하므로 선택한 `catId`가 방금 분석한 후보였는지는 재검증하지 않고,
> 현재 사용자 소유인지만 검증한다.

---

### IF-MATCH-003 새 고양이 등록

| 항목 | 내용 |
|---|---|
| 설명 | **[새로운 고양이예요]**(또는 후보 없음) → 이름 짓기 화면의 **[도감에 등록하기]**. 사진을 MinIO에 저장하고 새 고양이(`cats`)와 첫 목격(`sightings`)을 만들며, 태그·메모·촬영 위치와 `analysisId`의 Voyage 임베딩을 첫 목격에 함께 저장한다. 등록 후 고양이 수로 레벨을 계산하지만 `users.level` 캐시는 갱신하지 않는다 |
| Method / URL | `POST /app/cat/register` (`multipart/form-data`) |
| 호출 화면 | 이름 짓기(a5), 레벨업 팝업(a8) |

**Request**

| 구분 | 항목 | 타입 | 필수 | 설명 |
|---|---|---|---|---|
| Part | `file` | File[](JPEG/PNG, 최대 10MB) | Y | 분석에 사용한 촬영 사진. 현재는 정확히 1장만 허용 |
| Part | `contents` | String(JSON) | Y | 모바일 multipart 호환을 위해 JSON 객체를 문자열로 직렬화한 등록 내용 |
| `contents.analysisId` | String(UUID) | N | IF-MATCH-001이 반환한 ID. 이미 등록된 고양이가 있으면 필수이며, 첫 고양이 등록은 생략 가능 |
| `contents.name` | String(1~12) | Y | 고양이 이름. 공백만은 불가 |
| `contents.tags` | Array<String(1~30)> | N | 첫 목격 특징 태그. 중복 제거, 최대 5개, 쉼표 사용 불가 |
| `contents.memo` | String(0~200) | N | 첫 만남 메모 |
| `contents.latitude` | Decimal(-90~90) | N | 촬영 위치 위도. 경도와 함께 보내며 소수점 5자리로 저장 |
| `contents.longitude` | Decimal(-180~180) | N | 촬영 위치 경도. 위도와 함께 보내며 소수점 5자리로 저장 |

**Response `200` (`ResponseApi.data`)**

| 항목 | 타입 | Null | 설명 |
|---|---|---|---|
| `catId` | Long | N | 새 고양이 ID |
| `sightingId` | Long | N | 첫 목격 ID |
| `name` | String | N | 등록된 이름 |
| `photoUrl` | String | N | 앱에서 바로 표시할 수 있는 대표 사진 URL |
| `tags` | Array<String> | N | 중복 제거된 태그 |
| `catCount` | Integer | N | 등록 후 사용자의 고양이 수 |
| `level` | Integer | N | 등록 후 레벨(0~5) |
| `leveledUp` | Boolean | N | 이번 등록으로 레벨이 올랐는지 여부 |

**에러**: `400 FAIL`(사진·이름·태그·메모 형식 오류), `413 FAIL`(사진 10MB 초과), `503 FAIL`(Voyage 또는 MinIO 사용 불가)

```json
{
  "result": "SUCCESS",
  "message": "SUCCESS",
  "code": 200,
  "data": {
    "catId": 21,
    "sightingId": 303,
    "name": "양말이",
    "photoUrl": "http://192.168.0.4:8080/app/photo?catId=21",
    "tags": ["턱시도", "한쪽 귀 끝이 잘림"],
    "catCount": 5,
    "level": 2,
    "leveledUp": true
  }
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
| 매칭 결과(a3·a4) | (IF-CFG-002는 앱 시작 시 1회 캐시) | [이 고양이예요] → 목격 기록 작성 / [새로운 고양이예요]·[이름 짓기] → 이름 짓기 화면 이동 |
| 목격 기록 작성 | — | [목격 기록 저장하기] → IF-MATCH-002 |
| 이름 짓기(a5) | — | [도감에 등록하기] → IF-MATCH-003 |
| 레벨업 팝업(a8) | — | IF-MATCH-003 응답의 `leveledUp`으로 표시 |
| 도감(a6) | IF-CAT-001, IF-ME-002 | 카드 탭 → 상세로 이동 |
| 고양이 상세(a7) | IF-CAT-002, IF-CAT-006, IF-CAT-003(첫 페이지) | 타임라인 스크롤 끝 → IF-CAT-003(다음 page) |
| 레벨(a10) | IF-LVL-001 (등급표는 앱이 보유) | — |
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
| `getSightingsByCat`(미니맵) | IF-CAT-006 |
| `getSightingsByCat`(타임라인) | IF-CAT-003 (10건씩, `page` 늘려가며 무한스크롤) |
| `getUserLevelInfo`(개수만 서버에서 받아 앱이 `computeLevel`로 계산) | IF-LVL-001 (`catCount`) |
| `levels.js`의 `LEVELS` 상수 | 앱에 그대로 유지(IF-CFG-001 불필요) |
| `matchConfig.js`의 상수 | IF-CFG-002 |
| `mockMatchAgainstExisting` | IF-MATCH-001의 `status`·`candidates` 응답으로 교체 |
| `registerCatSighting` | IF-MATCH-002 |
| `registerNewCat` | IF-MATCH-003 |
| `seedDemoData` / `clearAllCats` | IF-DEV-001 / IF-DEV-002 |

앱이 바뀌는 부분(현재 코드 대비):
- **사진 값**: 기기 파일 경로(`photoUri`)를 화면들이 넘긴다. 촬영 직후 IF-MATCH-001로 올리고,
  현재 분석 API는 사진을 저장하지 않으므로 MinIO 저장을 위해 확정·등록할 때 같은 `photoUri`를 IF-MATCH-002·003으로 다시 전송한다.
  임베딩은 `analysisId`로 재사용하므로 Voyage API는 한 번만 호출한다.
- **일치율 단위**: 앱 `score`(0~1) → API `score`(0~100). `MatchCandidateCard`의 `score >= MATCH_HIGH` 비교를 `matchHigh`(70) 기준으로 맞춘다.
- **`selectCandidates`**: 후보 걸러내기·정렬·최대 3명은 서버가 하므로 앱의 `selectCandidates`는 필요 없어진다.

---

## 7. 미결 사항

| # | 항목 | 내용 |
|---|---|---|
| 1 | 대표 사진 | `cats`에는 사진 컬럼이 없고 **첫 목격 사진 = 대표 사진**으로 사용한다. "대표 사진 바꾸기"를 넣으면 URL을 중복 저장하지 말고 `cats.representative_sighting_id`로 목격 기록을 참조한다 |
| 2 | `analysisId` 임시 보관 | 임베딩을 단일 서버 메모리에 30분간 보관한다. 서버 다중화 시 Redis 등 공유 저장소로 옮겨야 하며, 후보 목록까지 저장해 확정 대상을 재검증할지는 추가 검토한다 |
| 3 | 사진 접근 방식 | 비공개 MinIO 객체를 `/app/photo?catId=` 또는 `/app/photo?sightingId=`가 `inline` 리소스로 대신 내려주며, 다른 API는 이 완전한 URL을 `photoUrl`로 반환한다 |
| 4 | "이번 주 N마리" | 목격 횟수와 서로 다른 고양이 수 중 무엇을 보여줄지. 문구는 "마리"라 `catCount`가 맞다(현재 앱은 횟수를 셈) |
| 5 | Claude 매칭 설명 | README의 Claude "매칭 설명" 자연어 문장은 새 목업에 표시할 자리가 없어 응답에서 뺐다. 필요하면 `candidates[].explanation` 필드를 추가한다 |
| 6 | 일치율 보정 | README의 min-max 보정 `LOWER_BOUND`/`UPPER_BOUND`는 실제 테스트로 정해야 한다. 기준값(40/70)은 IF-CFG-002만 고치면 앱 수정 없이 바뀐다 |
| 7 | 직접 고르기 | 후보가 하나도 없을 때 도감에서 수동으로 고양이를 고르는 진입점은 목업에도 없다. 필요해지면 `POST /cats/{catId}/sightings`(사진 직접 업로드) 같은 인터페이스가 추가된다 |
| 8 | 태그 저장 | 태그는 목격 시점의 특징이므로 `sightings.tags`에 쉼표 구분 문자열로 최대 5개를 저장한다 |
| 9 | 오프라인 | 촬영·매칭은 항상 온라인 전제. 오프라인 촬영 후 나중에 올리는 기능은 고려하지 않았다 |
