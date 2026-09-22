import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import CatDetailScreen from '../screens/CatDetailScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LevelUpScreen from '../screens/LevelUpScreen';
import RootTabs from './RootTabs';
import CaptureStack from './CaptureStack';

const Stack = createNativeStackNavigator();

// 로그인 전: Auth / 로그인 후: Tabs(도감·촬영·레벨) · CatDetail · Profile · LevelUp 은 일반 화면 이동,
// 촬영 후 Capture(MatchResult → Naming)만 팝업(modal)이라 주소가 바뀌지 않는다.
// ProfileScreen: 목업에는 없지만 로그아웃·개발용 도구가 갈 곳이 필요해 카메라 화면 우상단 아바타에 연결했다.
export default function RootNavigator() {
  const { user, ready } = useAuth();
  if (!ready) return null;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user.loggedIn ? (
        <Stack.Screen name="Auth" component={LoginScreen} />
      ) : (
        <>
          <Stack.Screen name="Tabs" component={RootTabs} />
          <Stack.Screen name="CatDetail" component={CatDetailScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Capture" component={CaptureStack} options={{ presentation: 'modal' }} />
          <Stack.Screen name="LevelUp" component={LevelUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
