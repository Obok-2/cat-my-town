import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Rect } from 'react-native-svg';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

let uid = 0;

// 목업 전반에 쓰이는 대각선 스트라이프 placeholder(실제 사진/일러스트 없을 때).
// "일러스트 손그림 고양이", "방금 찍은 사진", "대표 사진" 등의 자리표시자와 동일한 패턴.
export default function PlaceholderArt({ label, radius = 0, round = false, style }) {
  const colors = useColors();
  const patternId = React.useMemo(() => `stripes-${uid++}`, []);

  return (
    <View style={[styles.wrap, { borderRadius: round ? 9999 : radius }, style]}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <Pattern
            id={patternId}
            width={16}
            height={16}
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(135)"
          >
            <Rect width={16} height={16} fill={colors.placeholderB} />
            <Rect width={8} height={16} fill={colors.placeholderA} />
          </Pattern>
        </Defs>
        <Rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </Svg>
      {!!label && (
        <Text style={[styles.label, { color: colors.textMuted, fontFamily: fonts.mono }]}>{label}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  label: { fontSize: 10, textAlign: 'center', paddingHorizontal: 12 },
});
