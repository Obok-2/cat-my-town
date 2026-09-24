# 관리자 웹 REST API 인터페이스 정의서 v0.1

관리자 웹(`web/`의 `/admin`)이 호출하는 API. 공통 응답 형식(`ResponseApi`: `result`·`message`·`code`·`data`)은 앱 API와 같다.

## 인증

- `POST /admin/auth/login`만 로그인 없이 호출할 수 있다.
- 나머지 `/admin/**`는 `Authorization: Bearer <관리자 accessToken>`이 필요하다.
- 관리자 토큰과 앱 토큰은 서로 호환되지 않는다. 앱 토큰으로 `/admin/**`을 부르거나 관리자 토큰으로 `/app/**`을 부르면 `403`.
- 관리자 토큰 유효기간은 기본 12시간(`ADMIN_JWT_EXPIRES_SECONDS`, 기본 43200).

| 상황 | HTTP | code | message |
|---|---|---|---|
| 토큰 없음·만료·위조 | 401 | 401 | 로그인이 필요합니다. |
| 토큰 종류가 맞지 않음 | 403 | 403 | 접근 권한이 없습니다. |

---

## 1. 관리자 로그인

`POST /admin/auth/login`

**Request Body**

| 항목 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `email` | String | Y | 관리자 이메일 (대소문자 구분 없음) |
| `password` | String | Y | 비밀번호 |

**Response `200`** `data`

| 항목 | 타입 | 설명 |
|---|---|---|
| `accessToken` | String | 관리자 JWT |
| `tokenType` | String | `Bearer` |
| `expiresIn` | Long | 만료까지 남은 초 |
| `admin` | Object | `id`, `email`, `name`, `role` |

**에러**: 이메일이 없거나 비밀번호가 틀리면 `401` "이메일 또는 비밀번호가 올바르지 않습니다." (어느 쪽인지 구분하지 않음)

```json
{ "result": "SUCCESS", "message": "SUCCESS", "code": 200,
  "data": { "accessToken": "eyJ...", "tokenType": "Bearer", "expiresIn": 43200,
            "admin": { "id": 1, "email": "admin@example.com", "name": "운영자", "role": "OPERATOR" } } }
```

---

## 2. 대시보드

`GET /admin/dashboard` (관리자 토큰 필요)

**Response `200`** `data`

| 항목 | 타입 | 설명 |
|---|---|---|
| `asOf` | DateTime | 집계 시각 (한국 시간) |
| `summary` | Object | KPI 숫자 (아래) |
| `daily` | Array | 최근 7일(오늘 포함) 날짜별 기록, 날짜 오름차순 |
| `levels` | Array | 레벨 0~5별 사용자 수 |
| `activity` | Array | 최근 로그인한 사용자 10명, 최신순 |

**summary**

| 항목 | 설명 |
|---|---|
| `totalUsers` / `newUsers30d` | 누적 사용자 / 최근 30일 가입 |
| `activeUsers7d` | 최근 7일 안에 Google 로그인한 사용자 (`users.last_login_at`) |
| `totalCats` / `newCats30d` | 등록된 고양이 / 최근 30일 등록 |
| `totalSightings` | 전체 목격 기록 수 |
| `todaySightings` / `yesterdaySightings` | 오늘·어제 저장된 목격 기록 수 (한국 시간 자정 기준) |

**daily[]**: `day`(날짜), `sightingCount`(목격 기록 수), `newCatCount`(신규 고양이 수). 기록이 없는 날도 0으로 포함.

**levels[]**: `level`(0~5, 0은 미등록), `userCount`. 레벨 기준은 앱 등급표와 같다(1·5·12·16·30마리).

**activity[]**: `userId`, `email`(Google 이메일을 가린 값, 예: `ob***@gmail.com`), `lastLoginAt`(마지막 Google 로그인 시각).
`last_login_at`이 한 번도 기록되지 않은 사용자는 빠진다.

> AI 매칭 통계(같은 고양이 확정 수·새 고양이로 정정 수·평균 제안 일치율)는 매칭 결과(`match_logs`)를 저장하지 않아 제공하지 않는다.

---

## 관리자 계정 만들기

가입 API는 없다. DB에 직접 넣으며, 비밀번호는 PostgreSQL `pgcrypto`로 BCrypt 해시를 만든다.

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
INSERT INTO admin_users (email, password_hash, name)
VALUES ('admin@example.com', crypt('비밀번호', gen_salt('bf', 10)), '운영자');
```
