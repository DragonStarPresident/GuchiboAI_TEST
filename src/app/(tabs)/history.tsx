import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Character } from '@/components/Brand';
import { Card } from '@/components/Card';
import { MoodWeekChart } from '@/components/MoodWeekChart';
import {
  Conversation,
  formatRelativeDate,
  getConversations,
  getMoodEntries,
  hasUserMessage,
  MoodEntry,
} from '@/lib/storage';
import { colors, moodMeta, spacing } from '@/lib/theme';

export default function History() {
  const insets = useSafeAreaInsets();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      getConversations().then((list) => setConversations(list.filter(hasUserMessage)));
      getMoodEntries().then(setMoods);
    }, []),
  );

  const q = query.trim();
  const filtered = q
    ? conversations.filter((c) => c.title.includes(q) || c.messages.some((m) => m.content.includes(q)))
    : conversations;

  return (
    <FlatList
      style={styles.container}
      data={filtered}
      keyExtractor={(item) => item.id}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xl, gap: spacing.md }}
      ListHeaderComponent={
        <View style={{ gap: spacing.md }}>
          <View>
            <Text style={styles.header}>きろく</Text>
            <Text style={styles.sub}>これまで吐き出せた気持ち、ぜんぶ残っています。</Text>
          </View>
          <Card>
            <View style={styles.chartHead}>
              <Text style={styles.chartTitle}>この1週間のきもち</Text>
              <Pressable onPress={() => router.push('/feelings')} hitSlop={8}>
                <Text style={styles.chartLink}>くわしく</Text>
              </Pressable>
            </View>
            <MoodWeekChart entries={moods} />
          </Card>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={16} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="記録を検索"
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
            />
          </View>
        </View>
      }
      ListEmptyComponent={
        <Card style={{ alignItems: 'center' }}>
          <Character pose="pray" size={90} />
          <Text style={styles.emptyText}>
            {q ? '見つかりませんでした。' : 'まだ会話の記録がありません。\n下の「はなす」から話してみましょう。'}
          </Text>
        </Card>
      }
      renderItem={({ item }) => {
        const mood = moodMeta(item.mood);
        const lastUser = [...item.messages].reverse().find((m) => m.role === 'user');
        const turns = item.messages.filter((m) => m.role === 'user').length;
        return (
          <Pressable onPress={() => router.push(`/history/${item.id}`)}>
            <Card style={styles.item}>
              <View style={[styles.moodIcon, { backgroundColor: (mood?.color ?? colors.moodNormal) + '33' }]}>
                <Text style={{ fontSize: 18 }}>{mood?.emoji ?? '💬'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.cardTop}>
                  <Text style={[styles.moodLabel, { color: mood ? mood.color : colors.textMuted }]}>
                    {mood?.label ?? '気分の記録なし'}
                  </Text>
                  <Text style={styles.date}>{formatRelativeDate(item.createdAt)}</Text>
                </View>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                {lastUser && (
                  <Text style={styles.snippet} numberOfLines={1}>
                    {lastUser.content}
                  </Text>
                )}
                <View style={styles.countRow}>
                  <Ionicons name="chatbubble-outline" size={11} color={colors.textMuted} />
                  <Text style={styles.count}>{turns} 往復の会話</Text>
                </View>
              </View>
            </Card>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { fontSize: 26, fontWeight: '800', color: colors.text },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  chartHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  chartTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  chartLink: { fontSize: 12, fontWeight: '700', color: colors.primary },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: colors.text },
  emptyText: { color: colors.textSecondary, textAlign: 'center', lineHeight: 20, marginTop: spacing.sm },
  item: { flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  moodIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  moodLabel: { fontSize: 11, fontWeight: '800' },
  date: { fontSize: 11, color: colors.textMuted },
  title: { fontSize: 15, fontWeight: '800', color: colors.text, marginBottom: 2 },
  snippet: { fontSize: 12, color: colors.textSecondary, marginBottom: 6 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  count: { fontSize: 11, color: colors.textMuted },
});
