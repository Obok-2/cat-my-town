import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Rect, Line } from 'react-native-svg';
import { fonts } from '../theme/fonts';

// ⚠️ 자리표시자. 목업 a7은 react-native-maps를 쓰지만, 실제 지도를 그리려면
// Google Maps API 키 발급이 필요해서(아직 없음) 격자+핀만 흉내낸 정적 뷰다.
// 높이 190 고정 · scrollEnabled 없음 · 폴리라인(경로선) 없음은 목업 스펙 그대로 유지.
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
  { left: 76, top: 126 },
  { left: 228, top: 142 },
];
const SELECTED_POS = { left: 196, top: 96 };
const CARD_POS = { left: 84, top: 106 };

function formatShort(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

export default function SightingMiniMap({ sightings, height = 190 }) {
  const patternId = React.useMemo(() => `map-grid-${gridUid++}`, []);
  const pinCount = Math.min(sightings?.length ?? 0, PIN_POSITIONS.length);
  const latest = sightings?.[0];

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

      {PIN_POSITIONS.slice(0, pinCount).map((pos, i) => (
        <View key={i} style={[styles.pinRow, { left: pos.left, top: pos.top }]}>
          <View style={styles.pin} />
        </View>
      ))}

      {latest && (
        <>
          <View style={[styles.pinRow, { left: SELECTED_POS.left, top: SELECTED_POS.top }]}>
            <View style={styles.pinSelected} />
          </View>
          <View style={[styles.popupCard, { left: CARD_POS.left, top: CARD_POS.top, backgroundColor: CARD_BG }]}>
            {latest.photoUri ? (
              <Image source={{ uri: latest.photoUri }} style={styles.popupThumb} />
            ) : (
              <View style={[styles.popupThumb, { backgroundColor: MAP_GRID }]} />
            )}
            <View>
              <Text style={styles.popupDate}>{formatShort(latest.takenAt)}</Text>
              {!!latest.memo && (
                <Text style={styles.popupMemo} numberOfLines={1}>
                  {latest.memo}
                </Text>
              )}
            </View>
          </View>
        </>
      )}

      <Text style={styles.caption}>실제 위치 지도는 준비 중이에요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 18, overflow: 'hidden', backgroundColor: MAP_BG, justifyContent: 'flex-end' },
  road: { position: 'absolute', left: 0, top: 64, width: '100%', height: 16, backgroundColor: MAP_ROAD },
  roadVertical: { position: 'absolute', left: 112, top: 0, width: 14, height: '100%', backgroundColor: MAP_ROAD },
  pinRow: { position: 'absolute' },
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
    paddingVertical: 8,
    backgroundColor: 'rgba(233,237,228,0.85)',
  },
});
