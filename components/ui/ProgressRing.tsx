import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Typography } from './Typography';

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  showPercentage?: boolean;
  animated?: boolean;
  duration?: number;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
  color = '#6366F1',
  backgroundColor = '#374151',
  showPercentage = true,
  animated = true,
  duration = 1000,
}: ProgressRingProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  // Ensure safe values
  const safeProgress = typeof progress === 'number' && !isNaN(progress) ? Math.max(0, Math.min(100, progress)) : 0;
  const safeSize = typeof size === 'number' && size > 0 ? size : 120;
  const safeStrokeWidth = typeof strokeWidth === 'number' && strokeWidth > 0 ? strokeWidth : 8;
  const safeDuration = typeof duration === 'number' && duration > 0 ? duration : 1000;
  
  const radius = (safeSize - safeStrokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  useEffect(() => {
    try {
      if (animated) {
        Animated.timing(animatedValue, {
          toValue: safeProgress,
          duration: safeDuration,
          useNativeDriver: false,
        }).start();
      } else {
        animatedValue.setValue(safeProgress);
      }
    } catch (error) {
      console.error('Error in ProgressRing animation:', error);
      animatedValue.setValue(safeProgress);
    }
  }, [safeProgress, animated, safeDuration]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={[styles.container, { width: safeSize, height: safeSize }]}>
      <Svg width={safeSize} height={safeSize} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={safeSize / 2}
          cy={safeSize / 2}
          r={radius}
          stroke={backgroundColor}
          strokeWidth={safeStrokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <AnimatedCircle
          cx={safeSize / 2}
          cy={safeSize / 2}
          r={radius}
          stroke={color}
          strokeWidth={safeStrokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${safeSize / 2} ${safeSize / 2})`}
        />
      </Svg>
      {showPercentage && (
        <View style={styles.textContainer}>
          <Typography variant="h3" color="#F9FAFB" style={styles.percentage}>
            {Math.round(safeProgress)}%
          </Typography>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  percentage: {
    fontWeight: 'bold',
  },
});