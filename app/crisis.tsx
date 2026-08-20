import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Linking, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { CRISIS_TEST_MODE, HOTLINES } from '@/lib/crisis';
import { colors, spacing } from '@/lib/theme';

export default function Crisis() {
  const primary = HOTLINES[0];

  const call = (telHref: string) => {
    if (Platform.OS === 'web') {
      Linking.openURL(telHref).catch(() => {});
    } else {
      Linking.openURL(telHref).catch(() => {});
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.close} onPress={() => router.back()} hitSlop={12}>
        <Ionicons name="close" size={22} color={colors.textSecondary} />
      </Pressable>

      <ScrollView contentContainerStyle={styles.content}>
        {CRISIS_TEST_MODE && (
          <View style={styles.testBanner}>
            <Text style={styles.testBannerText}>
              ⚠️ テストモード：このページの電話番号はすべてダミーです（本物の相談窓口ではありません）
            </Text>
          </View>
        )}

        <View style={styles.shieldWrap}>
          <Ionicons name="shield-checkmark-outline" size={34} color={colors.primary} />
        </View>

        <Text style={styles.title}>あなたのことが、{'\n'}とても心配です。</Text>
        <Text style={styles.body}>
          ひとりで抱えるには、つらすぎるかもしれません。あなたを支えてくれる人に、いま頼ってほしいです。
        </Text>

        {HOTLINES.map((h) => (
          <Pressable key={h.name} style={styles.hotlineCard} onPress={() => call(h.telHref)}>
            <View style={styles.phoneIcon}>
              <Ionicons name="call-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.hotlineName}>{h.name}</Text>
              <Text style={styles.hotlineHours}>{h.hours}</Text>
            </View>
            <Text style={styles.hotlineNumber}>{h.number}</Text>
          </Pressable>
        ))}

        <PrimaryButton
          label={`📞 ${primary.name}にかける`}
          onPress={() => call(primary.telHref)}
          style={{ marginTop: spacing.lg, width: '100%' }}
        />
        <Pressable style={styles.continueLink} onPress={() => router.back()}>
          <Text style={styles.continueLinkText}>😊 Guchiboと話を続ける</Text>
        </Pressable>

        <Text style={styles.disclaimer}>
          Guchiboはあなたの言葉から不安を感じ取りました。専門的な判断や治療は行えません。危険を感じる場合は、迷わず119番、または上記の窓口にご連絡ください。
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  close: { position: 'absolute', top: 56, right: spacing.lg, zIndex: 10, padding: spacing.sm },
  content: { padding: spacing.lg, paddingTop: 90, alignItems: 'center' },
  testBanner: {
    width: '100%',
    backgroundColor: '#FFF4CC',
    borderRadius: 12,
    padding: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: '#E8C766',
  },
  testBannerText: {
    fontSize: 12,
    color: '#7A5B00',
    fontWeight: '700',
    textAlign: 'center',
  },
  shieldWrap: {
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 30,
    marginBottom: spacing.sm,
  },
  body: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  hotlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.sm,
    gap: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  phoneIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotlineName: { fontSize: 14, fontWeight: '700', color: colors.text },
  hotlineHours: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  hotlineNumber: { fontSize: 13, fontWeight: '700', color: colors.primary },
  continueLink: { marginTop: spacing.lg, padding: spacing.sm },
  continueLinkText: { color: colors.primary, fontWeight: '700', fontSize: 14 },
  disclaimer: {
    marginTop: spacing.xl,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 17,
  },
});
