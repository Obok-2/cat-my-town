import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useColors } from '../theme/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { getUserLevelInfo } from '../data/store';
import GhostButton from '../components/GhostButton';

// 목업에 "나" 탭 상세 화면은 없음(네비게이션 구조만 8페이지에 명시) — 로그아웃 등 최소 기능만 둔다.
export default function ProfileScreen() {
  const colors = useColors();
  const { user, logout } = useAuth();
  const [levelInfo, setLevelInfo] = useState({ level: 0, title: '', catCount: 0 });

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getUserLevelInfo().then((l) => mounted && setLevelInfo(l));
      return () => {
        mounted = false;
      };
    }, [])
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.content}>
        <View style={[styles.avatar, { backgroundColor: colors.cardAlt }]}>
          <Text style={styles.avatarEmoji}>🙂</Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>{user?.displayName ?? '산책자'}</Text>
        {levelInfo.level > 0 && (
          <Text style={[styles.level, { color: colors.primary }]}>
            {levelInfo.title} Lv.{levelInfo.level}
          </Text>
        )}
        <Text style={[styles.stat, { color: colors.textMuted }]}>고양이 {levelInfo.catCount}마리 수집</Text>

        <View style={styles.spacer} />
        <GhostButton label="로그아웃" onPress={logout} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 28, paddingTop: 48 },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarEmoji: { fontSize: 40 },
  name: { fontSize: 18, fontWeight: '800' },
  level: { fontSize: 13, fontWeight: '700', marginTop: 6 },
  stat: { fontSize: 12, marginTop: 4 },
  spacer: { flex: 1 },
});
