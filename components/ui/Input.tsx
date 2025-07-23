import React, { useState } from 'react';
import { TextInput, StyleSheet, TextInputProps, ViewStyle, View } from 'react-native';
import { Typography } from './Typography';

interface InputProps extends TextInputProps {
  style?: ViewStyle;
  label?: string;
  error?: string;
  helperText?: string;
}

export function Input({ style, label, error, helperText, ...props }: InputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Typography variant="caption" color="#9CA3AF" style={styles.label}>
          {label}
        </Typography>
      )}
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          error && styles.inputError,
          style
        ]}
        placeholderTextColor="#9CA3AF"
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        accessibilityLabel={label || props.placeholder}
        {...props}
      />
      {error && (
        <Typography variant="caption" color="#EF4444" style={styles.errorText}>
          {error}
        </Typography>
      )}
      {helperText && !error && (
        <Typography variant="caption" color="#6B7280" style={styles.helperText}>
          {helperText}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#F9FAFB',
    minHeight: 44,
  },
  inputFocused: {
    borderColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  inputError: {
    borderColor: '#EF4444',
  },
  errorText: {
    marginTop: 4,
  },
  helperText: {
    marginTop: 4,
  },
});