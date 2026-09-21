import React, { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { paletteFor } from './colors';

// 목업에 다크모드 전환 스위치가 없어(6·7페이지) 시스템 설정을 그대로 따른다.
const ThemeContext = createContext(paletteFor('light'));

export function ThemeProvider({ children }) {
  const scheme = useColorScheme();
  const colors = useMemo(() => paletteFor(scheme), [scheme]);
  return <ThemeContext.Provider value={colors}>{children}</ThemeContext.Provider>;
}

export function useColors() {
  return useContext(ThemeContext);
}
