// 카카오 지도에 목격 핀을 그리는 코드.
//
// ⚠️ 왜 함수가 아니라 **문자열**인가:
// 네이티브(안드로이드·iOS)는 WebView 안에서 이 코드를 실행해야 하는데, React Native의 Hermes 엔진은
// 빌드할 때 소스를 바이트코드로 바꿔버려서 `함수.toString()`이 원본 대신 `function () { [bytecode] }`를 준다
// (웹에서는 멀쩡히 동작해서 놓치기 쉽다). 그래서 함수를 직렬화하는 방식 대신, 소스를 문자열로 들고 있다가
// 웹·네이티브 양쪽 다 `<script>`로 그대로 집어넣는 방식을 쓴다(eval 없음).
//
// points: [{ lat, lng, number, label, date, memo, latest }] — number는 마커 안에 넣을 순번(1,2,3…),
// label은 팝업 카드용 원 숫자(①②③…)
export const DRAW_FUNCTION_NAME = 'drawKakaoMap';

export const DRAW_SOURCE = `
function drawKakaoMap(kakao, container, points) {
  var PIN = '#C9713C';
  var PIN_LATEST = '#A8552A';
  var CARD_BG = '#FFF8EF';

  // 숫자가 안에 박힌 원형 마커 + 아래로 뾰족한 꼬리(핀이 실제 좌표를 가리키는 지점).
  function pinElement(point) {
    var size = point.latest ? 30 : 24;
    var tailH = 8;
    var color = point.latest ? PIN_LATEST : PIN;

    var wrap = document.createElement('div');
    wrap.style.cssText =
      'position:relative;width:' + size + 'px;height:' + (size + tailH) + 'px;transform:translate(-50%,-100%)';

    var circle = document.createElement('div');
    circle.style.cssText =
      'position:absolute;top:0;left:0;width:' + size + 'px;height:' + size + 'px;border-radius:50%;' +
      'background:' + color + ';display:flex;align-items:center;justify-content:center;' +
      'box-shadow:0 2px 5px rgba(60,45,30,0.35);box-sizing:border-box;' +
      (point.latest ? 'border:2px solid ' + CARD_BG + ';' : '');
    var num = document.createElement('span');
    num.textContent = point.number;
    num.style.cssText =
      'font-size:' + (point.latest ? '14px' : '12px') + ';font-weight:bold;color:' + CARD_BG + ';line-height:1';
    circle.appendChild(num);
    wrap.appendChild(circle);

    var tail = document.createElement('div');
    tail.style.cssText =
      'position:absolute;left:50%;top:' + (size - 3) + 'px;width:0;height:0;margin-left:-6px;' +
      'border-left:6px solid transparent;border-right:6px solid transparent;border-top:' + tailH + 'px solid ' + color;
    wrap.appendChild(tail);

    return wrap;
  }

  function cardElement(point) {
    var card = document.createElement('div');
    card.style.cssText =
      'transform:translate(-50%,-115%);background:' + CARD_BG + ';border-radius:14px;padding:7px 10px;' +
      'box-shadow:0 6px 14px rgba(60,45,30,0.22);max-width:180px;white-space:nowrap;overflow:hidden;' +
      'text-overflow:ellipsis;font-size:12px;color:#3A322C';
    card.textContent = point.label + ' ' + point.date;
    if (point.memo) {
      var memo = document.createElement('div');
      memo.textContent = point.memo;
      memo.style.cssText = 'font-size:11px;color:#6E6055;margin-top:2px';
      card.appendChild(memo);
    }
    return card;
  }

  var map = new kakao.maps.Map(container, {
    center: new kakao.maps.LatLng(points[0].lat, points[0].lng),
    level: 4
  });
  map.setZoomable(true);
  map.setDraggable(true);

  var bounds = new kakao.maps.LatLngBounds();
  for (var i = 0; i < points.length; i++) {
    var point = points[i];
    var position = new kakao.maps.LatLng(point.lat, point.lng);
    bounds.extend(position);

    new kakao.maps.CustomOverlay({
      map: map,
      position: position,
      content: pinElement(point),
      zIndex: point.latest ? 3 : 2
    });

    if (point.latest) {
      new kakao.maps.CustomOverlay({
        map: map,
        position: position,
        content: cardElement(point),
        zIndex: 4
      });
    }
  }

  // 핀이 하나뿐이면 setBounds가 너무 확대되므로 그대로 둔다.
  // 위쪽 여백을 크게 주는 건 최신 목격의 팝업 카드가 핀 위로 떠서 잘리지 않게 하려는 것이다.
  if (points.length > 1) {
    map.setBounds(bounds, 92, 44, 26, 44);
  }
  return map;
}
`;

// 카카오 지도 SDK 주소. autoload=false 로 받아서 kakao.maps.load() 안에서 그린다.
export function kakaoSdkUrl(appKey) {
  return 'https://dapi.kakao.com/v2/maps/sdk.js?autoload=false&appkey=' + appKey;
}

export const KAKAO_JS_KEY = process.env.EXPO_PUBLIC_KAKAO_JS_KEY || '';
