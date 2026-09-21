import React from 'react';
import { Pressable, View, Text, Image, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import PlaceholderArt from './PlaceholderArt';

// 목업 a6 카드 그리드 1칸: 정사각 사진(placeholder) + 우하단 목격 횟수 배지 + Jua 이름 + 대표 태그.
export default function CatCard({ cat, onPress }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={styles.photoWrap}>
        {cat.photoUri ? (
          <Image source={{ uri: cat.photoUri }} style={styles.photo} resizeMode="cover" />
        ) : (
          <PlaceholderArt style={StyleSheet.absoluteFill} />
        )}
        <View style={[styles.badge, { backgroundColor: colors.badgeOverlay }]}>
          <Text style={[styles.badgeText, { color: colors.onPrimary }]}>{cat.sightingCount}회</Text>
        </View>
      </View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {cat.name}
      </Text>
      {cat.tags?.[0] && (
        <View style={[styles.tag, { backgroundColor: colors.tagPeachBg }]}>
          <Text style={[styles.tagText, { color: colors.tagPeachText }]} numberOfLines={1}>
            {cat.tags[0]}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 22, borderWidth: 1.5, overflow: 'hidden' },
  photoWrap: { aspectRatio: 1, justifyContent: 'flex-end', alignItems: 'flex-end', padding: 8 },
  photo: { ...StyleSheet.absoluteFillObject },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontFamily: fonts.body, fontSize: 11 },
  name: { fontFamily: fonts.display, fontSize: 17, marginTop: 10, marginHorizontal: 12 },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 5,
    marginHorizontal: 12,
    marginBottom: 13,
  },
  tagText: { fontFamily: fonts.body, fontSize: 11 },
});
