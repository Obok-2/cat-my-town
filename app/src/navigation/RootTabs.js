import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../theme/ThemeContext';
import CollectionScreen from '../screens/CollectionScreen';
import CameraScreen from '../screens/CameraScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  Collection: 'grid-outline',
  Camera: 'camera-outline',
  Profile: 'person-outline',
};
const LABELS = { Collection: '도감', Camera: '촬영', Profile: '나' };

// 목업 4·6페이지 하단 탭: 도감 / 촬영(초기 화면) / 나.
export default function RootTabs() {
  const colors = useColors();
  return (
    <Tab.Navigator
      initialRouteName="Camera"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabel: LABELS[route.name],
        tabBarStyle: { backgroundColor: colors.card, borderTopColor: colors.border },
        tabBarIcon: ({ color, size }) => <Ionicons name={ICONS[route.name]} color={color} size={size} />,
      })}
    >
      <Tab.Screen name="Collection" component={CollectionScreen} />
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
