import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';
import { Typography } from './Typography';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  color?: string;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'overline';
  suffix?: string;
  prefix?: string;
}

export function AnimatedCounter({
  value,
  duration = 1000,
  color = '#F9FAFB',
  variant = 'h2',
  suffix = '',
  prefix = '',
}: AnimatedCounterProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const displayValue = useRef(0);

  useEffect(() => {
    try {
      const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
      const safeDuration = typeof duration === 'number' && duration > 0 ? duration : 1000;
      
      const listener = animatedValue.addListener(({ value: animValue }) => {
        displayValue.current = Math.round(animValue);
      });

      Animated.timing(animatedValue, {
        toValue: safeValue,
        duration: safeDuration,
        useNativeDriver: false,
      }).start();

      return () => {
        animatedValue.removeListener(listener);
      };
    } catch (error) {
      console.error('Error in AnimatedCounter:', error);
      displayValue.current = typeof value === 'number' ? value : 0;
    }
  }, [value, duration]);

  const displayText = `${prefix || ''}${Math.round(displayValue.current)}${suffix || ''}`;

  return (
    <Animated.View>
      <Typography variant={variant} color={color}>
        {displayText}
      </Typography>
    </Animated.View>
  );
}