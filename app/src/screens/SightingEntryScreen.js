import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { StackActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { registerCatSighting } from '../api/catApi';
import PrimaryButton from '../components/PrimaryButton';
import TraitTagList from '../components/TraitTagList';
import { fonts } from '../theme/fonts';
import { useColors } from '../theme/ThemeContext';

export default function SightingEntryScreen({ route, navigation }) {
  const { photoUri, analysisId, cat, latitude = null, longitude = null } = route.params;
  const colors = useColors();
  const [tags, setTags] = useState([]);
  const [memo, setMemo] = useState('');
  const [saving, setSaving] = useState(false);

  function addTag(tag) {
    if (tags.length < 5 && !tags.includes(tag)) setTags((previous) => [...previous, tag]);
  }

  function removeTag(tag) {
    setTags((previous) => previous.filter((item) => item !== tag));
  }

  async function handleSave() {
    if (saving) return;
    setSaving(true);
    try {
      const response = await registerCatSighting(photoUri, {
        analysisId,
        catId: cat.id,
        tags,
        memo: memo.trim(),
        latitude,
        longitude,
      });
      const sighting = response.data.data;
      navigation.getParent()?.dispatch(
        StackActions.replace('Completion', {
          type: 'SIGHTING',
          catName: sighting.name,
        })
      );
    } catch (error) {
      Alert.alert('기록하지 못했어요', error.response?.data?.message || error.message || '잠시 후 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.bg }]}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.headerRow} accessibilityLabel="뒤로 가기">
          <Ionicons name="arrow-back" size={22} color={colors.textSubtle} />
          <Text style={[styles.headerTitle, { color: colors.text }]}>목격 기록 작성</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.photoRow}>
          <Image source={{ uri: photoUri }} style={styles.photo} />
          <View style={styles.catInfo}>
            <Text style={[styles.catName, { color: colors.text }]}>{cat.name}</Text>
            <Text style={[styles.location, { color: colors.textMuted }]}>
              {latitude !== null && longitude !== null ? '촬영 위치가 함께 기록돼요' : '위치 정보 없이 기록돼요'}
            </Text>
          </View>
        </View>

        <Text style={[styles.label, { color: colors.textMuted }]}>오늘 본 특징 ({tags.length}/5)</Text>
        <TraitTagList tags={tags} editable maxTags={5} onAdd={addTag} onRemove={removeTag} />

        <Text style={[styles.label, styles.memoLabel, { color: colors.textMuted }]}>목격 메모</Text>
        <View style={[styles.inputWrap, { borderColor: colors.inputBorder, backgroundColor: colors.card }]}>
          <TextInput
            value={memo}
            onChangeText={setMemo}
            maxLength={200}
            placeholder="오늘 어디서 무엇을 하고 있었나요?"
            placeholderTextColor={colors.textMuted}
            multiline
            style={[styles.memoInput, { color: colors.text }]}
          />
        </View>
        <Text style={[styles.counter, { color: colors.textMuted }]}>{memo.length} / 200</Text>

        <PrimaryButton label="목격 기록 저장하기" onPress={handleSave} loading={saving} />
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
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 18, marginTop: 22, marginBottom: 28 },
  photo: { width: 104, height: 104, borderRadius: 24 },
  catInfo: { flex: 1, gap: 8 },
  catName: { fontFamily: fonts.display, fontSize: 24 },
  location: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  label: { fontFamily: fonts.body, fontSize: 14, marginBottom: 10 },
  memoLabel: { marginTop: 24 },
  inputWrap: { borderWidth: 1.5, borderRadius: 18, paddingHorizontal: 18, paddingVertical: 4 },
  memoInput: { minHeight: 110, fontFamily: fonts.body, fontSize: 14, paddingVertical: 14, textAlignVertical: 'top' },
  counter: { fontFamily: fonts.body, fontSize: 12, textAlign: 'right', marginTop: 7, marginBottom: 24 },
});
