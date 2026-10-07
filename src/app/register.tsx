import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '@/components/Brand';
import { PrimaryButton } from '@/components/PrimaryButton';
import { showAlert } from '@/lib/dialog';
import { updateProfile } from '@/lib/storage';
import { colors, spacing } from '@/lib/theme';

export default function Register() {
  const insets = useSafeAreaInsets();
  const [nickname, setNickname] = useState('');
  const [showNicknameInput, setShowNicknameInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const finishRegister = async (name: string) => {
    setLoading(true);
    await updateProfile({
      nickname: name || 'ゲスト',
      onboarded: true,
      createdAt: new Date().toISOString(),
      plan: 'free',
    });
    setLoading(false);
    router.replace('/home');
  };

  const notReady = (provider: string) => {
    showAlert(`${provider}でのログイン`, 'ベータ版ではまだ準備中です。「ニックネームではじめる」からお試しください。');
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView bounces={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <LinearGradient
          colors={[colors.gradientSoft[0], colors.gradientSoft[1]]}
          style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}
        >
          <Logo size={88} />
          <Text style={styles.brand}>
            Guchibo<Text style={{ color: colors.accentCoral }}>.</Text>
          </Text>
          <Text style={styles.tagline}>孤独に、会話という居場所を。</Text>
        </LinearGradient>

        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <Text style={styles.title}>はじめましょう</Text>
          <Text style={styles.subtitle}>登録は30秒。ニックネームだけで始められます。</Text>

          <Pressable style={styles.appleButton} onPress={() => notReady('Apple')}>
            <Ionicons name="logo-apple" size={18} color="#fff" />
            <Text style={styles.appleText}>Appleで続ける</Text>
            <Text style={styles.soon}>準備中</Text>
          </Pressable>

          <Pressable style={styles.googleButton} onPress={() => notReady('Google')}>
            <Ionicons name="logo-google" size={16} color={colors.text} />
            <Text style={styles.googleText}>Googleで続ける</Text>
            <Text style={[styles.soon, { color: colors.textMuted }]}>準備中</Text>
          </Pressable>

          {showNicknameInput ? (
            <View style={styles.nicknameBox}>
              <TextInput
                style={styles.input}
                placeholder="ニックネームを入力（あとで変えられます）"
                placeholderTextColor={colors.textMuted}
                value={nickname}
                onChangeText={setNickname}
                maxLength={20}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => finishRegister(nickname.trim())}
              />
              <PrimaryButton label="はじめる" loading={loading} onPress={() => finishRegister(nickname.trim())} />
            </View>
          ) : (
            <Pressable onPress={() => setShowNicknameInput(true)} style={styles.nicknameLink}>
              <Ionicons name="person-outline" size={16} color={colors.primary} />
              <Text style={styles.nicknameLinkText}>ニックネームではじめる</Text>
            </Pressable>
          )}

          <Text style={styles.terms}>
            続行すると利用規約・プライバシーポリシーに同意したものとみなされます。{'\n'}
            （ベータ版のため、規約は正式公開時に掲載します）
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', paddingBottom: spacing.xxl },
  brand: { fontSize: 28, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  tagline: { fontSize: 13, color: colors.textSecondary, marginTop: spacing.xs },
  sheet: {
    flex: 1,
    backgroundColor: colors.surface,
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.lg,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginBottom: spacing.lg },
  appleButton: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    backgroundColor: '#1B1730',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.sm,
    opacity: 0.85,
  },
  appleText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  googleButton: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.md,
    opacity: 0.85,
  },
  googleText: { color: colors.text, fontWeight: '700', fontSize: 15 },
  soon: { fontSize: 10, color: 'rgba(255,255,255,0.7)', fontWeight: '700' },
  nicknameLink: { flexDirection: 'row', gap: 6, justifyContent: 'center', alignItems: 'center', paddingVertical: spacing.sm },
  nicknameLinkText: { color: colors.primary, fontWeight: '800', fontSize: 15 },
  nicknameBox: { gap: spacing.sm },
  input: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  terms: { marginTop: spacing.lg, fontSize: 11, color: colors.textMuted, textAlign: 'center', lineHeight: 17 },
});
