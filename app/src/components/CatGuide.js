import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Ellipse } from 'react-native-svg';
import { useColors } from '../theme/ThemeContext';

// 카메라 화면 위에 덧그리는 앉은 고양이 안내선(정면 얼굴 + 몸통). 화면에만 보이고 촬영된 사진에는 찍히지 않는다.
// 얼굴은 정면으로, 몸통은 털 무늬가 함께 보이도록 고양이 전체가 선 안에 들어오게 맞추는 용도이고,
// 길고양이는 가만히 있지 않으므로 강제하지 않는다.
// 영역(왼쪽·오른쪽 44, 위 100, 아래 200)은 손전등 버튼(위)·확대 버튼과 셔터(아래)를 피해 잡았고,
// 화면이 작으면 SVG가 비율을 유지한 채 알아서 줄어든다.
const LINE = { fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' };

export default function CatGuide() {
  const colors = useColors();
  const stroke = colors.frameGuide;

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Svg width="100%" height="100%" viewBox="0 0 240 300" style={StyleSheet.absoluteFill}>
        {/* 머리 윤곽(귀 포함) */}
        <Path
          d="M60 68 C56 48 58 30 66 8 L96 30 Q120 25 144 30 L174 8 C182 30 184 48 180 68 C184 92 156 108 120 108 C84 108 56 92 60 68 Z"
          stroke={stroke}
          strokeWidth={3}
          {...LINE}
        />
        {/* 눈 */}
        <Ellipse cx={98} cy={64} rx={7} ry={8} stroke={stroke} strokeWidth={2.5} fill="none" />
        <Ellipse cx={142} cy={64} rx={7} ry={8} stroke={stroke} strokeWidth={2.5} fill="none" />
        {/* 코·입 */}
        <Path
          d="M114 80 L126 80 L120 87 Z M120 87 L120 93 M120 93 Q114 99 108 96 M120 93 Q126 99 132 96"
          stroke={stroke}
          strokeWidth={2.5}
          {...LINE}
        />
        {/* 수염 */}
        <Path d="M92 84 L68 78 M92 90 L70 92 M148 84 L172 78 M148 90 L170 92" stroke={stroke} strokeWidth={2.5} {...LINE} />
        {/* 몸통 윤곽 */}
        <Path
          d="M82 102 C60 130 50 190 54 250 Q56 285 100 288 L140 288 Q184 285 186 250 C190 190 180 130 158 102"
          stroke={stroke}
          strokeWidth={3}
          {...LINE}
        />
        {/* 앞다리 */}
        <Path d="M108 140 C106 190 106 240 104 286 M132 140 C134 190 134 240 136 286" stroke={stroke} strokeWidth={2.5} {...LINE} />
        {/* 꼬리 */}
        <Path d="M186 262 C214 262 222 230 212 205" stroke={stroke} strokeWidth={3} {...LINE} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 44, right: 44, top: 100, bottom: 200 },
});
