import React, { useState } from 'react';
import { Alert, View, Text, TextInput, Image, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StackActions } from '@react-navigation/native';
import { useColors } from '../theme/ThemeContext';
import { fonts } from '../theme/fonts';
import { registerNewCat } from '../api/catApi';
import { computeLevel } from '../data/levels';
import TraitTagList from '../components/TraitTagList';
import PrimaryButton from '../components/PrimaryButton';
import PlaceholderArt from '../components/PlaceholderArt';

const NAME_MAX = 12;

// 목업 a5 "이름 짓기": 이름 · 태그(수정 가능) · 첫 만남 메모 → 도감 등록.
export default function NamingScreen({ route, navigation }) {
  const { photoUri, suggestedTags = [] } = route.params;
  const colors = useColors();
  const [name, setName] = useState('');
  const [tags, setTags] = useState(suggestedTags);
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);

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
      const contents = {
        name: trimmed,
        tags,
        memo: memo.trim(),
      };
      const response = await registerNewCat(photoUri, contents);
      const registration = response.data.data;
      const rootNavigation = navigation.getParent();

      if (registration.leveledUp) {
        rootNavigation?.dispatch(
          StackActions.replace('LevelUp', {
            levelInfo: computeLevel(registration.catCount),
          })
        );
      } else {
        rootNavigation?.dispatch(StackActions.popTo('Tabs', { screen: 'Collection' }));
      }
    } catch (error) {
      Alert.alert('등록하지 못했어요', error.response?.data?.message || error.message || '잠시 후 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={12}
          style={styles.headerRow}
          accessibilityLabel="뒤로 가기"
        >
          <Ionicons name="arrow-back" size={22} color={colors.textSubtle} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>이름 짓기</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.photoRow}>
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.photo} />
          ) : (
            <PlaceholderArt label="대표 사진" round style={styles.photo} />
          )}
        </View>

        <Text style={[styles.label, { color: colors.textMuted }]}>이름</Text>
        <View style={[styles.inputWrap, { borderColor: colors.primary, backgroundColor: colors.card }]}>
          <TextInput
            value={name}
            onChangeText={(t) => setName(t.slice(0, NAME_MAX))}
            placeholder="나만의 이름이에요"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.text }]}
          />
        </View>
        <View style={styles.counterRow}>
          <Text style={[styles.counter, { color: colors.textMuted }]}>나만 보는 이름이에요</Text>
          <Text style={[styles.counter, { color: colors.textMuted }]}>
            {name.length} / {NAME_MAX}
          </Text>
        </View>

        <Text style={[styles.label, { color: colors.textMuted, marginTop: 18 }]}>특징 태그 (수정 가능)</Text>
        <TraitTagList tags={tags} editable onAdd={addTag} onRemove={removeTag} />

        <Text style={[styles.label, { color: colors.textMuted, marginTop: 18 }]}>첫 만남 메모</Text>
        <View style={[styles.inputWrap, styles.memoWrap, { borderColor: colors.inputBorder, backgroundColor: colors.card }]}>
          <TextInput
            value={memo}
            onChangeText={setMemo}
            placeholder="골목 담벼락 위에서 졸고 있었다"
            placeholderTextColor="#B0A091"
            multiline
            style={[styles.input, styles.memoInput, { color: colors.text }]}
          />
        </View>

        <View style={{ height: 24 }} />
        <PrimaryButton label="도감에 등록하기" onPress={handleRegister} disabled={!name.trim()} loading={saving} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerTitle: { fontFamily: fonts.display, fontSize: 20 },
  content: { paddingHorizontal: 30, paddingBottom: 40 },
  photoRow: { alignItems: 'center', marginTop: 10, marginBottom: 22 },
  photo: { width: 150, height: 150, borderRadius: 75 },
  label: { fontFamily: fonts.body, fontSize: 14, marginBottom: 10 },
  inputWrap: { borderWidth: 1.5, borderRadius: 18, paddingHorizontal: 18 },
  input: { fontFamily: fonts.body, fontSize: 19, paddingVertical: 14 },
  counterRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  counter: { fontFamily: fonts.body, fontSize: 12 },
  memoWrap: { paddingVertical: 4 },
  memoInput: { minHeight: 72, fontSize: 14, textAlignVertical: 'top' },
});
