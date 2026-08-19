import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Card } from '@/components/Card';
import { Conversation, getConversations } from '@/lib/storage';
import { colors, moodOptions, spacing } from '@/lib/theme';

function moodMeta(key: string | null) {
  return moodOptions.find((m) => m.key === key);
}

export default function History() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      getConversations().then(setConversations);
    }, []),
  );

  const filtered = conversations.filter(
    (c) =>
      c.title.includes(query) ||
      c.messages.some((m) => m.content.includes(query)),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>きろく</Text>
      <Text style={styles.sub}>これまで吐き出せた気持ち、ぜんぶ残っています。</Text>

      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="記録を検索"
          placeholderTextColor={colors.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: spacing.lg, paddingTop: 0, gap: spacing.md }}
        ListEmptyComponent={
          <Card>
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
              まだ記録がありません。ホームから今日の気持ちを話してみましょう。
            </Text>
          </Card>
        }
        renderItem={({ item }) => {
          const mood = moodMeta(item.mood);
          const lastUser = [...item.messages].reverse().find((m) => m.role === 'user');
          return (
            <Pressable onPress={() => router.push(`/history/${item.id}`)}>
              <Card>
                <View style={styles.cardTop}>
                  <View style={[styles.moodBadge, { backgroundColor: (mood?.color ?? colors.moodNormal) + '33' }]}>
                    <Text style={[styles.moodBadgeText, { color: mood?.color ?? colors.textSecondary }]}>
                      {mood?.emoji ?? '💬'} {mood?.label ?? '記録'}
                    </Text>
                  </View>
                  <Text style={styles.date}>
                    {new Date(item.createdAt).toLocaleDateString('ja-JP', {
                      month: 'numeric',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                {lastUser && (
                  <Text style={styles.snippet} numberOfLines={1}>
                    {lastUser.content}
                  </Text>
                )}
                <Text style={styles.count}>{item.messages.length} 往復の会話</Text>
              </Card>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.xl },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: spacing.lg,
  },
  sub: {
    fontSize: 13,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  searchBox: { paddingHorizontal: spacing.lg, marginBottom: spacing.md },
  searchInput: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  moodBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 999,
  },
  moodBadgeText: { fontSize: 12, fontWeight: '700' },
  date: { fontSize: 12, color: colors.textMuted },
  title: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 4 },
  snippet: { fontSize: 13, color: colors.textSecondary, marginBottom: 6 },
  count: { fontSize: 12, color: colors.textMuted },
});
