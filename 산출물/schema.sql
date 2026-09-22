-- 우리동네고양이 DB 스키마 초안 (PostgreSQL + pgvector)
-- 기준: README「DB 스키마」 + app 목업 데이터 모양(store.js/seed.json) + 관리자 웹 대시보드(w2)
-- ERD 작성용 초안 — 확정 전이며 server/ 의 스키마 관리 방식(마이그레이션 도구)은 아직 정하지 않았다.

CREATE EXTENSION IF NOT EXISTS vector;

-- 앱 사용자 (Google 로그인, 회원가입 없음)
CREATE TABLE users (
    id            BIGSERIAL     PRIMARY KEY,
    google_uid    VARCHAR(128)  NOT NULL UNIQUE,            -- Firebase Auth(Google) UID
    display_name  VARCHAR(50),
    level         SMALLINT      NOT NULL DEFAULT 0,         -- 캐싱된 값. 신규 고양이 등록 시점마다 갱신 (등록 개체 수 기준 Lv1~5: 1·5·12·16·30마리 이상, 0은 미등록)
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- 등록된 고양이 개체 (사용자별 도감 — 다른 사용자와 공유하지 않는다)
CREATE TABLE cats (
    id                        BIGSERIAL     PRIMARY KEY,
    user_id                   BIGINT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,  -- 이 고양이를 등록한 사용자
    name                      VARCHAR(50)   NOT NULL,
    created_at                TIMESTAMPTZ   NOT NULL DEFAULT now()   -- 첫 만남 시각
);
CREATE INDEX idx_cats_user_id ON cats (user_id);

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
    embedding   VECTOR(1024)  NOT NULL,                     -- 목격 사진 임베딩 (Voyage AI voyage-multimodal-3.5)
    memo        VARCHAR(200),                               -- 예: "놀이터 미끄럼틀 밑"
    latitude    NUMERIC(8, 5),                              -- 정밀 좌표는 저장하지 않고 뭉갠 좌표만 (소수 5자리 미만으로 절삭)
    longitude   NUMERIC(8, 5),
    taken_at    TIMESTAMPTZ   NOT NULL                      -- 촬영일시
);
CREATE INDEX idx_sightings_cat_id_taken_at ON sightings (cat_id, taken_at DESC);
CREATE INDEX idx_sightings_embedding ON sightings USING hnsw (embedding vector_cosine_ops);

-- AI 매칭 결과 로그 — 관리자 대시보드의 수락률·일치율 집계용 (촬영 1건 = 1행)
-- 앱은 일치율 40% 이상 후보를 최대 3명 보여주고 사용자가 하나를 고르거나 "새로운 고양이"를 고른다.
-- 후보 목록은 match_candidates 에, 사용자가 고른 결과는 여기에 저장한다.
CREATE TABLE match_logs (
    id                 BIGSERIAL     PRIMARY KEY,
    user_id            BIGINT        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    sighting_id        BIGINT        REFERENCES sightings (id) ON DELETE SET NULL,
    selected_cat_id    BIGINT        REFERENCES cats (id) ON DELETE SET NULL,   -- 사용자가 최종 선택한 기존 고양이 (새 고양이로 등록했거나 후보가 없으면 NULL)
    score              NUMERIC(5, 2),                       -- 선택한 후보의 보정된 일치율(0~100). 선택 없음이면 NULL
    result             VARCHAR(20)   NOT NULL,              -- CONFIRMED(후보 중 하나를 같은 고양이로 확정) / CORRECTED_NEW(후보가 있었지만 새 고양이로 등록) / NEW(기준 미만이라 후보 없이 신규 등록)
    created_at         TIMESTAMPTZ   NOT NULL DEFAULT now(),
    CHECK (result IN ('CONFIRMED', 'CORRECTED_NEW', 'NEW'))
);
CREATE INDEX idx_match_logs_created_at ON match_logs (created_at);

-- AI 매칭 후보 — 한 번의 매칭에서 보여준 후보(일치율 기준 이상, 최대 3명)
CREATE TABLE match_candidates (
    id            BIGSERIAL     PRIMARY KEY,
    match_log_id  BIGINT        NOT NULL REFERENCES match_logs (id) ON DELETE CASCADE,
    cat_id        BIGINT        NOT NULL REFERENCES cats (id) ON DELETE CASCADE,
    rank_no       SMALLINT      NOT NULL,                   -- 일치율 높은 순 순위 (1~3)
    score         NUMERIC(5, 2) NOT NULL,                   -- 이 후보의 보정된 일치율(0~100)
    UNIQUE (match_log_id, rank_no),
    CHECK (rank_no BETWEEN 1 AND 3)
);
CREATE INDEX idx_match_candidates_cat_id ON match_candidates (cat_id);

-- 관리자 웹 운영자 계정 (회원가입 없이 내부에서 발급)
CREATE TABLE admin_users (
    id             BIGSERIAL     PRIMARY KEY,
    email          VARCHAR(255)  NOT NULL UNIQUE,
    password_hash  VARCHAR(255)  NOT NULL,
    name           VARCHAR(50)   NOT NULL,
    role           VARCHAR(30)   NOT NULL DEFAULT 'OPERATOR',   -- 예: 운영 관리자
    created_at     TIMESTAMPTZ   NOT NULL DEFAULT now()
);
