import React from 'react';
import { Pressable, View, Text, Image, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import PlaceholderArt from './PlaceholderArt';

// 목업 a6 카드 그리드 1칸: 정사각 사진(placeholder) + 우하단 목격 횟수 배지 + Jua 이름 + 대표 태그.
export default function CatCard({ cat, onPress }) {
  const colors = useColors();
  const photoSource = cat.photoSource ?? (cat.photoUri ? { uri: cat.photoUri } : null);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={[styles.photoWrap, { backgroundColor: colors.cardAlt }]}>
        {photoSource ? (
          <Image source={photoSource} style={styles.photo} resizeMode="cover" />
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
  card: { flex: 1, borderRadius: 24, borderWidth: 1.5, padding: 8, overflow: 'hidden' },
  photoWrap: {
    aspectRatio: 1,
    borderRadius: 18,
    overflow: 'hidden',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 8,
  },
  photo: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 13 },
  badgeText: { fontFamily: fonts.body, fontSize: 11 },
  name: { fontFamily: fonts.display, fontSize: 18, marginTop: 10, marginHorizontal: 4 },
  tag: {
    alignSelf: 'flex-start',
    borderRadius: 11,
    paddingHorizontal: 9,
    paddingVertical: 5,
    marginTop: 6,
    marginHorizontal: 4,
    marginBottom: 5,
  },
  tagText: { fontFamily: fonts.body, fontSize: 11 },
});
