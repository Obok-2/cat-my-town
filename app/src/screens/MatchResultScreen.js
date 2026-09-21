import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../theme/ThemeContext';
import { getCats, addSightingToCat } from '../data/store';
import { mockMatchAgainstExisting } from '../data/mockMatch';
import MatchGauge from '../components/MatchGauge';
import TraitTagList from '../components/TraitTagList';
import PrimaryButton from '../components/PrimaryButton';
import GhostButton from '../components/GhostButton';

// 목업 5페이지 "매칭 결과" / "후보 없음" 두 변형.
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
        <View style={styles.content}>
          <Image source={{ uri: photoUri }} style={[styles.bigPhoto, { backgroundColor: colors.cardAlt }]} />
          <Text style={[styles.title, { color: colors.text }]}>새로운 친구를 발견했어요!</Text>
          <Text style={[styles.desc, { color: colors.textMuted }]}>
            도감에 비슷한 고양이가 없어요.{'\n'}이 친구의 이름을 지어줄까요?
          </Text>
          <TraitTagList tags={result.tags} editable={false} />
          <View style={styles.spacer} />
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

        <View style={styles.gaugeWrap}>
          <MatchGauge percent={Math.round(result.score * 100)} />
        </View>

        <View style={styles.compareRow}>
          <View style={styles.compareCol}>
            <Image source={{ uri: photoUri }} style={[styles.comparePhoto, { backgroundColor: colors.cardAlt }]} />
            <Text style={[styles.compareLabel, { color: colors.textMuted }]}>방금 찍은 사진</Text>
          </View>
          <Text style={[styles.arrow, { color: colors.textMuted }]}>↔</Text>
          <View style={styles.compareCol}>
            {result.candidateCat.photoUri ? (
              <Image source={{ uri: result.candidateCat.photoUri }} style={styles.comparePhoto} />
            ) : (
              <View style={[styles.comparePhoto, { backgroundColor: colors.cardAlt }]} />
            )}
            <Text style={[styles.compareLabel, { color: colors.text }]}>{result.candidateCat.name}</Text>
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
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 14 },
  label: { fontSize: 12, marginBottom: 8 },
  gaugeWrap: { alignItems: 'center', marginVertical: 24 },
  compareRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 },
  compareCol: { alignItems: 'center', gap: 8 },
  comparePhoto: { width: 96, height: 96, borderRadius: 16 },
  compareLabel: { fontSize: 12, fontWeight: '600' },
  arrow: { fontSize: 20 },
  spacer: { flex: 1, minHeight: 20 },
  footer: { fontSize: 11, textAlign: 'center', marginTop: 10, marginBottom: 8 },
  bigPhoto: { width: '100%', height: 220, borderRadius: 20, marginBottom: 24 },
  desc: { fontSize: 14, lineHeight: 20, marginBottom: 20 },
});
