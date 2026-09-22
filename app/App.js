import React, { useCallback, useEffect, useState } from 'react';
import { View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, useNavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts, Jua_400Regular } from '@expo-google-fonts/jua';
import { GowunDodum_400Regular } from '@expo-google-fonts/gowun-dodum';
import { IBMPlexMono_400Regular, IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono';
import { Ionicons } from '@expo/vector-icons';
import { ThemeProvider, useColors } from './src/theme/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import SplashScreenView from './src/screens/SplashScreen';
import RootNavigator from './src/navigation/RootNavigator';
import { linking, formatDocumentTitle } from './src/navigation/linking';

SplashScreen.preventAutoHideAsync().catch(() => {});

// 앱 시작 시점부터 잰다(폰트 로딩 중에는 네이티브 스플래시가 이미 떠 있음).
const SPLASH_MIN_MS = 1600;

function Shell() {
  const colors = useColors();
  const { ready } = useAuth();
  const [splashElapsed, setSplashElapsed] = useState(false);
  const navigationRef = useNavigationContainerRef();
  const [fontsLoaded] = useFonts({
    ...Ionicons.font,
    Jua_400Regular,
    GowunDodum_400Regular,
    IBMPlexMono_400Regular,
    IBMPlexMono_500Medium,
  });

  useEffect(() => {
    const timer = setTimeout(() => setSplashElapsed(true), SPLASH_MIN_MS);
    return () => clearTimeout(timer);
  }, []);

  const onLayout = useCallback(() => {
    if (fontsLoaded) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  const syncTitle = () => {
    if (Platform.OS === 'web') document.title = formatDocumentTitle(navigationRef.getCurrentRoute());
  };

  const showSplash = !splashElapsed || !ready;

  return (
    <View style={{ flex: 1 }} onLayout={onLayout}>
      {showSplash ? (
        <SplashScreenView />
      ) : (
        <NavigationContainer
          ref={navigationRef}
          linking={linking}
          documentTitle={{ enabled: false }}
          onReady={syncTitle}
          onStateChange={syncTitle}
        >
          <RootNavigator />
        </NavigationContainer>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <Shell />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
