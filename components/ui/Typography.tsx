import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'overline';
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
}

export function Typography({
  children,
  variant = 'body',
  color = '#F9FAFB',
  style,
  numberOfLines,
}: TypographyProps) {
  return (
    <Text
      style={[styles[variant], { color }, style]}
      numberOfLines={numberOfLines}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontFamily: 'SpaceGrotesk-Bold',
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontFamily: 'SpaceGrotesk-SemiBold',
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontFamily: 'SpaceGrotesk-SemiBold',
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    lineHeight: 20,
  },
  overline: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    lineHeight: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});