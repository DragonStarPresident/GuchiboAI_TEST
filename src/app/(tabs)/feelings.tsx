import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Character } from '@/components/Brand';
import { Card } from '@/components/Card';
import { MoodWeekChart } from '@/components/MoodWeekChart';
import { PrimaryButton } from '@/components/PrimaryButton';
import { formatRelativeDate, getMoodEntries, MoodEntry } from '@/lib/storage';
import { colors, moodMeta, moodOptions, spacing } from '@/lib/theme';

const DAYS = 30;

export default function Feelings() {
  const insets = useSafeAreaInsets();
  const [entries, setEntries] = useState<MoodEntry[]>([]);

  useFocusEffect(
    useCallback(() => {
      getMoodEntries().then(setEntries);
    }, []),
  );

  const since = Date.now() - DAYS * 24 * 60 * 60 * 1000;
  const recent = entries.filter((e) => new Date(e.createdAt).getTime() >= since);
  const counts = moodOptions.map((m) => ({ ...m, count: recent.filter((e) => e.mood === m.key).length }));
  const maxCount = Math.max(1, ...counts.map((c) => c.count));

  const triggerCounts = new Map<string, number>();
  recent.forEach((e) => e.triggers.forEach((t) => triggerCounts.set(t, (triggerCounts.get(t) ?? 0) + 1)));
  const topTriggers = [...triggerCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xl, gap: spacing.md }}
    >
      <View>
        <Text style={styles.header}>きもち</Text>
        <Text style={styles.sub}>記録した気分の流れを、やさしく振り返れます。</Text>
      </View>

      {entries.length === 0 ? (
        <Card style={{ alignItems: 'center' }}>
          <Character pose="heart" size={110} />
          <Text style={styles.emptyTitle}>まだ気分の記録がありません</Text>
          <Text style={styles.emptyText}>ホームで今日の気分を選ぶと、ここに流れが表示されます。</Text>
          <PrimaryButton label="今日の気分を記録する" onPress={() => router.push('/home')} style={{ marginTop: spacing.md, alignSelf: 'stretch' }} />
        </Card>
      ) : (
        <>
          <Card>
            <Text style={styles.cardTitle}>この1週間</Text>
            <Text style={styles.cardNote}>棒が高いほど、しんどかった日です</Text>
            <View style={{ height: spacing.md }} />
            <MoodWeekChart entries={entries} />
          </Card>

          <Card>
            <Text style={styles.cardTitle}>この{DAYS}日間の気分</Text>
            <Text style={styles.cardNote}>記録 {recent.length} 件</Text>
            <View style={{ gap: spacing.sm, marginTop: spacing.md }}>
              {counts.map((c) => (
                <View key={c.key} style={styles.countRow}>
                  <Text style={styles.countEmoji}>{c.emoji}</Text>
                  <Text style={styles.countLabel}>{c.label}</Text>
                  <View style={styles.countTrack}>
                    <View style={[styles.countBar, { width: `${(c.count / maxCount) * 100}%`, backgroundColor: c.color }]} />
                  </View>
                  <Text style={styles.countNum}>{c.count}</Text>
                </View>
              ))}
            </View>
            {topTriggers.length > 0 && (
              <View style={styles.triggerBox}>
                <Text style={styles.triggerTitle}>よく選んだきっかけ</Text>
                <View style={styles.triggerRow}>
                  {topTriggers.map(([t, n]) => (
                    <View key={t} style={styles.triggerChip}>
                      <Text style={styles.triggerText}>
                        {t}・{n}回
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Card>

          <Text style={styles.sectionTitle}>これまでの記録</Text>
          {entries.slice(0, 30).map((e) => {
            const m = moodMeta(e.mood);
            return (
              <Card key={e.id} style={styles.entry}>
                <View style={[styles.entryIcon, { backgroundColor: (m?.color ?? colors.moodNormal) + '33' }]}>
                  <Text style={{ fontSize: 18 }}>{m?.emoji}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.entryTop}>
                    <Text style={[styles.entryMood, { color: m?.color }]}>{m?.label}</Text>
                    <Text style={styles.entryDate}>{formatRelativeDate(e.createdAt)}</Text>
                  </View>
                  {e.triggers.length > 0 && <Text style={styles.entryTriggers}>{e.triggers.join('・')}</Text>}
                  {e.memo ? <Text style={styles.entryMemo}>{e.memo}</Text> : null}
                  {e.conversationId && <Text style={styles.entryChat}>この日はGuchiboと話しました</Text>}
                </View>
              </Card>
            );
          })}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { fontSize: 26, fontWeight: '800', color: colors.text },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: colors.text, marginTop: spacing.sm },
  emptyText: { fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4, lineHeight: 20 },
  cardTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  cardNote: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  countRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  countEmoji: { fontSize: 16, width: 22 },
  countLabel: { fontSize: 12, color: colors.textSecondary, width: 56 },
  countTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: colors.surfaceAlt, overflow: 'hidden' },
  countBar: { height: 10, borderRadius: 5 },
  countNum: { fontSize: 12, fontWeight: '800', color: colors.text, width: 24, textAlign: 'right' },
  triggerBox: { marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  triggerTitle: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: spacing.sm },
  triggerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  triggerChip: { backgroundColor: colors.surfaceAlt, borderRadius: 999, paddingVertical: 6, paddingHorizontal: 12 },
  triggerText: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: colors.textSecondary, marginTop: spacing.sm },
  entry: { flexDirection: 'row', gap: spacing.md, padding: spacing.md },
  entryIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  entryTop: { flexDirection: 'row', justifyContent: 'space-between' },
  entryMood: { fontSize: 13, fontWeight: '800' },
  entryDate: { fontSize: 11, color: colors.textMuted },
  entryTriggers: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  entryMemo: { fontSize: 13, color: colors.text, marginTop: 4, lineHeight: 19 },
  entryChat: { fontSize: 11, color: colors.primary, marginTop: 4 },
});
