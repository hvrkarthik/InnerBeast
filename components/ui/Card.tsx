import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  variant?: 'default' | 'elevated' | 'outlined';
}

export function Card({ children, style, padding = 20, variant = 'default' }: CardProps) {
  return (
    <View style={[styles.card, styles[variant], { padding }, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
  },
  default: {
    borderWidth: 1,
    borderColor: '#374151',
  },
  elevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#374151',
  },
  outlined: {
    borderWidth: 2,
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
});