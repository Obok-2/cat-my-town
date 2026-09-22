import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { DRAW_SOURCE, DRAW_FUNCTION_NAME, kakaoSdkUrl, KAKAO_JS_KEY } from './kakaoMapDraw';

// 안드로이드·iOS용. 카카오는 React Native 지도 SDK를 제공하지 않아서
// WebView 안에 카카오 지도 JS SDK를 띄운다(카카오 문서의 <script src="...sdk.js?appkey=..."> 그대로).
// baseUrl이 카카오에 보내는 Referer가 되므로, 개발자 콘솔 [플랫폼 > Web]에
// https://localhost 를 등록해야 지도가 뜬다.
const BASE_URL = 'https://localhost';

function buildHtml(points) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
<style>html,body,#map{margin:0;padding:0;width:100%;height:100%;overflow:hidden;background:#E9EDE4}</style>
<script src="${kakaoSdkUrl(KAKAO_JS_KEY)}"></script>
</head>
<body>
<div id="map"></div>
<script>
${DRAW_SOURCE}
  var points = ${JSON.stringify(points)};
  function report(message) {
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(message);
  }
  window.onerror = function (message) { report('error:' + message); };
  if (window.kakao && window.kakao.maps) {
    kakao.maps.load(function () {
      try {
        ${DRAW_FUNCTION_NAME}(kakao, document.getElementById('map'), points);
        report('ready');
      } catch (e) {
        report('error:' + e.message);
      }
    });
  } else {
    report('error:sdk-not-loaded');
  }
</script>
</body>
</html>`;
}

export default function KakaoMapView({ points, onStatus }) {
  function handleMessage(event) {
    if (!onStatus) return;
    const data = event.nativeEvent.data;
    if (data === 'ready') {
      onStatus({ ok: true });
    } else if (data.startsWith('error:')) {
      onStatus({ ok: false, message: data.slice(6) });
    }
  }

  return (
    <WebView
      style={styles.web}
      originWhitelist={['*']}
      source={{ html: buildHtml(points), baseUrl: BASE_URL }}
      onMessage={handleMessage}
      scrollEnabled={false}
      javaScriptEnabled
      domStorageEnabled
      androidLayerType="hardware"
    />
  );
}

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: '#E9EDE4' },
});
