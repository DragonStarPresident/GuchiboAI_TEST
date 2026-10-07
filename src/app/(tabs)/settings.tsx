import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { Card } from '@/components/Card';
import { showAlert } from '@/lib/dialog';
import { deleteAllData, getConversations, getProfile, Profile } from '@/lib/storage';
import { colors, spacing } from '@/lib/theme';

function Row({
  icon,
  label,
  value,
  onPress,
  tint,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress: () => void;
  tint?: string;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={[styles.rowIcon, tint ? { backgroundColor: tint + '22' } : null]}>
        <Ionicons name={icon} size={18} color={tint ?? colors.primary} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {value && <Text style={styles.rowValue}>{value}</Text>}
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
  );
}

export default function Settings() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useFocusEffect(
    useCallback(() => {
      getProfile().then(setProfile);
    }, []),
  );

  const notReady = (feature: string) =>
    showAlert(feature, 'このMVPではまだ準備中の機能です。');

  const exportData = async () => {
    const conversations = await getConversations();
    if (conversations.length === 0) {
      showAlert('書き出し', 'まだ記録がありません。');
      return;
    }
    const text = conversations
      .map((c) => {
        const lines = c.messages.map((m) => `${m.role === 'user' ? 'あなた' : 'Guchibo'}: ${m.content}`);
        return `【${new Date(c.createdAt).toLocaleString('ja-JP')}】${c.title}\n${lines.join('\n')}`;
      })
      .join('\n\n---\n\n');
    if (Platform.OS === 'web') {
      try {
        await navigator.clipboard.writeText(text);
        showAlert('書き出し', 'きろくをクリップボードにコピーしました。');
      } catch {
        showAlert('書き出し', 'コピーに失敗しました。ブラウザのクリップボード権限をご確認ください。');
      }
      return;
    }
    await Share.share({ message: text, title: 'Guchibo きろく書き出し' });
  };

  const confirmDelete = () => {
    showAlert(
      'データを削除する',
      'プロフィールと会話の記録がすべて削除されます。この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: async () => {
            await deleteAllData();
            router.replace('/onboarding');
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }}>
      <Text style={styles.header}>設定</Text>

      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{profile?.nickname ?? 'ゲスト'}さん</Text>
          <Text style={styles.profileMeta}>
            {profile?.plan === 'plus' ? 'Guchibo Plus' : '無料プラン'}
          </Text>
        </View>
      </Card>

      {profile?.plan !== 'plus' && (
        <Pressable onPress={() => router.push('/subscription')} style={{ marginTop: spacing.md }}>
          <Card style={styles.plusBanner}>
            <View>
              <Text style={styles.plusTitle}>Guchibo Plus にする</Text>
              <Text style={styles.plusSub}>制限なく、いつでも話せます</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </Card>
        </Pressable>
      )}

      <Text style={styles.sectionTitle}>きろく・プライバシー</Text>
      <Card style={{ padding: 0 }}>
        <Row icon="notifications-outline" label="通知・リマインド" onPress={() => notReady('通知・リマインド')} />
        <View style={styles.divider} />
        <Row icon="lock-closed-outline" label="アプリのロック" onPress={() => notReady('アプリのロック')} />
        <View style={styles.divider} />
        <Row icon="download-outline" label="記録の保存と書き出し" onPress={exportData} />
        <View style={styles.divider} />
        <Row icon="trash-outline" label="データを削除する" onPress={confirmDelete} tint={colors.danger} />
      </Card>

      <Text style={styles.sectionTitle}>こまったとき</Text>
      <Card style={{ padding: 0 }}>
        <Row icon="call-outline" label="緊急の相談窓口" onPress={() => router.push('/crisis')} tint={colors.danger} />
        <View style={styles.divider} />
        <Row icon="chatbubble-ellipses-outline" label="使い方・よくある質問" onPress={() => router.push('/help')} />
      </Card>

      <Pressable style={styles.logout} onPress={confirmDelete}>
        <Text style={styles.logoutText}>ログアウト / 最初からやり直す</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { fontSize: 24, fontWeight: '800', color: colors.text, marginBottom: spacing.lg },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { fontSize: 16, fontWeight: '700', color: colors.text },
  profileMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  plusBanner: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  plusTitle: { color: '#fff', fontWeight: '800', fontSize: 15 },
  plusSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  sectionTitle: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '600' },
  rowValue: { fontSize: 13, color: colors.textMuted, marginRight: spacing.xs },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.md + 32 + spacing.sm },
  logout: { alignItems: 'center', marginTop: spacing.xl },
  logoutText: { color: colors.textMuted, fontSize: 13 },
});
