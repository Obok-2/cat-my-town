import React, { useCallback, useState } from 'react';
import { View, Text, Image, ScrollView, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { getCatById, getSightingsByCat } from '../data/store';
import TraitTagList from '../components/TraitTagList';
import SightingTimelineItem from '../components/SightingTimelineItem';
import SightingMiniMap from '../components/SightingMiniMap';
import PlaceholderArt from '../components/PlaceholderArt';

function formatDate(ts) {
  const d = new Date(ts);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

// 목업 a7 "고양이 상세": 타임라인 + 목격 미니맵(지도는 상세에서만, 필터 없음).
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
          <Text style={[styles.headerIcon, { color: colors.textSubtle }]}>←</Text>
        </Pressable>
        <Text style={[styles.headerIcon, { color: colors.textSubtle }]}>⋯</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.topRow}>
          {cat.photoUri ? (
            <Image source={{ uri: cat.photoUri }} style={styles.photo} />
          ) : (
            <PlaceholderArt radius={24} style={styles.photo} />
          )}
          <View style={styles.topInfo}>
            <Text style={[styles.name, { color: colors.text }]}>{cat.name}</Text>
            <TraitTagList tags={cat.tags} editable={false} />
            <Text style={[styles.meta, { color: colors.textMuted }]}>
              첫 만남 {formatDate(cat.firstSeenAt)} · {cat.sightingCount}번 만남
            </Text>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>목격 타임라인</Text>
        <View style={styles.timeline}>
          {sightings.map((s, i) => (
            <SightingTimelineItem
              key={s.id}
              sighting={s}
              number={sightings.length - i}
              isLast={i === sightings.length - 1}
            />
          ))}
        </View>

        <View style={[styles.mapCard, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}>
          <View style={styles.sectionRow}>
            <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>이 친구를 만난 곳들</Text>
            <Text style={[styles.sectionCount, { color: colors.textMuted }]}>핀 {sightings.length}개</Text>
          </View>
          <SightingMiniMap sightings={sightings} />
          <Text style={[styles.mapCaption, { color: colors.textMuted }]}>
            핀은 만날 때마다 쌓여요. 경로가 아니라 그날의 스냅샷 기록이에요.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 8, paddingBottom: 6 },
  headerIcon: { fontSize: 20 },
  content: { paddingHorizontal: 22, paddingBottom: 40 },
  topRow: { flexDirection: 'row', gap: 16, marginTop: 6, alignItems: 'flex-start' },
  photo: { width: 88, height: 88, borderRadius: 24 },
  topInfo: { flex: 1, gap: 7 },
  name: { fontFamily: fonts.display, fontSize: 32, lineHeight: 32 },
  meta: { fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
  sectionTitle: { fontFamily: fonts.display, fontSize: 18, marginTop: 22, marginBottom: 14 },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionCount: { fontFamily: fonts.body, fontSize: 12 },
  timeline: { marginBottom: 8 },
  mapCard: { marginTop: 8, marginBottom: 26, padding: 16, borderRadius: 24, borderWidth: 1.5, gap: 12 },
  mapCaption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 19 },
});
