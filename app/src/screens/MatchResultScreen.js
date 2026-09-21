import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { getCats, addSightingToCat } from '../data/store';
import { mockMatchAgainstExisting } from '../data/mockMatch';
import { MATCH_THRESHOLD } from '../data/matchConfig';
import MatchCandidateCard from '../components/MatchCandidateCard';
import TraitTagList from '../components/TraitTagList';
import PrimaryButton from '../components/PrimaryButton';
import GhostButton from '../components/GhostButton';
import PlaceholderArt from '../components/PlaceholderArt';

// 촬영 후 매칭 결과. 일치율 기준(MATCH_THRESHOLD, 60%)으로 화면이 갈린다.
//  - 기준 이상인 후보가 있으면 → 후보(최대 3마리) 중에서 같은 고양이를 고르거나 "이 중에 없어요"
//  - 기준 이상인 후보가 없으면 → 새로운 고양이 등록(이름 짓기)으로 바로 연결 (목업 a4)
// ⚠️ mockMatchAgainstExisting은 진짜 AI 매칭이 아니라 화면 흐름 검증용 목데이터다.
export default function MatchResultScreen({ route, navigation }) {
  const { photoUri } = route.params;
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let mounted = true;
    getCats().then((cats) => {
      if (!mounted) return;
      setResult(mockMatchAgainstExisting(cats));
      setLoading(false);
    });
    return () => {
      mounted = false;
    };
  }, []);

  async function handleConfirm() {
    if (!selectedId || confirming) return;
    setConfirming(true);
    try {
      await addSightingToCat(selectedId, { photoUri });
      navigation.navigate('Tabs', { screen: 'Collection' });
    } finally {
      setConfirming(false);
    }
  }

  function handleNewCat() {
    navigation.navigate('Naming', { photoUri, suggestedTags: result?.tags ?? [] });
  }

  if (loading || !result) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  // 일치율 기준 미만(또는 등록된 고양이 없음) → 새로운 고양이 등록 화면
  if (result.candidates.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <View style={styles.noCandidateContent}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.bigPhoto} />
          ) : (
            <PlaceholderArt label="방금 찍은 사진" radius={30} style={styles.bigPhoto} />
          )}
          <Text style={[styles.bigTitle, { color: colors.text }]}>새로운 친구를{'\n'}발견했어요!</Text>
          <Text style={[styles.desc, { color: colors.textSubtle }]}>
            도감에 비슷한 고양이가 없어요.{'\n'}이 친구의 이름을 지어줄까요?
          </Text>
          <TraitTagList tags={result.tags} editable={false} />
        </View>
        <View style={styles.bottomButton}>
          <PrimaryButton label="이름 지어주기" onPress={handleNewCat} />
        </View>
      </SafeAreaView>
    );
  }

  // 일치율 기준 이상 후보가 1~3마리 → 그중에서 선택
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>누구인지 살펴봤어요</Text>

        <View style={styles.shotRow}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.shotPhoto} />
          ) : (
            <PlaceholderArt label="방금 찍은 사진" radius={20} style={styles.shotPhoto} />
          )}
          <View style={styles.shotInfo}>
            <Text style={[styles.label, { color: colors.textMuted }]}>AI가 찾은 특징</Text>
            <TraitTagList tags={result.tags} editable={false} />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          비슷한 고양이 {result.candidates.length}마리를 찾았어요
        </Text>
        <Text style={[styles.sectionDesc, { color: colors.textMuted }]}>
          사진을 비교해서 같은 고양이를 골라주세요. (일치율 {Math.round(MATCH_THRESHOLD * 100)}% 이상만 보여줘요)
        </Text>

        <View style={styles.list} accessibilityRole="radiogroup">
          {result.candidates.map(({ cat, score }) => (
            <MatchCandidateCard
              key={cat.id}
              cat={cat}
              score={score}
              selected={selectedId === cat.id}
              onPress={() => setSelectedId(cat.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <PrimaryButton label="이 고양이가 맞아요" onPress={handleConfirm} disabled={!selectedId} loading={confirming} />
        <View style={{ height: 10 }} />
        <GhostButton label="이 중에 없어요, 새로운 고양이예요" onPress={handleNewCat} />
        <Text style={[styles.footer, { color: colors.textMuted }]}>최종 확정은 언제나 내가 해요</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 14, paddingBottom: 12 },
  title: { fontFamily: fonts.display, fontSize: 21, marginBottom: 16 },
  label: { fontFamily: fonts.body, fontSize: 13, marginBottom: 9 },
  shotRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  shotPhoto: { width: 92, height: 92, borderRadius: 20 },
  shotInfo: { flex: 1 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 18, marginTop: 24 },
  sectionDesc: { fontFamily: fonts.body, fontSize: 13, lineHeight: 20, marginTop: 6, marginBottom: 14 },
  list: { gap: 12 },
  bottom: { paddingHorizontal: 24, paddingTop: 8 },
  footer: { fontFamily: fonts.body, fontSize: 12, textAlign: 'center', marginTop: 10, marginBottom: 8 },
  noCandidateContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 30 },
  bigPhoto: { width: 230, height: 230, borderRadius: 30 },
  bigTitle: { fontFamily: fonts.display, fontSize: 30, textAlign: 'center', lineHeight: 38 },
  desc: { fontFamily: fonts.body, fontSize: 15, lineHeight: 25, textAlign: 'center' },
  bottomButton: { paddingHorizontal: 20, paddingBottom: 34 },
});
