import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { analyzeCameraPhoto } from '../api/cameraApi';
import MatchCandidateCard from '../components/MatchCandidateCard';
import TraitTagList from '../components/TraitTagList';
import PrimaryButton from '../components/PrimaryButton';
import PlaceholderArt from '../components/PlaceholderArt';

const ALL_NO = { 1: '아니에요', 2: '둘 다 아니에요', 3: '셋 다 아니에요' };

function formatNow() {
  const d = new Date();
  return `오늘 ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// 촬영 후 서버의 /app/camera/analyze 결과로 화면을 나눈다.
// NOT_CAT은 재촬영, NEW_CAT은 이름 짓기, EXISTING_CAT은 최대 3개의 후보를 보여준다.
export default function MatchResultScreen({ route, navigation }) {
  const { photoUri } = route.params;
  const colors = useColors();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLabel] = useState(formatNow);

  useEffect(() => {
    let mounted = true;

    async function loadAnalysis() {
      try {
        const response = await analyzeCameraPhoto(photoUri);
        const analysis = response.data.data;
        const candidates = analysis.candidates.map((candidate) => ({
          cat: {
            id: candidate.catId,
            name: candidate.name,
            photoUri: candidate.photoUrl,
            sightingCount: candidate.sightingCount,
            tags: candidate.tags ?? [],
          },
          score: candidate.score / 100,
        }));

        if (!mounted) return;
        setResult({ ...analysis, candidates, tags: [] });
      } catch (error) {
        if (!mounted) return;
        setErrorMessage(error.response?.data?.message || error.message || '사진을 분석하지 못했어요.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadAnalysis();
    return () => {
      mounted = false;
    };
  }, []);

  function closeCapture() {
    navigation.getParent()?.goBack();
  }

  function handleConfirm() {
    Alert.alert('확정 기능 준비 중', '기존 고양이로 확정하는 서버 API를 연결한 뒤 사용할 수 있어요.');
  }

  function handleNewCat() {
    navigation.navigate('Naming', { photoUri, suggestedTags: result?.tags ?? [] });
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }]}>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (errorMessage || !result) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <View style={styles.messageContent}>
          <Text style={[styles.bigTitle, { color: colors.text }]}>사진을 분석하지 못했어요</Text>
          <Text style={[styles.desc, { color: colors.textSubtle }]}>{errorMessage || '잠시 후 다시 시도해주세요.'}</Text>
        </View>
        <View style={styles.bottomButton}>
          <PrimaryButton label="다시 촬영하기" onPress={closeCapture} />
        </View>
      </SafeAreaView>
    );
  }

  if (result.status === 'NOT_CAT') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <View style={styles.messageContent}>
          <Image source={{ uri: photoUri }} style={styles.bigPhoto} />
          <Text style={[styles.bigTitle, { color: colors.text }]}>고양이를 찾지 못했어요</Text>
          <Text style={[styles.desc, { color: colors.textSubtle }]}>고양이 얼굴과 몸이 프레임 안에 잘 보이도록 다시 촬영해주세요.</Text>
        </View>
        <View style={styles.bottomButton}>
          <PrimaryButton label="다시 촬영하기" onPress={closeCapture} />
        </View>
      </SafeAreaView>
    );
  }

  if (result.status === 'NEW_CAT') {
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
            등록된 고양이 중 비슷한 친구가 없어요.{'\n'}이 친구의 이름을 지어줄까요?
          </Text>
          {result.tags.length > 0 && <TraitTagList tags={result.tags} editable={false} centered />}
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

        {result.tags.length > 0 && (
          <>
            <Text style={[styles.label, { color: colors.textMuted }]}>AI가 찾은 특징</Text>
            <TraitTagList tags={result.tags} editable={false} />
          </>
        )}

        <View style={styles.list}>
          {candidates.map(({ cat, score }, i) => (
            <MatchCandidateCard
              key={cat.id}
              cat={cat}
              score={score}
              top={i === 0}
              onConfirm={handleConfirm}
            />
          ))}
        </View>
      </ScrollView>

      <View style={styles.bottom}>
        <Pressable
          onPress={handleNewCat}
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
  messageContent: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24, paddingHorizontal: 30 },
  bigPhoto: { width: 230, height: 230, borderRadius: 30 },
  bigTitle: { fontFamily: fonts.display, fontSize: 30, textAlign: 'center', lineHeight: 40 },
  desc: { fontFamily: fonts.body, fontSize: 15, lineHeight: 26, textAlign: 'center' },
  bottomButton: { paddingHorizontal: 20, paddingBottom: 34 },
});
