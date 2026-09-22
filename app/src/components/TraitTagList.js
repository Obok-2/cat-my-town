import React, { useState } from 'react';
import { View, Text, Pressable, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';

// 목업 태그 팔레트는 살구(peach)·민트 2색이 번갈아 쓰인다.
const TAG_PALETTE = ['peach', 'mint'];

// editable=false: AI가 찾은 특징 등 읽기 전용 표시.
// editable=true: 이름 짓기 화면 — 닫기·추가 아이콘이 있는 편집용 칩.
export default function TraitTagList({ tags, editable = false, onRemove, onAdd, centered = false, maxTags = 5 }) {
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
    <View style={[styles.wrap, centered && styles.wrapCentered]}>
      {tags.map((tag, i) => {
        const kind = TAG_PALETTE[i % TAG_PALETTE.length];
        const bg = kind === 'peach' ? colors.tagPeachBg : colors.tagMintBg;
        const fg = kind === 'peach' ? colors.tagPeachText : colors.tagMintText;
        return (
          <View key={tag} style={[styles.chip, styles.tagChip, { backgroundColor: bg }]}>
            <Text style={[styles.chipText, { color: fg }]}>{tag}</Text>
            {editable && (
              <Pressable onPress={() => onRemove?.(tag)} hitSlop={6} accessibilityLabel={`${tag} 태그 삭제`}>
                <Ionicons name="close" size={15} color={fg} />
              </Pressable>
            )}
          </View>
        );
      })}
      {editable && tags.length < maxTags &&
        (adding ? (
          <TextInput
            autoFocus
            value={draft}
            onChangeText={setDraft}
            maxLength={30}
            onSubmitEditing={commitDraft}
            onBlur={commitDraft}
            placeholder="태그 입력"
            placeholderTextColor={colors.textMuted}
            style={[
              styles.chip,
              styles.chipInput,
              { color: colors.text, borderColor: colors.borderStrong, backgroundColor: colors.card },
            ]}
          />
        ) : (
          <Pressable
            onPress={() => setAdding(true)}
            style={[styles.chip, styles.addChip, { borderColor: colors.borderStrong, backgroundColor: colors.card }]}
          >
            <Ionicons name="add" size={16} color={colors.textMuted} />
            <Text style={[styles.chipText, { color: colors.textMuted }]}>직접 입력</Text>
          </Pressable>
        ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  wrapCentered: { justifyContent: 'center' },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
  },
  chipText: { fontFamily: fonts.body, fontSize: 14 },
  tagChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  addChip: { flexDirection: 'row', alignItems: 'center', gap: 2, borderWidth: 1.5, borderStyle: 'dashed' },
  chipInput: { borderWidth: 1.5, minWidth: 100, paddingVertical: 7 },
});
