import React from 'react';
import { Pressable, View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { MATCH_HIGH } from '../data/matchConfig';
import PlaceholderArt from './PlaceholderArt';

// 목업 a3 후보 1칸: 사진 · 이름 · 일치율(%) + 등급 뱃지 · 일치율 바 · "태그 · N번 만남" · [이 고양이예요].
// 70% 이상은 초록("매우 비슷해요"), 그 아래는 주황("조금 비슷해요"). 1순위 후보는 주황 테두리로 강조한다.
export default function MatchCandidateCard({ cat, score, top, busy, disabled, onConfirm }) {
  const colors = useColors();
  const percent = Math.round(score * 100);
  const high = score >= MATCH_HIGH;
  const tone = high ? colors.matchGood : colors.matchWarn;
  const badgeBg = high ? colors.matchGoodBadgeBg : colors.matchWarnBadgeBg;
  const badgeText = high ? colors.matchGoodBadgeText : colors.matchWarnBadgeText;

  return (
    <View
      style={[
        styles.card,
        top
          ? { backgroundColor: colors.card, borderColor: colors.primary, borderWidth: 2 }
          : { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1.5 },
      ]}
    >
      {cat.photoSource || cat.photoUri ? (
        <Image source={cat.photoSource ?? { uri: cat.photoUri }} style={styles.photo} />
      ) : (
        <PlaceholderArt radius={15} style={styles.photo} />
      )}

      <View style={styles.info}>
        <View style={styles.nameRow}>
          <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
            {cat.name}
          </Text>
          <Text style={[styles.percent, { color: tone }]}>
            {percent}
            <Text style={styles.percentSign}>%</Text>
          </Text>
          <View style={[styles.badge, { backgroundColor: badgeBg }]}>
            <Text style={[styles.badgeText, { color: badgeText }]}>{high ? '매우 비슷해요' : '조금 비슷해요'}</Text>
          </View>
        </View>
        <View style={[styles.track, { backgroundColor: colors.trackBg }]}>
          <View style={[styles.fill, { width: `${percent}%`, backgroundColor: tone }]} />
        </View>
        <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>
          {cat.tags?.[0] ? `${cat.tags[0]} · ` : ''}
          {cat.sightingCount}번 만남
        </Text>
      </View>

      <Pressable
        onPress={onConfirm}
        disabled={disabled || busy}
        accessibilityLabel={`${cat.name} 맞아요`}
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primaryShadow,
            opacity: disabled ? 0.5 : 1,
            transform: [{ translateY: pressed ? 2 : 0 }],
          },
        ]}
      >
        {busy ? (
          <ActivityIndicator color={colors.onPrimary} />
        ) : (
          <Text style={[styles.buttonText, { color: colors.onPrimary }]}>{'이 고양이\n예요'}</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 11, borderRadius: 20 },
  photo: { width: 58, height: 58, borderRadius: 15 },
  info: { flex: 1, gap: 5, minWidth: 0 },
  nameRow: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 8, rowGap: 2 },
  name: { fontFamily: fonts.display, fontSize: 17 },
  percent: { fontFamily: fonts.display, fontSize: 26, lineHeight: 30 },
  percentSign: { fontSize: 14 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: 'center' },
  badgeText: { fontFamily: fonts.body, fontSize: 10 },
  track: { height: 9, borderRadius: 5, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 5 },
  meta: { fontFamily: fonts.body, fontSize: 11 },
  button: {
    minWidth: 68,
    height: 38,
    paddingHorizontal: 13,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  buttonText: { fontFamily: fonts.body, fontSize: 13, lineHeight: 16, textAlign: 'center' },
});
