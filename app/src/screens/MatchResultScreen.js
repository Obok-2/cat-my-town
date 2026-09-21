import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { getCats, addSightingToCat } from '../data/store';
import { mockMatchAgainstExisting } from '../data/mockMatch';
import { MATCH_THRESHOLD } from '../data/matchConfig';
import MatchCandidateCard from '../components/MatchCandidateCard';
import TraitTagList from '../components/TraitTagList';
import PrimaryButton from '../components/PrimaryButton';
import PlaceholderArt from '../components/PlaceholderArt';

const ALL_NO = { 1: '아니에요', 2: '둘 다 아니에요', 3: '셋 다 아니에요' };

function formatNow() {
  const d = new Date();
  return `오늘 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// 촬영 후 매칭 결과. 일치율 기준(MATCH_THRESHOLD, 40%)으로 화면이 갈린다.
//  - 기준 이상 후보가 1~3마리 → 후보 카드 목록(목업 a3). 카드마다 [이 고양이예요], 아래에 [새로운 고양이예요]
//  - 기준 이상 후보가 없음 → "새로운 친구를 발견했어요!" + [이름 짓기] (목업 a4)
// ⚠️ mockMatchAgainstExisting은 진짜 AI 매칭이 아니라 화면 흐름 검증용 목데이터다.
export default function MatchResultScreen({ route, navigation }) {
  const { photoUri } = route.params;
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [timeLabel] = useState(formatNow);

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

  async function handleConfirm(catId) {
    if (confirmingId) return;
    setConfirmingId(catId);
    try {
      await addSightingToCat(catId, { photoUri });
      navigation.navigate('Tabs', { screen: 'Collection' });
    } finally {
      setConfirmingId(null);
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
            일치율 {Math.round(MATCH_THRESHOLD * 100)}% 이상인 후보가 없어요.{'\n'}이 친구의 이름을 지어줄까요?
          </Text>
          <TraitTagList tags={result.tags} editable={false} centered />
        </View>
        <View style={styles.bottomButton}>
          <PrimaryButton label="이름 짓기" onPress={handleNewCat} />
        </View>
      </SafeAreaView>
    );
  }

  const { candidates } = result;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.shotRow}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.shotPhoto} />
          ) : (
            <PlaceholderArt label={'방금\n찍은 사진'} radius={16} style={styles.shotPhoto} />
          )}
          <View style={styles.shotInfo}>
            <Text style={[styles.title, { color: colors.text }]}>비슷한 친구 {candidates.length}명을 찾았어요</Text>
            <Text style={[styles.subtitle, { color: colors.textMuted }]}>{timeLabel} · 일치율 높은 순</Text>
          </View>
        </View>

        <Text style={[styles.label, { color: colors.textMuted }]}>AI가 찾은 특징</Text>
        <TraitTagList tags={result.tags} editable={false} />

        <View style={styles.list}>
          {candidates.map(({ cat, score }, i) => (
            <MatchCandidateCard
              key={cat.id}
              cat={cat}
              score={score}
              top={i === 0}
              busy={confirmingId === cat.id}
              disabled={!!confirmingId && confirmingId !== cat.id}
              onConfirm={() => handleConfirm(cat.id)}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <Pressable
          onPress={handleNewCat}
          disabled={!!confirmingId}
          style={({ pressed }) => [
            styles.softButton,
            { backgroundColor: colors.softBtnBg, borderColor: colors.softBtnBorder, opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={[styles.softButtonText, { color: colors.textMuted }]}>
            {ALL_NO[candidates.length]}, 새로운 고양이예요
          </Text>
        </Pressable>
        <Text style={[styles.footer, { color: colors.textMuted }]}>최종 확정은 언제나 내가 해요</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 12 },
  shotRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  shotPhoto: { width: 62, height: 62, borderRadius: 16 },
  shotInfo: { flex: 1, gap: 5 },
  title: { fontFamily: fonts.display, fontSize: 20 },
  subtitle: { fontFamily: fonts.body, fontSize: 12 },
  label: { fontFamily: fonts.body, fontSize: 12, marginBottom: 8 },
  list: { gap: 10, marginTop: 16, marginHorizontal: -4 },
  bottom: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 30, gap: 9 },
  softButton: { height: 50, borderRadius: 25, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 },
  softButtonText: { fontFamily: fonts.body, fontSize: 15 },
  footer: { fontFamily: fonts.body, fontSize: 12, textAlign: 'center' },
  noCandidateContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 30 },
  bigPhoto: { width: 230, height: 230, borderRadius: 30 },
  bigTitle: { fontFamily: fonts.display, fontSize: 30, textAlign: 'center', lineHeight: 40 },
  desc: { fontFamily: fonts.body, fontSize: 15, lineHeight: 26, textAlign: 'center' },
  bottomButton: { paddingHorizontal: 20, paddingBottom: 34 },
});
