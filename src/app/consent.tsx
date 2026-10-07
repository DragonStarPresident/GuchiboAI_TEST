import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Character } from '@/components/Brand';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CHAT_DEMO_MODE } from '@/lib/api';
import { updateProfile } from '@/lib/storage';
import { colors, spacing } from '@/lib/theme';

// AIへのデータ送信についての同意画面（App Store審査ガイドライン5.1.2対応）。
// 初めてチャットを開くときに表示し、設定画面からも内容を確認できる。
const POINTS = [
  {
    icon: 'cloud-upload-outline' as const,
    title: '送信される内容',
    body: 'あなたが入力したメッセージと、会話を始めるときに選んだ気分・きっかけ・メモが、返答を作るために送信されます。',
  },
  {
    icon: 'business-outline' as const,
    title: '送信先',
    body: 'AIの返答には、Anthropic社（米国）の生成AI「Claude」を利用します。',
  },
  {
    icon: 'shield-checkmark-outline' as const,
    title: '取り扱い',
    body: '送信した内容は返答を作るためにのみ使い、広告などには使いません。詳しくはプライバシーポリシーをご確認ください。',
  },
];

export default function Consent() {
  const insets = useSafeAreaInsets();
  const { view } = useLocalSearchParams<{ view?: string }>();
  const viewOnly = view === '1';

  const agree = async () => {
    await updateProfile({ aiConsentAt: new Date().toISOString() });
    router.back();
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.md }]}>
      <Pressable style={styles.close} onPress={() => router.back()} hitSlop={12} accessibilityLabel="閉じる">
        <Ionicons name="close" size={22} color={colors.textSecondary} />
      </Pressable>
      <ScrollView contentContainerStyle={styles.content}>
        <Character pose="pray" size={110} style={{ alignSelf: 'center' }} />
        <Text style={styles.title}>AIとの会話について</Text>
        <Text style={styles.lead}>Guchiboと話す前に、あなたの言葉がどのように扱われるかをご確認ください。</Text>

        {CHAT_DEMO_MODE && (
          <View style={styles.demoBox}>
            <Text style={styles.demoText}>
              ベータ版ではAIに接続していないため、実際には外部へ送信されません。返答はデモ用の定型文です。
            </Text>
          </View>
        )}

        {POINTS.map((p) => (
          <View key={p.title} style={styles.point}>
            <View style={styles.pointIcon}>
              <Ionicons name={p.icon} size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.pointTitle}>{p.title}</Text>
              <Text style={styles.pointBody}>{p.body}</Text>
            </View>
          </View>
        ))}

        <Text style={styles.note}>
          Guchiboは医療行為・診断を行うサービスではありません。命の危険を感じるときは、設定の「緊急の相談窓口」からすぐに相談してください。
        </Text>
      </ScrollView>

      {!viewOnly && (
        <View style={styles.footer}>
          <PrimaryButton label="同意して、はなしはじめる" onPress={agree} />
          <Pressable style={styles.decline} onPress={() => router.back()}>
            <Text style={styles.declineText}>今はやめておく</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  close: { position: 'absolute', top: spacing.md, right: spacing.md, zIndex: 10, padding: spacing.sm },
  content: { padding: spacing.lg, paddingTop: spacing.xl },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, textAlign: 'center', marginTop: spacing.md },
  lead: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', lineHeight: 22, marginTop: spacing.sm, marginBottom: spacing.lg },
  demoBox: {
    backgroundColor: colors.warningSoft,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  demoText: { fontSize: 12, color: colors.warningText, lineHeight: 18, fontWeight: '600' },
  point: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  pointIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pointTitle: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: 4 },
  pointBody: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
  note: { fontSize: 11, color: colors.textMuted, lineHeight: 17, marginTop: spacing.md },
  footer: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  decline: { alignItems: 'center', paddingVertical: spacing.md },
  declineText: { fontSize: 13, color: colors.textSecondary },
});
