import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import PrimaryButton from '../components/PrimaryButton';

// 목업 4페이지 "로그인": 구글 소셜 로그인 단일 버튼.
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
        <View style={[styles.illustration, { backgroundColor: colors.cardAlt }]}>
          <Text style={styles.illustrationEmoji}>🐈</Text>
        </View>

        <Text style={[styles.title, { color: colors.text }]}>우리동네고양이</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          오늘 마주친 고양이를{'\n'}나만의 도감에 담아요
        </Text>

        <View style={styles.spacer} />

        <PrimaryButton label="Google로 시작하기" onPress={handleLogin} loading={loading} />
        <Text style={[styles.footer, { color: colors.textMuted }]}>
          기록은 이 기기와 내 계정에만 저장돼요
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 28, paddingVertical: 48, justifyContent: 'center' },
  illustration: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  illustrationEmoji: { fontSize: 52 },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 10 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  spacer: { height: 160 },
  footer: { fontSize: 12, textAlign: 'center', marginTop: 14 },
});
