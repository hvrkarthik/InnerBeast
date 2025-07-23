import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookOpen, PenTool, Brain, Calendar, Plus, Trash2 } from 'lucide-react-native';
import { Storage, STORAGE_KEYS } from '@/utils/storage';
import { JournalEntry, Distraction } from '@/types';
import { formatDate, formatDisplayDate, formatTime } from '@/utils/dateHelpers';

const DISTRACTION_TYPES = ['social-media', 'entertainment', 'procrastination', 'other'] as const;
const DISTRACTION_LABELS = {
  'social-media': 'Social Media',
  'entertainment': 'Entertainment',
  'procrastination': 'Procrastination',
  'other': 'Other',
};

export default function Journal() {
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [distractions, setDistractions] = useState<Distraction[]>([]);
  const [activeTab, setActiveTab] = useState<'journal' | 'distractions'>('journal');
  const [newEntryContent, setNewEntryContent] = useState('');
  const [newEntryMood, setNewEntryMood] = useState(3);
  const [newDistractionContent, setNewDistractionContent] = useState('');
  const [newDistractionType, setNewDistractionType] = useState<typeof DISTRACTION_TYPES[number]>('social-media');
  const [newDistractionIntensity, setNewDistractionIntensity] = useState(3);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJournalData();
  }, []);

  const loadJournalData = async () => {
    try {
      const [entriesResult, distractionsResult] = await Promise.all([
        Storage.get<JournalEntry[]>(STORAGE_KEYS.JOURNAL_ENTRIES),
        Storage.get<Distraction[]>(STORAGE_KEYS.DISTRACTIONS),
      ]);

      const entriesData = entriesResult || [];
      const distractionsData = distractionsResult || [];

      setJournalEntries(entriesData.sort((a, b) => b.timestamp - a.timestamp));
      setDistractions(distractionsData.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      console.error('Error loading journal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addJournalEntry = async () => {
    if (!newEntryContent.trim()) {
      Alert.alert('Empty Entry', 'Please write something in your journal entry.');
      return;
    }

    try {
      const newEntry: JournalEntry = {
        id: Date.now().toString(),
        content: newEntryContent.trim(),
        mood: newEntryMood,
        tags: [],
        date: formatDate(new Date()),
        timestamp: Date.now(),
      };

      const updatedEntries = [newEntry, ...journalEntries];
      await Storage.set(STORAGE_KEYS.JOURNAL_ENTRIES, updatedEntries);
      
      setJournalEntries(updatedEntries);
      setNewEntryContent('');
      setNewEntryMood(3);
      
      Alert.alert('Entry Saved', 'Your journal entry has been saved successfully.');
    } catch (error) {
      console.error('Error saving journal entry:', error);
      Alert.alert('Error', 'Failed to save your journal entry. Please try again.');
    }
  };

  const addDistraction = async () => {
    if (!newDistractionContent.trim()) {
      Alert.alert('Empty Distraction', 'Please describe what distracted you.');
      return;
    }

    try {
      const newDistraction: Distraction = {
        id: Date.now().toString(),
        content: newDistractionContent.trim(),
        type: newDistractionType,
        intensity: newDistractionIntensity,
        timestamp: Date.now(),
      };

      const updatedDistractions = [newDistraction, ...distractions];
      await Storage.set(STORAGE_KEYS.DISTRACTIONS, updatedDistractions);
      
      setDistractions(updatedDistractions);
      setNewDistractionContent('');
      setNewDistractionIntensity(3);
      
      Alert.alert('Distraction Logged', 'Good job resisting! Your distraction has been logged.');
    } catch (error) {
      console.error('Error saving distraction:', error);
      Alert.alert('Error', 'Failed to log your distraction. Please try again.');
    }
  };

  const deleteJournalEntry = async (id: string) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this journal entry?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedEntries = journalEntries.filter(entry => entry.id !== id);
              await Storage.set(STORAGE_KEYS.JOURNAL_ENTRIES, updatedEntries);
              setJournalEntries(updatedEntries);
            } catch (error) {
              console.error('Error deleting journal entry:', error);
            }
          },
        },
      ]
    );
  };

  const deleteDistraction = async (id: string) => {
    try {
      const updatedDistractions = distractions.filter(distraction => distraction.id !== id);
      await Storage.set(STORAGE_KEYS.DISTRACTIONS, updatedDistractions);
      setDistractions(updatedDistractions);
    } catch (error) {
      console.error('Error deleting distraction:', error);
    }
  };

  const getMoodEmoji = (mood: number) => {
    const emojis = ['😢', '😕', '😐', '🙂', '😊'];
    return emojis[mood] || '😐';
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity <= 2) return '#10B981';
    if (intensity <= 3) return '#F59E0B';
    return '#EF4444';
  };

  const TabButton = ({ 
    id, 
    title, 
    icon, 
    count 
  }: { 
    id: 'journal' | 'distractions', 
    title: string, 
    icon: React.ReactNode, 
    count: number 
  }) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === id && styles.activeTabButton]}
      onPress={() => setActiveTab(id)}
    >
      {icon}
      <Typography
        variant="caption"
        color={activeTab === id ? '#6366F1' : '#9CA3AF'}
        style={styles.tabTitle}
      >
        {title}
      </Typography>
      <Typography
        variant="overline"
        color={activeTab === id ? '#6366F1' : '#6B7280'}
      >
        {count}
      </Typography>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Typography variant="body" color="#9CA3AF">Loading journal...</Typography>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#111827', '#1F2937']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <BookOpen size={32} color="#6366F1" />
            <Typography variant="h2" color="#F9FAFB" style={styles.headerTitle}>
              Journal & Focus
            </Typography>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TabButton
            id="journal"
            title="Journal"
            icon={<PenTool size={20} color={activeTab === 'journal' ? '#6366F1' : '#9CA3AF'} />}
            count={journalEntries.length}
          />
          <TabButton
            id="distractions"
            title="Distraction Wall"
            icon={<Brain size={20} color={activeTab === 'distractions' ? '#6366F1' : '#9CA3AF'} />}
            count={distractions.length}
          />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {activeTab === 'journal' ? (
            <>
              {/* New Journal Entry */}
              <Card style={styles.newEntryCard}>
                <Typography variant="h3" color="#F9FAFB" style={styles.sectionTitle}>
                  New Journal Entry
                </Typography>
                
                {/* Mood Selector */}
                <View style={styles.moodSection}>
                  <Typography variant="caption" color="#9CA3AF" style={styles.inputLabel}>
                    How are you feeling?
                  </Typography>
                  <View style={styles.moodSelector}>
                    {[0, 1, 2, 3, 4].map((mood) => (
                      <TouchableOpacity
                        key={mood}
                        style={[
                          styles.moodButton,
                          newEntryMood === mood && styles.selectedMoodButton
                        ]}
                        onPress={() => setNewEntryMood(mood)}
                      >
                        <Typography variant="body" style={styles.moodEmoji}>
                          {getMoodEmoji(mood)}
                        </Typography>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <Input
                  value={newEntryContent}
                  onChangeText={setNewEntryContent}
                  placeholder="What's on your mind today? Reflect on your thoughts, experiences, or goals..."
                  multiline
                  numberOfLines={4}
                  style={styles.textArea}
                />
                
                <Button
                  title="Save Entry"
                  onPress={addJournalEntry}
                  style={styles.addButton}
                />
              </Card>

              {/* Journal Entries */}
              <View style={styles.entriesSection}>
                <Typography variant="h3" color="#F9FAFB" style={styles.sectionTitle}>
                  Your Entries
                </Typography>
                
                {journalEntries.length > 0 ? (
                  journalEntries.map((entry) => (
                    <Card key={entry.id} style={styles.entryCard}>
                      <View style={styles.entryHeader}>
                        <View style={styles.entryInfo}>
                          <Typography variant="caption" color="#9CA3AF">
                            {formatDisplayDate(entry.date)} • {formatTime(new Date(entry.timestamp))}
                          </Typography>
                          <Typography variant="body" style={styles.entryMood}>
                            {getMoodEmoji(entry.mood)}
                          </Typography>
                        </View>
                        <TouchableOpacity
                          onPress={() => deleteJournalEntry(entry.id)}
                          style={styles.deleteButton}
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                      <Typography variant="body" color="#F9FAFB" style={styles.entryContent}>
                        {entry.content}
                      </Typography>
                    </Card>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <PenTool size={48} color="#6B7280" />
                    <Typography variant="h3" color="#9CA3AF" style={styles.emptyTitle}>
                      No Journal Entries
                    </Typography>
                    <Typography variant="body" color="#6B7280" style={styles.emptyDescription}>
                      Start writing to capture your thoughts and reflections
                    </Typography>
                  </View>
                )}
              </View>
            </>
          ) : (
            <>
              {/* New Distraction */}
              <Card style={styles.newEntryCard}>
                <Typography variant="h3" color="#F9FAFB" style={styles.sectionTitle}>
                  Log a Distraction
                </Typography>
                <Typography variant="caption" color="#9CA3AF" style={styles.distractionSubtitle}>
                  Feeling tempted? Log it here instead of acting on it.
                </Typography>
                
                {/* Distraction Type */}
                <View style={styles.typeSection}>
                  <Typography variant="caption" color="#9CA3AF" style={styles.inputLabel}>
                    Type of distraction
                  </Typography>
                  <View style={styles.typeSelector}>
                    {DISTRACTION_TYPES.map((type) => (
                      <TouchableOpacity
                        key={type}
                        style={[
                          styles.typeButton,
                          newDistractionType === type && styles.selectedTypeButton
                        ]}
                        onPress={() => setNewDistractionType(type)}
                      >
                        <Typography
                          variant="caption"
                          color={newDistractionType === type ? '#6366F1' : '#9CA3AF'}
                        >
                          {DISTRACTION_LABELS[type]}
                        </Typography>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Intensity */}
                <View style={styles.intensitySection}>
                  <Typography variant="caption" color="#9CA3AF" style={styles.inputLabel}>
                    How strong is the urge? (1-5)
                  </Typography>
                  <View style={styles.intensitySelector}>
                    {[1, 2, 3, 4, 5].map((intensity) => (
                      <TouchableOpacity
                        key={intensity}
                        style={[
                          styles.intensityButton,
                          newDistractionIntensity === intensity && styles.selectedIntensityButton,
                          { borderColor: getIntensityColor(intensity) }
                        ]}
                        onPress={() => setNewDistractionIntensity(intensity)}
                      >
                        <Typography
                          variant="caption"
                          color={newDistractionIntensity === intensity ? getIntensityColor(intensity) : '#9CA3AF'}
                        >
                          {intensity}
                        </Typography>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <Input
                  value={newDistractionContent}
                  onChangeText={setNewDistractionContent}
                  placeholder="What's trying to distract you? Be specific..."
                  multiline
                  numberOfLines={3}
                  style={styles.textArea}
                />
                
                <Button
                  title="Log Distraction"
                  onPress={addDistraction}
                  style={styles.addButton}
                />
              </Card>

              {/* Distraction Wall */}
              <View style={styles.entriesSection}>
                <Typography variant="h3" color="#F9FAFB" style={styles.sectionTitle}>
                  Distraction Wall
                </Typography>
                
                {distractions.length > 0 ? (
                  distractions.map((distraction) => (
                    <Card key={distraction.id} style={styles.distractionCard}>
                      <View style={styles.distractionHeader}>
                        <View style={styles.distractionInfo}>
                          <Typography variant="caption" color="#9CA3AF">
                            {formatTime(new Date(distraction.timestamp))} • {DISTRACTION_LABELS[distraction.type]}
                          </Typography>
                          <View style={styles.intensityIndicator}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <View
                                key={i}
                                style={[
                                  styles.intensityDot,
                                  {
                                    backgroundColor: i < distraction.intensity 
                                      ? getIntensityColor(distraction.intensity) 
                                      : '#374151'
                                  }
                                ]}
                              />
                            ))}
                          </View>
                        </View>
                        <TouchableOpacity
                          onPress={() => deleteDistraction(distraction.id)}
                          style={styles.deleteButton}
                        >
                          <Trash2 size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                      <Typography variant="body" color="#F9FAFB" style={styles.distractionContent}>
                        {distraction.content}
                      </Typography>
                    </Card>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Brain size={48} color="#6B7280" />
                    <Typography variant="h3" color="#9CA3AF" style={styles.emptyTitle}>
                      No Distractions Logged
                    </Typography>
                    <Typography variant="body" color="#6B7280" style={styles.emptyDescription}>
                      When you feel distracted, log it here instead of giving in
                    </Typography>
                  </View>
                )}
              </View>
            </>
          )}
          
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    marginLeft: 12,
  },
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4,
  },
  activeTabButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  tabTitle: {
    marginTop: 4,
    marginBottom: 2,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  newEntryCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  distractionSubtitle: {
    marginBottom: 16,
    fontStyle: 'italic',
  },
  inputLabel: {
    marginBottom: 8,
  },
  moodSection: {
    marginBottom: 16,
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedMoodButton: {
    backgroundColor: '#6366F1',
  },
  moodEmoji: {
    fontSize: 20,
  },
  typeSection: {
    marginBottom: 16,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  selectedTypeButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: '#6366F1',
  },
  intensitySection: {
    marginBottom: 16,
  },
  intensitySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  intensityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4B5563',
  },
  selectedIntensityButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  textArea: {
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  addButton: {
    width: '100%',
  },
  entriesSection: {
    marginBottom: 20,
  },
  entryCard: {
    marginBottom: 16,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  entryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  entryMood: {
    fontSize: 18,
  },
  deleteButton: {
    padding: 4,
  },
  entryContent: {
    lineHeight: 24,
  },
  distractionCard: {
    marginBottom: 16,
  },
  distractionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  distractionInfo: {
    flex: 1,
    gap: 8,
  },
  intensityIndicator: {
    flexDirection: 'row',
    gap: 4,
  },
  intensityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  distractionContent: {
    lineHeight: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});