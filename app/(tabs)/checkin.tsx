import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Brain, Heart, Target, X, CheckCircle, AlertCircle } from 'lucide-react-native';
import { Storage, STORAGE_KEYS } from '@/utils/storage';
import { DailyCheckIn } from '@/types';
import { formatDate } from '@/utils/dateHelpers';

const MOOD_EMOJIS = ['😢', '😕', '😐', '🙂', '😊'];
const MOOD_LABELS = ['Terrible', 'Poor', 'Okay', 'Good', 'Excellent'];

export default function CheckIn() {
  const [focus, setFocus] = useState('');
  const [mood, setMood] = useState(3);
  const [feeling, setFeeling] = useState('');
  const [avoidance, setAvoidance] = useState('');
  const [journal, setJournal] = useState('');
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [todayCheckIn, setTodayCheckIn] = useState<DailyCheckIn | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    checkTodayStatus();
  }, []);

  const checkTodayStatus = async () => {
    try {
      setError(null);
      const checkIns = await Storage.get<DailyCheckIn[]>(STORAGE_KEYS.DAILY_CHECKINS) || [];
      const today = formatDate(new Date());
      const todayCheckIn = checkIns.find(c => c.date === today);
      
      if (todayCheckIn) {
        setHasCheckedInToday(true);
        setTodayCheckIn(todayCheckIn);
        // Pre-fill form with today's data
        setFocus(todayCheckIn.focus);
        setMood(todayCheckIn.mood);
        setFeeling(todayCheckIn.feeling);
        setAvoidance(todayCheckIn.avoidance);
        setJournal(todayCheckIn.journal || '');
      }
    } catch (error) {
      console.error('Error checking today status:', error);
      setError('Failed to load your check-in data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!focus.trim()) {
      setError('Please enter your focus for today.');
      return false;
    }
    if (!feeling.trim()) {
      setError('Please describe how you\'re feeling today.');
      return false;
    }
    if (focus.trim().length < 3) {
      setError('Please provide a more detailed focus (at least 3 characters).');
      return false;
    }
    if (feeling.trim().length < 3) {
      setError('Please provide a more detailed description of your feelings (at least 3 characters).');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const checkIns = await Storage.get<DailyCheckIn[]>(STORAGE_KEYS.DAILY_CHECKINS) || [];
      const today = formatDate(new Date());
      
      const newCheckIn: DailyCheckIn = {
        id: hasCheckedInToday ? todayCheckIn!.id : Date.now().toString(),
        date: today,
        focus: focus.trim(),
        mood,
        feeling: feeling.trim(),
        avoidance: avoidance.trim(),
        journal: journal.trim(),
        timestamp: Date.now(),
      };

      let updatedCheckIns;
      if (hasCheckedInToday) {
        // Update existing check-in
        updatedCheckIns = checkIns.map(c => c.id === newCheckIn.id ? newCheckIn : c);
        setSuccess('Your check-in has been updated successfully! 🎉');
      } else {
        // Add new check-in
        updatedCheckIns = [...checkIns, newCheckIn];
        setSuccess('Great job on completing your daily check-in! 🔥');
      }

      await Storage.set(STORAGE_KEYS.DAILY_CHECKINS, updatedCheckIns);
      
      setHasCheckedInToday(true);
      setTodayCheckIn(newCheckIn);

      // Provide haptic feedback on mobile
      if (Platform.OS !== 'web') {
        try {
          const { impactAsync, ImpactFeedbackStyle } = await import('expo-haptics');
          impactAsync(ImpactFeedbackStyle.Medium);
        } catch (error) {
          // Haptics not available, continue silently
        }
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (error) {
      console.error('Error saving check-in:', error);
      setError('Failed to save your check-in. Please check your connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const clearForm = () => {
    setFocus('');
    setMood(3);
    setFeeling('');
    setAvoidance('');
    setJournal('');
    setError(null);
    setSuccess(null);
  };

  const resetToday = () => {
    Alert.alert(
      'Reset Today\'s Check-in',
      'Are you sure you want to start over? This will clear all your current entries.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            clearForm();
            setHasCheckedInToday(false);
            setTodayCheckIn(null);
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#111827', '#1F2937']} style={styles.gradient}>
          <View style={styles.loadingContainer}>
            <Brain size={48} color="#6366F1" />
            <Typography variant="body" color="#9CA3AF" style={styles.loadingText}>
              Loading your check-in...
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
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <Brain size={32} color="#6366F1" />
              <View style={styles.headerText}>
                <Typography variant="h2" color="#F9FAFB">
                  Daily Check-in
                </Typography>
                <Typography variant="caption" color="#9CA3AF">
                  {hasCheckedInToday ? 'Update your' : 'Start your'} daily reflection
                </Typography>
              </View>
            </View>
            {hasCheckedInToday && (
              <TouchableOpacity onPress={resetToday} style={styles.resetButton}>
                <X size={20} color="#EF4444" />
                <Typography variant="caption" color="#EF4444" style={styles.resetText}>
                  Reset
                </Typography>
              </TouchableOpacity>
            )}
          </View>

          {/* Status Messages */}
          {error && (
            <Card style={[styles.messageCard, styles.errorCard]} variant="outlined">
              <View style={styles.messageContent}>
                <AlertCircle size={20} color="#EF4444" />
                <Typography variant="body" color="#EF4444" style={styles.messageText}>
                  {error}
                </Typography>
              </View>
            </Card>
          )}

          {success && (
            <Card style={[styles.messageCard, styles.successCard]} variant="outlined">
              <View style={styles.messageContent}>
                <CheckCircle size={20} color="#10B981" />
                <Typography variant="body" color="#10B981" style={styles.messageText}>
                  {success}
                </Typography>
              </View>
            </Card>
          )}

          {/* Focus Question */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Target size={20} color="#6366F1" />
              <Typography variant="h3" color="#F9FAFB">
                What are you focusing on today? *
              </Typography>
            </View>
            <Input
              value={focus}
              onChangeText={(text) => {
                setFocus(text);
                setError(null);
              }}
              placeholder="My main focus for today is to complete my project, exercise for 30 minutes..."
              multiline
              numberOfLines={3}
              style={styles.textArea}
              maxLength={500}
            />
            <Typography variant="overline" color="#6B7280" style={styles.charCount}>
              {focus.length}/500
            </Typography>
          </Card>

          {/* Mood Selector */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Heart size={20} color="#EC4899" />
              <Typography variant="h3" color="#F9FAFB">
                How are you feeling?
              </Typography>
            </View>
            <View style={styles.moodSelector}>
              {MOOD_EMOJIS.map((emoji, index) => (
                <View key={index} style={styles.moodOption}>
                  <TouchableOpacity
                    onPress={() => setMood(index)}
                    style={[
                      styles.moodButton,
                      mood === index && styles.selectedMoodButton
                    ]}
                    activeOpacity={0.7}
                    accessibilityRole="button"
                    accessibilityLabel={`${MOOD_LABELS[index]} mood`}
                  >
                    <Typography variant="body" style={styles.moodEmoji}>
                      {emoji}
                    </Typography>
                  </TouchableOpacity>
                  <Typography 
                    variant="caption" 
                    color={mood === index ? '#6366F1' : '#9CA3AF'}
                    style={styles.moodLabel}
                  >
                    {MOOD_LABELS[index]}
                  </Typography>
                </View>
              ))}
            </View>
          </Card>

          {/* Feeling Description */}
          <Card style={styles.section}>
            <Typography variant="h3" color="#F9FAFB" style={styles.questionTitle}>
              Describe how you're feeling today *
            </Typography>
            <Input
              value={feeling}
              onChangeText={(text) => {
                setFeeling(text);
                setError(null);
              }}
              placeholder="I'm feeling energetic and ready to tackle my goals. I'm excited about the challenges ahead..."
              multiline
              numberOfLines={3}
              style={styles.textArea}
              maxLength={500}
            />
            <Typography variant="overline" color="#6B7280" style={styles.charCount}>
              {feeling.length}/500
            </Typography>
          </Card>

          {/* Avoidance Question */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <X size={20} color="#EF4444" />
              <Typography variant="h3" color="#F9FAFB">
                What will you NOT do today?
              </Typography>
            </View>
            <Input
              value={avoidance}
              onChangeText={setAvoidance}
              placeholder="I will avoid social media scrolling, procrastination, negative self-talk..."
              multiline
              numberOfLines={2}
              style={styles.textArea}
              maxLength={300}
            />
            <Typography variant="overline" color="#6B7280" style={styles.charCount}>
              {avoidance.length}/300
            </Typography>
          </Card>

          {/* Optional Journal */}
          <Card style={styles.section}>
            <Typography variant="h3" color="#F9FAFB" style={styles.questionTitle}>
              Additional thoughts (optional)
            </Typography>
            <Typography variant="caption" color="#9CA3AF" style={styles.subtitle}>
              Any other reflections, plans, or insights for today
            </Typography>
            <Input
              value={journal}
              onChangeText={setJournal}
              placeholder="Today I'm grateful for... I learned that... I want to remember..."
              multiline
              numberOfLines={4}
              style={styles.textArea}
              maxLength={1000}
            />
            <Typography variant="overline" color="#6B7280" style={styles.charCount}>
              {journal.length}/1000
            </Typography>
          </Card>

          {/* Submit Button */}
          <View style={styles.submitSection}>
            <Button
              title={
                saving 
                  ? 'Saving...' 
                  : hasCheckedInToday 
                    ? 'Update Check-in' 
                    : 'Complete Check-in'
              }
              onPress={handleSubmit}
              size="lg"
              style={styles.submitButton}
              disabled={saving}
              loading={saving}
            />
            <Typography variant="caption" color="#6B7280" style={styles.submitHint}>
              * Required fields
            </Typography>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
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
    marginLeft: 12,
    flex: 1,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  resetText: {
    fontSize: 12,
  },
  messageCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: '#EF4444',
  },
  successCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: '#10B981',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  messageText: {
    flex: 1,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  questionTitle: {
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 16,
    fontStyle: 'italic',
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  charCount: {
    textAlign: 'right',
    marginTop: 4,
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moodOption: {
    alignItems: 'center',
    flex: 1,
  },
  moodButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginBottom: 8,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedMoodButton: {
    borderColor: '#6366F1',
    backgroundColor: 'rgba(99, 102, 241, 0.2)',
  },
  moodEmoji: {
    fontSize: 24,
  },
  moodLabel: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  submitSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  submitButton: {
    width: '100%',
    marginBottom: 8,
  },
  submitHint: {
    textAlign: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});