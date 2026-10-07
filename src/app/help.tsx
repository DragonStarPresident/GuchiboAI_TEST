import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { colors, spacing } from '@/lib/theme';

const FAQS = [
  {
    q: 'Guchiboは医療行為やカウンセリングを行いますか？',
    a: 'いいえ。Guchiboは医療行為・診断・治療を目的としたサービスではありません。うつ病などの治療を目的とするものではなく、気持ちを言葉にする対話の相手です。深刻な症状がある場合は、必ず医療機関や専門の相談窓口にご相談ください。',
  },
  {
    q: '会話の内容は誰かに見られますか？',
    a: 'あなたの会話内容は、あなたの許可なく公開されることはありません。',
  },
  {
    q: '無料プランでは何回話せますか？',
    a: '無料プランでは月30回まで会話できます。回数を超えると、Guchibo Plus（有料プラン）へのご案内が表示されます。',
  },
  {
    q: '記録はどこに保存されますか？',
    a: '現在のMVP版では、会話の記録はお使いの端末内にのみ保存されます。設定の「記録の保存と書き出し」からテキストとして書き出すこともできます。',
  },
];

export default function Help() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>使い方・よくある質問</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        {FAQS.map((item) => (
          <Card key={item.q}>
            <Text style={styles.q}>Q. {item.q}</Text>
            <Text style={styles.a}>{item.a}</Text>
          </Card>
        ))}
      </ScrollView>
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
  q: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  a: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
});
