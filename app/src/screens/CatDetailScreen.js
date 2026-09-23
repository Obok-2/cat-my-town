import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, View, Text, Image, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { getCatDetail, getCatMarkers, getCatSightings } from '../api/catApi';
import { getAuthorizationHeaders } from '../storage/tokenStorage';
import TraitTagList from '../components/TraitTagList';
import SightingTimelineItem from '../components/SightingTimelineItem';
import SightingMiniMap from '../components/SightingMiniMap';
import PlaceholderArt from '../components/PlaceholderArt';
import PrimaryButton from '../components/PrimaryButton';

function formatDate(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

function normalizeSighting(sighting, imageHeaders) {
  return {
    ...sighting,
    photoSource: sighting.photoUrl ? { uri: sighting.photoUrl, headers: imageHeaders } : null,
  };
}

async function requestCatDetail(catId) {
  const [detailResponse, markersResponse, sightingsResponse, imageHeaders] = await Promise.all([
    getCatDetail(catId),
    getCatMarkers(catId),
    getCatSightings(catId, 0),
    getAuthorizationHeaders(),
  ]);
  const detail = detailResponse.data.data;
  const markerList = markersResponse.data.data.markers ?? [];
  const sightingPage = sightingsResponse.data.data;

  return {
    cat: {
      ...detail,
      photoSource: detail.photoUrl ? { uri: detail.photoUrl, headers: imageHeaders } : null,
    },
    markers: markerList.map((marker) => ({
      ...marker,
      lat: Number(marker.latitude),
      lng: Number(marker.longitude),
      photoSource: marker.photoUrl ? { uri: marker.photoUrl, headers: imageHeaders } : null,
    })),
    sightings: (sightingPage.sightings ?? []).map((sighting) => normalizeSighting(sighting, imageHeaders)),
    hasMore: sightingPage.hasMore,
  };
}

// 목업 a7 "고양이 상세": 이름·태그 아래 미니맵은 고정, 목격 타임라인만 스크롤(지도는 상세에서만, 필터 없음).
export default function CatDetailScreen({ route, navigation }) {
  const { catId } = route.params;
  const colors = useColors();
  const [cat, setCat] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [sightings, setSightings] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const loadingMoreRef = useRef(false);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadDetail() {
        setLoading(true);
        setErrorMessage('');
        try {
          const detail = await requestCatDetail(catId);
          if (!active) return;
          setCat(detail.cat);
          setMarkers(detail.markers);
          setSightings(detail.sightings);
          setPage(0);
          setHasMore(detail.hasMore);
        } catch (error) {
          if (!active) return;
          setErrorMessage(error.response?.data?.message || error.message || '고양이 정보를 불러오지 못했어요.');
        } finally {
          if (active) setLoading(false);
        }
      }

      loadDetail();
      return () => {
        active = false;
      };
    }, [catId])
  );

  async function handleRetry() {
    if (loading) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const detail = await requestCatDetail(catId);
      setCat(detail.cat);
      setMarkers(detail.markers);
      setSightings(detail.sightings);
      setPage(0);
      setHasMore(detail.hasMore);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || '고양이 정보를 불러오지 못했어요.');
    } finally {
      setLoading(false);
    }
  }

  async function handleLoadMore() {
    if (!hasMore || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setErrorMessage('');
    try {
      const nextPage = page + 1;
      const response = await getCatSightings(catId, nextPage);
      const sightingPage = response.data.data;
      const imageHeaders = await getAuthorizationHeaders();
      const nextSightings = (sightingPage.sightings ?? []).map((sighting) => normalizeSighting(sighting, imageHeaders));
      setSightings((previous) => [...previous, ...nextSightings]);
      setPage(nextPage);
      setHasMore(sightingPage.hasMore);
    } catch (error) {
      setErrorMessage(error.response?.data?.message || error.message || '목격 기록을 더 불러오지 못했어요.');
    } finally {
      loadingMoreRef.current = false;
      setLoadingMore(false);
    }
  }

  function handleTimelineScroll(event) {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 80) {
      handleLoadMore();
    }
  }

  if (loading && !cat) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered, { backgroundColor: colors.bg }]}>
        <ActivityIndicator color={colors.primary} />
        <Text style={[styles.statusText, { color: colors.textMuted }]}>고양이 기록을 불러오고 있어요</Text>
      </SafeAreaView>
    );
  }

  if (!cat) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="뒤로 가기">
            <Ionicons name="arrow-back" size={22} color={colors.textSubtle} />
          </Pressable>
        </View>
        <View style={styles.errorContent}>
          <Text style={[styles.errorTitle, { color: colors.text }]}>상세 정보를 불러오지 못했어요</Text>
          <Text style={[styles.statusText, { color: colors.textMuted }]}>{errorMessage}</Text>
          <View style={styles.retryButton}>
            <PrimaryButton label="다시 시도하기" onPress={handleRetry} loading={loading} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="뒤로 가기">
          <Ionicons name="arrow-back" size={22} color={colors.textSubtle} />
        </Pressable>
        <Ionicons name="ellipsis-horizontal" size={22} color={colors.textSubtle} accessibilityLabel="더보기" />
      </View>
      <View style={styles.topRow}>
        {cat.photoSource || cat.photoUri ? (
          <Image source={cat.photoSource ?? { uri: cat.photoUri }} style={styles.photo} />
        ) : (
          <PlaceholderArt radius={24} style={styles.photo} />
        )}
        <View style={styles.topInfo}>
          <Text style={[styles.name, { color: colors.text }]}>{cat.name}</Text>
          <TraitTagList tags={cat.tags ?? []} editable={false} />
          <Text style={[styles.meta, { color: colors.textMuted }]}>
            첫 만남 {formatDate(cat.firstSeenAt)} · {cat.sightingCount}번 만남
          </Text>
        </View>
      </View>

      <View style={[styles.mapCard, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
        <View style={styles.sectionRow}>
          <Text style={[styles.mapTitle, { color: colors.text }]}>이 친구를 만난 곳들</Text>
          <Text style={[styles.sectionCount, { color: colors.textMuted }]}>핀 {markers.length}개</Text>
        </View>
        <SightingMiniMap sightings={markers} />
        <Text style={[styles.mapCaption, { color: colors.textMuted }]}>
          핀은 만날 때마다 쌓여요. 경로가 아니라 그날의 스냅샷 기록이에요.
        </Text>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>목격 타임라인</Text>
      <ScrollView
        style={styles.timelineScroll}
        contentContainerStyle={styles.timeline}
        onScroll={handleTimelineScroll}
        scrollEventThrottle={200}
      >
        {sightings.map((s, i) => (
          <SightingTimelineItem
            key={s.id}
            sighting={s}
            number={s.seq}
            isLast={i === sightings.length - 1}
          />
        ))}
        {sightings.length === 0 && (
          <Text style={[styles.emptyText, { color: colors.textMuted }]}>아직 목격 기록이 없어요.</Text>
        )}
        {loadingMore && <ActivityIndicator style={styles.moreLoader} color={colors.primary} />}
        {!!errorMessage && sightings.length > 0 && (
          <Text style={[styles.loadMoreError, { color: colors.accent }]}>{errorMessage}</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  centered: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 12 },
  statusText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21, textAlign: 'center' },
  errorContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 12 },
  errorTitle: { fontFamily: fonts.display, fontSize: 20 },
  retryButton: { width: '100%', marginTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 14 },
  topRow: { flexDirection: 'row', gap: 16, paddingHorizontal: 22, paddingTop: 6, alignItems: 'center' },
  photo: { width: 88, height: 88, borderRadius: 24 },
  topInfo: { flex: 1, gap: 7 },
  name: { fontFamily: fonts.display, fontSize: 32, lineHeight: 32 },
  meta: { fontFamily: fonts.body, fontSize: 13 },
  mapCard: { marginHorizontal: 18, marginTop: 18, padding: 16, borderRadius: 24, borderWidth: 1.5, gap: 12 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  mapTitle: { fontFamily: fonts.display, fontSize: 17 },
  sectionCount: { fontFamily: fonts.body, fontSize: 12 },
  mapCaption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 19 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 18, paddingHorizontal: 22, paddingTop: 20, paddingBottom: 8 },
  timelineScroll: { flex: 1 },
  timeline: { paddingHorizontal: 22, paddingBottom: 22 },
  emptyText: { fontFamily: fonts.body, fontSize: 13, textAlign: 'center', paddingVertical: 24 },
  moreLoader: { paddingVertical: 12 },
  loadMoreError: { fontFamily: fonts.body, fontSize: 12, textAlign: 'center', paddingVertical: 10 },
});
