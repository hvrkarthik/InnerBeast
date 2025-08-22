import React, { useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { X, ArrowRight, ArrowLeft, Brain, Target, BookOpen, BarChart3, Shield } from 'lucide-react-native';
import { Storage, STORAGE_KEYS } from '@/utils/storage';

// const { width, height } = Dimensions.get('window');

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to InnerBeast',
    description: 'Transform your life with daily check-ins, goal tracking, and mindful growth. Let\'s unleash your inner beast! 🔥',
    icon: <Brain size={48} color="#6366F1" />,
    color: '#6366F1',
  },
  {
    id: 'checkin',
    title: 'Daily Check-ins',
    description: 'Start each day with intention. Reflect on your focus, mood, and goals to build self-awareness and consistency.',
    icon: <Brain size={48} color="#10B981" />,
    color: '#10B981',
  },
  {
    id: 'goals',
    title: 'Track Your Goals',
    description: 'Set meaningful goals and track your progress. Whether it\'s reading books, exercising, or learning new skills.',
    icon: <Target size={48} color="#F59E0B" />,
    color: '#F59E0B',
  },
  {
    id: 'journal',
    title: 'Journal & Focus',
    description: 'Document your thoughts and resist distractions. Build mental strength by logging what tries to pull you off track.',
    icon: <BookOpen size={48} color="#EC4899" />,
    color: '#EC4899',
  },
  {
    id: 'stats',
    title: 'Life Statistics',
    description: 'Track books read, places visited, and projects completed. See your life progress in beautiful visualizations.',
    icon: <BarChart3 size={48} color="#8B5CF6" />,
    color: '#8B5CF6',
  },
  {
    id: 'focus',
    title: 'Focus Tools',
    description: 'Create personal mantras and vision boards. Use reboot mode for distraction-free deep work sessions.',
    icon: <Shield size={48} color="#06B6D4" />,
    color: '#06B6D4',
  },
];

interface OnboardingTourProps {
  visible: boolean;
  onComplete: () => void;
}

export function OnboardingTour({ visible, onComplete }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleNext = () => {
    if (isAnimating) return;

    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentStep(currentStep + 1);
        setIsAnimating(false);
      }, 150);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (isAnimating || currentStep === 0) return;

    setIsAnimating(true);
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      setIsAnimating(false);
    }, 150);
  };

  const handleComplete = async () => {
    try {
      await Storage.set(STORAGE_KEYS.USER_PREFERENCES, { hasSeenOnboarding: true });
      onComplete(); // Call onComplete to close modal and navigate to app
    } catch (error) {
      console.error('Error saving onboarding completion:', error);
      // Proceed with onComplete even if storage fails to avoid blocking the user
      onComplete();
    } finally {
      setIsAnimating(false); // Ensure animation flag is reset
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const step = ONBOARDING_STEPS[currentStep];
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  // Log current step for debugging
  console.log(`Current step: ${currentStep}, Visible: ${visible}`);

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="fullScreen"
      onRequestClose={handleSkip}
    >
      <LinearGradient
        colors={['#111827', '#1F2937', '#374151']}
        style={styles.container}
      >
        {/* Skip Button */}
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <X size={24} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Typography variant="caption" color="#9CA3AF">
            {currentStep + 1} of {ONBOARDING_STEPS.length}
          </Typography>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <Card style={{ ...styles.stepCard, borderColor: `${step.color}30` }}>
            <View style={[styles.iconContainer, { backgroundColor: `${step.color}20` }]}>
              {step.icon}
            </View>
            
            <Typography variant="h1" color="#F9FAFB" style={styles.title}>
              {step.title}
            </Typography>
            
            <Typography variant="body" color="#E5E7EB" style={styles.description}>
              {step.description}
            </Typography>

            {/* Feature Highlights */}
            {step.id === 'welcome' && (
              <View style={styles.featuresContainer}>
                <View style={styles.featureItem}>
                  <Typography variant="body" color="#10B981">✓</Typography>
                  <Typography variant="caption" color="#9CA3AF">
                    Daily reflection & mood tracking
                  </Typography>
                </View>
                <View style={styles.featureItem}>
                  <Typography variant="body" color="#10B981">✓</Typography>
                  <Typography variant="caption" color="#9CA3AF">
                    Goal setting & progress visualization
                  </Typography>
                </View>
                <View style={styles.featureItem}>
                  <Typography variant="body" color="#10B981">✓</Typography>
                  <Typography variant="caption" color="#9CA3AF">
                    Life statistics & achievements
                  </Typography>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureItem}>
                    <Typography variant="body" color="#10B981">✓</Typography>
                    <Typography variant="caption" color="#9CA3AF">
                      Focus tools & distraction resistance
                    </Typography>
                  </View>
                </View>
              </View>
            )}
          </Card>
        </View>

        {/* Navigation */}
        <View style={styles.navigation}>
          <TouchableOpacity
            onPress={handlePrevious}
            style={[styles.navButton, currentStep === 0 && styles.navButtonDisabled]}
            disabled={currentStep === 0 || isAnimating}
          >
            <ArrowLeft size={20} color={currentStep === 0 ? '#6B7280' : '#F9FAFB'} />
            <Typography 
              variant="caption" 
              color={currentStep === 0 ? '#6B7280' : '#F9FAFB'}
            >
              Previous
            </Typography>
          </TouchableOpacity>

          <View style={styles.dots}>
            {ONBOARDING_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep && styles.activeDot,
                  { backgroundColor: index === currentStep ? step.color : '#374151' }
                ]}
              />
            ))}
          </View>

          <TouchableOpacity
            onPress={handleNext}
            style={[styles.navButton, styles.nextButton]}
            disabled={isAnimating}
          >
            <Typography variant="caption" color="#F9FAFB">
              {currentStep === ONBOARDING_STEPS.length - 1 ? 'Get Started' : 'Next'}
            </Typography>
            <ArrowRight size={20} color="#F9FAFB" />
          </TouchableOpacity>
        </View>

        {/* Bottom CTA */}
        {currentStep === ONBOARDING_STEPS.length - 1 && (
          <View style={styles.ctaContainer}>
            <Button
              title="Start Your Journey"
              onPress={handleComplete}
              size="lg"
              style={{ ...styles.ctaButton, backgroundColor: step.color }}
              disabled={isAnimating}
            />
            <Typography variant="caption" color="#9CA3AF" style={styles.ctaSubtext}>
              Ready to unleash your inner beast? 🚀
            </Typography>
          </View>
        )}
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  skipButton: {
    alignSelf: 'flex-end',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  progressContainer: {
    marginTop: 20,
    marginBottom: 40,
    alignItems: 'center',
    gap: 8,
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
    backgroundColor: '#6366F1',
    borderRadius: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCard: {
    width: '100%',
    maxWidth: 400,
    padding: 32,
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.8)',
    borderWidth: 1,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  featuresContainer: {
    width: '100%',
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(55, 65, 81, 0.5)',
    minWidth: 100,
    justifyContent: 'center',
  },
  navButtonDisabled: {
    opacity: 0.5,
  },
  nextButton: {
    backgroundColor: '#6366F1',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeDot: {
    width: 24,
  },
  ctaContainer: {
    alignItems: 'center',
    marginTop: 20,
    gap: 8,
  },
  ctaButton: {
    width: '100%',
    maxWidth: 300,
  },
  ctaSubtext: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});