-- 우리동네고양이 DB 스키마 초안 (PostgreSQL + pgvector)
-- 기준: README「DB 스키마」 + app 목업 데이터 모양(store.js/seed.json) + 관리자 웹 대시보드(w2)
-- ERD 작성용 초안 — 확정 전이며 server/ 의 스키마 관리 방식(마이그레이션 도구)은 아직 정하지 않았다.

CREATE EXTENSION IF NOT EXISTS vector;

-- 앱 사용자 (Google 로그인, 회원가입 없음)
CREATE TABLE users (
    id            BIGSERIAL     PRIMARY KEY,
    google_uid    VARCHAR(128)  NOT NULL UNIQUE,            -- Firebase Auth(Google) UID
    display_name  VARCHAR(50),
    level         SMALLINT      NOT NULL DEFAULT 0,         -- 캐싱된 값. 신규 고양이 등록 시점마다 갱신 (등록 개체 수 기준 Lv1~4)
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 등록된 고양이 개체 (사용자별 도감 — 다른 사용자와 공유하지 않는다)
CREATE TABLE cats (
    id                        BIGSERIAL     PRIMARY KEY,
    user_id                   BIGINT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,  -- 이 고양이를 등록한 사용자
    name                      VARCHAR(50)   NOT NULL,
    representative_embedding  VECTOR(1024),                 -- 대표 임베딩 (Voyage AI voyage-multimodal-3.5, 1024차원)
    created_at                TIMESTAMPTZ   NOT NULL DEFAULT now()   -- 첫 만남 시각
);
CREATE INDEX idx_cats_user_id ON cats (user_id);
-- 검색은 항상 "본인 소유 고양이"로 범위를 제한(WHERE user_id = ?)한 뒤 코사인 유사도로 비교한다.
CREATE INDEX idx_cats_embedding ON cats USING hnsw (representative_embedding vector_cosine_ops);

-- 특징 태그 (자유 텍스트, 고정 카테고리 아님) — README 는 cats.feature_tag 한 칸이지만
-- 앱 목업이 태그를 여러 개(예: 턱시도, 코 옆 흰 점) 다루므로 별도 테이블로 뺐다.
CREATE TABLE cat_tags (
    id      BIGSERIAL    PRIMARY KEY,
    cat_id  BIGINT       NOT NULL REFERENCES cats (id) ON DELETE CASCADE,
    tag     VARCHAR(30)  NOT NULL,
    UNIQUE (cat_id, tag)
);

-- 목격 기록 (촬영 1건 = 1행)
CREATE TABLE sightings (
    id          BIGSERIAL     PRIMARY KEY,
    cat_id      BIGINT        NOT NULL REFERENCES cats (id) ON DELETE CASCADE,
    photo_url   VARCHAR(500)  NOT NULL,                     -- MinIO 또는 로컬 디스크 경로
    memo        VARCHAR(200),                               -- 예: "놀이터 미끄럼틀 밑"
    latitude    NUMERIC(8, 5),                              -- 정밀 좌표는 저장하지 않고 뭉갠 좌표만 (소수 5자리 미만으로 절삭)
    longitude   NUMERIC(8, 5),
    taken_at    TIMESTAMPTZ   NOT NULL                      -- 촬영일시
);
CREATE INDEX idx_sightings_cat_id_taken_at ON sightings (cat_id, taken_at DESC);

-- AI 매칭 결과 로그 — 관리자 대시보드의 수락률·일치율 집계용
CREATE TABLE match_logs (
    id                 BIGSERIAL     PRIMARY KEY,
    user_id            BIGINT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    sighting_id        BIGINT        REFERENCES sightings (id) ON DELETE SET NULL,
    suggested_cat_id   BIGINT        REFERENCES cats (id) ON DELETE SET NULL,   -- AI 가 제안한 후보 (후보 없음이면 NULL)
    score              NUMERIC(5, 2),                       -- 보정된 일치율(0~100). 후보 없음이면 NULL
    result             VARCHAR(20)   NOT NULL,              -- CONFIRMED(같은 고양이 확정) / CORRECTED_NEW(새 고양이로 정정) / NEW(후보 없이 신규 등록)
    created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CHECK (result IN ('CONFIRMED', 'CORRECTED_NEW', 'NEW'))
);
CREATE INDEX idx_match_logs_created_at ON match_logs (created_at);

-- 관리자 웹 운영자 계정 (회원가입 없이 내부에서 발급)
CREATE TABLE admin_users (
    id             BIGSERIAL     PRIMARY KEY,
    email          VARCHAR(255)  NOT NULL UNIQUE,
    password_hash  VARCHAR(255)  NOT NULL,
    name           VARCHAR(50)   NOT NULL,
    role           VARCHAR(30)   NOT NULL DEFAULT 'OPERATOR',   -- 예: 운영 관리자
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);
