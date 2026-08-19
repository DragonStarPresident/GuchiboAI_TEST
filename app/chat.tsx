import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ChatBubble } from '@/components/ChatBubble';
import { containsCrisisKeyword } from '@/lib/crisis';
import {
  ChatMessage,
  Conversation,
  FREE_MONTHLY_LIMIT,
  genId,
  getProfile,
  getUsage,
  incrementUsage,
  saveConversation,
} from '@/lib/storage';
import { colors, moodOptions, MoodKey, spacing } from '@/lib/theme';

function openingLine(moodKey: string | null, memo: string | null): string {
  const mood = moodOptions.find((m) => m.key === moodKey);
  const h = new Date().getHours();
  const greet = h < 11 ? 'おはようございます。' : h < 18 ? 'こんにちは。' : '今日もおつかれさまです。';
  if (memo) {
    return `${greet}「${memo}」なんですね。もう少し、聞かせてもらえますか？`;
  }
  if (mood && mood.key !== 'calm') {
    return `${greet}今日は${mood.label}気持ちだったんですね。今、いちばん気にかかっていることはなんですか？`;
  }
  return `${greet}今日はどんな一日でしたか？よかったら聞かせてください。`;
}

export default function Chat() {
  const params = useLocalSearchParams<{ mood?: string; triggers?: string; memo?: string }>();
  const mood = (params.mood || null) as MoodKey | null;
  const triggers = params.triggers ? params.triggers.split(',').filter(Boolean) : [];
  const memo = params.memo || '';

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const now = new Date().toISOString();
    const opening: ChatMessage = {
      id: genId(),
      role: 'assistant',
      content: openingLine(mood, memo),
      createdAt: now,
    };
    const moodLabel = moodOptions.find((m) => m.key === mood)?.label ?? '記録';
    const conv: Conversation = {
      id: genId(),
      mood,
      triggers,
      memo,
      title: memo ? memo.slice(0, 20) : `${moodLabel}気持ち`,
      createdAt: now,
      updatedAt: now,
      messages: [opening],
    };
    setConversation(conv);
    saveConversation(conv);

    getUsage().then((u) => setLimitReached(u.messageCount >= FREE_MONTHLY_LIMIT));
  }, []);

  const persist = async (conv: Conversation) => {
    setConversation({ ...conv });
    await saveConversation(conv);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !conversation || sending) return;

    const profile = await getProfile();
    if (profile?.plan !== 'plus') {
      const usage = await getUsage();
      if (usage.messageCount >= FREE_MONTHLY_LIMIT) {
        setLimitReached(true);
        router.push('/subscription');
        return;
      }
    }

    setInput('');
    const crisis = containsCrisisKeyword(text);

    const userMsg: ChatMessage = {
      id: genId(),
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
      isCrisis: crisis,
    };
    const updated: Conversation = {
      ...conversation,
      messages: [...conversation.messages, userMsg],
      updatedAt: new Date().toISOString(),
    };
    await persist(updated);
    await incrementUsage();

    if (crisis) {
      // 安全確保を最優先し、返答を待たずに危機介入画面へ
      router.push({ pathname: '/crisis', params: { conversationId: updated.id } });
    }

    setSending(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // 先頭のAI挨拶メッセージ（クライアント側で生成した非APIメッセージ）を除き、
          // ユーザー発話から始まる履歴としてAPIに渡す
          messages: updated.messages
            .slice(1)
            .map((m) => ({ role: m.role, content: m.content })),
          moodLabel: moodOptions.find((m) => m.key === conversation.mood)?.label ?? null,
          triggers: conversation.triggers,
          memo: conversation.memo,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'API error');
      }

      const aiMsg: ChatMessage = {
        id: genId(),
        role: 'assistant',
        content: data.reply || 'うまく返答できませんでした。もう一度送ってみてください。',
        createdAt: new Date().toISOString(),
        isCrisis: data.isCrisis,
      };
      await persist({ ...updated, messages: [...updated.messages, aiMsg], updatedAt: new Date().toISOString() });
    } catch (e: any) {
      Alert.alert(
        '通信エラー',
        e?.message?.includes('ANTHROPIC_API_KEY') || e?.message?.includes('missing_api_key')
          ? 'サーバーにAPIキーが設定されていません（開発者向け: .env の ANTHROPIC_API_KEY を確認してください）。'
          : '少し時間をおいてもう一度お試しください。',
      );
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  if (!conversation) return null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerAvatar}>
          <Text style={{ fontSize: 16 }}>😊</Text>
        </View>
        <View>
          <Text style={styles.headerTitle}>Guchibo</Text>
          <Text style={styles.headerStatus}>● そばにいます</Text>
        </View>
      </View>

      <FlatList
        ref={listRef}
        data={conversation.messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <ChatBubble message={item} />}
        contentContainerStyle={{ paddingVertical: spacing.lg }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
      />

      {sending && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.typingText}>Guchiboが返信を考えています…</Text>
        </View>
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="今の気持ちを入力..."
          placeholderTextColor={colors.textMuted}
          value={input}
          onChangeText={setInput}
          multiline
          editable={!limitReached}
        />
        <Pressable style={styles.sendButton} onPress={send} disabled={sending || !input.trim()}>
          <Ionicons name="arrow-up" size={20} color="#fff" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: 56,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  headerStatus: { fontSize: 11, color: colors.success },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  typingText: { fontSize: 12, color: colors.textMuted },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
