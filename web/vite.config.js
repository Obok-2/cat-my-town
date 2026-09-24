import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // 백엔드 도메인은 공개 저장소에 적지 않고 Git 제외 web/.env 의 API_PROXY_TARGET 에서 읽는다
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    server: {
      // 로컬 개발(npm run dev)에서도 배포와 같은 /api 주소를 쓰도록 /api/... 를 백엔드의 /cat/... 로 넘긴다
      // (배포에서는 관리자 도메인 서버의 nginx가 같은 일을 한다). 빌드 결과물에는 들어가지 않는다.
      proxy: env.API_PROXY_TARGET
        ? {
            '/api': {
              target: env.API_PROXY_TARGET,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, '/cat'),
            },
          }
        : undefined,
    },
  };
});
