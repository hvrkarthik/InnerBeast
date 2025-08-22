import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';
import { StreakCalendar } from '@/components/features/StreakCalendar';
import { QuickActions } from '@/components/features/QuickActions';
import { AchievementBadge } from '@/components/features/AchievementBadge';
import { OnboardingTour } from '@/components/features/OnboardingTour';
import { Brain, TrendingUp, Flame, Trophy, CheckCircle, AlertCircle } from 'lucide-react-native';
import { Storage, STORAGE_KEYS } from '@/utils/storage';
import { DailyCheckIn, LifeStat } from '@/types';
import { formatDisplayDate, getDaysInStreak } from '@/utils/dateHelpers';
import { calculateAchievements } from '@/utils/achievements';
import { router } from 'expo-router';

export default function Dashboard() {
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null);
  const [lifeStats, setLifeStats] = useState<LifeStat[]>([]);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [focusStreak, setFocusStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkOnboardingStatus();
    loadDashboardData();
  }, []);

  type UserPreferences = {
    hasSeenOnboarding?: boolean;
    // add other preference properties here if needed
  };

  const checkOnboardingStatus = async () => {
    try {
      const preferences = await Storage.get<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
      if (!preferences?.hasSeenOnboarding) {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setError(null);
      
      const [checkInsResult, statsResult] = await Promise.all([
        Storage.get<DailyCheckIn[]>(STORAGE_KEYS.DAILY_CHECKINS),
        Storage.get<LifeStat[]>(STORAGE_KEYS.LIFE_STATS)
      ]);
      
      const checkInsData = Array.isArray(checkInsResult) ? checkInsResult : [];
      const today = new Date().toISOString().split('T')[0];
      const todayCheckIn = checkInsData.find(c => c?.date === today) || null;
      
      const stats = Array.isArray(statsResult) ? statsResult : [];
      const streak = getDaysInStreak(checkInsData.map(c => c?.date).filter((date): date is string => Boolean(date)));
      
      const userAchievements = calculateAchievements(checkInsData, stats);
      
      setTodayCheckIn(todayCheckIn);
      setLifeStats(stats.slice(0, 3));
      setCheckIns(checkInsData);
      setFocusStreak(streak);
      setAchievements(userAchievements);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleStartCheckIn = () => {
    try {
      router.push('/(tabs)/checkin');
    } catch (error) {
      console.error('Error navigating to check-in:', error);
    }
  };

  const handleCompleteOnboarding = () => {
    setShowOnboarding(false);
  };

  const getGreeting = () => {
    try {
      const hour = new Date().getHours();
      if (hour < 12) return 'Good Morning';
      if (hour < 17) return 'Good Afternoon';
      return 'Good Evening';
    } catch (error) {
      return 'Hello';
    }
  };

  const getMotivationalQuote = () => {
    const quotes = [
      "Every master was once a disaster.",
      "Progress, not perfection.",
      "Small steps, big dreams.",
      "Your only limit is you.",
      "Consistency beats perfection.",
      "Growth begins at the end of your comfort zone.",
      "The best time to plant a tree was 20 years ago. The second best time is now.",
      "Success is the sum of small efforts repeated day in and day out.",
      "Don't watch the clock; do what it does. Keep going.",
      "The future depends on what you do today.",
    ];
    
    try {
      const today = new Date().getDate();
      return quotes[today % quotes.length];
    } catch (error) {
      return quotes[0];
    }
  };

  const getOverallProgress = () => {
    try {
      if (!Array.isArray(lifeStats) || lifeStats.length === 0) return 0;
      
      const validStats = lifeStats.filter(stat => 
        stat && 
        typeof stat.progress === 'number' && 
        typeof stat.target === 'number' && 
        stat.target > 0
      );
      
      if (validStats.length === 0) return 0;
      
      const totalProgress = validStats.reduce((sum, stat) => {
        const percentage = (stat.progress / stat.target) * 100;
        return sum + Math.min(percentage, 100);
      }, 0);
      
      return Math.min(totalProgress / validStats.length, 100);
    } catch (error) {
      console.error('Error calculating overall progress:', error);
      return 0;
    }
  };

  const unlockedAchievements = Array.isArray(achievements) ? achievements.filter(a => a?.unlocked) : [];
  const totalGoals = Array.isArray(lifeStats) ? lifeStats.length : 0;
  const completedGoals = Array.isArray(lifeStats) ? lifeStats.filter(stat => 
    stat && 
    typeof stat.progress === 'number' && 
    typeof stat.target === 'number' && 
    stat.progress >= stat.target
  ).length : 0;

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#111827', '#1F2937']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Brain size={48} color="#6366F1" />
            <Typography variant="body" color="#9CA3AF" style={styles.loadingText}>
              Loading your progress...
            </Typography>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#111827', '#1F2937']}
        style={styles.gradient}
      >
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#6366F1"
              colors={['#6366F1']}
            />
          }
        >
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.headerText}>
                <Typography variant="h1" color="#F9FAFB">
                  InnerBeast
                </Typography>
                <Typography variant="body" color="#9CA3AF">
                  {getGreeting()}, Warrior
                </Typography>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push('/(tabs)/stats')}>
              <Trophy size={28} color="#F59E0B" />
            </TouchableOpacity>
          </View>

          {error && (
            <Card style={{ ...styles.messageCard, ...styles.errorCard }}>
              <View style={styles.messageContent}>
                <AlertCircle size={20} color="#EF4444" />
                <Typography variant="body" color="#EF4444" style={styles.messageText}>
                  {error}
                </Typography>
                <TouchableOpacity onPress={loadDashboardData} style={styles.retryButton}>
                  <Typography variant="caption" color="#6366F1">
                    Retry
                  </Typography>
                </TouchableOpacity>
              </View>
            </Card>
          )}

          <Card style={styles.quoteCard}>
            <Typography variant="h3" color="#6366F1" style={styles.quoteText}>
              "{getMotivationalQuote()}"
            </Typography>
          </Card>

          <View style={styles.statsOverview}>
            <Card style={styles.streakCard}>
              <View style={styles.streakContent}>
                <View style={styles.streakIcon}>
                  <Flame size={32} color="#F59E0B" />
                </View>
                <View style={styles.streakInfo}>
                  <AnimatedCounter value={focusStreak} variant="h2" />
                  <Typography variant="caption" color="#9CA3AF">
                    Day Focus Streak
                  </Typography>
                </View>
              </View>
            </Card>

            <Card style={styles.progressCard}>
              <ProgressRing
                progress={getOverallProgress()}
                size={80}
                strokeWidth={6}
                color="#6366F1"
              />
              <Typography variant="caption" color="#9CA3AF" style={styles.progressLabel}>
                Overall Progress
              </Typography>
            </Card>
          </View>

          <View style={styles.quickStats}>
            <Card style={styles.quickStatCard}>
              <Typography variant="h3" color="#10B981">
                {Array.isArray(checkIns) ? checkIns.length : 0}
              </Typography>
              <Typography variant="caption" color="#9CA3AF">
                Check-ins
              </Typography>
            </Card>
            <Card style={styles.quickStatCard}>
              <Typography variant="h3" color="#6366F1">
                {completedGoals}/{totalGoals}
              </Typography>
              <Typography variant="caption" color="#9CA3AF">
                Goals Done
              </Typography>
            </Card>
            <Card style={styles.quickStatCard}>
              <Typography variant="h3" color="#F59E0B">
                {unlockedAchievements.length}
              </Typography>
              <Typography variant="caption" color="#9CA3AF">
                Achievements
              </Typography>
            </Card>
          </View>

          <Card style={styles.checkInCard}>
            <View style={styles.checkInHeader}>
              <Brain size={24} color="#6366F1" />
              <Typography variant="h3" color="#F9FAFB">
                Today's Check-in
              </Typography>
            </View>
            {todayCheckIn ? (
              <View style={styles.checkInCompleted}>
                <View style={styles.checkInCompletedHeader}>
                  <CheckCircle size={20} color="#10B981" />
                  <Typography variant="body" color="#10B981">
                    Completed - {formatDisplayDate(todayCheckIn.date)}
                  </Typography>
                </View>
                <Typography variant="caption" color="#9CA3AF" style={styles.checkInPreview}>
                  Focus: {todayCheckIn.focus?.substring(0, 50) || 'No focus set'}...
                </Typography>
                <Typography variant="caption" color="#9CA3AF">
                  Mood: {['😢', '😕', '😐', '🙂', '😊'][todayCheckIn.mood] || '😐'} • Feeling: {todayCheckIn.feeling?.substring(0, 30) || 'No feeling recorded'}...
                </Typography>
              </View>
            ) : (
              <View style={styles.checkInPending}>
                <Typography variant="body" color="#F59E0B" style={styles.checkInPendingText}>
                  Ready for your daily check-in?
                </Typography>
                <Typography variant="caption" color="#9CA3AF" style={styles.checkInHint}>
                  Start your day with intention and reflection
                </Typography>
                <Button
                  title="Start Check-in"
                  onPress={handleStartCheckIn}
                  style={styles.checkInButton}
                />
              </View>
            )}
          </Card>

          {Array.isArray(lifeStats) && lifeStats.length > 0 && (
            <Card style={styles.statsCard}>
              <View style={styles.statsHeader}>
                <TrendingUp size={24} color="#6366F1" />
                <Typography variant="h3" color="#F9FAFB">
                  Life Goals
                </Typography>
                <TouchableOpacity onPress={() => router.push('/(tabs)/stats')}>
                  <Typography variant="caption" color="#6366F1">
                    View All
                  </Typography>
                </TouchableOpacity>
              </View>
              <View style={styles.statsGrid}>
                {lifeStats.map((stat) => {
                  if (!stat || typeof stat.progress !== 'number' || typeof stat.target !== 'number') {
                    return null;
                  }
                  
                  return (
                    <View key={stat.id} style={styles.statItem}>
                      <View style={styles.statHeader}>
                        <Typography variant="caption" color="#9CA3AF">
                          {stat.title || 'Untitled Goal'}
                        </Typography>
                        <Typography variant="overline" color="#6366F1">
                          {stat.target > 0 ? Math.round((stat.progress / stat.target) * 100) : 0}%
                        </Typography>
                      </View>
                      <View style={styles.statProgress}>
                        <View style={styles.progressBar}>
                          <View 
                            style={[
                              styles.progressFill, 
                              { width: `${stat.target > 0 ? Math.min((stat.progress / stat.target) * 100, 100) : 0}%` }
                            ]} 
                          />
                        </View>
                        <Typography variant="caption" color="#F9FAFB">
                          {stat.progress}/{stat.target} {stat.unit || 'items'}
                        </Typography>
                      </View>
                    </View>
                  );
                })}
              </View>
            </Card>
          )}

          {unlockedAchievements.length > 0 && (
            <View style={styles.achievementsSection}>
              <Typography variant="h3" color="#F9FAFB" style={styles.sectionTitle}>
                Recent Achievements
              </Typography>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.achievementsScroll}>
                {unlockedAchievements.slice(0, 5).map((achievement) => (
                  <View key={achievement.id} style={styles.achievementItem}>
                    <AchievementBadge achievement={achievement} size="medium" />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.calendarSection}>
            <StreakCalendar checkinDates={Array.isArray(checkIns) ? checkIns.map(c => c?.date).filter((date): date is string => Boolean(date)) : []} />
          </View>

          <QuickActions />

          <View style={styles.bottomPadding} />
        </ScrollView>

        <OnboardingTour
          visible={showOnboarding}
          onComplete={handleCompleteOnboarding}
        />
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  gradient: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerText: {
    flex: 1,
  },
  messageCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  messageText: {
    flex: 1,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 6,
  },
  quoteCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  quoteText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  statsOverview: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  streakCard: {
    flex: 2,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakIcon: {
    marginRight: 16,
  },
  streakInfo: {
    flex: 1,
  },
  progressCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.2)',
  },
  progressLabel: {
    marginTop: 8,
    textAlign: 'center',
  },
  quickStats: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  quickStatCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  checkInCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  checkInHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  checkInCompleted: {
    padding: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    gap: 8,
  },
  checkInCompletedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkInPending: {
    padding: 16,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    alignItems: 'center',
    gap: 8,
  },
  checkInPendingText: {
    textAlign: 'center',
    fontWeight: '600',
  },
  checkInPreview: {
    marginTop: 4,
  },
  checkInHint: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  checkInButton: {
    marginTop: 8,
    minWidth: 150,
  },
  statsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statsGrid: {
    gap: 16,
  },
  statItem: {
    gap: 8,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  achievementsScroll: {
    flexDirection: 'row',
  },
  achievementItem: {
    marginRight: 12,
  },
  calendarSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bottomPadding: {
    height: 20,
  },
});