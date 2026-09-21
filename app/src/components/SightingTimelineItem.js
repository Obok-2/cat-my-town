import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeContext';

function formatDate(ts) {
  const d = new Date(ts);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// 목업 6페이지 "고양이 상세" 목격 타임라인 한 줄: 좌측 점선 + 날짜/메모 카드.
export default function SightingTimelineItem({ sighting, isLast }) {
  const colors = useColors();
  return (
    <View style={styles.row}>
      <View style={styles.railCol}>
        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
        {!isLast && <View style={[styles.line, { backgroundColor: colors.border }]} />}
      </View>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {sighting.photoUri && <Image source={{ uri: sighting.photoUri }} style={styles.thumb} />}
        <View style={styles.textCol}>
          <Text style={[styles.date, { color: colors.text }]}>{formatDate(sighting.takenAt)}</Text>
          {!!sighting.memo && (
            <Text style={[styles.memo, { color: colors.textMuted }]} numberOfLines={2}>
              {sighting.memo}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  railCol: { width: 20, alignItems: 'center' },
  dot: { width: 10, height: 10, borderRadius: 5, marginTop: 14 },
  line: { flex: 1, width: 2, marginTop: 4, marginBottom: 4 },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    marginBottom: 12,
    gap: 10,
  },
  thumb: { width: 44, height: 44, borderRadius: 10 },
  textCol: { flex: 1 },
  date: { fontSize: 13, fontWeight: '700' },
  memo: { fontSize: 12, marginTop: 2 },
});
