import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

// 목업: height 58 / radius 29 / bg #E08B4B / box-shadow 0 3px 0 #C0703A (엠보싱 버튼)
export default function PrimaryButton({ label, onPress, disabled, loading }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: colors.primary,
          shadowColor: colors.primaryShadow,
          opacity: disabled ? 0.5 : 1,
          transform: pressed ? [{ translateY: 2 }] : [{ translateY: 0 }],
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} />
      ) : (
        <Text style={[styles.label, { color: colors.onPrimary }]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 17,
  },
});
