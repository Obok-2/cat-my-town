import React, { useState } from 'react';
import { Alert, Image, Platform, View, Text, StyleSheet, SafeAreaView, Pressable, ActivityIndicator } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { useAuth } from '../context/AuthContext';

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

// 목업 a1 "로그인": Google Cloud OAuth 로그인 버튼 하나. 로고는 가운데, 버튼은 하단에 고정.
export default function LoginScreen() {
  const colors = useColors();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  async function handleLogin() {
    setLoginError('');
    setLoading(true);
    try {
      await login();
    } catch (error) {
      const message = error.response?.data?.message || error.message || '잠시 후 다시 시도해주세요.';
      setLoginError(message);
      if (Platform.OS !== 'web') Alert.alert('로그인하지 못했어요', message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.hero}>
        <Image
          source={require('../../assets/brand-mark.png')}
          style={styles.illustration}
          resizeMode="contain"
          accessibilityLabel="우리동네고양이 로고"
        />
        <View style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.text }]}>우리동네고양이</Text>
          <Text style={[styles.subtitle, { color: colors.textSubtle }]}>
            오늘 마주친 고양이를{'\n'}나만의 도감에 담아요
          </Text>
        </View>
      </View>

      <View style={styles.bottom}>
        {!!loginError && (
          <Text accessibilityRole="alert" style={[styles.footer, { color: colors.text }]}>
            로그인하지 못했어요. {loginError}
          </Text>
        )}
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
        <Text style={[styles.footer, { color: colors.textMuted }]}>Google 계정으로 내 도감을 안전하게 관리해요</Text>
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
