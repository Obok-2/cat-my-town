import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import PrimaryButton from './PrimaryButton';
import PlaceholderArt from './PlaceholderArt';
import { LEVELS } from '../data/levels';

// 목업 a8 레벨업 팝업: 오버레이 + 일러스트 + "LEVEL UP!" + 타이틀 + 설명 + 진행바 + 버튼.
export default function LevelUpModal({ visible, levelInfo, onContinue }) {
  const colors = useColors();
  if (!levelInfo) return null;
  const next = LEVELS.find((l) => l.level === levelInfo.level + 1);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onContinue}>
      <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
        <View style={[styles.card, { backgroundColor: colors.cardAlt }]}>
          <PlaceholderArt label={'일러스트\n깃발 든 고양이'} round style={styles.illustration} />
          <Text style={[styles.badge, { color: colors.accent }]}>LEVEL UP!</Text>
          <Text style={[styles.title, { color: colors.text }]}>{`${levelInfo.title}가\n되었습니다`}</Text>
          <Text style={[styles.desc, { color: colors.textSubtle }]}>
            {levelInfo.catCount}마리째 기록 완료.
            {next ? ` 다음 레벨은 ${next.title}예요.` : ' 최고 레벨을 달성했어요.'}
          </Text>
          <View style={[styles.track, { backgroundColor: colors.trackBg }]}>
            <View style={[styles.fill, { width: `${Math.max(8, Math.round(levelInfo.ratio * 100))}%`, backgroundColor: colors.primary }]} />
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
  card: { width: '100%', maxWidth: 360, borderRadius: 30, paddingHorizontal: 24, paddingTop: 30, paddingBottom: 24, alignItems: 'center', gap: 16 },
  illustration: { width: 120, height: 120 },
  badge: { fontFamily: fonts.display, fontSize: 15, letterSpacing: 1.2 },
  title: { fontFamily: fonts.display, fontSize: 27, textAlign: 'center', lineHeight: 36 },
  desc: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22, textAlign: 'center' },
  track: { width: '100%', height: 14, borderRadius: 7, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 7 },
  buttonWrap: { width: '100%', marginTop: 2 },
});
