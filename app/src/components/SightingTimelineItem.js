import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { circled } from '../data/circled';
import PlaceholderArt from './PlaceholderArt';
import TraitTagList from './TraitTagList';

function formatDate(ts) {
  const d = new Date(ts);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${days[d.getDay()]} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 목업 a7 목격 타임라인 한 줄: 좌측 번호 원(주황) + 연결선 + 썸네일/날짜/장소 카드.
export default function SightingTimelineItem({ sighting, number, isLast }) {
  const colors = useColors();
  const photoSource = sighting.photoSource ?? (sighting.photoUri ? { uri: sighting.photoUri } : null);

  return (
    <View style={styles.row}>
      <View style={styles.railCol}>
        <View style={[styles.numberCircle, { backgroundColor: colors.primary }]}>
          <Text style={[styles.numberText, { color: colors.onPrimary }]}>{circled(number)}</Text>
        </View>
        {!isLast && <View style={[styles.line, { backgroundColor: colors.border }]} />}
      </View>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.thumbWrap}>
          {photoSource ? (
            <Image source={photoSource} style={StyleSheet.absoluteFill} resizeMode="cover" />
          ) : (
            <PlaceholderArt style={StyleSheet.absoluteFill} radius={14} />
          )}
        </View>
        <View style={styles.textCol}>
          <Text style={[styles.date, { color: colors.text }]}>{formatDate(sighting.takenAt)}</Text>
          <Text style={[styles.memo, { color: colors.textMuted }]} numberOfLines={2}>
            {sighting.memo || '메모 없음'}
          </Text>
          {sighting.tags?.length > 0 && <TraitTagList tags={sighting.tags} editable={false} />}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 14 },
  railCol: { width: 22, alignItems: 'center' },
  numberCircle: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  numberText: { fontFamily: fonts.body, fontSize: 12 },
  line: { flex: 1, width: 2, marginVertical: 2 },
  card: {
    flex: 1,
    flexDirection: 'row',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 10,
    marginBottom: 14,
    gap: 12,
  },
  thumbWrap: { width: 62, height: 62, borderRadius: 14, overflow: 'hidden' },
  textCol: { flex: 1, justifyContent: 'center', gap: 4 },
  date: { fontFamily: fonts.body, fontSize: 14 },
  memo: { fontFamily: fonts.body, fontSize: 12 },
});
