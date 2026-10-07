import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '@/components/Brand';
import { PrimaryButton } from '@/components/PrimaryButton';
import { showAlert } from '@/lib/dialog';
import { FREE_MONTHLY_LIMIT, updateProfile } from '@/lib/storage';
import { colors, spacing } from '@/lib/theme';

// 料金・特典は利用規約ドラフト（2026-09-26）に合わせた暫定値。正式な値はPMと確定する
const PRICE_MONTHLY = '¥980';

const BENEFITS = [
  { text: '回数の制限なく、いつでも話せる', soon: false },
  { text: '混み合う時間も、優先して応答', soon: false },
  { text: 'こころの振り返りレポート', soon: true },
];

export default function Subscription() {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  const subscribe = async () => {
    setLoading(true);
    // ベータ版では決済に接続していない。端末内のプラン状態だけを切り替える
    await updateProfile({ plan: 'plus' });
    setLoading(false);
    showAlert('Guchibo Plus（デモ）', 'ベータ版のため、課金は発生しません。Plusの状態を体験できます。', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.gradient[0], colors.gradient[1]]} style={[styles.hero, { paddingTop: spacing.xl }]}>
        <Pressable style={styles.close} onPress={() => router.back()} hitSlop={12} accessibilityLabel="閉じる">
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>
        <Logo size={64} />
        <Text style={styles.heroLabel}>GUCHIBO PLUS</Text>
        <Text style={styles.heroTitle}>いつでも、そばに。</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.lg }]}>
        <View style={styles.betaBox}>
          <Text style={styles.betaText}>ベータ版では決済に接続していないため、課金は発生しません。</Text>
        </View>

        {BENEFITS.map((b) => (
          <View key={b.text} style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={styles.benefitText}>{b.text}</Text>
            {b.soon && <Text style={styles.soon}>準備中</Text>}
          </View>
        ))}

        <View style={styles.planCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.planName}>月額プラン</Text>
            <Text style={styles.planSub}>いつでも解約できます</Text>
          </View>
          <Text style={styles.planPrice}>
            {PRICE_MONTHLY}
            <Text style={styles.planUnit}> /月（税込）</Text>
          </Text>
        </View>

        <Text style={styles.freeNote}>無料プランでも、月{FREE_MONTHLY_LIMIT}回まで話せます。</Text>

        <PrimaryButton label="Plusを体験する（デモ）" onPress={subscribe} loading={loading} style={{ marginTop: spacing.lg }} />
        <Pressable style={styles.later} onPress={() => router.back()}>
          <Text style={styles.laterText}>無料プランのまま使う</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: { paddingBottom: spacing.xl, alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  close: { position: 'absolute', top: spacing.md, right: spacing.md, zIndex: 10, padding: spacing.sm },
  heroLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '800', letterSpacing: 2, marginTop: spacing.md },
  heroTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 4 },
  content: { padding: spacing.lg },
  betaBox: { backgroundColor: colors.warningSoft, borderRadius: 12, padding: spacing.sm, marginBottom: spacing.lg },
  betaText: { fontSize: 12, color: colors.warningText, textAlign: 'center', fontWeight: '600' },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  benefitText: { fontSize: 14, color: colors.text, flex: 1 },
  soon: { fontSize: 10, fontWeight: '800', color: colors.textMuted },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: 16,
    padding: spacing.md,
    marginTop: spacing.lg,
    backgroundColor: colors.surface,
  },
  planName: { fontSize: 15, fontWeight: '800', color: colors.text },
  planSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  planPrice: { fontSize: 22, fontWeight: '800', color: colors.primary },
  planUnit: { fontSize: 11, fontWeight: '600', color: colors.textSecondary },
  freeNote: { fontSize: 12, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.md },
  later: { alignItems: 'center', paddingVertical: spacing.md },
  laterText: { fontSize: 13, color: colors.textSecondary },
});
