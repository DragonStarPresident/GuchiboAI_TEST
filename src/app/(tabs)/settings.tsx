import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Logo } from '@/components/Brand';
import { Card } from '@/components/Card';
import { CHAT_DEMO_MODE } from '@/lib/api';
import { showAlert } from '@/lib/dialog';
import { deleteAllData, getConversations, getProfile, hasUserMessage, Profile, updateProfile } from '@/lib/storage';
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
    <Pressable style={({ pressed }) => [styles.row, pressed && { opacity: 0.6 }]} onPress={onPress}>
      <View style={[styles.rowIcon, tint ? { backgroundColor: tint + '1F' } : null]}>
        <Ionicons name={icon} size={17} color={tint ?? colors.primary} />
      </View>
      <Text style={styles.rowLabel}>{label}</Text>
      {value ? <Text style={styles.rowValue}>{value}</Text> : null}
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

export default function Settings() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<Profile | null>(null);

  useFocusEffect(
    useCallback(() => {
      getProfile().then(setProfile);
    }, []),
  );

  const days = profile ? Math.max(1, Math.ceil((Date.now() - new Date(profile.createdAt).getTime()) / 86400000)) : 1;
  const version = Constants.expoConfig?.version ?? '';

  const notReady = (feature: string) => showAlert(feature, 'ベータ版ではまだ準備中の機能です。');

  const editNickname = () => {
    if (Platform.OS !== 'ios') return notReady('ニックネームの変更');
    Alert.prompt(
      'ニックネームを変更',
      '20文字まで',
      async (text) => {
        const name = text.trim().slice(0, 20);
        if (!name) return;
        setProfile(await updateProfile({ nickname: name }));
      },
      'plain-text',
      profile?.nickname ?? '',
    );
  };

  const exportData = async () => {
    const conversations = (await getConversations()).filter(hasUserMessage);
    if (conversations.length === 0) {
      showAlert('記録の書き出し', 'まだ会話の記録がありません。');
      return;
    }
    const text = conversations
      .map((c) => {
        const lines = c.messages.map((m) => `${m.role === 'user' ? 'あなた' : 'Guchibo'}: ${m.content}`);
        return `【${new Date(c.createdAt).toLocaleString('ja-JP')}】${c.title}\n${lines.join('\n')}`;
      })
      .join('\n\n---\n\n');
    await Share.share({ message: text, title: 'Guchibo きろくの書き出し' });
  };

  const confirmDelete = () => {
    showAlert('データを削除する', 'プロフィール、会話、気分の記録がすべて削除され、最初の画面に戻ります。この操作は取り消せません。', [
      { text: 'キャンセル', style: 'cancel' },
      {
        text: '削除する',
        style: 'destructive',
        onPress: async () => {
          await deleteAllData();
          router.replace('/onboarding');
        },
      },
    ]);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xl }}
    >
      <Text style={styles.header}>設定</Text>

      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.profileName}>{profile?.nickname ?? 'ゲスト'}さん</Text>
          <Text style={styles.profileMeta}>
            {profile?.plan === 'plus' ? 'Guchibo Plus' : '無料プラン'}・登録から{days}日
          </Text>
        </View>
        <Pressable style={styles.editButton} onPress={editNickname}>
          <Text style={styles.editText}>編集</Text>
        </Pressable>
      </Card>

      {profile?.plan !== 'plus' && (
        <Pressable onPress={() => router.push('/subscription')} style={{ marginTop: spacing.md }}>
          <Card style={styles.plusBanner}>
            <Logo size={36} />
            <View style={{ flex: 1 }}>
              <Text style={styles.plusTitle}>Guchibo Plus にする</Text>
              <Text style={styles.plusSub}>制限なく、いつでも話せます</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#fff" />
          </Card>
        </Pressable>
      )}

      <Text style={styles.sectionTitle}>きろく・プライバシー</Text>
      <Card style={styles.group}>
        <Row icon="notifications-outline" label="通知・リマインド" value="準備中" onPress={() => notReady('通知・リマインド')} />
        <Divider />
        <Row icon="lock-closed-outline" label="アプリのロック" value="準備中" onPress={() => notReady('アプリのロック')} />
        <Divider />
        <Row icon="share-outline" label="記録の書き出し" onPress={exportData} />
        <Divider />
        <Row icon="sparkles-outline" label="AIとの会話について" onPress={() => router.push({ pathname: '/consent', params: { view: '1' } })} />
        <Divider />
        <Row icon="trash-outline" label="データを削除する" onPress={confirmDelete} tint={colors.danger} />
      </Card>

      <Text style={styles.sectionTitle}>こまったとき</Text>
      <Card style={styles.group}>
        <Row icon="call-outline" label="緊急の相談窓口" onPress={() => router.push('/crisis')} tint={colors.danger} />
        <Divider />
        <Row icon="help-circle-outline" label="使い方・よくある質問" onPress={() => router.push('/help')} />
      </Card>

      <Text style={styles.sectionTitle}>このアプリについて</Text>
      <Card style={styles.group}>
        <Row icon="document-text-outline" label="利用規約" value="準備中" onPress={() => notReady('利用規約')} />
        <Divider />
        <Row icon="shield-outline" label="プライバシーポリシー" value="準備中" onPress={() => notReady('プライバシーポリシー')} />
      </Card>

      <Text style={styles.version}>
        Guchibo ベータ版 {version}
        {CHAT_DEMO_MODE ? '・AI未接続（デモ応答）' : ''}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { fontSize: 26, fontWeight: '800', color: colors.text, marginBottom: spacing.md },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { fontSize: 16, fontWeight: '800', color: colors.text },
  profileMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  editButton: { backgroundColor: colors.surfaceAlt, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  editText: { fontSize: 12, fontWeight: '800', color: colors.primary },
  plusBanner: { backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md },
  plusTitle: { color: '#fff', fontWeight: '800', fontSize: 15 },
  plusSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: colors.textMuted, marginTop: spacing.lg, marginBottom: spacing.sm, marginLeft: spacing.xs },
  group: { padding: 0 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: spacing.md, gap: spacing.sm },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: { flex: 1, fontSize: 14, color: colors.text, fontWeight: '600' },
  rowValue: { fontSize: 12, color: colors.textMuted, marginRight: spacing.xs },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: spacing.md + 32 + spacing.sm },
  version: { textAlign: 'center', fontSize: 11, color: colors.textMuted, marginTop: spacing.xl },
});
