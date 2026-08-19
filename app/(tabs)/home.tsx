import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Card } from '@/components/Card';
import { PrimaryButton } from '@/components/PrimaryButton';
import { getProfile } from '@/lib/storage';
import { colors, MoodKey, moodOptions, moodTriggers, spacing } from '@/lib/theme';

function greeting(): string {
  const h = new Date().getHours();
  if (h < 5) return 'こんばんは';
  if (h < 11) return 'おはようございます';
  if (h < 18) return 'こんにちは';
  return 'こんばんは';
}

export default function Home() {
  const [nickname, setNickname] = useState('');
  const [mood, setMood] = useState<MoodKey | null>(null);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [memo, setMemo] = useState('');

  useEffect(() => {
    getProfile().then((p) => setNickname(p?.nickname ?? ''));
  }, []);

  const toggleTrigger = (t: string) => {
    setTriggers((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  };

  const startChat = () => {
    router.push({
      pathname: '/chat',
      params: {
        mood: mood ?? '',
        triggers: triggers.join(','),
        memo,
      },
    });
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.greeting}>
        {greeting()}{nickname ? `、${nickname}さん` : ''}
      </Text>
      <Text style={styles.headline}>今日は、どんな気持ちでしたか？</Text>

      <Card style={{ marginTop: spacing.lg }}>
        <View style={styles.moodRow}>
          {moodOptions.map((m) => {
            const active = mood === m.key;
            return (
              <Pressable
                key={m.key}
                onPress={() => setMood(m.key)}
                style={[
                  styles.moodItem,
                  active && { backgroundColor: m.color + '33', borderColor: m.color },
                ]}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, active && { color: colors.text, fontWeight: '700' }]}>
                  {m.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionLabel}>きっかけは？（任意）</Text>
        <View style={styles.chipRow}>
          {moodTriggers.map((t) => {
            const active = triggers.includes(t);
            return (
              <Pressable
                key={t}
                onPress={() => toggleTrigger(t)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>

        <TextInput
          style={styles.memoInput}
          placeholder="ひとことメモを残す（あとで見返せます）"
          placeholderTextColor={colors.textMuted}
          value={memo}
          onChangeText={setMemo}
          multiline
        />

        <PrimaryButton
          label="Guchiboに話してみる"
          onPress={startChat}
          style={{ marginTop: spacing.md }}
        />
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  greeting: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  headline: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    lineHeight: 30,
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  moodItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
    marginHorizontal: 3,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  moodLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  sectionLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
  },
  chipActive: {
    backgroundColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  memoInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    padding: spacing.md,
    minHeight: 60,
    fontSize: 14,
    color: colors.text,
    textAlignVertical: 'top',
  },
});
