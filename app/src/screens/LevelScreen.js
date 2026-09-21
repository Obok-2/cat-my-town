import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { LEVELS } from '../data/levels';
import { getUserLevelInfo } from '../data/store';
import LevelProgressBar from '../components/LevelProgressBar';

// 목업 a10 "레벨"(세 번째 탭): 현재 등급·진행률 카드 + 등급표 전체.
export default function LevelScreen() {
  const colors = useColors();
  const [info, setInfo] = useState({ level: 0, title: '', ratio: 0, catCount: 0, remainToNext: 1 });

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getUserLevelInfo().then((l) => mounted && setInfo(l));
      return () => {
        mounted = false;
      };
    }, [])
  );

  function badgeFor(lv) {
    if (lv.level < info.level) return '달성';
    if (lv.level === info.level) return '지금 여기';
    return `${lv.min - info.catCount}마리 남음`;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>레벨</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>고양이를 만날수록 등급이 올라가요</Text>
        </View>

        <View style={styles.card}>
          <LevelProgressBar
            eyebrow="지금 나의 등급"
            title={info.title}
            level={info.level}
            ratio={info.ratio}
            catCount={info.catCount}
            remainToNext={info.remainToNext}
          />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>등급표</Text>
        <View style={styles.list}>
          {LEVELS.map((lv) => (
            <View key={lv.level} style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.levelChip, { backgroundColor: colors.tagPeachBg }]}>
                <Text style={[styles.levelChipText, { color: colors.tagPeachText }]}>Lv.{lv.level}</Text>
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.rowTitle, { color: colors.text }]}>{lv.title}</Text>
                <Text style={[styles.rowDesc, { color: colors.textMuted }]}>고양이 {lv.min}마리 수집</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: colors.tagPeachBg }]}>
                <Text style={[styles.badgeText, { color: colors.tagPeachText }]}>{badgeFor(lv)}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.footnote, { color: colors.textMuted }]}>
          같은 고양이를 다시 만나도 기록은 쌓이지만, 등급은 새로 만난 고양이 수로 올라가요.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingBottom: 24 },
  header: { paddingHorizontal: 22, paddingTop: 14, gap: 4 },
  title: { fontFamily: fonts.display, fontSize: 22 },
  subtitle: { fontFamily: fonts.body, fontSize: 13 },
  card: { marginHorizontal: 18, marginTop: 16 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 18, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 10 },
  list: { paddingHorizontal: 18, gap: 9 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1.5 },
  levelChip: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  levelChipText: { fontFamily: fonts.display, fontSize: 14 },
  rowText: { flex: 1, gap: 3 },
  rowTitle: { fontFamily: fonts.display, fontSize: 17 },
  rowDesc: { fontFamily: fonts.body, fontSize: 12 },
  badge: { borderRadius: 11, paddingVertical: 5, paddingHorizontal: 10 },
  badgeText: { fontFamily: fonts.body, fontSize: 12 },
  footnote: { fontFamily: fonts.body, fontSize: 12, lineHeight: 20, paddingHorizontal: 22, paddingTop: 14 },
});
