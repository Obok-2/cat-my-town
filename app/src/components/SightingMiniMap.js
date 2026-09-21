import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeContext';

// ⚠️ 자리표시자. 목업 8페이지는 react-native-maps를 쓰지만, 실제 지도를 그리려면
// Google Maps API 키 발급·설정이 필요해서(아직 없음) 지금은 핀만 흉내낸 정적 뷰다.
// 높이 190 고정 · scrollEnabled 없음 · 폴리라인(경로선) 없음은 목업 스펙 그대로 유지.
export default function SightingMiniMap({ sightings, height = 190 }) {
  const colors = useColors();
  const pinCount = Math.min(sightings?.length ?? 0, 6);

  return (
    <View style={[styles.wrap, { height, backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
      <View style={styles.grid}>
        {Array.from({ length: pinCount }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.pin,
              {
                backgroundColor: colors.primary,
                left: `${15 + ((i * 37) % 70)}%`,
                top: `${20 + ((i * 53) % 55)}%`,
              },
            ]}
          />
        ))}
      </View>
      <Text style={[styles.caption, { color: colors.textMuted }]}>실제 위치 지도는 준비 중이에요</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 16, borderWidth: 1, overflow: 'hidden', justifyContent: 'flex-end' },
  grid: { ...StyleSheet.absoluteFillObject },
  pin: { position: 'absolute', width: 12, height: 12, borderRadius: 6 },
  caption: { fontSize: 11, textAlign: 'center', paddingVertical: 8 },
});
