import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { dayKey, MoodEntry } from '@/lib/storage';
import { colors, moodMeta, moodOptions, spacing } from '@/lib/theme';

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];
const MAX_HEIGHT = 64;

// 直近7日間の気分。1日に複数の記録がある場合は、その日のいちばんしんどかった気分を表示する
export function MoodWeekChart({ entries }: { entries: MoodEntry[] }) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const key = dayKey(d);
    const dayEntries = entries.filter((e) => dayKey(e.createdAt) === key);
    const worst = dayEntries
      .map((e) => moodMeta(e.mood))
      .filter((m): m is NonNullable<typeof m> => !!m)
      .sort((a, b) => b.level - a.level)[0];
    return { label: WEEKDAYS[d.getDay()], isToday: i === 6, mood: worst };
  });

  return (
    <View>
      <View style={styles.bars}>
        {days.map((d, i) => (
          <View key={i} style={styles.col}>
            <View style={styles.track}>
              <View
                style={[
                  styles.bar,
                  d.mood
                    ? { height: (MAX_HEIGHT * d.mood.level) / 4, backgroundColor: d.mood.color }
                    : styles.barEmpty,
                ]}
              />
            </View>
            <Text style={[styles.day, d.isToday && styles.dayToday]}>{d.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        {moodOptions.map((m) => (
          <View key={m.key} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: m.color }]} />
            <Text style={styles.legendText}>{m.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  col: { alignItems: 'center', flex: 1 },
  track: { height: MAX_HEIGHT, justifyContent: 'flex-end' },
  bar: { width: 14, borderRadius: 7 },
  barEmpty: { height: 8, backgroundColor: colors.border },
  day: { fontSize: 11, color: colors.textMuted, marginTop: 6 },
  dayToday: { color: colors.primary, fontWeight: '800' },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10, color: colors.textSecondary },
});
