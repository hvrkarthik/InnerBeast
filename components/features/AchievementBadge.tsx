import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Trophy, Star, Target, Flame } from 'lucide-react-native';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'target' | 'flame';
  color: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'small' | 'medium' | 'large';
}

export function AchievementBadge({ achievement, size = 'medium' }: AchievementBadgeProps) {
  const getIcon = () => {
    const iconSize = size === 'small' ? 16 : size === 'medium' ? 24 : 32;
    const iconColor = achievement.unlocked ? achievement.color : '#6B7280';

    switch (achievement.icon) {
      case 'trophy':
        return <Trophy size={iconSize} color={iconColor} />;
      case 'star':
        return <Star size={iconSize} color={iconColor} fill={achievement.unlocked ? iconColor : 'none'} />;
      case 'target':
        return <Target size={iconSize} color={iconColor} />;
      case 'flame':
        return <Flame size={iconSize} color={iconColor} />;
      default:
        return <Trophy size={iconSize} color={iconColor} />;
    }
  };

  const cardStyle = [
    styles.card,
    styles[`${size}Card`],
    achievement.unlocked && { borderColor: achievement.color, borderWidth: 2 },
    !achievement.unlocked && styles.lockedCard,
  ];

  return (
    <Card style={cardStyle}>
      <View style={[styles.iconContainer, styles[`${size}IconContainer`]]}>
        {getIcon()}
      </View>
      <Typography
        variant={size === 'small' ? 'overline' : 'caption'}
        color={achievement.unlocked ? '#F9FAFB' : '#6B7280'}
        style={styles.title}
      >
        {achievement.title}
      </Typography>
      {size !== 'small' && (
        <Typography
          variant="overline"
          color={achievement.unlocked ? '#9CA3AF' : '#6B7280'}
          style={styles.description}
        >
          {achievement.description}
        </Typography>
      )}
      {achievement.progress !== undefined && achievement.maxProgress && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                  backgroundColor: achievement.unlocked ? achievement.color : '#6B7280',
                },
              ]}
            />
          </View>
          <Typography variant="overline" color="#9CA3AF">
            {achievement.progress}/{achievement.maxProgress}
          </Typography>
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: '#1F2937',
  },
  smallCard: {
    padding: 8,
    minWidth: 80,
  },
  mediumCard: {
    padding: 12,
    minWidth: 120,
  },
  largeCard: {
    padding: 16,
    minWidth: 160,
  },
  lockedCard: {
    opacity: 0.6,
  },
  iconContainer: {
    borderRadius: 50,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  smallIconContainer: {
    width: 32,
    height: 32,
  },
  mediumIconContainer: {
    width: 48,
    height: 48,
  },
  largeIconContainer: {
    width: 64,
    height: 64,
  },
  title: {
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '600',
  },
  description: {
    textAlign: 'center',
    marginBottom: 8,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 4,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#374151',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
});