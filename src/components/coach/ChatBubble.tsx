import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { Typography } from '../ui/Typography';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export function ChatBubble({ role, content, isStreaming = false }: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <View style={[styles.wrapper, isUser ? styles.wrapperUser : styles.wrapperAssistant]}>
      <Typography
        variant="captionBold"
        color={Colors.textMuted}
        style={[styles.senderLabel, isUser ? styles.senderLabelUser : null]}
      >
        {isUser ? 'YOU' : 'AI COACH'}
      </Typography>

      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Typography
          variant="body"
          color={isUser ? Colors.textInverse : Colors.text}
          style={styles.messageText}
        >
          {content}
          {isStreaming ? (
            <Typography variant="monoBold" color={Colors.accent}>
              {' |'}
            </Typography>
          ) : null}
        </Typography>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: Spacing.xs + 2,
    maxWidth: '88%',
  },
  wrapperUser: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  wrapperAssistant: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderLabel: {
    fontSize: 10,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  senderLabelUser: {
    textAlign: 'right',
  },
  bubble: {
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
  },
  bubbleUser: {
    backgroundColor: Colors.accent,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  bubbleAssistant: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageText: {
    lineHeight: 22,
  },
});
