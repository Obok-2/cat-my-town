import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MatchResultScreen from '../screens/MatchResultScreen';
import NamingScreen from '../screens/NamingScreen';
import SightingEntryScreen from '../screens/SightingEntryScreen';

const Stack = createNativeStackNavigator();

// 목업 8페이지: CaptureStack (modal) — MatchResultScreen ├ NamingScreen.
export default function CaptureStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MatchResult" component={MatchResultScreen} />
      <Stack.Screen name="SightingEntry" component={SightingEntryScreen} />
      <Stack.Screen name="Naming" component={NamingScreen} />
    </Stack.Navigator>
  );
}
