import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import CollectionScreen from '../screens/CollectionScreen';
import CameraScreen from '../screens/CameraScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  Collection: ['grid-outline', 'grid'],
  Camera: ['radio-button-off-outline', 'radio-button-on'],
  Profile: ['person-outline', 'person'],
};
const LABELS = { Collection: '도감', Camera: '촬영', Profile: '나' };

// 목업 a2·a6 하단 탭: 도감 / 촬영(초기 화면) / 나.
export default function RootTabs() {
  const colors = useColors();
  return (
    <Tab.Navigator
      initialRouteName="Camera"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabel: LABELS[route.name],
        tabBarLabelStyle: { fontFamily: fonts.body, fontSize: 12 },
        tabBarStyle: {
          backgroundColor: colors.tabBarBg,
          borderTopColor: colors.tabBarBorder,
          borderTopWidth: 1.5,
          height: 78,
          paddingTop: 10,
        },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons name={ICONS[route.name][focused ? 1 : 0]} color={color} size={size} />
        ),
      })}
    >
      <Tab.Screen name="Collection" component={CollectionScreen} />
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
