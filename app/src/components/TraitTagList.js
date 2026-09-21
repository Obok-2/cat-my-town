import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { useColors } from '../theme/ThemeContext';

const TAG_PALETTE_KEYS = ['tagPeach', 'tagMint', 'tagBlue'];

// editable=false: AI가 찾은 특징 등 읽기 전용 표시 (매칭결과 화면).
// editable=true: 이름 짓기 화면의 "특징 태그(수정 가능)" — 제거 X + "직접 입력" 추가.
export default function TraitTagList({ tags, editable = false, onRemove, onAdd }) {
  const colors = useColors();
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState('');

  function commitDraft() {
    const value = draft.trim();
    if (value) onAdd?.(value);
    setDraft('');
    setAdding(false);
  }

  return (
    <View style={styles.wrap}>
      {tags.map((tag, i) => {
        const paletteKey = TAG_PALETTE_KEYS[i % TAG_PALETTE_KEYS.length];
        return (
          <View key={tag} style={[styles.chip, { backgroundColor: colors[paletteKey] }]}>
            <Text style={[styles.chipText, { color: colors.text }]}>{tag}</Text>
            {editable && (
              <Pressable onPress={() => onRemove?.(tag)} hitSlop={8}>
                <Text style={[styles.remove, { color: colors.text }]}> ✕</Text>
              </Pressable>
            )}
          </View>
        );
      })}
      {editable &&
        (adding ? (
          <TextInput
            autoFocus
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={commitDraft}
            onBlur={commitDraft}
            placeholder="태그 입력"
            placeholderTextColor={colors.textMuted}
            style={[styles.chip, styles.chipInput, { color: colors.text, borderColor: colors.border }]}
          />
        ) : (
          <Pressable onPress={() => setAdding(true)} style={[styles.chip, styles.addChip, { borderColor: colors.border }]}>
            <Text style={[styles.chipText, { color: colors.textMuted }]}>+ 직접 입력</Text>
          </Pressable>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  chipText: { fontSize: 13, fontWeight: '600' },
  remove: { fontSize: 12, fontWeight: '700' },
  addChip: { borderWidth: 1, backgroundColor: 'transparent' },
  chipInput: { borderWidth: 1, minWidth: 100, paddingVertical: 6 },
});
