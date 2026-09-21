import React from 'react';
import { Pressable, View, Text, Image, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import PlaceholderArt from './PlaceholderArt';

// 매칭 결과의 후보 1칸: 사진 · 이름 · 만난 횟수 · 일치율 · 선택 표시(라디오).
export default function MatchCandidateCard({ cat, score, selected, onPress }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: selected ? colors.cardAlt : colors.card,
          borderColor: selected ? colors.primary : colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      {cat.photoUri ? (
        <Image source={{ uri: cat.photoUri }} style={styles.photo} />
      ) : (
        <PlaceholderArt radius={16} style={styles.photo} />
      )}

      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {cat.name}
        </Text>
        <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
          {cat.sightingCount}번 만났어요{cat.tags?.[0] ? ` · ${cat.tags[0]}` : ''}
        </Text>
      </View>

      <View style={styles.right}>
        <Text style={[styles.percent, { color: colors.accent }]}>
          {Math.round(score * 100)}
          <Text style={styles.percentSign}>%</Text>
        </Text>
        <View style={[styles.radio, { borderColor: selected ? colors.primary : colors.borderStrong }]}>
          {selected && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 12,
    borderRadius: 22,
    borderWidth: 2,
  },
  photo: { width: 72, height: 72, borderRadius: 16 },
  info: { flex: 1, gap: 4 },
  name: { fontFamily: fonts.display, fontSize: 18 },
  meta: { fontFamily: fonts.body, fontSize: 13 },
  right: { alignItems: 'flex-end', gap: 8, paddingRight: 4 },
  percent: { fontFamily: fonts.display, fontSize: 24, lineHeight: 26 },
  percentSign: { fontSize: 13 },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
});
