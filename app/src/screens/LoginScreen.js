import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { useAuth } from '../context/AuthContext';
import PlaceholderArt from '../components/PlaceholderArt';

// 목업의 conic-gradient(빨·노·초·파 4등분) 구글 마크를 사분원 4개로 그린다.
function GoogleMark() {
  return (
    <Svg width={20} height={20} viewBox="0 0 20 20">
      <Path d="M10 10 L10 0 A10 10 0 0 1 20 10 Z" fill="#EA4335" />
      <Path d="M10 10 L20 10 A10 10 0 0 1 10 20 Z" fill="#FBBC05" />
      <Path d="M10 10 L10 20 A10 10 0 0 1 0 10 Z" fill="#34A853" />
      <Path d="M10 10 L0 10 A10 10 0 0 1 10 0 Z" fill="#4285F4" />
    </Svg>
  );
}

// 목업 a1 "로그인": 구글 소셜 로그인 버튼 하나. 로고는 가운데, 버튼은 하단에 고정.
// ⚠️ 실제 Firebase Authentication 연동 전까지는 버튼을 누르면 바로 로그인 처리되는 목업이다.
export default function LoginScreen() {
  const colors = useColors();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    try {
      await login();
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.hero}>
        <PlaceholderArt label={'일러스트\n손그림 고양이'} round style={styles.illustration} />
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.text }]}>우리동네고양이</Text>
          <Text style={[styles.subtitle, { color: colors.textSubtle }]}>
            오늘 마주친 고양이를{'\n'}나만의 도감에 담아요
          </Text>
        </View>
      </View>

      <View style={styles.bottom}>
        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={({ pressed }) => [
            styles.googleButton,
            {
              backgroundColor: colors.card,
              borderColor: colors.borderStrong,
              shadowColor: colors.googleBtnShadow,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <>
              <GoogleMark />
              <Text style={[styles.googleLabel, { color: colors.text }]}>Google로 시작하기</Text>
            </>
          )}
        </Pressable>
        <Text style={[styles.footer, { color: colors.textMuted }]}>기록은 이 기기의 내 계정에만 저장돼요</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28, paddingHorizontal: 36 },
  illustration: { width: 168, height: 168 },
  titleWrap: { alignItems: 'center', gap: 8 },
  title: { fontFamily: fonts.display, fontSize: 34 },
  subtitle: { fontFamily: fonts.body, fontSize: 15, lineHeight: 24, textAlign: 'center' },
  bottom: { paddingHorizontal: 28, paddingBottom: 48, gap: 16 },
  googleButton: {
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
  },
  googleLabel: { fontFamily: fonts.body, fontSize: 17 },
  footer: { fontFamily: fonts.body, fontSize: 12, lineHeight: 19, textAlign: 'center' },
});
