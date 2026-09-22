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
- 로컬 DB명·계정·비밀번호는 Git에서 제외된 `infra/.env`의 `POSTGRES_DB`·`POSTGRES_USER`·`POSTGRES_PASSWORD`로 관리한다.
  `infra/.env.example`에는 키 이름만 두고 실제 값을 넣지 않는다. 서버는 같은 환경변수를 사용한다.
- 로컬 DB 스키마는 compose가 자동으로 적재하지 않는다 — 필요하면 `산출물/schema.sql`을 직접 실행한다. `schema.sql`을 고치면 ERD도 함께 맞춘다.
- 로컬 사진 저장소 MinIO(`infra/docker-compose.yml`의 `minio`) 관리자 이름·비밀번호는 Git에서 제외된 `infra/.env`의
  `MINIO_ROOT_USER`·`MINIO_ROOT_PASSWORD`로 관리한다. 포트는 API **9000**, 웹 콘솔 **9001**, 버킷 `cat-photos`는 `minio-init` 컨테이너가 자동으로 만든다.
  이미지는 Docker Hub의 `minio/minio`가 삭제되어 **Quay의 마지막 공식 이미지(`quay.io/minio/minio:RELEASE.2025-09-07...`)로 고정**한 것이니 `latest`나 Docker Hub 주소로 바꾸지 않는다.

## 지도 (app/)

- 고양이 상세(a7)의 목격 지도는 **카카오 지도 JS SDK**를 쓴다. 카카오는 React Native용 지도 SDK가 없어서
  네이티브(안드로이드·iOS)는 `react-native-webview` 안에 SDK를 띄우고(`KakaoMapView.js`), 웹은 페이지에 SDK를 직접 올린다(`KakaoMapView.web.js`).
  핀 그리는 코드는 `kakaoMapDraw.js`의 **문자열 상수 `DRAW_SOURCE`** 한 곳에 두고 양쪽 다 `<script>`로 집어넣는다.
  **함수를 `.toString()`으로 직렬화하면 안 된다** — React Native의 Hermes는 빌드할 때 소스를 바이트코드로 바꿔서
  `함수.toString()`이 `function () { [bytecode] }`를 돌려주므로 네이티브에서만 조용히 깨진다(웹에서는 멀쩡해서 놓치기 쉽다).
  `DRAW_SOURCE` 안에서는 바깥 변수·import를 쓸 수 없고, 바깥 템플릿 리터럴에 들어가므로 백틱과 `${`도 쓰지 않는다.
- 카카오 개발자 콘솔에서 **두 가지를 켜야** SDK가 내려온다 — 안 켜져 있으면 각각 다른 오류가 난다(둘 다 앱 코드 문제 아님).
  ① [제품 설정 > 카카오맵] 활성화 ON — 꺼져 있으면 `NotAuthorizedError: disabled OPEN_MAP_AND_LOCAL service`
  ② [내 애플리케이션 > 플랫폼 > Web]에 도메인 등록(`http://localhost:8081`·`https://localhost`) — 안 돼 있으면 `AccessDeniedError: domain mismatched`
  이 오류가 나도 앱은 죽지 않고 격자 자리표시자로 넘어간다.

## 코딩 규칙 (React — app/, web/)

- **`useEffect`는 최소한으로 쓴다.** 쓰기 전에 effect 없이 되는지 먼저 본다.
  값 계산은 렌더 중에(파생값), 사용자 동작은 이벤트 핸들러에, 외부 저장소 구독은 `useSyncExternalStore`, 권한·데이터는 라이브러리가 주는 옵션/훅으로 처리한다.
- 꼭 필요한 `useEffect`는 웬만하면 **`[]`(마운트 시 1회)로 끝나게** 설계한다. 값이 바뀔 때마다 다시 도는 effect는 가능하면 만들지 않는다.
- 단, 값이 바뀔 때 정말 다시 실행돼야 하는 effect의 의존성을 `[]`로 억지로 비우지 않는다(오래된 값을 쓰는 버그, `exhaustive-deps` 경고를 무시하는 것도 금지).
  그런 경우엔 effect를 없애는 방향(위 첫 항목)으로 구조를 바꾼다.
- `useFocusEffect`는 `useEffect`와 별개다. 탭 화면은 언마운트되지 않아서 "화면에 돌아올 때마다 새로 읽어야 하는 데이터"에 필요하므로 `[]`(1회)로 바꾸지 않는다.

## 코딩 규칙 (Java — server/)

- **앱용 API**는 URL 앞에 `/app`을 붙이되 문자열을 직접 쓰지 않고 상수 `ApiUrl.APP`(`com.catmytown.server.common.ApiUrl`)를 쓴다(`@RequestMapping(ApiUrl.APP + "/collection")`). **화면(도메인) 단위로 패키지를 나눈다** — 지금은
  `/app/collection`(도감 목록) · `/app/cat`(고양이 상세 화면) · `/app/camera` · `/app/level` → `com.catmytown.server.app.{collection,cat,camera,level}`.
  같은 "고양이" 관련이어도 화면이 다르면 패키지를 같이 쓰지 않는다(도감 목록은 collection, 고양이 상세는 cat — 새 화면이 생기면 그 화면 이름으로 새 패키지를 만든다).
  구조는 `XxxController` → `XxxService` → `XxxDao`(`@Mapper` 인터페이스) → Mapper XML.
- **경로 변수(`@PathVariable`)는 쓰지 않는다.** id를 포함해 요청값은 전부 GET이면 `@RequestParam`, 본문이 있으면 `@RequestBody`로 받는다
  (예: `GET /app/cat/detail?catId=12`이지 `GET /app/cat/{catId}`가 아니다).
- **MyBatis 설정**은 `application.properties`에 이 형태로 둔다: `mybatis.config-location=classpath:mybatis/mybatis-config.xml` ·
  `mybatis.type-aliases-package=com.catmytown.server.model` · `mybatis.mapper-locations=mybatis/mappers/*.xml`.
  Mapper XML은 `src/main/resources/mybatis/mappers/` 한 폴더에 `XxxMapper.xml`로 두고(하위 폴더 없음) `namespace`는 Dao 인터페이스의 전체 이름.
- **VO/DTO 클래스는 `com.catmytown.server.model` 패키지**에 둔다. 클래스 이름이 곧 **별칭**이라 mapper XML의 `resultType`/`parameterType`에 전체 이름 대신 클래스 이름을 쓴다.
  같은 이름의 클래스를 둘 이상 만들지 않는다(시작할 때 오류).
- `mybatis-config.xml`에는 `<settings>`(예: `mapUnderscoreToCamelCase`)를 둔다. **`config-location`을 쓰면 `mybatis.configuration.*` 속성은 같이 쓸 수 없다**(시작 오류) — 그 설정은 XML로.
  속성 이름은 `mybatis.config`가 아니라 **`mybatis.config-location`** 이다(`mybatis.config`는 무시됨). Mapper는 `mapper-locations`로 잡으므로 config의 `<mappers>`에는 같이 등록하지 않는다(둘 다 쓰면 중복 등록 오류).
- **SQL(Mapper XML 쿼리, `schema.sql` 포함)은 한 줄로 쓰지 않고 절마다 줄을 나눠 정렬해서 쓴다.** `SELECT`·`FROM`·`JOIN`·`WHERE`·`GROUP BY`·`ORDER BY`를 각각 새 줄에 쓰고 키워드 끝을 맞춘다.
  조회 컬럼이 여러 개면 한 줄에 하나씩 쓴다. 예:
  ```xml
  <select id="selectCatList" parameterType="long" resultType="CatCardVo">
      SELECT c.id,
             c.name,
             COUNT(s.id) AS sighting_count
        FROM cats c
        LEFT JOIN sightings s ON s.cat_id = c.id
       WHERE c.user_id = #{userId}
       GROUP BY c.id, c.name
       ORDER BY c.created_at DESC
  </select>
  ```
- **모든 REST API 응답은 공통 클래스 `ResponseApi`(`com.catmytown.server.common`)로 통일한다.** 필드는 `result`(`RESULT` enum: `SUCCESS` 성공 / `FAIL` 업무 처리 실패 / `ERROR` 시스템 오류) · `message` · `code`(int, 성공 기본 200) · `data`(Object).
  실제 데이터는 `data`에 담는다. 응답 JSON 예: `{ "result": "SUCCESS", "message": "SUCCESS", "code": 200, "data": { "catCount": 12 } }`
- **컨트롤러와 Service 메서드는 모두 `ResponseApi`를 반환한다.** Service가 결과를 `ResponseApi.success(...)`로 감싸서 돌려주고, 컨트롤러는 그것을 그대로 `return collectionService.getCatList(userId);` 한다. `RESULT`·메시지·코드를 매번 직접 쓰지 않고 정적 팩토리(`ResponseApi.success(data)` / `fail(code, message)` / `error(message)`)를 쓴다.
  컨트롤러에는 try/catch를 두지 않는다 — 실패·오류는 예외를 던지고 `@RestControllerAdvice` 전역 예외 처리기(`GlobalExceptionHandler`)가 같은 모양으로 변환한다(시스템 오류는 사용자에게 일반 문구만 보이고 스택트레이스는 숨긴다).
  컨트롤러는 요청을 받아 Service를 호출하고 그 결과를 그대로 반환하기만 하며, 로직과 `ResponseApi` 생성은 Service에 둔다.
- **요청·응답 객체**: 응답 데이터는 `XxxRes`, 요청 본문·파라미터가 있으면 `XxxReq`(없으면 만들지 않는다), 쿼리 결과만 담는 내부용은 `XxxVo`로 이름 짓고 모두 `com.catmytown.server.model` 패키지에 둔다.
  클래스 이름이 MyBatis 별칭이라 겹치지 않게 기능명을 앞에 붙인다(예: `CollectionCatRes`). `Res`는 `ResponseApi`의 `data`에 담기는 내용이며, Service가 `ResponseApi.success(new XxxRes(...))`로 만든다.
- **람다식·스트림·메서드 참조(`->`, `::`)와 `->`를 쓰는 switch 식은 쓰지 않는다.** 읽기 어려우므로 `for`문·`if`문·일반 `switch`로 풀어서 쓴다(컬렉션 묶기·변환도 `for`문으로).
  이벤트 핸들러 같은 인터페이스 구현이 필요하면 람다 대신 클래스로 구현한다.
- **서버 오류의 상세 원인은 클라이언트에 알리지 않는다(보안).** 응답에는 일반 문구(`서버 오류가 발생했습니다.`)만 내려가고, 예외 메시지·스택트레이스·DB 접속 정보 등은 서버 로그에만 남긴다.
  예외 메시지를 응답 `message`에 그대로 넣지 않고, Tomcat 오류 페이지의 서버 이름·버전도 숨긴다(`TomcatErrorPageConfig`).
- 의존성 주입은 **필드에 `@Autowired`** 로 한다. `@RequiredArgsConstructor` 생성자 주입은 쓰지 않는다.

## 절대 규칙

1. **git commit·push는 사용자가 먼저 하기 전까지 하지 않는다.** 코드·문서를 수정해도 커밋하지 않고 작업 트리에만 남겨둔다. "커밋해", "푸시해"처럼 명시적으로 요청했을 때만 실행한다. (2026-09-21 — 동의 없이 커밋·푸시해서 항의받음)
2. **테스트(단위 테스트 실행, Docker로 DB 띄우기, curl·헤드리스 브라우저로 직접 호출 검증 등)는 사용자가 하라고 하기 전까지 하지 않는다.** 코드만 작성해서 남겨두고, 검증은 사용자가 "테스트해", "검증해"처럼 명시적으로 요청했을 때만 한다. (2026-09-22 — 시키지도 않은 테스트를 계속 돌려서 토큰 낭비한다고 항의받음)
