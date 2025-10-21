import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { tokens } from '../tokens';

export interface ChatBubbleProps {
  mine?: boolean;
  children: React.ReactNode;
  testID?: string;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({
  mine = false,
  children,
  testID,
}) => {
  return (
    <View
      style={[styles.container, mine ? styles.containerMine : styles.containerOther]}
      testID={testID}
    >
      <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleOther]}>
        <Text style={[styles.text, mine ? styles.textMine : styles.textOther]}>
          {children}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: tokens.spacing.xs,
    paddingHorizontal: tokens.spacing.md,
  },
  containerMine: {
    justifyContent: 'flex-end',
  },
  containerOther: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    borderRadius: tokens.borderRadius.lg,
    paddingVertical: tokens.spacing.sm,
    paddingHorizontal: tokens.spacing.md,
  },
  bubbleMine: {
    backgroundColor: tokens.colors.bubbleSent,
    borderBottomRightRadius: tokens.borderRadius.sm,
  },
  bubbleOther: {
    backgroundColor: tokens.colors.bubbleReceived,
    borderBottomLeftRadius: tokens.borderRadius.sm,
    ...tokens.shadows.sm,
  },
  text: {
    fontSize: tokens.typography.fontSize.md,
    lineHeight: tokens.typography.lineHeight.md,
  },
  textMine: {
    color: tokens.colors.text,
  },
  textOther: {
    color: tokens.colors.text,
  },
});
