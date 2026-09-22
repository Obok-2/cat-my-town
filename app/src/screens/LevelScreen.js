import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { getLevelCount } from '../api/levelApi';
import { computeLevel, LEVELS } from '../data/levels';
import LevelProgressBar from '../components/LevelProgressBar';
import PrimaryButton from '../components/PrimaryButton';

async function requestLevelInfo() {
  const response = await getLevelCount();
  return computeLevel(response.data.data.catCount ?? 0);
}

// 목업 a10 "레벨"(세 번째 탭): 현재 등급·진행률 카드 + 등급표 전체.
export default function LevelScreen() {
  const colors = useColors();
  const [info, setInfo] = useState({ level: 0, title: '', ratio: 0, catCount: 0, remainToNext: 1 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadLevel() {
        setLoading(true);
        setErrorMessage('');
        try {
          const levelInfo = await requestLevelInfo();
          if (active) setInfo(levelInfo);
        } catch (error) {
          if (active) {
            setErrorMessage(error.response?.data?.message || error.message || '레벨 정보를 불러오지 못했어요.');
          }
        } finally {
          if (active) setLoading(false);
        }
      }

      loadLevel();
      return () => {
        active = false;
      };
    }, [])
  );

  async function handleRefresh() {
    if (refreshing) return;
    setRefreshing(true);
    setErrorMessage('');
    try {
      setInfo(await requestLevelInfo());
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || '레벨 정보를 불러오지 못했어요.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }

  function badgeFor(lv) {
    if (lv.level < info.level) return '달성';
    if (lv.level === info.level) return '지금 여기';
    return `${lv.min - info.catCount}마리 남음`;
  }

  function appearanceFor(lv) {
    if (lv.level < info.level) {
      return {
        row: { backgroundColor: colors.tagMintBg, borderColor: colors.matchGood },
        chip: { backgroundColor: colors.matchGoodBadgeBg },
        chipText: { color: colors.matchGoodBadgeText },
        title: { color: colors.matchGoodBadgeText },
        description: { color: colors.textMuted },
        badge: { backgroundColor: colors.matchGoodBadgeBg },
        badgeText: { color: colors.matchGoodBadgeText },
      };
    }

    if (lv.level === info.level) {
      return {
        row: [styles.currentRow, { backgroundColor: colors.tagPeachBg, borderColor: colors.primary, shadowColor: colors.primaryShadow }],
        chip: { backgroundColor: colors.primary },
        chipText: { color: colors.onPrimary },
        title: { color: colors.accentDark },
        description: { color: colors.tagPeachText },
        badge: { backgroundColor: colors.primary },
        badgeText: { color: colors.onPrimary },
      };
    }

    return {
      row: { backgroundColor: colors.card, borderColor: colors.lockedBorder },
      chip: { backgroundColor: colors.lockedBg },
      chipText: { color: colors.lockedText },
      title: { color: colors.textMuted },
      description: { color: colors.lockedText },
      badge: { backgroundColor: colors.lockedBg },
      badgeText: { color: colors.lockedText },
    };
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered, { backgroundColor: colors.bg }]} edges={['top']}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.statusText, { color: colors.textMuted }]}>레벨 정보를 불러오고 있어요</Text>
      </SafeAreaView>
    );
  }

  if (errorMessage) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered, { backgroundColor: colors.bg }]} edges={['top']}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>레벨 정보를 불러오지 못했어요</Text>
        <Text style={[styles.statusText, { color: colors.textMuted }]}>{errorMessage}</Text>
        <View style={styles.retryButton}>
          <PrimaryButton label="다시 시도하기" onPress={handleRefresh} loading={refreshing} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}
      >
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
          {LEVELS.map((lv) => {
            const appearance = appearanceFor(lv);
            return (
              <View key={lv.level} style={[styles.row, appearance.row]}>
                <View style={[styles.levelChip, appearance.chip]}>
                  <Text style={[styles.levelChipText, appearance.chipText]}>Lv.{lv.level}</Text>
                </View>
                <View style={styles.rowText}>
                  <Text style={[styles.rowTitle, appearance.title]}>{lv.title}</Text>
                  <Text style={[styles.rowDesc, appearance.description]}>고양이 {lv.min}마리 수집</Text>
                </View>
                <View style={[styles.badge, appearance.badge]}>
                  <Text style={[styles.badgeText, appearance.badgeText]}>{badgeFor(lv)}</Text>
                </View>
              </View>
            );
          })}
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
  centered: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 12 },
  statusText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  errorTitle: { fontFamily: fonts.display, fontSize: 20 },
  retryButton: { width: '100%', marginTop: 8 },
  content: { paddingBottom: 24 },
  header: { paddingHorizontal: 22, paddingTop: 14, gap: 4 },
  title: { fontFamily: fonts.display, fontSize: 22 },
  subtitle: { fontFamily: fonts.body, fontSize: 13 },
  card: { marginHorizontal: 18, marginTop: 16 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 18, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 10 },
  list: { paddingHorizontal: 18, gap: 9 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderRadius: 18, borderWidth: 1.5 },
  currentRow: { borderWidth: 2.5, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.22, shadowRadius: 5, elevation: 4 },
  levelChip: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  levelChipText: { fontFamily: fonts.display, fontSize: 14 },
  rowText: { flex: 1, gap: 3 },
  rowTitle: { fontFamily: fonts.display, fontSize: 17 },
  rowDesc: { fontFamily: fonts.body, fontSize: 12 },
  badge: { borderRadius: 11, paddingVertical: 5, paddingHorizontal: 10 },
  badgeText: { fontFamily: fonts.body, fontSize: 12 },
  footnote: { fontFamily: fonts.body, fontSize: 12, lineHeight: 20, paddingHorizontal: 22, paddingTop: 14 },
});
