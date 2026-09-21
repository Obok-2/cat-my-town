import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useColors } from '../theme/ThemeContext';

// 목업 8페이지: "react-native-svg Circle의 strokeDashoffset을 score로 계산하고
// 0 → score 애니메이션." reanimated 대신 RN 내장 Animated로 동일 효과를 낸다(추가 네이티브 의존성 회피).
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export default function MatchGauge({ percent = 0, size = 140, strokeWidth = 12, label = '일치율' }) {
  const colors = useColors();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

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
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Text style={[styles.percent, { color: colors.text }]}>{Math.round(percent)}%</Text>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { position: 'absolute', alignItems: 'center' },
  percent: { fontSize: 30, fontWeight: '800' },
  label: { fontSize: 13, marginTop: 2 },
});
