import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

// 목업 a3: r=43(viewBox 100), stroke-width 11, 배경 트랙 #F0E6D8, 진행 #E08B4B.
// reanimated 대신 RN 내장 Animated로 0 → score 애니메이션.
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const VIEWBOX = 100;
const RADIUS = 43;
const STROKE_WIDTH = 11;

export default function MatchGauge({ percent = 0, size = 170, label = '일치율' }) {
  const colors = useColors();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const circumference = 2 * Math.PI * RADIUS;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: percent,
      duration: 700,
      useNativeDriver: false, // strokeDashoffset은 native driver 미지원
    }).start();
  }, [percent, animatedValue]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={VIEWBOX / 2} cy={VIEWBOX / 2} r={RADIUS} stroke={colors.trackBg} strokeWidth={STROKE_WIDTH} fill="none" />
        <AnimatedCircle
          cx={VIEWBOX / 2}
          cy={VIEWBOX / 2}
          r={RADIUS}
          stroke={colors.primary}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={[styles.percent, { color: colors.accent }]}>
          {Math.round(percent)}
          <Text style={styles.percentSign}>%</Text>
        </Text>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
  percent: { fontFamily: fonts.display, fontSize: 52, lineHeight: 52 },
  percentSign: { fontSize: 24 },
  label: { fontFamily: fonts.body, fontSize: 13, marginTop: 2 },
});
