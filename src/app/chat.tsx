import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '@/components/Brand';
import { ChatBubble } from '@/components/ChatBubble';
import { ChatNotConfiguredError, CHAT_DEMO_MODE, sendChat } from '@/lib/api';
import { containsCrisisKeyword } from '@/lib/crisis';
import { CRISIS_DEMO_REPLY, demoReply } from '@/lib/demoReply';
import { showAlert } from '@/lib/dialog';
import {
  addMoodEntry,
  ChatMessage,
  Conversation,
  FREE_MONTHLY_LIMIT,
  genId,
  getProfile,
  getUsage,
  incrementUsage,
  Plan,
  saveConversation,
} from '@/lib/storage';
import { colors, MoodKey, moodMeta, spacing } from '@/lib/theme';

function openingLine(moodKey: string | null, memo: string): string {
  const mood = moodMeta(moodKey);
  const h = new Date().getHours();
  const greet = h < 5 ? '遅くまでおつかれさまです。' : h < 11 ? 'おはようございます。' : h < 18 ? 'こんにちは。' : '今日もおつかれさまです。';
  if (memo) return `${greet}「${memo}」なんですね。よかったら、もう少し聞かせてもらえますか？`;
  if (mood && mood.key !== 'calm') {
    return `${greet}今日は${mood.label}気持ちだったんですね。いま、いちばん気にかかっていることはなんですか？`;
  }
  return `${greet}どんな気持ちで過ごしていましたか？思いついたことから、そのまま話してください。`;
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Chat() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ mood?: string; triggers?: string; memo?: string }>();

  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [plan, setPlan] = useState<Plan>('free');
  const [remaining, setRemaining] = useState(FREE_MONTHLY_LIMIT);
  const consentAsked = useRef(false);
  const initialized = useRef(false);
  const listRef = useRef<FlatList>(null);

  const init = useCallback(async () => {
    const mood = (params.mood || null) as MoodKey | null;
    const triggers = params.triggers ? params.triggers.split(',').filter(Boolean) : [];
    const memo = params.memo || '';
    const now = new Date().toISOString();
    const conv: Conversation = {
      id: genId(),
      mood,
      triggers,
      memo,
      title: memo ? memo.slice(0, 24) : mood ? `${moodMeta(mood)?.label}気持ちの日` : 'Guchiboとの会話',
      createdAt: now,
      updatedAt: now,
      messages: [{ id: genId(), role: 'assistant', content: openingLine(mood, memo), createdAt: now }],
    };
    if (mood) await addMoodEntry({ mood, triggers, memo: memo || undefined, conversationId: conv.id });
    setConversation(conv);
  }, [params.mood, params.triggers, params.memo]);

  // 初回は、AIへのデータ送信の同意画面を挟む。同意しなかった場合はチャットを閉じる
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const profile = await getProfile();
        setPlan(profile?.plan ?? 'free');
        const usage = await getUsage();
        setRemaining(Math.max(FREE_MONTHLY_LIMIT - usage.messageCount, 0));
        if (!profile?.aiConsentAt) {
          if (consentAsked.current) {
            router.back();
          } else {
            consentAsked.current = true;
            router.push('/consent');
          }
          return;
        }
        if (!initialized.current) {
          initialized.current = true;
          await init();
        }
      })();
    }, [init]),
  );

  const persist = async (conv: Conversation) => {
    setConversation({ ...conv });
    await saveConversation(conv);
  };

  const send = async () => {
    const text = input.trim();
    if (!text || !conversation || sending) return;

    if (plan !== 'plus') {
      const usage = await getUsage();
      if (usage.messageCount >= FREE_MONTHLY_LIMIT) {
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
      title: conversation.memo || conversation.messages.length > 1 ? conversation.title : text.slice(0, 24),
      messages: [...conversation.messages, userMsg],
      updatedAt: new Date().toISOString(),
    };
    await persist(updated);
    const usage = await incrementUsage();
    setRemaining(Math.max(FREE_MONTHLY_LIMIT - usage.messageCount, 0));

    if (crisis) {
      // 安全確保を最優先し、返答を待たずに危機介入画面へ
      router.push('/crisis');
    }

    setSending(true);
    try {
      let reply: string;
      let isDemo = false;
      if (CHAT_DEMO_MODE) {
        await wait(1200);
        const turn = updated.messages.filter((m) => m.role === 'user').length - 1;
        reply = crisis ? CRISIS_DEMO_REPLY : demoReply(text, turn);
        isDemo = true;
      } else {
        const data = await sendChat({
          // 先頭のあいさつ（アプリ側で作った文）を除き、ユーザーの発言から始まる履歴を渡す
          messages: updated.messages.slice(1).map((m) => ({ role: m.role, content: m.content })),
          moodLabel: moodMeta(conversation.mood)?.label ?? null,
          triggers: conversation.triggers,
          memo: conversation.memo,
        });
        reply = data.reply || 'うまく返答できませんでした。もう一度送ってみてください。';
      }
      const aiMsg: ChatMessage = {
        id: genId(),
        role: 'assistant',
        content: reply,
        createdAt: new Date().toISOString(),
        isDemo,
      };
      await persist({ ...updated, messages: [...updated.messages, aiMsg], updatedAt: new Date().toISOString() });
    } catch (e: any) {
      showAlert(
        '通信エラー',
        e instanceof ChatNotConfiguredError ? 'AIとの接続はまだ準備中です。' : '少し時間をおいてもう一度お試しください。',
      );
    } finally {
      setSending(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="戻る">
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Logo size={36} />
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Guchibo</Text>
          <Text style={styles.headerStatus}>● そばにいます</Text>
        </View>
        {CHAT_DEMO_MODE && (
          <View style={styles.demoPill}>
            <Text style={styles.demoPillText}>デモ</Text>
          </View>
        )}
      </View>

      {CHAT_DEMO_MODE && (
        <View style={styles.demoBanner}>
          <Text style={styles.demoBannerText}>ベータ版：AIは未接続のため、返答はデモ用の定型文です</Text>
        </View>
      )}

      {conversation ? (
        <FlatList
          ref={listRef}
          data={conversation.messages}
          keyExtractor={(m) => m.id}
          renderItem={({ item }) => <ChatBubble message={item} />}
          contentContainerStyle={{ paddingVertical: spacing.lg }}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
        />
      ) : (
        <View style={{ flex: 1 }} />
      )}

      {sending && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={styles.typingText}>Guchiboが返事を考えています…</Text>
        </View>
      )}

      <View style={[styles.inputBar, { paddingBottom: Math.max(insets.bottom, spacing.md) }]}>
        {plan !== 'plus' && <Text style={styles.remaining}>今月あと{remaining}回話せます（無料プラン）</Text>}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="いまの気持ちを入力..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={1000}
          />
          <Pressable
            style={[styles.sendButton, (!input.trim() || sending) && { opacity: 0.4 }]}
            onPress={send}
            disabled={sending || !input.trim()}
            accessibilityLabel="送信"
          >
            <Ionicons name="arrow-up" size={20} color="#fff" />
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  headerStatus: { fontSize: 11, color: colors.success },
  demoPill: { backgroundColor: colors.warningSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  demoPillText: { fontSize: 11, fontWeight: '800', color: colors.warningText },
  demoBanner: { backgroundColor: colors.warningSoft, paddingVertical: 6, paddingHorizontal: spacing.md },
  demoBannerText: { fontSize: 11, color: colors.warningText, textAlign: 'center' },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  typingText: { fontSize: 12, color: colors.textMuted },
  inputBar: {
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  remaining: { fontSize: 10, color: colors.textMuted, marginBottom: 6, marginLeft: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  input: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 15,
    color: colors.text,
    maxHeight: 120,
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
