import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import PlaceholderArt from '../components/PlaceholderArt';
import { expo } from '../../app.json';

// 목업 a0 "스플래시": 로고 + 한 줄 문구 + 로딩 점 3개 + 버전. 앱 실행 직후 잠깐만 보인다.
export default function SplashScreen() {
  const colors = useColors();
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setActive((i) => (i + 1) % 3), 350);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={[styles.root, { backgroundColor: colors.splashBg }]}>
      <View style={[styles.circleA, { backgroundColor: colors.splashCircleA }]} />
      <View style={[styles.circleB, { backgroundColor: colors.splashCircleB }]} />

      <PlaceholderArt
        label={'일러스트\n손그림 고양이'}
        round
        stripe={9}
        colorA={colors.splashArtA}
        colorB={colors.splashArtB}
        style={styles.art}
      />
      <View style={styles.titleWrap}>
        <Text style={[styles.title, { color: colors.text }]}>우리동네고양이</Text>
        <Text style={[styles.tagline, { color: colors.textSubtle }]}>오늘의 산책을 기록해요</Text>
      </View>

      <View style={styles.bottom}>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[styles.dot, { backgroundColor: i === active ? colors.primary : colors.splashDotOff }]}
            />
          ))}
        </View>
        <Text style={[styles.version, { color: colors.splashSubtle }]}>v{expo.version}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 26, overflow: 'hidden' },
  circleA: { position: 'absolute', left: -60, top: 90, width: 220, height: 220, borderRadius: 110 },
  circleB: { position: 'absolute', right: -70, bottom: 130, width: 260, height: 260, borderRadius: 130 },
  art: { width: 184, height: 184 },
  titleWrap: { alignItems: 'center', gap: 10 },
  title: { fontFamily: fonts.display, fontSize: 38 },
  tagline: { fontFamily: fonts.body, fontSize: 15 },
  bottom: { position: 'absolute', bottom: 56, alignItems: 'center', gap: 16 },
  dots: { flexDirection: 'row', gap: 7 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  version: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.1 },
});
