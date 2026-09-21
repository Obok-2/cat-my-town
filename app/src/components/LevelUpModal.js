import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import PrimaryButton from './PrimaryButton';
import { LEVELS } from '../data/levels';

// 목업 5페이지 "레벨업 팝업": 달성 시 짧게 노출되는 오버레이.
export default function LevelUpModal({ visible, levelInfo, onContinue }) {
  const colors = useColors();
  if (!levelInfo) return null;
  const next = LEVELS.find((l) => l.level === levelInfo.level + 1);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onContinue}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.badgeText, { color: colors.primary }]}>LEVEL UP!</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>{levelInfo.title}가 되었습니다</Text>
          <Text style={[styles.desc, { color: colors.textMuted }]}>
            {levelInfo.catCount}마리째 기록 완료.
            {next ? ` 다음 레벨은 ${next.title}예요.` : ' 최고 레벨을 달성했어요.'}
          </Text>
          <View style={[styles.track, { backgroundColor: colors.cardAlt }]}>
            <View style={[styles.fill, { width: `${Math.round(levelInfo.ratio * 100)}%`, backgroundColor: colors.primary }]} />
          </View>
          <View style={styles.buttonWrap}>
            <PrimaryButton label="계속 모으기" onPress={onContinue} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 360, borderRadius: 24, padding: 24 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 14 },
  badgeText: { fontSize: 12, fontWeight: '800' },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 8 },
  desc: { fontSize: 13, lineHeight: 19, marginBottom: 16 },
  track: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 20 },
  fill: { height: '100%', borderRadius: 4 },
  buttonWrap: { marginTop: 4 },
});
