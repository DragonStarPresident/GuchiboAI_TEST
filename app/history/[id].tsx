import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChatBubble } from '@/components/ChatBubble';
import { Conversation, getConversation } from '@/lib/storage';
import { colors, moodOptions, spacing } from '@/lib/theme';

export default function HistoryDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [conversation, setConversation] = useState<Conversation | null | undefined>(undefined);

  useEffect(() => {
    if (id) getConversation(id).then(setConversation);
  }, [id]);

  const mood = moodOptions.find((m) => m.key === conversation?.mood);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>{conversation?.title ?? '記録'}</Text>
          {conversation && (
            <Text style={styles.headerMeta}>
              {mood ? `${mood.emoji} ${mood.label}・` : ''}
              {new Date(conversation.createdAt).toLocaleString('ja-JP')}
            </Text>
          )}
        </View>
      </View>

      {conversation === undefined ? null : conversation === null ? (
        <Text style={styles.empty}>記録が見つかりませんでした。</Text>
      ) : (
        <FlatList
          data={conversation.messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={{ paddingVertical: spacing.lg }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingTop: 56,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  headerMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  empty: { textAlign: 'center', marginTop: spacing.xxl, color: colors.textSecondary },
});
