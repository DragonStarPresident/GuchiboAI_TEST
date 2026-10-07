import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Character } from '@/components/Brand';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { showAlert } from '@/lib/dialog';
import { addMoodEntry, getProfile } from '@/lib/storage';
import { colors, MoodKey, moodOptions, moodTriggers, spacing } from '@/lib/theme';

function greeting(): { text: string; icon: keyof typeof Ionicons.glyphMap } {
  const h = new Date().getHours();
  if (h < 5) return { text: 'こんばんは', icon: 'moon-outline' };
  if (h < 11) return { text: 'おはようございます', icon: 'sunny-outline' };
  if (h < 18) return { text: 'こんにちは', icon: 'partly-sunny-outline' };
  return { text: 'こんばんは', icon: 'moon-outline' };
}

export default function Home() {
  const insets = useSafeAreaInsets();
  const [nickname, setNickname] = useState('');
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [memo, setMemo] = useState('');
  const g = greeting();

  useFocusEffect(
    useCallback(() => {
      getProfile().then((p) => setNickname(p?.nickname ?? ''));
    }, []),
  );

  const toggleTrigger = (t: string) => {
    setTriggers((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  };

  const reset = () => {
    setMood(null);
    setTriggers([]);
    setMemo('');
  };

  const startChat = () => {
    router.push({
      pathname: '/chat',
      params: { mood: mood ?? '', triggers: triggers.join(','), memo: memo.trim() },
    });
    reset();
  };

  const recordOnly = async () => {
    if (!mood) {
      showAlert('気分を選んでください', '今日の気分をひとつ選ぶと、記録できます。');
      return;
    }
    await addMoodEntry({ mood, triggers, memo: memo.trim() || undefined });
    reset();
    showAlert('記録しました', '「きもち」タブから、これまでの気分の流れを見られます。');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.topRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.greetRow}>
            <Ionicons name={g.icon} size={14} color={colors.textSecondary} />
            <Text style={styles.greeting}>
              {g.text}
              {nickname ? `、${nickname}さん` : ''}
            </Text>
          </View>
          <Text style={styles.headline}>今日は、どんな気持ち{'\n'}でしたか？</Text>
        </View>
        <Character pose="wave" size={84} />
      </View>

      <Card style={{ marginTop: spacing.md }}>
        <View style={styles.moodRow}>
          {moodOptions.map((m) => {
            const active = mood === m.key;
            return (
              <Pressable key={m.key} onPress={() => setMood(active ? null : m.key)} style={styles.moodItem}>
                <View
                  style={[
                    styles.moodCircle,
                    { backgroundColor: m.color + '33' },
                    active && { backgroundColor: m.color, transform: [{ scale: 1.08 }] },
                  ]}
                >
                  <Text style={styles.moodEmoji}>{m.emoji}</Text>
                </View>
                <Text style={[styles.moodLabel, active && { color: colors.text, fontWeight: '800' }]}>{m.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Text style={styles.sectionLabel}>きっかけは？（任意）</Text>
      <View style={styles.chipRow}>
        {moodTriggers.map((t) => {
          const active = triggers.includes(t);
          return (
            <Pressable key={t} onPress={() => toggleTrigger(t)} style={[styles.chip, active && styles.chipActive]}>
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{t}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.memoBox}>
        <Ionicons name="pencil-outline" size={14} color={colors.textMuted} style={{ marginTop: 3 }} />
        <TextInput
          style={styles.memoInput}
          placeholder="ひとことメモを残す（あとで見返せます）"
          placeholderTextColor={colors.textMuted}
          value={memo}
          onChangeText={setMemo}
          multiline
          maxLength={200}
        />
      </View>

      <PrimaryButton
        label="Guchiboに話してみる"
        icon={<Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />}
        onPress={startChat}
        style={{ marginTop: spacing.lg }}
      />
      <Pressable onPress={recordOnly} style={styles.recordOnly}>
        <Text style={styles.recordOnlyText}>記録だけして閉じる</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  greetRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: spacing.xs },
  greeting: { fontSize: 13, color: colors.textSecondary },
  headline: { fontSize: 24, fontWeight: '800', color: colors.text, lineHeight: 34 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between' },
  moodItem: { flex: 1, alignItems: 'center' },
  moodCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  moodEmoji: { fontSize: 26 },
  moodLabel: { fontSize: 11, color: colors.textSecondary },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary, marginTop: spacing.lg, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: { backgroundColor: colors.surfaceAlt, borderColor: colors.primaryLight },
  chipText: { fontSize: 13, color: colors.textSecondary },
  chipTextActive: { color: colors.primary, fontWeight: '800' },
  memoBox: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  memoInput: { flex: 1, minHeight: 44, fontSize: 14, color: colors.text, textAlignVertical: 'top', padding: 0 },
  recordOnly: { alignItems: 'center', paddingVertical: spacing.md },
  recordOnlyText: { fontSize: 13, color: colors.textSecondary },
});
