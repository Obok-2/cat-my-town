import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

// 목업 a6·a10 레벨 카드: 라벨(a6 "나의 레벨" / a10 "지금 나의 등급") + Jua 타이틀/퍼센트 + 진행 바 + 캡션 2줄.
export default function LevelProgressBar({ title, level, ratio, catCount, remainToNext, eyebrow = '나의 레벨' }) {
  const colors = useColors();
  const percent = Math.round(ratio * 100);
  return (
    <View style={[styles.card, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
      <View style={styles.titleRow}>
        <View style={{ gap: 4 }}>
          <Text style={[styles.eyebrow, { color: colors.textMuted }]}>{eyebrow}</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {title} {level > 0 ? `Lv.${level}` : ''}
          </Text>
        </View>
        <Text style={[styles.percent, { color: colors.accent }]}>
          {percent}
          <Text style={styles.percentSign}>%</Text>
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.trackBg }]}>
        <LinearGradient
          colors={colors.primaryGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.fill, { width: `${percent}%` }]}
        />
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
  card: { borderRadius: 24, borderWidth: 1.5, padding: 20, gap: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  eyebrow: { fontFamily: fonts.body, fontSize: 12 },
  title: { fontFamily: fonts.display, fontSize: 25 },
  percent: { fontFamily: fonts.display, fontSize: 30 },
  percentSign: { fontSize: 16 },
  track: { height: 16, borderRadius: 8, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 8 },
  captionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  caption: { fontFamily: fonts.body, fontSize: 12 },
});
