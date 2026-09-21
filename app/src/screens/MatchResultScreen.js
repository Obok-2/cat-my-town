import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { getCats, addSightingToCat } from '../data/store';
import { mockMatchAgainstExisting } from '../data/mockMatch';
import MatchGauge from '../components/MatchGauge';
import TraitTagList from '../components/TraitTagList';
import PrimaryButton from '../components/PrimaryButton';
import GhostButton from '../components/GhostButton';
import PlaceholderArt from '../components/PlaceholderArt';

// 목업 a3 "매칭 결과" / a4 "후보 없음" 두 변형.
// ⚠️ mockMatchAgainstExisting은 진짜 AI 매칭이 아니라 화면 흐름 검증용 목데이터다.
export default function MatchResultScreen({ route, navigation }) {
  const { photoUri } = route.params;
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
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

  async function handleSameCat() {
    if (!result?.candidateCat || confirming) return;
    setConfirming(true);
    try {
      await addSightingToCat(result.candidateCat.id, { photoUri });
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

  if (!result.candidateCat) {
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

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>누구인지 살펴봤어요</Text>
        <Text style={[styles.label, { color: colors.textMuted }]}>AI가 찾은 특징</Text>
        <TraitTagList tags={result.tags} editable={false} />

        <View style={[styles.matchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <MatchGauge percent={Math.round(result.score * 100)} />

          <View style={styles.compareRow}>
            <View style={styles.compareCol}>
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={styles.comparePhoto} />
              ) : (
                <PlaceholderArt label="방금 찍은 사진" radius={18} style={styles.comparePhoto} />
              )}
              <Text style={[styles.compareLabel, { color: colors.textMuted }]}>오늘 촬영</Text>
            </View>
            <Text style={[styles.arrow, { color: colors.textMuted }]}>↔</Text>
            <View style={styles.compareCol}>
              {result.candidateCat.photoUri ? (
                <Image source={{ uri: result.candidateCat.photoUri }} style={[styles.comparePhoto, styles.compareCandidate, { borderColor: colors.primary }]} />
              ) : (
                <PlaceholderArt label="등록된 후보" radius={18} style={[styles.comparePhoto, styles.compareCandidate, { borderColor: colors.primary }]} />
              )}
              <Text style={[styles.compareLabel, { color: colors.text }]}>
                {result.candidateCat.name} · {result.candidateCat.sightingCount}번째 만남
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.spacer} />

        <PrimaryButton label="맞아요, 같은 고양이예요" onPress={handleSameCat} loading={confirming} />
        <View style={{ height: 10 }} />
        <GhostButton label="아니에요, 새로운 고양이예요" onPress={handleNewCat} />
        <Text style={[styles.footer, { color: colors.textMuted }]}>최종 확정은 언제나 내가 해요</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 14 },
  title: { fontFamily: fonts.display, fontSize: 21, marginBottom: 14 },
  label: { fontFamily: fonts.body, fontSize: 13, marginBottom: 9 },
  matchCard: { marginTop: 20, padding: 20, borderRadius: 26, borderWidth: 1.5, alignItems: 'center', gap: 16 },
  compareRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, width: '100%' },
  compareCol: { flex: 1, alignItems: 'center', gap: 7 },
  comparePhoto: { width: '100%', aspectRatio: 1, borderRadius: 18 },
  compareCandidate: { borderWidth: 2 },
  compareLabel: { fontFamily: fonts.body, fontSize: 13 },
  arrow: { fontSize: 16, marginTop: 40 },
  spacer: { flex: 1, minHeight: 20 },
  footer: { fontFamily: fonts.body, fontSize: 12, textAlign: 'center', marginTop: 10, marginBottom: 8 },
  noCandidateContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 30 },
  bigPhoto: { width: 230, height: 230, borderRadius: 30 },
  bigTitle: { fontFamily: fonts.display, fontSize: 30, textAlign: 'center', lineHeight: 38 },
  desc: { fontFamily: fonts.body, fontSize: 15, lineHeight: 25, textAlign: 'center' },
  bottomButton: { paddingHorizontal: 20, paddingBottom: 34 },
});
