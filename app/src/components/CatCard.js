import React from 'react';
import { Pressable, View, Text, Image, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeContext';

// 목업 6페이지 "도감(메인 탭)" 카드 그리드 1칸: 사진 + 목격 횟수 배지 + 이름 + 대표 태그.
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
      <View style={[styles.photoWrap, { backgroundColor: colors.cardAlt }]}>
        {cat.photoUri ? (
          <Image source={{ uri: cat.photoUri }} style={styles.photo} />
        ) : (
          <Text style={[styles.photoFallback, { color: colors.textMuted }]}>🐱</Text>
        )}
        <View style={[styles.badge, { backgroundColor: colors.overlay }]}>
          <Text style={styles.badgeText}>{cat.sightingCount}회</Text>
        </View>
      </View>
      <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
        {cat.name}
      </Text>
      {cat.tags?.[0] && (
        <View style={[styles.tag, { backgroundColor: colors.tagPeach }]}>
          <Text style={[styles.tagText, { color: colors.text }]} numberOfLines={1}>
            {cat.tags[0]}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 18, borderWidth: 1, padding: 10 },
  photoWrap: {
    aspectRatio: 1,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  photoFallback: { fontSize: 32 },
  badge: {
    position: 'absolute',
    right: 8,
    top: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  name: { fontSize: 14, fontWeight: '700', marginTop: 8 },
  tag: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3, marginTop: 4 },
  tagText: { fontSize: 11, fontWeight: '600' },
});
