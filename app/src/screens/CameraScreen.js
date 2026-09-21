import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { getSightings } from '../data/store';
import PrimaryButton from '../components/PrimaryButton';

function formatToday() {
  const d = new Date();
  const hour = d.getHours();
  const part = hour < 11 ? '아침' : hour < 17 ? '낮' : '저녁';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} · ${part} 산책`;
}

// 목업 a2 "홈 (카메라)": 앱 실행 시 즉시 카메라, 프레임 가이드 + 단일 셔터.
export default function CameraScreen({ navigation }) {
  const colors = useColors();
  const [permission, requestPermission] = useCameraPermissions();
  const [weekCount, setWeekCount] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef(null);

  // 앱이 켜지고 촬영 탭(초기 화면)에 들어오면 버튼 탭 없이 바로 권한을 물어본다.
  // 웹은 getUserMedia 호출 시 브라우저가 자체 권한 팝업을 띄우므로 우리 쪽 게이트를 두지 않는다.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      getSightings().then((sightings) => {
        if (!mounted) return;
        const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        setWeekCount(sightings.filter((s) => s.takenAt >= weekAgo).length);
      });
      return () => {
        mounted = false;
      };
    }, [])
  );

  async function handleShutter() {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
      navigation.navigate('Capture', { screen: 'MatchResult', params: { photoUri: photo.uri } });
    } finally {
      setCapturing(false);
    }
  }

  // 웹은 권한 게이트를 두지 않는다 — CameraView가 뜨는 순간 브라우저가 알아서 물어본다.
  if (Platform.OS !== 'web') {
    if (!permission) {
      return <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} />;
    }

    if (!permission.granted) {
      const deniedPermanently = !permission.canAskAgain;
      return (
        <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
          <View style={styles.permissionWrap}>
            <Text style={[styles.permissionText, { color: colors.text }]}>
              {deniedPermanently
                ? '설정에서 카메라 권한을 허용해주세요'
                : '길고양이를 촬영하려면 카메라 권한이 필요해요'}
            </Text>
            {!deniedPermanently && <PrimaryButton label="카메라 권한 허용하기" onPress={requestPermission} />}
          </View>
        </SafeAreaView>
      );
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.headerRow}>
        <View style={{ gap: 3 }}>
          <Text style={[styles.dateText, { color: colors.textMuted }]}>{formatToday()}</Text>
          <Text style={[styles.headerTitle, { color: colors.text }]}>오늘은 누굴 만날까요?</Text>
        </View>
        <View style={[styles.avatar, { backgroundColor: colors.tagPeachBg }]}>
          <Text style={[styles.avatarGlyph, { color: colors.tagPeachText }]}>☻</Text>
        </View>
      </View>

      <View style={styles.viewfinderWrap}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        <View pointerEvents="none" style={styles.frameGuide}>
          <View style={[styles.corner, styles.cornerTL, { borderColor: colors.frameGuide }]} />
          <View style={[styles.corner, styles.cornerTR, { borderColor: colors.frameGuide }]} />
          <View style={[styles.corner, styles.cornerBL, { borderColor: colors.frameGuide }]} />
          <View style={[styles.corner, styles.cornerBR, { borderColor: colors.frameGuide }]} />
        </View>
        <View pointerEvents="none" style={styles.hintRow}>
          <View style={[styles.hintBubble, { backgroundColor: colors.hintBubbleBg }]}>
            <Text style={[styles.hintStar, { color: colors.accent }]}>✦</Text>
            <Text style={[styles.hintText, { color: colors.hintBubbleText }]}>얼굴이 프레임 안에 들어오면 또렷해요</Text>
          </View>
        </View>
        <View style={styles.shutterRow}>
          <Pressable
            onPress={handleShutter}
            disabled={capturing}
            style={({ pressed }) => [
              styles.shutterOuter,
              { borderColor: colors.frameGuide, opacity: pressed || capturing ? 0.7 : 1 },
            ]}
          >
            <View style={[styles.shutterInner, { backgroundColor: colors.primary }]} />
          </Pressable>
        </View>
      </View>

      <Text style={[styles.weekText, { color: colors.textMuted }]}>이번 주에 {weekCount}마리를 만났어요</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 12 },
  dateText: { fontFamily: fonts.body, fontSize: 12 },
  headerTitle: { fontFamily: fonts.display, fontSize: 22 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  avatarGlyph: { fontSize: 16 },
  viewfinderWrap: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#2E2A26',
  },
  camera: { flex: 1 },
  frameGuide: { ...StyleSheet.absoluteFillObject, margin: 34 },
  corner: { position: 'absolute', width: 74, height: 74 },
  cornerTL: { top: 76, left: 0, borderLeftWidth: 3, borderTopWidth: 3, borderTopLeftRadius: 26 },
  cornerTR: { top: 76, right: 0, borderRightWidth: 3, borderTopWidth: 3, borderTopRightRadius: 26 },
  cornerBL: { bottom: 116, left: 0, borderLeftWidth: 3, borderBottomWidth: 3, borderBottomLeftRadius: 26 },
  cornerBR: { bottom: 116, right: 0, borderRightWidth: 3, borderBottomWidth: 3, borderBottomRightRadius: 26 },
  hintRow: { position: 'absolute', left: 0, right: 0, top: 20, alignItems: 'center' },
  hintBubble: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  hintStar: { fontSize: 13 },
  hintText: { fontFamily: fonts.body, fontSize: 13 },
  shutterRow: { position: 'absolute', left: 0, right: 0, bottom: 30, alignItems: 'center' },
  shutterOuter: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 5,
    backgroundColor: '#FBF4EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 68, height: 68, borderRadius: 34 },
  weekText: { fontFamily: fonts.body, fontSize: 13, textAlign: 'center', paddingVertical: 14 },
  permissionWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 20 },
  permissionText: { fontFamily: fonts.body, fontSize: 15, textAlign: 'center' },
});
