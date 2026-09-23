import React, { useCallback, useState } from 'react';
import { ActivityIndicator, View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { getCollectionCats, getCollectionCount } from '../api/collectionApi';
import { getAuthorizationHeaders } from '../storage/tokenStorage';
import { computeLevel } from '../data/levels';
import LevelProgressBar from '../components/LevelProgressBar';
import CatCard from '../components/CatCard';
import LockedCatCard from '../components/LockedCatCard';
import PrimaryButton from '../components/PrimaryButton';

// 다음 레벨까지 남은 마리 수만큼 "???" 카드를 보여주되, 화면이 길어지지 않게 이 개수까지만 둔다.
const MAX_LOCKED_CARDS = 4;

async function requestCollection() {
  const [catsResponse, countResponse, imageHeaders] = await Promise.all([
    getCollectionCats(),
    getCollectionCount(),
    getAuthorizationHeaders(),
  ]);
  const collectionCats = catsResponse.data.data.cats ?? [];
  const catCount = countResponse.data.data.catCount ?? collectionCats.length;

  return {
    cats: collectionCats.map((cat) => ({
      ...cat,
      photoSource: cat.photoUrl ? { uri: cat.photoUrl, headers: imageHeaders } : null,
    })),
    levelInfo: computeLevel(catCount),
  };
}

// 목업 a6 "도감 (메인 탭)": 레벨+진행률 카드 + 필터 없는 전체 카드 그리드(+ 아직 못 만난 친구 "???" 카드).
export default function CollectionScreen({ navigation }) {
  const colors = useColors();
  const [cats, setCats] = useState([]);
  const [levelInfo, setLevelInfo] = useState({ level: 0, title: '', ratio: 0, catCount: 0, remainToNext: 1 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadCollection() {
        setLoading(true);
        setErrorMessage('');
        try {
          const collection = await requestCollection();
          if (!active) return;
          setCats(collection.cats);
          setLevelInfo(collection.levelInfo);
        } catch (error) {
          if (!active) return;
          setErrorMessage(error.response?.data?.message || error.message || '도감을 불러오지 못했어요.');
        } finally {
          if (active) setLoading(false);
        }
      }

      loadCollection();
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
      const collection = await requestCollection();
      setCats(collection.cats);
      setLevelInfo(collection.levelInfo);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || '도감을 불러오지 못했어요.');
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }

  const items = [
    ...cats,
    ...Array.from({ length: Math.min(levelInfo.remainToNext, MAX_LOCKED_CARDS) }, (_, i) => ({
      id: `locked_${i}`,
      locked: true,
    })),
  ];
  if (items.length % 2 === 1) items.push({ id: 'spacer', spacer: true });

  if (loading && cats.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered, { backgroundColor: colors.bg }]} edges={['top']}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.statusText, { color: colors.textMuted }]}>도감을 불러오고 있어요</Text>
      </SafeAreaView>
    );
  }

  if (errorMessage && cats.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered, { backgroundColor: colors.bg }]} edges={['top']}>
        <Text style={[styles.errorTitle, { color: colors.text }]}>도감을 불러오지 못했어요</Text>
        <Text style={[styles.statusText, { color: colors.textMuted }]}>{errorMessage}</Text>
        <View style={styles.retryButton}>
          <PrimaryButton label="다시 시도하기" onPress={handleRefresh} loading={refreshing} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.list}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <LevelProgressBar
              title={levelInfo.title}
              level={levelInfo.level}
              ratio={levelInfo.ratio}
              catCount={levelInfo.catCount}
              remainToNext={levelInfo.remainToNext}
            />
            <View style={styles.sectionRow}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>나의 도감</Text>
              <Text style={[styles.sectionCount, { color: colors.textMuted }]}>전체 {cats.length}</Text>
            </View>
            {cats.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.textMuted }]}>
                아직 만난 고양이가 없어요.{'\n'}촬영 탭에서 첫 만남을 기록해보세요.
              </Text>
            )}
            {errorMessage && <Text style={[styles.refreshError, { color: colors.accent }]}>{errorMessage}</Text>}
          </View>
        }
        renderItem={({ item }) => {
          if (item.spacer) return <View style={styles.spacer} />;
          if (item.locked) return <LockedCatCard />;
          return <CatCard cat={item} onPress={() => navigation.navigate('CatDetail', { catId: item.id })} />;
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 12 },
  statusText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  errorTitle: { fontFamily: fonts.display, fontSize: 20 },
  retryButton: { width: '100%', marginTop: 8 },
  list: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 24 },
  headerWrap: { marginBottom: 8, paddingHorizontal: 2 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 20, marginBottom: 12, paddingHorizontal: 4 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 19 },
  sectionCount: { fontFamily: fonts.body, fontSize: 13 },
  column: { gap: 14, marginBottom: 14 },
  spacer: { flex: 1 },
  emptyText: { fontFamily: fonts.body, fontSize: 13, textAlign: 'center', lineHeight: 20, paddingBottom: 20 },
  refreshError: { fontFamily: fonts.body, fontSize: 12, textAlign: 'center', marginBottom: 10 },
});
