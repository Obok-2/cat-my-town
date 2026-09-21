import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeContext';

export default function GhostButton({ label, onPress, disabled }) {
  const colors = useColors();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { borderColor: colors.border, backgroundColor: pressed ? colors.cardAlt : 'transparent', opacity: disabled ? 0.5 : 1 },
      ]}
    >
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
