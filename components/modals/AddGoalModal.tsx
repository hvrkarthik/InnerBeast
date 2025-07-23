import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Target, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import { Storage, STORAGE_KEYS } from '@/utils/storage';
import { LifeStat } from '@/types';

interface AddGoalModalProps {
  visible: boolean;
  onClose: () => void;
  onGoalAdded: () => void;
}

const CATEGORIES = [
  { id: 'career', label: 'Career', color: '#6366F1', icon: '💼' },
  { id: 'health', label: 'Health', color: '#10B981', icon: '💪' },
  { id: 'habits', label: 'Habits', color: '#F59E0B', icon: '🔄' },
  { id: 'personal', label: 'Personal', color: '#EC4899', icon: '🌟' },
] as const;

const GOAL_EXAMPLES = {
  career: ['Complete 5 projects', 'Learn 3 new skills', 'Attend 10 networking events'],
  health: ['Exercise 100 times', 'Drink 2000 glasses of water', 'Sleep 8 hours for 30 days'],
  habits: ['Read 24 books', 'Meditate 365 days', 'Write 100 journal entries'],
  personal: ['Visit 10 new places', 'Learn 50 new recipes', 'Complete 5 courses'],
};

export function AddGoalModal({ visible, onClose, onGoalAdded }: AddGoalModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('');
  const [category, setCategory] = useState<'career' | 'health' | 'habits' | 'personal'>('career');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTarget('');
    setUnit('');
    setCategory('career');
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      setError('Please enter a goal title.');
      return false;
    }
    if (title.trim().length < 3) {
      setError('Goal title must be at least 3 characters long.');
      return false;
    }
    if (!target.trim()) {
      setError('Please enter a target number.');
      return false;
    }
    if (!unit.trim()) {
      setError('Please enter a unit (e.g., books, workouts, days).');
      return false;
    }

    const targetNumber = parseInt(target);
    if (isNaN(targetNumber) || targetNumber <= 0) {
      setError('Please enter a valid target number greater than 0.');
      return false;
    }
    if (targetNumber > 10000) {
      setError('Target number seems too high. Please enter a realistic goal.');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const existingGoals = await Storage.get<LifeStat[]>(STORAGE_KEYS.LIFE_STATS) || [];
      
      // Check for duplicate goals
      const duplicateGoal = existingGoals.find(
        goal => goal.title.toLowerCase().trim() === title.toLowerCase().trim()
      );
      
      if (duplicateGoal) {
        setError('A goal with this title already exists. Please choose a different title.');
        setLoading(false);
        return;
      }

      const newGoal: LifeStat = {
        id: Date.now().toString(),
        category,
        title: title.trim(),
        description: description.trim(),
        progress: 0,
        target: parseInt(target),
        unit: unit.trim(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const updatedGoals = [...existingGoals, newGoal];
      await Storage.set(STORAGE_KEYS.LIFE_STATS, updatedGoals);
      
      setSuccess('Goal added successfully! 🎯');

      // Provide haptic feedback on mobile
      if (Platform.OS !== 'web') {
        try {
          const { impactAsync, ImpactFeedbackStyle } = await import('expo-haptics');
          impactAsync(ImpactFeedbackStyle.Medium);
        } catch (error) {
          // Haptics not available, continue silently
        }
      }

      // Wait a moment to show success message, then close
      setTimeout(() => {
        onGoalAdded();
        handleClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error saving goal:', error);
      setError('Failed to save your goal. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillExample = (example: string) => {
    const parts = example.split(' ');
    const targetNum = parts.find(part => !isNaN(parseInt(part)));
    const unitPart = parts.slice(parts.indexOf(targetNum!) + 1).join(' ');
    
    setTitle(example);
    setTarget(targetNum || '');
    setUnit(unitPart || 'items');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <LinearGradient
        colors={['#111827', '#1F2937']}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Target size={24} color="#6366F1" />
            <Typography variant="h2" color="#F9FAFB" style={styles.headerTitle}>
              Add New Goal
            </Typography>
          </View>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton} disabled={loading}>
            <X size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Status Messages */}
          {error && (
            <Card style={[styles.messageCard, styles.errorCard]}>
              <View style={styles.messageContent}>
                <AlertCircle size={20} color="#EF4444" />
                <Typography variant="body" color="#EF4444" style={styles.messageText}>
                  {error}
                </Typography>
              </View>
            </Card>
          )}

          {success && (
            <Card style={[styles.messageCard, styles.successCard]}>
              <View style={styles.messageContent}>
                <CheckCircle size={20} color="#10B981" />
                <Typography variant="body" color="#10B981" style={styles.messageText}>
                  {success}
                </Typography>
              </View>
            </Card>
          )}

          <Card style={styles.formCard}>
            {/* Category */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Category
              </Typography>
              <View style={styles.categoryGrid}>
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryButton,
                      category === cat.id && styles.selectedCategoryButton,
                      { borderColor: cat.color }
                    ]}
                    onPress={() => setCategory(cat.id)}
                    disabled={loading}
                  >
                    <Typography variant="body" style={styles.categoryIcon}>
                      {cat.icon}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={category === cat.id ? cat.color : '#9CA3AF'}
                    >
                      {cat.label}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Examples */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Example Goals for {CATEGORIES.find(c => c.id === category)?.label}
              </Typography>
              <View style={styles.examplesContainer}>
                {GOAL_EXAMPLES[category].map((example, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.exampleButton}
                    onPress={() => fillExample(example)}
                    disabled={loading}
                  >
                    <Typography variant="caption" color="#6366F1">
                      {example}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Title */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Goal Title *
              </Typography>
              <Input
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  setError(null);
                }}
                placeholder="e.g., Read more books, Exercise regularly..."
                style={styles.input}
                maxLength={100}
                editable={!loading}
              />
              <Typography variant="overline" color="#6B7280" style={styles.charCount}>
                {title.length}/100
              </Typography>
            </View>

            {/* Target and Unit */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                  Target *
                </Typography>
                <Input
                  value={target}
                  onChangeText={(text) => {
                    // Only allow numbers
                    const numericText = text.replace(/[^0-9]/g, '');
                    setTarget(numericText);
                    setError(null);
                  }}
                  placeholder="100"
                  keyboardType="numeric"
                  style={styles.input}
                  maxLength={5}
                  editable={!loading}
                />
              </View>
              <View style={[styles.inputGroup, styles.flex1]}>
                <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                  Unit *
                </Typography>
                <Input
                  value={unit}
                  onChangeText={(text) => {
                    setUnit(text);
                    setError(null);
                  }}
                  placeholder="books, workouts, days..."
                  style={styles.input}
                  maxLength={20}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Description (optional)
              </Typography>
              <Input
                value={description}
                onChangeText={setDescription}
                placeholder="Describe your goal in more detail..."
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
                maxLength={300}
                editable={!loading}
              />
              <Typography variant="overline" color="#6B7280" style={styles.charCount}>
                {description.length}/300
              </Typography>
            </View>
          </Card>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={loading ? 'Saving...' : 'Add Goal'}
              onPress={handleSave}
              disabled={loading}
              size="lg"
              style={styles.saveButton}
            />
            <Typography variant="caption" color="#6B7280" style={styles.hint}>
              * Required fields
            </Typography>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </LinearGradient>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    marginLeft: 12,
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  messageCard: {
    marginBottom: 16,
    padding: 16,
  },
  errorCard: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  successCard: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  messageText: {
    flex: 1,
  },
  formCard: {
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
  textArea: {
    textAlignVertical: 'top',
    minHeight: 80,
  },
  charCount: {
    textAlign: 'right',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 16,
  },
  flex1: {
    flex: 1,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryButton: {
    flex: 1,
    minWidth: '45%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#374151',
    borderWidth: 2,
    borderColor: '#4B5563',
    alignItems: 'center',
    gap: 4,
  },
  selectedCategoryButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  categoryIcon: {
    fontSize: 20,
  },
  examplesContainer: {
    gap: 8,
  },
  exampleButton: {
    padding: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  buttonContainer: {
    paddingBottom: 20,
    alignItems: 'center',
  },
  saveButton: {
    width: '100%',
    marginBottom: 8,
  },
  hint: {
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});