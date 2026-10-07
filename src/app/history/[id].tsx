import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChatBubble } from '@/components/ChatBubble';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Conversation, getConversation } from '@/lib/storage';
import { colors, moodMeta, spacing } from '@/lib/theme';

export default function HistoryDetail() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [conversation, setConversation] = useState<Conversation | null | undefined>(undefined);

  useEffect(() => {
    if (id) getConversation(id).then((c) => setConversation(c ?? null));
  }, [id]);

  const mood = moodMeta(conversation?.mood);
  const meta = conversation
    ? `${mood ? `${mood.emoji} ${mood.label}・` : ''}${new Date(conversation.createdAt).toLocaleString('ja-JP', {
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`
    : undefined;

  return (
    <View style={styles.container}>
      <ScreenHeader title={conversation?.title ?? '記録'} subtitle={meta} />
      {conversation === undefined ? null : conversation === null ? (
        <Text style={styles.empty}>記録が見つかりませんでした。</Text>
      ) : (
        <FlatList
          data={conversation.messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={{ paddingTop: spacing.lg, paddingBottom: insets.bottom + spacing.lg }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  empty: { textAlign: 'center', marginTop: spacing.xxl, color: colors.textSecondary },
});
