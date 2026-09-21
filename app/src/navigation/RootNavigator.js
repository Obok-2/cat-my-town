import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import CatDetailScreen from '../screens/CatDetailScreen';
import RootTabs from './RootTabs';
import CaptureStack from './CaptureStack';

const Stack = createNativeStackNavigator();

// 목업 8페이지 NAVIGATION 블록 그대로:
// AuthStack > LoginScreen / RootTabs / CaptureStack(modal) / CatDetailScreen(push)
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
          <Stack.Screen name="Capture" component={CaptureStack} options={{ presentation: 'modal' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
