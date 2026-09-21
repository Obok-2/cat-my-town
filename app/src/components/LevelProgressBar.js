import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeContext';

// 목업 6페이지 "도감(메인 탭)" 상단 카드: 레벨 타이틀 + % + 바 + 하단 캡션 2줄.
export default function LevelProgressBar({ title, level, ratio, catCount, remainToNext }) {
  const colors = useColors();
  const percent = Math.round(ratio * 100);
  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[styles.eyebrow, { color: colors.textMuted }]}>나의 레벨</Text>
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: colors.text }]}>
          {title} {level > 0 ? `Lv.${level}` : ''}
        </Text>
        <Text style={[styles.percent, { color: colors.primary }]}>{percent}%</Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.cardAlt }]}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: colors.primary }]} />
      </View>
      <View style={styles.captionRow}>
        <Text style={[styles.caption, { color: colors.textMuted }]}>고양이 {catCount}마리 수집</Text>
        {remainToNext > 0 ? (
          <Text style={[styles.caption, { color: colors.textMuted }]}>다음 레벨까지 {remainToNext}마리</Text>
        ) : (
          <Text style={[styles.caption, { color: colors.textMuted }]}>최고 레벨 달성</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 20, borderWidth: 1, padding: 18 },
  eyebrow: { fontSize: 12, marginBottom: 6 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  title: { fontSize: 18, fontWeight: '800' },
  percent: { fontSize: 18, fontWeight: '800' },
  track: { height: 8, borderRadius: 4, marginTop: 12, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  captionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  caption: { fontSize: 12 },
});
