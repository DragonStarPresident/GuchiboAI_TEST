import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { PrimaryButton } from '@/components/PrimaryButton';
import { showAlert } from '@/lib/dialog';
import { updateProfile } from '@/lib/storage';
import { colors, spacing } from '@/lib/theme';

export default function Register() {
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
    showAlert(
      `${provider}でのログイン`,
      'このMVPではまだ準備中です。まずは「ニックネームではじめる」からお試しください。',
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <LinearGradient colors={[colors.gradient[0], colors.gradient[1]]} style={styles.hero}>
        <View style={styles.logoCircle}>
          <Text style={{ fontSize: 34 }}>😊</Text>
        </View>
      </LinearGradient>

      <View style={styles.sheet}>
        <Text style={styles.title}>はじめましょう</Text>
        <Text style={styles.subtitle}>登録は30秒。ニックネームだけで始められます。</Text>

        <Pressable style={styles.appleButton} onPress={() => notReady('Apple')}>
          <Text style={styles.appleText}>Appleで続ける</Text>
        </Pressable>

        <Pressable style={styles.googleButton} onPress={() => notReady('Google')}>
          <Text style={styles.googleText}>Googleで続ける</Text>
        </Pressable>

        {showNicknameInput ? (
          <View style={styles.nicknameBox}>
            <TextInput
              style={styles.input}
              placeholder="ニックネームを入力"
              placeholderTextColor={colors.textMuted}
              value={nickname}
              onChangeText={setNickname}
              maxLength={20}
              autoFocus
            />
            <PrimaryButton
              label="はじめる"
              loading={loading}
              onPress={() => finishRegister(nickname.trim())}
            />
          </View>
        ) : (
          <Pressable onPress={() => setShowNicknameInput(true)} style={styles.nicknameLink}>
            <Text style={styles.nicknameLinkText}>ニックネームではじめる</Text>
          </Pressable>
        )}

        <Text style={styles.terms}>
          続行すると利用規約・プライバシーポリシーに同意したものとみなされます。
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheet: {
    flex: 1,
    backgroundColor: colors.background,
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  appleButton: {
    backgroundColor: '#1B1730',
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  appleText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  googleButton: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  googleText: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 15,
  },
  nicknameLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  nicknameLinkText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
  nicknameBox: {
    gap: spacing.sm,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    fontSize: 15,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  terms: {
    marginTop: spacing.lg,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
