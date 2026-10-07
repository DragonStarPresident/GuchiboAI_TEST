import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Card } from '@/components/Card';
import { ScreenHeader } from '@/components/ScreenHeader';
import { FREE_MONTHLY_LIMIT } from '@/lib/storage';
import { colors, spacing } from '@/lib/theme';

const FAQS = [
  {
    q: 'Guchiboはどんなアプリですか？',
    a: '気持ちをそのまま吐き出して、受け止めてもらうための対話アプリです。アドバイスや正解を出すのではなく、言葉にすることで少し心が軽くなることを大切にしています。',
  },
  {
    q: 'ベータ版でできること・できないことは？',
    a: '気分の記録、会話の記録、振り返りは使えます。AIとの会話は準備中のため、現在の返答はデモ用の定型文です。ログイン、課金、通知も準備中です。',
  },
  {
    q: '医療行為やカウンセリングを行いますか？',
    a: 'いいえ。Guchiboは医療行為・診断・治療を目的としたサービスではありません。深刻な症状があるときや、命の危険を感じるときは、医療機関や設定の「緊急の相談窓口」に相談してください。',
  },
  {
    q: '記録はどこに保存されますか？',
    a: 'ベータ版では、記録はお使いの端末の中にだけ保存されます。アプリを削除すると記録も消えます。設定の「記録の書き出し」から、テキストとして残すこともできます。',
  },
  {
    q: '無料で何回話せますか？',
    a: `無料プランでは月${FREE_MONTHLY_LIMIT}回まで話せます。回数は毎月1日にリセットされます。`,
  },
];

export default function Help() {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.container}>
      <ScreenHeader title="使い方・よくある質問" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + spacing.lg, gap: spacing.md }}>
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
  q: { fontSize: 14, fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  a: { fontSize: 13, color: colors.textSecondary, lineHeight: 20 },
});
