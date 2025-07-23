import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, Platform } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  loading?: boolean;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  textStyle,
  loading = false,
}: ButtonProps) {
  const handlePress = () => {
    if (disabled || loading) return;
    
    // Add haptic feedback for native platforms
    if (Platform.OS !== 'web') {
      try {
        import('expo-haptics').then(({ impactAsync, ImpactFeedbackStyle }) => {
          impactAsync(ImpactFeedbackStyle.Light);
        });
      } catch (error) {
        // Haptics not available, continue silently
      }
    }
    
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        (disabled || loading) && styles.disabled,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      <Text style={[
        styles.text, 
        styles[`${variant}Text`], 
        styles[`${size}Text`], 
        textStyle
      ]}>
        {loading ? 'Loading...' : title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 44, // Minimum touch target size
  },
  
  // Variants
  primary: {
    backgroundColor: '#6366F1',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  secondary: {
    backgroundColor: '#374151',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#6366F1',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  
  // Sizes
  sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  lg: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    minHeight: 52,
  },
  
  // Text styles
  text: {
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#E5E7EB',
  },
  outlineText: {
    color: '#6366F1',
  },
  ghostText: {
    color: '#9CA3AF',
  },
  
  // Text sizes
  smText: {
    fontSize: 14,
    lineHeight: 20,
  },
  mdText: {
    fontSize: 16,
    lineHeight: 24,
  },
  lgText: {
    fontSize: 18,
    lineHeight: 28,
  },
  
  disabled: {
    opacity: 0.5,
  },
});