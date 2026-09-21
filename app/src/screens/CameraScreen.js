import React, { useCallback, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useColors } from '../theme/ThemeContext';
import { getSightings } from '../data/store';
import PrimaryButton from '../components/PrimaryButton';

function formatToday() {
  const d = new Date();
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} · ${days[d.getDay()]}요 산책`;
}

// 목업 4페이지 "홈(카메라)": 앱 실행 시 즉시 카메라, 프레임 가이드 + 단일 셔터.
export default function CameraScreen({ navigation }) {
  const colors = useColors();
  const [permission, requestPermission] = useCameraPermissions();
  const [weekCount, setWeekCount] = useState(0);
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef(null);

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

  if (!permission) {
    return <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
        <View style={styles.permissionWrap}>
          <Text style={[styles.permissionText, { color: colors.text }]}>
            길고양이를 촬영하려면 카메라 권한이 필요해요
          </Text>
          <PrimaryButton label="카메라 권한 허용하기" onPress={requestPermission} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: '#15130F' }]}>
      <SafeAreaView style={styles.headerSafe}>
        <Text style={styles.dateText}>{formatToday()}</Text>
        <Text style={styles.headerTitle}>오늘은 누굴 만날까요?</Text>
        <View style={styles.hintBubble}>
          <Text style={styles.hintText}>+ 얼굴이 프레임 안에 들어오면 또렷해요</Text>
        </View>
      </SafeAreaView>

      <View style={styles.viewfinderWrap}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" />
        <View pointerEvents="none" style={styles.frameGuide}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
      </View>

      <SafeAreaView style={styles.footerSafe}>
        <Text style={styles.weekText}>이번 주에 {weekCount}마리를 만났어요</Text>
        <Pressable
          onPress={handleShutter}
          disabled={capturing}
          style={({ pressed }) => [
            styles.shutterOuter,
            { borderColor: colors.primary, opacity: pressed || capturing ? 0.7 : 1 },
          ]}
        >
          <View style={[styles.shutterInner, { backgroundColor: colors.primary }]} />
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { flex: 1 },
  headerSafe: { paddingHorizontal: 20, paddingTop: 8 },
  dateText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: '800', marginTop: 4 },
  hintBubble: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  hintText: { color: '#FFF', fontSize: 12 },
  viewfinderWrap: {
    flex: 1,
    marginHorizontal: 24,
    marginVertical: 16,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: { flex: 1 },
  frameGuide: { ...StyleSheet.absoluteFillObject, margin: 28 },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: 'rgba(255,255,255,0.8)' },
  cornerTL: { top: 0, left: 0, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: 12 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: 12 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: 12 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: 12 },
  footerSafe: { alignItems: 'center', paddingBottom: 12 },
  weekText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginBottom: 14 },
  shutterOuter: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 58, height: 58, borderRadius: 29 },
  permissionWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 20 },
  permissionText: { fontSize: 15, textAlign: 'center' },
});
