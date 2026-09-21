import React, { useCallback, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useColors } from '../theme/ThemeContext';
import { getCatById, getSightingsByCat } from '../data/store';
import TraitTagList from '../components/TraitTagList';
import SightingTimelineItem from '../components/SightingTimelineItem';
import SightingMiniMap from '../components/SightingMiniMap';

function formatDate(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// 목업 6페이지 "고양이 상세": 타임라인 + 목격 미니맵(지도는 상세에서만, 필터 없음).
export default function CatDetailScreen({ route, navigation }) {
  const { catId } = route.params;
  const colors = useColors();
  const [cat, setCat] = useState(null);
  const [sightings, setSightings] = useState([]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      Promise.all([getCatById(catId), getSightingsByCat(catId)]).then(([c, s]) => {
        if (!mounted) return;
        setCat(c);
        setSightings(s);
      });
      return () => {
        mounted = false;
      };
    }, [catId])
  );

  if (!cat) {
    return <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} />;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={[styles.back, { color: colors.text }]}>← 뒤로</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          {cat.photoUri ? (
            <Image source={{ uri: cat.photoUri }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, { backgroundColor: colors.cardAlt }]} />
          )}
          <View style={styles.topInfo}>
            <Text style={[styles.name, { color: colors.text }]}>{cat.name}</Text>
            <TraitTagList tags={cat.tags} editable={false} />
          </View>
        </View>
        <Text style={[styles.meta, { color: colors.textMuted }]}>
          첫 만남 {formatDate(cat.firstSeenAt)} · {cat.sightingCount}번 만남
        </Text>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>목격 타임라인</Text>
        <View style={styles.timeline}>
          {sightings.map((s, i) => (
            <SightingTimelineItem key={s.id} sighting={s} isLast={i === sightings.length - 1} />
          ))}
        </View>

        <View style={styles.sectionRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>이 친구를 만난 곳들</Text>
          <Text style={[styles.sectionCount, { color: colors.textMuted }]}>전 {sightings.length}개</Text>
        </View>
        <SightingMiniMap sightings={sightings} />
        <Text style={[styles.mapCaption, { color: colors.textMuted }]}>
          만날 때마다 쌓여요. 경로가 아니라 그날의 스냅샷 기록이에요.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4 },
  back: { fontSize: 15, fontWeight: '700' },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  topRow: { flexDirection: 'row', gap: 14, marginTop: 8 },
  photo: { width: 84, height: 84, borderRadius: 20 },
  topInfo: { flex: 1, justifyContent: 'center', gap: 8 },
  name: { fontSize: 20, fontWeight: '800' },
  meta: { fontSize: 12, marginTop: 12, marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '800', marginBottom: 14 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 8 },
  sectionCount: { fontSize: 12, marginBottom: 14 },
  timeline: { marginBottom: 8 },
  mapCaption: { fontSize: 11, marginTop: 10, lineHeight: 16 },
});
