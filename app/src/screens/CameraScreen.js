import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useIsFocused } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { getCameraWeekCount } from '../api/cameraApi';
import CatGuide from '../components/CatGuide';
import PrimaryButton from '../components/PrimaryButton';
import { prepareCameraPhoto } from '../utils/prepareCameraPhoto';

function formatToday() {
  const d = new Date();
  const hour = d.getHours();
  const part = hour < 11 ? '아침' : hour < 17 ? '낮' : '저녁';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} · ${part} 산책`;
}

// expo-camera 의 zoom 은 0~1 이고 기기 최대 배율에 대한 비율이다(Android 는 선형, iOS 는 지수).
// 그래서 배율은 기기마다 다르며 아래 값은 일반적인 폰에서 대략 1x / 2x / 3x 가 되도록 잡은 값이다.
const ZOOM_STEPS = [
  { label: '1x', zoom: 0 },
  { label: '2x', zoom: 0.25 },
  { label: '3x', zoom: 0.4 },
];

// 목업 a2 "홈 (카메라)": 앱 실행 시 즉시 카메라 + 단일 셔터.
// 목업에 없는 것을 추가했다: 손전등 토글(왼쪽 위)과 확대 버튼(셔터 위)은 웹 카메라가 대부분 지원하지 않아 앱에서만 보이고,
// 네 모서리 프레임 대신 앉은 고양이 안내선(얼굴 정면 + 몸통, CatGuide)을 얹어 매번 비슷한 각도로 찍도록 안내한다(매칭 정확도 개선 ②).
export default function CameraScreen({ navigation }) {
  const colors = useColors();
  // 웹은 getUserMedia 호출 시 브라우저가 자체 권한 팝업을 띄우므로 우리 쪽에서는 묻지 않는다.
  const [permission, requestPermission] = useCameraPermissions();
  const [weekCount, setWeekCount] = useState(undefined);
  const [capturing, setCapturing] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [zoom, setZoom] = useState(0);
  const isFocused = useIsFocused();
  const cameraRef = useRef(null);

  // 촬영 탭(로그인 후 첫 화면)이 열리면 버튼 없이 카메라 → 위치 순서로 권한을 묻는다.
  // 안드로이드는 권한 팝업을 한 번에 하나만 띄울 수 있어 순서대로 요청한다.
  // requestPermission은 expo 권한 훅이 고정해 주는 함수라 탭이 처음 열릴 때 1회만 돈다.
  useEffect(() => {
    if (Platform.OS === 'web') return;

    async function requestOnOpen() {
      const camera = await requestPermission();
      if (camera.granted) await Location.requestForegroundPermissionsAsync();
    }

    requestOnOpen();
  }, [requestPermission]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadWeekCount() {
        try {
          const response = await getCameraWeekCount();
          if (active) setWeekCount(response.data.data.catCount ?? 0);
        } catch {
          if (active) setWeekCount(null);
        }
      }

      loadWeekCount();
      return () => {
        active = false;
      };
    }, [])
  );

  // 목격 위치는 고양이 상세 지도의 마커가 되므로 앱에서는 반드시 기록한다.
  // 위치 권한이 없거나 위치를 못 잡으면 촬영 흐름을 진행하지 않는다(웹은 위치 없이 진행).
  async function handleShutter() {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      if (Platform.OS !== 'web' && !(await ensureLocationPermission())) return;

      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      const [preparedPhoto, location] = await Promise.all([prepareCameraPhoto(photo), getCaptureLocation()]);
      if (Platform.OS !== 'web' && !location) {
        Alert.alert('위치를 가져오지 못했어요', '위치 서비스(GPS)를 켜고 다시 찍어 주세요.');
        return;
      }
      navigation.navigate('Capture', {
        screen: 'MatchResult',
        params: {
          photoUri: preparedPhoto.uri,
          latitude: location?.coords.latitude ?? null,
          longitude: location?.coords.longitude ?? null,
        },
      });
    } catch (error) {
      Alert.alert('사진 처리 실패', '사진을 준비하지 못했어요. 다시 촬영해주세요.');
    } finally {
      setCapturing(false);
    }
  }

  // 셔터를 누를 때마다 위치 권한을 확인한다. 이미 허용돼 있으면 팝업 없이 바로 통과하고,
  // 탭이 열릴 때 거부했더라도 다시 물을 수 있으면 여기서 한 번 더 묻는다.
  async function ensureLocationPermission() {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (permission.granted) return true;

    const buttons = permission.canAskAgain
      ? [{ text: '확인' }]
      : [
          { text: '취소', style: 'cancel' },
          { text: '설정 열기', onPress: () => Linking.openSettings() },
        ];
    Alert.alert('위치 권한이 필요해요', '고양이를 만난 위치를 지도에 남기려면 위치 권한이 필요해요.', buttons);
    return false;
  }

  async function getCaptureLocation() {
    if (Platform.OS === 'web') return null;
    try {
      return await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
    } catch {
      return null;
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
            {deniedPermanently ? (
              <PrimaryButton label="설정 열기" onPress={() => Linking.openSettings()} />
            ) : (
              <PrimaryButton label="카메라 권한 허용하기" onPress={requestPermission} />
            )}
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
        <Pressable
          onPress={() => navigation.navigate('Profile')}
          accessibilityLabel="내 정보"
          style={[styles.avatar, { backgroundColor: colors.tagPeachBg }]}
        >
          <Ionicons name="person-outline" size={19} color={colors.tagPeachText} />
        </Pressable>
      </View>

      <View style={styles.viewfinderWrap}>
        <CameraView ref={cameraRef} style={styles.camera} facing="back" zoom={zoom} enableTorch={torchOn && isFocused} />
        <CatGuide />
        <View pointerEvents="none" style={styles.hintRow}>
          <View style={[styles.hintBubble, { backgroundColor: colors.hintBubbleBg }]}>
            <Ionicons name="sparkles" size={15} color={colors.accent} />
            <Text style={[styles.hintText, { color: colors.hintBubbleText }]}>고양이 전체가 선 안에, 얼굴은 정면으로 맞춰 주세요</Text>
          </View>
        </View>
        {Platform.OS !== 'web' && (
          <>
            <Pressable
              onPress={() => setTorchOn(!torchOn)}
              accessibilityLabel={torchOn ? '손전등 끄기' : '손전등 켜기'}
              style={[styles.torchButton, { backgroundColor: torchOn ? colors.primary : colors.hintBubbleBg }]}
            >
              <Ionicons
                name={torchOn ? 'flashlight' : 'flashlight-outline'}
                size={20}
                color={torchOn ? colors.onPrimary : colors.hintBubbleText}
              />
            </Pressable>
            <View pointerEvents="box-none" style={styles.zoomRow}>
              {ZOOM_STEPS.map((step) => {
                const selected = step.zoom === zoom;
                return (
                  <Pressable
                    key={step.label}
                    onPress={() => setZoom(step.zoom)}
                    accessibilityLabel={`확대 ${step.label}`}
                    style={[styles.zoomChip, { backgroundColor: selected ? colors.primary : colors.hintBubbleBg }]}
                  >
                    <Text style={[styles.zoomChipText, { color: selected ? colors.onPrimary : colors.hintBubbleText }]}>
                      {step.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </>
        )}
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

      <Text style={[styles.weekText, { color: colors.textMuted }]}>
        {weekCount === undefined
          ? '이번 주 기록을 확인하고 있어요'
          : weekCount === null
            ? '이번 주 기록을 불러오지 못했어요'
            : `이번 주에 ${weekCount}마리를 만났어요`}
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 12 },
  dateText: { fontFamily: fonts.body, fontSize: 12 },
  headerTitle: { fontFamily: fonts.display, fontSize: 22 },
  avatar: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  viewfinderWrap: {
    flex: 1,
    marginHorizontal: 16,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: '#2E2A26',
  },
  camera: { flex: 1 },
  hintRow: { position: 'absolute', left: 0, right: 0, top: 20, alignItems: 'center' },
  hintBubble: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  hintText: { fontFamily: fonts.body, fontSize: 13 },
  torchButton: { position: 'absolute', left: 16, top: 64, width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  zoomRow: { position: 'absolute', left: 0, right: 0, bottom: 160, flexDirection: 'row', justifyContent: 'center', gap: 8 },
  zoomChip: { minWidth: 48, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16, alignItems: 'center' },
  zoomChipText: { fontFamily: fonts.body, fontSize: 13 },
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
