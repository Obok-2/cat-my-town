import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackActions } from '@react-navigation/native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { LEVELS } from '../data/levels';
import PrimaryButton from '../components/PrimaryButton';

export default function LevelUpScreen({ route, navigation }) {
  const colors = useColors();
  const { levelInfo } = route.params;
  const next = LEVELS.find((level) => level.level === levelInfo.level + 1);

  function goToCollection() {
    navigation.dispatch(StackActions.popTo('Tabs', { screen: 'Collection' }));
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <Image
          source={require('../../assets/level-up-cat.png')}
          style={styles.illustration}
          resizeMode="contain"
          accessibilityLabel="깃발을 든 고양이"
        />
        <Text style={[styles.badge, { color: colors.accent }]}>LEVEL UP!</Text>
        <Text style={[styles.title, { color: colors.text }]}>{`${levelInfo.title}가\n되었습니다`}</Text>
        <Text style={[styles.desc, { color: colors.textSubtle }]}>
          {levelInfo.catCount}마리째 기록 완료.
          {next ? ` 다음 레벨은 ${next.title}예요.` : ' 최고 레벨을 달성했어요.'}
        </Text>
        <View style={[styles.track, { backgroundColor: colors.trackBg }]}>
          <View
            style={[
              styles.fill,
              {
                width: `${Math.max(8, Math.round(levelInfo.ratio * 100))}%`,
                backgroundColor: colors.primary,
              },
            ]}
          />
        </View>
      </View>
      <View style={styles.buttonWrap}>
        <PrimaryButton label="계속 모으기" onPress={goToCollection} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, gap: 18 },
  illustration: { width: 240, height: 240 },
  badge: { fontFamily: fonts.display, fontSize: 17, letterSpacing: 1.4 },
  title: { fontFamily: fonts.display, fontSize: 30, textAlign: 'center', lineHeight: 40 },
  desc: { fontFamily: fonts.body, fontSize: 15, lineHeight: 24, textAlign: 'center' },
  track: { width: '100%', maxWidth: 360, height: 14, borderRadius: 7, overflow: 'hidden', marginTop: 4 },
  fill: { height: '100%', borderRadius: 7 },
  buttonWrap: { paddingHorizontal: 20, paddingBottom: 34 },
});
