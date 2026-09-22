import React, { useState } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Rect, Line } from 'react-native-svg';
import { fonts } from '../theme/fonts';
import { circled } from '../data/circled';
import KakaoMapView from './KakaoMapView';
import { KAKAO_JS_KEY } from './kakaoMapDraw';

// 좌표가 있는 목격 기록이 하나라도 있으면 카카오 지도를 띄우고,
// 없으면(또는 지도 로딩 실패) 아래의 격자+핀 자리표시자를 그대로 보여준다.
// 높이 190 고정 · 폴리라인(경로선) 없음은 목업 스펙 그대로 유지.
// 맵 영역 색은 다른 화면과 별개로 목업의 고정 그린-그레이 팔레트를 그대로 쓴다(라이트/다크 공통).
const MAP_BG = '#E9EDE4';
const MAP_GRID = '#DCE3D4';
const MAP_ROAD = '#DFE5D8';
const PIN_COLOR = '#C9713C';
const PIN_SELECTED = '#A8552A';
const CARD_BG = '#FFF8EF';
const CARD_TEXT_MUTED = '#6E6055';
let gridUid = 0;

const PIN_POSITIONS = [
  { left: 24, top: 22 },
  { left: 150, top: 44 },
  { left: 28, top: 150 },
  { left: 228, top: 142 },
];
const SELECTED_POS = { left: 196, top: 96 };
const CARD_POS = { left: 96, top: 108 };
const PIN_LABEL = '#5F6B58';

function formatShort(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// 지도를 못 쓸 때 자리표시자 아래에 이유를 적어준다.
function fallbackCaption(mapFailed, pointCount) {
  if (mapFailed) return '지도를 불러오지 못했어요';
  if (!KAKAO_JS_KEY) return '지도 키가 없어 위치를 표시할 수 없어요';
  if (pointCount === 0) return '아직 위치가 기록된 목격이 없어요';
  return '실제 위치 지도는 준비 중이에요';
}

// 좌표(lat·lng)가 있는 목격만 지도에 찍는다. 번호는 오래된 목격이 ①이 되도록 전체 순서 기준으로 매긴다.
function toMapPoints(sightings) {
  const total = sightings.length;
  const points = [];
  for (let i = 0; i < total; i++) {
    const s = sightings[i];
    if (typeof s.lat !== 'number' || typeof s.lng !== 'number') continue;
    points.push({
      lat: s.lat,
      lng: s.lng,
      number: s.seq ?? total - i,
      label: circled(s.seq ?? total - i),
      date: formatShort(s.takenAt),
      memo: s.memo || '',
      latest: i === 0,
    });
  }
  return points;
}

// sightings: 최신순. 가장 최근 목격은 강조 핀 + 팝업 카드, 그 이전 목격은 번호 핀(최대 4개)으로 보여준다.
export default function SightingMiniMap({ sightings, height = 190 }) {
  const patternId = React.useMemo(() => `map-grid-${gridUid++}`, []);
  const total = sightings?.length ?? 0;
  const previous = (sightings ?? []).slice(1, 1 + PIN_POSITIONS.length);
  const latest = sightings?.[0];
  const [mapFailed, setMapFailed] = useState(false);

  const mapPoints = React.useMemo(() => toMapPoints(sightings ?? []), [sightings]);
  const canUseMap = !!KAKAO_JS_KEY && mapPoints.length > 0 && !mapFailed;

  function handleStatus(status) {
    if (!status.ok) setMapFailed(true);
  }

  if (canUseMap) {
    return (
      <View style={[styles.wrap, { height }]}>
        <KakaoMapView points={mapPoints} onStatus={handleStatus} />
      </View>
    );
  }

  return (
    <View style={[styles.wrap, { height }]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern id={patternId} width={26} height={26} patternUnits="userSpaceOnUse">
            <Line x1={0} y1={0} x2={26} y2={0} stroke={MAP_GRID} strokeWidth={1} />
            <Line x1={0} y1={0} x2={0} y2={26} stroke={MAP_GRID} strokeWidth={1} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={MAP_BG} />
        <Rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </Svg>
      <View style={styles.road} />
      <View style={styles.roadVertical} />

      {previous.map((s, i) => (
        <View key={s.id} style={[styles.pinRow, { left: PIN_POSITIONS[i].left, top: PIN_POSITIONS[i].top }]}>
          <View style={styles.pin} />
          <Text style={styles.pinLabel}>{circled(s.seq ?? total - 1 - i)}</Text>
        </View>
      ))}

      {latest && (
        <>
          <View style={[styles.pinRow, { left: SELECTED_POS.left, top: SELECTED_POS.top }]}>
            <View style={styles.pinSelected} />
          </View>
          <View style={[styles.popupCard, { left: CARD_POS.left, top: CARD_POS.top, backgroundColor: CARD_BG }]}>
            {latest.photoSource || latest.photoUri ? (
              <Image source={latest.photoSource ?? { uri: latest.photoUri }} style={styles.popupThumb} />
            ) : (
              <View style={[styles.popupThumb, { backgroundColor: MAP_GRID }]} />
            )}
            <View>
              <Text style={styles.popupDate}>
                {circled(latest.seq ?? total)} {formatShort(latest.takenAt)}
              </Text>
              {!!latest.memo && (
                <Text style={styles.popupMemo} numberOfLines={1}>
                  {latest.memo}
                </Text>
              )}
            </View>
          </View>
        </>
      )}

      <Text style={styles.caption}>{fallbackCaption(mapFailed, mapPoints.length)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 18, overflow: 'hidden', backgroundColor: MAP_BG, justifyContent: 'flex-end' },
  road: { position: 'absolute', left: 0, top: 64, width: '100%', height: 16, backgroundColor: MAP_ROAD },
  roadVertical: { position: 'absolute', left: 112, top: 0, width: 14, height: '100%', backgroundColor: MAP_ROAD },
  pinRow: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 4 },
  pinLabel: { fontFamily: fonts.body, fontSize: 11, color: PIN_LABEL },
  pin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderBottomRightRadius: 2,
    backgroundColor: PIN_COLOR,
    transform: [{ rotate: '-45deg' }],
  },
  pinSelected: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderBottomRightRadius: 2,
    backgroundColor: PIN_SELECTED,
    borderWidth: 2,
    borderColor: CARD_BG,
    transform: [{ rotate: '-45deg' }],
  },
  popupCard: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    padding: 8,
    borderRadius: 14,
    shadowColor: '#3C2D1E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
    maxWidth: 170,
  },
  popupThumb: { width: 40, height: 40, borderRadius: 10 },
  popupDate: { fontFamily: fonts.body, fontSize: 12, color: '#3A322C' },
  popupMemo: { fontFamily: fonts.body, fontSize: 11, color: CARD_TEXT_MUTED, marginTop: 2 },
  caption: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: '#5F6B58',
    textAlign: 'center',
    paddingVertical: 5,
    backgroundColor: 'rgba(233,237,228,0.85)',
  },
});
