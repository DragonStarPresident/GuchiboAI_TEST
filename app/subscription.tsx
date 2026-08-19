import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { updateProfile } from '@/lib/storage';
import { colors, spacing } from '@/lib/theme';

const BENEFITS = [
  '回数の制限なく、いつでも話せる',
  'あなたに合わせて寄り添いが深まる',
  'きもちの記録を無期限で保存',
  '週ごとの「こころの振り返り」レポート',
];

type PlanId = 'yearly' | 'monthly';

export default function Subscription() {
  const [plan, setPlan] = useState<PlanId>('yearly');
  const [loading, setLoading] = useState(false);

  const subscribe = async () => {
    setLoading(true);
    // NOTE: MVPでは実際の決済(Stripe / RevenueCat等)は未接続。
    // ここではローカルにプラン状態を保存し、体験として有料機能を解放するのみ。
    await updateProfile({ plan: 'plus' });
    setLoading(false);
    Alert.alert(
      'Guchibo Plus',
      '（MVPデモ）Plusプランを有効にしました。実際の決済連携は今後の実装が必要です。',
      [{ text: 'OK', onPress: () => router.back() }],
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={[colors.gradient[0], colors.gradient[1]]} style={styles.hero}>
        <Pressable style={styles.close} onPress={() => router.back()} hitSlop={12}>
          <Ionicons name="close" size={22} color="#fff" />
        </Pressable>
        <View style={styles.logoCircle}>
          <Text style={{ fontSize: 28 }}>😊</Text>
        </View>
        <Text style={styles.heroLabel}>GUCHIBO PLUS</Text>
        <Text style={styles.heroTitle}>いつでも、そばに。</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {BENEFITS.map((b) => (
          <View key={b} style={styles.benefitRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.primary} />
            <Text style={styles.benefitText}>{b}</Text>
          </View>
        ))}

        <Pressable
          style={[styles.planCard, plan === 'yearly' && styles.planCardActive]}
          onPress={() => setPlan('yearly')}
        >
          <View style={styles.radioOuter}>{plan === 'yearly' && <View style={styles.radioInner} />}</View>
          <View style={{ flex: 1 }}>
            <Text style={styles.planName}>年額プラン</Text>
            <Text style={styles.planSub}>7日間無料・以降 ¥19,800/年</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>17%お得</Text>
          </View>
        </Pressable>

        <Pressable
          style={[styles.planCard, plan === 'monthly' && styles.planCardActive]}
          onPress={() => setPlan('monthly')}
        >
          <View style={styles.radioOuter}>{plan === 'monthly' && <View style={styles.radioInner} />}</View>
          <View style={{ flex: 1 }}>
            <Text style={styles.planName}>月額プラン</Text>
            <Text style={styles.planSub}>¥1,980/月</Text>
          </View>
        </Pressable>

        <PrimaryButton
          label="7日間、無料ではじめる"
          onPress={subscribe}
          loading={loading}
          style={{ marginTop: spacing.lg, width: '100%' }}
        />
        <Text style={styles.footNote}>無料体験の終了前にお知らせします。いつでも解約できます。</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  hero: {
    paddingTop: 70,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },
  close: { position: 'absolute', top: 56, right: spacing.lg, zIndex: 10 },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700', letterSpacing: 2 },
  heroTitle: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 4 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm },
  benefitText: { fontSize: 14, color: colors.text, flex: 1 },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 16,
    padding: spacing.md,
    marginTop: spacing.md,
    backgroundColor: colors.surface,
  },
  planCardActive: { borderColor: colors.primary, backgroundColor: colors.surfaceAlt },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  planName: { fontSize: 14, fontWeight: '700', color: colors.text },
  planSub: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  badge: { backgroundColor: colors.accentCoral, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  footNote: { fontSize: 11, color: colors.textMuted, textAlign: 'center', marginTop: spacing.md },
});
