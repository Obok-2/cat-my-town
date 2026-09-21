# 우리동네고양이 (cat-my-town)

새 세션을 시작하면 먼저 `docs/진행상황.md`를 읽고 지금까지 어디까지 진행됐는지 확인한다.
작업 중단 지점을 추측하지 말고 그 문서를 기준으로 이어간다.

작업을 마치면 `docs/진행상황.md`의 「작업 기록」에 무엇을 했는지 날짜와 함께 추가하고,
「다음에 할 일」을 최신 상태로 갱신한다.

프로젝트 개요·기획 내용은 `README.md` 참고.

## 로컬 개발 환경

- 로컬 DB(`infra/docker-compose.yml`, PostgreSQL + pgvector)는 호스트 포트 **5455**로 연다(컨테이너 내부는 5432).
  이미 다른 PostgreSQL이 기본 포트 5432를 쓰고 있을 수 있어 **포트 충돌을 피하려고 일부러 5455로 바꾼 것**이다.
  5432로 되돌리지 말고, DB 접속 주소(`server/src/main/resources/application.properties`의 `spring.datasource.url`)도 5455 기준으로 맞춘다.
- 로컬 전용이라 DB명·계정(`catmytown`)과 비밀번호는 compose 파일과 `application.properties`에 **하드코딩**한다(접속 주소는 `localhost`). 환경변수·`.env`로 분리하지 않는다.
  비밀번호는 무작위 문자열이고 `infra/docker-compose.yml`의 `POSTGRES_PASSWORD`와 `application.properties`의 `spring.datasource.password` **두 곳이 항상 같아야** 한다.
  (git에 올라가는 값이므로 운영 환경에는 절대 재사용하지 않는다)

## 절대 규칙

1. **git commit·push는 사용자가 먼저 하기 전까지 하지 않는다.** 코드·문서를 수정해도 커밋하지 않고 작업 트리에만 남겨둔다. "커밋해", "푸시해"처럼 명시적으로 요청했을 때만 실행한다. (2026-09-21 — 동의 없이 커밋·푸시해서 항의받음)
