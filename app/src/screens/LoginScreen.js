import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Pressable, ActivityIndicator } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { useAuth } from '../context/AuthContext';
import PlaceholderArt from '../components/PlaceholderArt';

// 목업 a1 "로그인": 구글 소셜 로그인 단일 버튼.
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
      <View style={styles.content}>
        <PlaceholderArt label={'일러스트\n손그림 고양이'} round style={styles.illustration} />

        <Text style={[styles.title, { color: colors.text }]}>우리동네고양이</Text>
        <Text style={[styles.subtitle, { color: colors.textSubtle }]}>
          오늘 마주친 고양이를{'\n'}나만의 도감에 담아요
        </Text>

        <View style={styles.spacer} />

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={({ pressed }) => [
            styles.googleButton,
            { backgroundColor: colors.card, borderColor: colors.borderStrong, opacity: pressed ? 0.85 : 1 },
          ]}
        >
          {loading ? (
            <ActivityIndicator color={colors.text} />
          ) : (
            <>
              <View style={styles.googleDot} />
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
  content: { flex: 1, paddingHorizontal: 28, paddingVertical: 48, alignItems: 'center', justifyContent: 'center' },
  illustration: { width: 168, height: 168, marginBottom: 28 },
  title: { fontFamily: fonts.display, fontSize: 34, marginBottom: 8 },
  subtitle: { fontFamily: fonts.body, fontSize: 15, lineHeight: 24, textAlign: 'center' },
  spacer: { height: 160 },
  googleButton: {
    width: '100%',
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  googleDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4285F4',
  },
  googleLabel: { fontFamily: fonts.body, fontSize: 17 },
  footer: { fontFamily: fonts.body, fontSize: 12, textAlign: 'center', marginTop: 16 },
});
