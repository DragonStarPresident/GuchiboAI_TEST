import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Logo } from '@/components/Brand';
import { ChatMessage } from '@/lib/storage';
import { colors, radius, spacing } from '@/lib/theme';

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser && <Logo size={30} style={styles.avatar} />}
      <View style={{ maxWidth: '78%' }}>
        <View
          style={[
            styles.bubble,
            isUser ? styles.bubbleUser : styles.bubbleAi,
            message.isCrisis && isUser && styles.bubbleCrisis,
          ]}
        >
          <Text style={[styles.text, isUser && !message.isCrisis && styles.textUser]}>{message.content}</Text>
        </View>
        {message.isDemo && <Text style={styles.demoLabel}>デモ応答（AI未接続）</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  rowUser: { justifyContent: 'flex-end' },
  avatar: { marginRight: spacing.sm, marginBottom: 2 },
  bubble: {
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  bubbleAi: {
    backgroundColor: colors.surface,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: colors.primaryLight,
    borderBottomRightRadius: 4,
  },
  bubbleCrisis: { backgroundColor: colors.dangerSoft },
  text: { fontSize: 15, lineHeight: 22, color: colors.text },
  textUser: { color: '#fff' },
  demoLabel: { fontSize: 10, color: colors.textMuted, marginTop: 4, marginLeft: 4 },
});
