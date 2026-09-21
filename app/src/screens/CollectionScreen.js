import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { getCats, getUserLevelInfo } from '../data/store';
import LevelProgressBar from '../components/LevelProgressBar';
import CatCard from '../components/CatCard';
import LockedCatCard from '../components/LockedCatCard';

// 다음 레벨까지 남은 마리 수만큼 "???" 카드를 보여주되, 화면이 길어지지 않게 이 개수까지만 둔다.
const MAX_LOCKED_CARDS = 4;

// 목업 a6 "도감 (메인 탭)": 레벨+진행률 카드 + 필터 없는 전체 카드 그리드(+ 아직 못 만난 친구 "???" 카드).
export default function CollectionScreen({ navigation }) {
  const colors = useColors();
  const [cats, setCats] = useState([]);
  const [levelInfo, setLevelInfo] = useState({ level: 0, title: '', ratio: 0, catCount: 0, remainToNext: 1 });

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      Promise.all([getCats(), getUserLevelInfo()]).then(([c, l]) => {
        if (!mounted) return;
        setCats(c);
        setLevelInfo(l);
      });
      return () => {
        mounted = false;
      };
    }, [])
  );

  const items = [
    ...cats,
    ...Array.from({ length: Math.min(levelInfo.remainToNext, MAX_LOCKED_CARDS) }, (_, i) => ({
      id: `locked_${i}`,
      locked: true,
    })),
  ];
  if (items.length % 2 === 1) items.push({ id: 'spacer', spacer: true });

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} edges={['top']}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.column}
        contentContainerStyle={styles.list}
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
  list: { paddingHorizontal: 18, paddingTop: 14, paddingBottom: 24 },
  headerWrap: { marginBottom: 8, paddingHorizontal: 2 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 20, marginBottom: 12, paddingHorizontal: 4 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 19 },
  sectionCount: { fontFamily: fonts.body, fontSize: 13 },
  column: { gap: 14, marginBottom: 14 },
  spacer: { flex: 1 },
  emptyText: { fontFamily: fonts.body, fontSize: 13, textAlign: 'center', lineHeight: 20, paddingBottom: 20 },
});
