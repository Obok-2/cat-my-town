import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StackActions } from '@react-navigation/native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { LEVELS } from '../data/levels';
import PrimaryButton from '../components/PrimaryButton';

const IMAGES = {
  LEVEL_UP: require('../../assets/level-up-cat.png'),
  NEW_CAT: require('../../assets/registration-complete-cat.png'),
  SIGHTING: require('../../assets/sighting-complete-cat.png'),
};

function getContent(type, levelInfo, catName) {
  if (type === 'LEVEL_UP') {
    const next = LEVELS.find((level) => level.level === levelInfo.level + 1);
    return {
      badge: 'LEVEL UP!',
      title: `${levelInfo.title}가\n되었습니다`,
      description: `${levelInfo.catCount}마리째 기록 완료.${next ? ` 다음 레벨은 ${next.title}예요.` : ' 최고 레벨을 달성했어요.'}`,
      buttonLabel: '계속 모으기',
    };
  }

  if (type === 'SIGHTING') {
    return {
      badge: 'NEW RECORD',
      title: '만남을 기록했어요!',
      description: catName
        ? `${catName}의 새로운 추억이\n하나 더 생겼어요.`
        : '새로운 만남을\n도감에 기록했어요.',
      buttonLabel: '기록 확인하기',
    };
  }

  return {
    badge: 'NEW FRIEND',
    title: '새로운 친구를\n도감에 등록했어요!',
    description: '이 친구와의 첫 만남을\n소중하게 기록했어요.',
    buttonLabel: '도감 보러가기',
  };
}

export default function CompletionScreen({ route, navigation }) {
  const colors = useColors();
  const { type = 'NEW_CAT', levelInfo, catName } = route.params ?? {};
  const content = getContent(type, levelInfo, catName);

  function goToCollection() {
    navigation.dispatch(StackActions.popTo('Tabs', { screen: 'Collection' }));
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <Image
          source={IMAGES[type] ?? IMAGES.NEW_CAT}
          style={styles.illustration}
          resizeMode="contain"
          accessibilityLabel={content.title.replace('\n', ' ')}
        />
        <Text style={[styles.badge, { color: colors.accent }]}>{content.badge}</Text>
        <Text style={[styles.title, { color: colors.text }]}>{content.title}</Text>
        <Text style={[styles.desc, { color: colors.textSubtle }]}>{content.description}</Text>
        {type === 'LEVEL_UP' && (
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
        )}
      </View>
      <View style={styles.buttonWrap}>
        <PrimaryButton label={content.buttonLabel} onPress={goToCollection} />
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
