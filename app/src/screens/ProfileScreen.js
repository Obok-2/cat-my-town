import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { useAuth } from '../context/AuthContext';
import { getUserLevelInfo /* , seedDemoData, clearAllCats */ } from '../data/store';
import GhostButton from '../components/GhostButton';
import PlaceholderArt from '../components/PlaceholderArt';

// 목업에 없는 화면 — 카메라 화면 우상단 아바타로 들어오는 최소 기능(로그아웃·개발용 도구)만 둔다.
export default function ProfileScreen({ navigation }) {
  const colors = useColors();
  const { user, logout } = useAuth();
  const [levelInfo, setLevelInfo] = useState({ level: 0, title: '', catCount: 0 });
  // const [busy, setBusy] = useState(false); // 개발용 도구 주석 처리로 사용하지 않음

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getUserLevelInfo().then((l) => mounted && setLevelInfo(l));
      return () => {
        mounted = false;
      };
    }, [])
  );

  // 개발용 도구(데모 데이터 채우기·도감 비우기) — 아래 화면 버튼과 함께 주석 처리
  // async function handleSeed() {
  //   if (busy) return;
  //   setBusy(true);
  //   try {
  //     await seedDemoData();
  //     const l = await getUserLevelInfo();
  //     setLevelInfo(l);
  //     navigation.navigate('Tabs', { screen: 'Collection' });
  //   } finally {
  //     setBusy(false);
  //   }
  // }
  //
  // async function handleClear() {
  //   if (busy) return;
  //   setBusy(true);
  //   try {
  //     await clearAllCats();
  //     const l = await getUserLevelInfo();
  //     setLevelInfo(l);
  //   } finally {
  //     setBusy(false);
  //   }
  // }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} accessibilityLabel="뒤로 가기">
          <Ionicons name="arrow-back" size={22} color={colors.textSubtle} />
        </Pressable>
      </View>
      <View style={styles.content}>
        <PlaceholderArt round style={styles.avatar} />
        <Text style={[styles.name, { color: colors.text }]}>{user?.displayName ?? '산책자'}</Text>
        {levelInfo.level > 0 && (
          <Text style={[styles.level, { color: colors.accent }]}>
            {levelInfo.title} Lv.{levelInfo.level}
          </Text>
        )}
        <Text style={[styles.stat, { color: colors.textMuted }]}>고양이 {levelInfo.catCount}마리 수집</Text>

        <View style={styles.spacer} />

        {/* 개발용 도구 — 로컬 목데이터(AsyncStorage)만 바꾸고 서버 도감에는 반영되지 않아 주석 처리
        {__DEV__ && (
          <View style={styles.devSection}>
            <Text style={[styles.devLabel, { color: colors.textMuted }]}>개발용</Text>
            <GhostButton label="데모 데이터 채우기" onPress={handleSeed} disabled={busy} />
            <View style={{ height: 10 }} />
            <GhostButton label="도감 비우기" onPress={handleClear} disabled={busy} />
          </View>
        )}
        */}

        <View style={styles.logoutWrap}>
          <GhostButton label="로그아웃" onPress={logout} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 22, paddingTop: 14 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 28, paddingTop: 24 },
  avatar: { width: 88, height: 88, marginBottom: 16 },
  name: { fontFamily: fonts.display, fontSize: 20 },
  level: { fontFamily: fonts.body, fontSize: 13, marginTop: 6 },
  stat: { fontFamily: fonts.body, fontSize: 12, marginTop: 4 },
  spacer: { flex: 1 },
  logoutWrap: { width: '100%', marginTop: 16, paddingBottom: 24 },
  devSection: { width: '100%', marginBottom: 8 },
  devLabel: { fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1, marginBottom: 10 },
});
