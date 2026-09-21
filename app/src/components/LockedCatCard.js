import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

// 목업 a6·a9 도감 그리드의 "아직 만나지 못한 친구" 점선 카드.
export default function LockedCatCard() {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.lockedBg, borderColor: colors.lockedBorder }]}>
      <View style={styles.glyphWrap}>
        <Text style={[styles.glyph, { color: colors.lockedGlyph }]}>???</Text>
      </View>
      <Text style={[styles.label, { color: colors.lockedText }]}>아직 만나지 못한 친구</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 22, borderWidth: 1.5, borderStyle: 'dashed', overflow: 'hidden' },
  glyphWrap: { aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  glyph: { fontFamily: fonts.display, fontSize: 36 },
  label: { fontFamily: fonts.body, fontSize: 12, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 13 },
});
