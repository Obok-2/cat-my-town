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
- 로컬 사진 저장소 MinIO(`infra/docker-compose.yml`의 `minio`)도 같은 방식으로 계정(`catmytown`)·비밀번호를 **하드코딩**한다. 포트는 API **9000**, 웹 콘솔 **9001**,
  버킷 `cat-photos`는 `minio-init` 컨테이너가 자동으로 만든다. 비밀번호는 compose 안의 `minio`와 `minio-init` **두 곳이 같아야** 한다.
  이미지는 Docker Hub의 `minio/minio`가 삭제되어 **Quay의 마지막 공식 이미지(`quay.io/minio/minio:RELEASE.2025-09-07...`)로 고정**한 것이니 `latest`나 Docker Hub 주소로 바꾸지 않는다.

## 코딩 규칙 (React — app/, web/)

- **`useEffect`는 최소한으로 쓴다.** 쓰기 전에 effect 없이 되는지 먼저 본다.
  값 계산은 렌더 중에(파생값), 사용자 동작은 이벤트 핸들러에, 외부 저장소 구독은 `useSyncExternalStore`, 권한·데이터는 라이브러리가 주는 옵션/훅으로 처리한다.
- 꼭 필요한 `useEffect`는 웬만하면 **`[]`(마운트 시 1회)로 끝나게** 설계한다. 값이 바뀔 때마다 다시 도는 effect는 가능하면 만들지 않는다.
- 단, 값이 바뀔 때 정말 다시 실행돼야 하는 effect의 의존성을 `[]`로 억지로 비우지 않는다(오래된 값을 쓰는 버그, `exhaustive-deps` 경고를 무시하는 것도 금지).
  그런 경우엔 effect를 없애는 방향(위 첫 항목)으로 구조를 바꾼다.
- `useFocusEffect`는 `useEffect`와 별개다. 탭 화면은 언마운트되지 않아서 "화면에 돌아올 때마다 새로 읽어야 하는 데이터"에 필요하므로 `[]`(1회)로 바꾸지 않는다.

## 코딩 규칙 (Java — server/)

- **앱용 API**는 URL 앞에 `/app`을 붙이되 문자열을 직접 쓰지 않고 상수 `ApiUrl.APP`(`com.catmytown.server.common.ApiUrl`)를 쓴다(`@RequestMapping(ApiUrl.APP + "/collection")`). 기능별 패키지로 나눈다: `/app/collection` · `/app/camera` · `/app/level` → `com.catmytown.server.app.{collection,camera,level}`.
  구조는 `XxxController` → `XxxService` → `XxxDao`(`@Mapper` 인터페이스) → Mapper XML.
- **MyBatis 설정**은 `application.properties`에 이 형태로 둔다: `mybatis.config-location=classpath:mybatis/mybatis-config.xml` ·
  `mybatis.type-aliases-package=com.catmytown.server.model` · `mybatis.mapper-locations=mybatis/mappers/*.xml`.
  Mapper XML은 `src/main/resources/mybatis/mappers/` 한 폴더에 `XxxMapper.xml`로 두고(하위 폴더 없음) `namespace`는 Dao 인터페이스의 전체 이름.
- **VO/DTO 클래스는 `com.catmytown.server.model` 패키지**에 둔다. 클래스 이름이 곧 **별칭**이라 mapper XML의 `resultType`/`parameterType`에 전체 이름 대신 클래스 이름을 쓴다.
  같은 이름의 클래스를 둘 이상 만들지 않는다(시작할 때 오류).
- `mybatis-config.xml`에는 `<settings>`(예: `mapUnderscoreToCamelCase`)를 둔다. **`config-location`을 쓰면 `mybatis.configuration.*` 속성은 같이 쓸 수 없다**(시작 오류) — 그 설정은 XML로.
  속성 이름은 `mybatis.config`가 아니라 **`mybatis.config-location`** 이다(`mybatis.config`는 무시됨). Mapper는 `mapper-locations`로 잡으므로 config의 `<mappers>`에는 같이 등록하지 않는다(둘 다 쓰면 중복 등록 오류).
- 의존성 주입은 **필드에 `@Autowired`** 로 한다. `@RequiredArgsConstructor` 생성자 주입은 쓰지 않는다.

## 절대 규칙

1. **git commit·push는 사용자가 먼저 하기 전까지 하지 않는다.** 코드·문서를 수정해도 커밋하지 않고 작업 트리에만 남겨둔다. "커밋해", "푸시해"처럼 명시적으로 요청했을 때만 실행한다. (2026-09-21 — 동의 없이 커밋·푸시해서 항의받음)
