import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

// 목업: height 58 / radius 29 / bg #FFFFFF / border 1.5px #DFD2BF
export default function GhostButton({ label, onPress, disabled }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          borderColor: colors.borderStrong,
          backgroundColor: pressed ? colors.cardAlt : colors.card,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 58,
    borderRadius: 29,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: {
    fontFamily: fonts.body,
    fontSize: 17,
  },
});
