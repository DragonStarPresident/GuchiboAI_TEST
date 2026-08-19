import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '@/lib/theme';
import { ChatMessage } from '@/lib/storage';

export function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.row, isUser && styles.rowUser]}>
      {!isUser && (
        <View style={styles.avatar}>
          <Text style={styles.avatarEmoji}>😊</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser ? styles.bubbleUser : styles.bubbleAi,
          message.isCrisis && styles.bubbleCrisis,
        ]}
      >
        <Text style={[styles.text, isUser && styles.textUser]}>{message.content}</Text>
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
  rowUser: {
    justifyContent: 'flex-end',
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarEmoji: {
    fontSize: 14,
  },
  bubble: {
    maxWidth: '78%',
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
  bubbleCrisis: {
    backgroundColor: colors.dangerSoft,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.text,
  },
  textUser: {
    color: '#fff',
  },
});
