import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Card';
import { Brain, Target, BookOpen, MapPin, Zap, Trophy } from 'lucide-react-native';
import { router } from 'expo-router';

interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}

export function QuickActions() {
  const actions: QuickAction[] = [
    {
      id: 'checkin',
      title: 'Daily Check-in',
      subtitle: 'Reflect on today',
      icon: <Brain size={24} color="#6366F1" />,
      color: '#6366F1',
      onPress: () => router.push('/(tabs)/checkin'),
    },
    {
      id: 'goal',
      title: 'Add Goal',
      subtitle: 'Set new target',
      icon: <Target size={24} color="#10B981" />,
      color: '#10B981',
      onPress: () => router.push('/(tabs)/stats'),
    },
    {
      id: 'journal',
      title: 'Journal',
      subtitle: 'Write thoughts',
      icon: <BookOpen size={24} color="#F59E0B" />,
      color: '#F59E0B',
      onPress: () => router.push('/(tabs)/journal'),
    },
    {
      id: 'focus',
      title: 'Focus Mode',
      subtitle: 'Enter the zone',
      icon: <Zap size={24} color="#EC4899" />,
      color: '#EC4899',
      onPress: () => router.push('/(tabs)/focus'),
    },
  ];

  return (
    <View style={styles.container}>
      <Typography variant="h3" color="#F9FAFB" style={styles.title}>
        Quick Actions
      </Typography>
      <View style={styles.actionsGrid}>
        {actions.map((action) => (
          <TouchableOpacity
            key={action.id}
            onPress={action.onPress}
            style={styles.actionButton}
          >
            <Card style={[styles.actionCard, { borderColor: `${action.color}20` }]}>
              <View style={[styles.iconContainer, { backgroundColor: `${action.color}20` }]}>
                {action.icon}
              </View>
              <Typography variant="caption" color="#F9FAFB" style={styles.actionTitle}>
                {action.title}
              </Typography>
              <Typography variant="overline" color="#9CA3AF" style={styles.actionSubtitle}>
                {action.subtitle}
              </Typography>
            </Card>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
  },
  actionCard: {
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    textAlign: 'center',
    marginBottom: 4,
    fontWeight: '600',
  },
  actionSubtitle: {
    textAlign: 'center',
  },
});