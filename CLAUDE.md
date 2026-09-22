@AGENTS.md

## 앱 API 호출 규칙 (`app/`)

- 서버 HTTP API 호출은 `fetch` 대신 **axios**를 사용한다.
- 비동기 API 코드는 Promise의 `.then()`·`.catch()` 체인 대신 **`async`/`await`와 `try`/`catch`**로 작성한다.
- API 호출 코드는 화면·컴포넌트에 직접 작성하지 않고 `app/src/api/`에 기능별 모듈로 분리한다.
  예: 카메라 API는 `app/src/api/cameraApi.js`에서 함수를 `export`하고 화면은 그 함수를 import해서 사용한다.
- 단순한 API 호출에 공통 클라이언트·래퍼·응답 정규화 계층을 추가하지 않는다. 요청 객체를 만들고 axios를 호출한 뒤
  응답을 그대로 반환하는 아래 형태를 기본으로 한다.

```js
import axios from 'axios';

export const login = async (id, pwd) => {
  const bodyObj = { id, pwd };
  const data = await axios.post('http://localhost:5000/login', bodyObj);
  return data;
};
```

## 서버 CORS 규칙 (`server/`)

- CORS는 개별 컨트롤러의 `@CrossOrigin`으로 설정하지 않는다.
- `com.catmytown.server.common.WebConfig`의 Spring MVC 전역 설정에서 모든 API에 공통 적용한다.
