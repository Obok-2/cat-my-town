import React, { useEffect, useRef } from 'react';
import { DRAW_SOURCE, DRAW_FUNCTION_NAME, kakaoSdkUrl, KAKAO_JS_KEY } from './kakaoMapDraw';

// 웹용. WebView 없이 페이지에 카카오 지도 SDK를 직접 올린다(카카오 문서의
// <script src="...sdk.js?appkey=..."> 방식 그대로 — react-native-webview는 웹을 지원하지 않는다).
// 페이지 주소가 그대로 Referer가 되므로 개발자 콘솔 [플랫폼 > Web]에
// http://localhost:8081 같은 개발 주소를 등록해야 지도가 뜬다.
const SDK_SCRIPT_ID = 'kakao-maps-sdk';
const DRAW_SCRIPT_ID = 'kakao-maps-draw';

// 핀 그리는 코드는 네이티브와 같은 문자열을 쓴다(kakaoMapDraw.js의 설명 참고).
// 한 번만 <script>로 넣어두면 window[DRAW_FUNCTION_NAME]으로 부를 수 있다.
function ensureDrawFunction() {
  if (window[DRAW_FUNCTION_NAME] || document.getElementById(DRAW_SCRIPT_ID)) return;
  const script = document.createElement('script');
  script.id = DRAW_SCRIPT_ID;
  script.textContent = DRAW_SOURCE;
  document.head.appendChild(script);
}

function loadSdk() {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps && window.kakao.maps.Map) {
      resolve();
      return;
    }
    let script = document.getElementById(SDK_SCRIPT_ID);
    if (!script) {
      script = document.createElement('script');
      script.id = SDK_SCRIPT_ID;
      script.src = kakaoSdkUrl(KAKAO_JS_KEY);
      document.head.appendChild(script);
    }
    script.addEventListener('load', () => window.kakao.maps.load(resolve));
    script.addEventListener('error', () => reject(new Error('sdk-not-loaded')));
    // 이미 받아진 스크립트라면 load 이벤트가 다시 오지 않는다.
    if (window.kakao && window.kakao.maps) window.kakao.maps.load(resolve);
  });
}

export default function KakaoMapView({ points, onStatus }) {
  const containerRef = useRef(null);
  // points는 화면이 열릴 때 정해지고 바뀌지 않아서 최초 1회만 그린다.
  const statusRef = useRef(onStatus);
  statusRef.current = onStatus;

  useEffect(() => {
    let cancelled = false;
    loadSdk()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        ensureDrawFunction();
        if (typeof window[DRAW_FUNCTION_NAME] !== 'function') throw new Error('draw-not-loaded');
        window[DRAW_FUNCTION_NAME](window.kakao, containerRef.current, points);
        if (statusRef.current) statusRef.current({ ok: true });
      })
      .catch((e) => {
        if (cancelled) return;
        if (statusRef.current) statusRef.current({ ok: false, message: e.message });
      });
    return () => {
      cancelled = true;
    };
  }, [points]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', background: '#E9EDE4' }} />;
}
