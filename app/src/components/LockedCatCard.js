import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

// 목업 a6·a9 도감 그리드의 "아직 만나지 못한 친구" 점선 카드.
export default function LockedCatCard() {
  const colors = useColors();
  return (
    <View style={[styles.card, { backgroundColor: colors.lockedBg, borderColor: colors.lockedBorder }]}>
      <View style={styles.glyphWrap}>
        <Ionicons name="lock-closed-outline" size={40} color={colors.lockedGlyph} />
      </View>
      <Text style={[styles.label, { color: colors.lockedText }]}>아직 만나지 못한 친구</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, borderRadius: 22, borderWidth: 1.5, borderStyle: 'dashed', overflow: 'hidden' },
  glyphWrap: { aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: fonts.body, fontSize: 12, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 13 },
});
