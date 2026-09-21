import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColors } from '../theme/ThemeContext';
import { registerNewCat } from '../data/store';
import TraitTagList from '../components/TraitTagList';
import PrimaryButton from '../components/PrimaryButton';
import LevelUpModal from '../components/LevelUpModal';

const NAME_MAX = 12;

// 목업 5페이지 "이름 짓기": 이름 · 태그(수정 가능) · 첫 만남 메모 → 도감 등록.
export default function NamingScreen({ route, navigation }) {
  const { photoUri, suggestedTags = [] } = route.params;
  const colors = useColors();
  const [name, setName] = useState('');
  const [tags, setTags] = useState(suggestedTags);
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);
  const [levelUpInfo, setLevelUpInfo] = useState(null);

  function addTag(tag) {
    if (!tags.includes(tag)) setTags((prev) => [...prev, tag]);
  }
  function removeTag(tag) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  async function handleRegister() {
    const trimmed = name.trim();
    if (!trimmed || saving) return;
    setSaving(true);
    try {
      const { leveledUp, levelInfo } = await registerNewCat({ name: trimmed, tags, photoUri, memo });
      if (leveledUp) {
        setLevelUpInfo(levelInfo);
      } else {
        navigation.navigate('Tabs', { screen: 'Collection' });
      }
    } finally {
      setSaving(false);
    }
  }

  function handleLevelUpContinue() {
    setLevelUpInfo(null);
    navigation.navigate('Tabs', { screen: 'Collection' });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={[styles.back, { color: colors.text }]}>← 이름 짓기</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.photoRow}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, { backgroundColor: colors.cardAlt }]} />
          )}
        </View>

        <Text style={[styles.label, { color: colors.textMuted }]}>이름</Text>
        <View style={[styles.inputWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <TextInput
            value={name}
            onChangeText={(t) => setName(t.slice(0, NAME_MAX))}
            placeholder="나만의 이름이에요"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.text }]}
          />
        </View>
        <Text style={[styles.counter, { color: colors.textMuted }]}>
          {name.length} / {NAME_MAX}
        </Text>

        <Text style={[styles.label, { color: colors.textMuted, marginTop: 18 }]}>특징 태그 (수정 가능)</Text>
        <TraitTagList tags={tags} editable onAdd={addTag} onRemove={removeTag} />

        <Text style={[styles.label, { color: colors.textMuted, marginTop: 18 }]}>첫 만남 메모</Text>
        <View style={[styles.inputWrap, styles.memoWrap, { borderColor: colors.border, backgroundColor: colors.card }]}>
          <TextInput
            value={memo}
            onChangeText={setMemo}
            placeholder="골목 담벼락 뒤에서 졸고 있었다"
            placeholderTextColor={colors.textMuted}
            multiline
            style={[styles.input, styles.memoInput, { color: colors.text }]}
          />
        </View>

        <View style={{ height: 24 }} />
        <PrimaryButton label="도감에 등록하기" onPress={handleRegister} disabled={!name.trim()} loading={saving} />
      </ScrollView>

      <LevelUpModal visible={!!levelUpInfo} levelInfo={levelUpInfo} onContinue={handleLevelUpContinue} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  back: { fontSize: 15, fontWeight: '700' },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  photoRow: { alignItems: 'center', marginBottom: 20 },
  photo: { width: 100, height: 100, borderRadius: 50 },
  label: { fontSize: 12, marginBottom: 8 },
  inputWrap: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 14 },
  input: { fontSize: 15, paddingVertical: 12 },
  counter: { fontSize: 11, textAlign: 'right', marginTop: 4 },
  memoWrap: { paddingVertical: 4 },
  memoInput: { minHeight: 80, textAlignVertical: 'top' },
});
