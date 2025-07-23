import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Shield, Eye, EyeOff, Plus, Heart, Star, Trash2 } from 'lucide-react-native';
import { Storage, STORAGE_KEYS } from '@/utils/storage';
import { Mantra, VisionItem } from '@/types';

export default function Focus() {
  const [mantras, setMantras] = useState<Mantra[]>([]);
  const [visionItems, setVisionItems] = useState<VisionItem[]>([]);
  const [rebootMode, setRebootMode] = useState(false);
  const [activeTab, setActiveTab] = useState<'mantras' | 'vision' | 'reboot'>('mantras');
  const [newMantraText, setNewMantraText] = useState('');
  const [newMantraCategory, setNewMantraCategory] = useState<'motivation' | 'focus' | 'growth' | 'peace'>('motivation');
  const [newVisionTitle, setNewVisionTitle] = useState('');
  const [newVisionDescription, setNewVisionDescription] = useState('');
  const [newVisionCategory, setNewVisionCategory] = useState<'career' | 'lifestyle' | 'personal' | 'health'>('career');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFocusData();
  }, []);

  const loadFocusData = async () => {
    try {
      const [mantrasResult, visionResult] = await Promise.all([
        Storage.get<Mantra[]>(STORAGE_KEYS.MANTRAS),
        Storage.get<VisionItem[]>(STORAGE_KEYS.VISION_ITEMS),
      ]);

      const mantrasData = mantrasResult || [];
      const visionData = visionResult || [];

      setMantras(mantrasData);
      setVisionItems(visionData);
    } catch (error) {
      console.error('Error loading focus data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMantra = async () => {
    if (!newMantraText.trim()) {
      Alert.alert('Empty Mantra', 'Please enter a mantra text.');
      return;
    }

    try {
      const newMantra: Mantra = {
        id: Date.now().toString(),
        text: newMantraText.trim(),
        category: newMantraCategory,
        isActive: true,
        createdAt: Date.now(),
      };

      const updatedMantras = [...mantras, newMantra];
      await Storage.set(STORAGE_KEYS.MANTRAS, updatedMantras);
      
      setMantras(updatedMantras);
      setNewMantraText('');
      
      Alert.alert('Mantra Added', 'Your mantra has been added successfully.');
    } catch (error) {
      console.error('Error saving mantra:', error);
      Alert.alert('Error', 'Failed to save your mantra. Please try again.');
    }
  };

  const addVisionItem = async () => {
    if (!newVisionTitle.trim() || !newVisionDescription.trim()) {
      Alert.alert('Incomplete Vision', 'Please fill in both title and description.');
      return;
    }

    try {
      const newVision: VisionItem = {
        id: Date.now().toString(),
        title: newVisionTitle.trim(),
        description: newVisionDescription.trim(),
        category: newVisionCategory,
        isAchieved: false,
        createdAt: Date.now(),
      };

      const updatedVision = [...visionItems, newVision];
      await Storage.set(STORAGE_KEYS.VISION_ITEMS, updatedVision);
      
      setVisionItems(updatedVision);
      setNewVisionTitle('');
      setNewVisionDescription('');
      
      Alert.alert('Vision Added', 'Your vision has been added to your board.');
    } catch (error) {
      console.error('Error saving vision item:', error);
      Alert.alert('Error', 'Failed to save your vision. Please try again.');
    }
  };

  const toggleMantraActive = async (id: string) => {
    try {
      const updatedMantras = mantras.map(mantra =>
        mantra.id === id ? { ...mantra, isActive: !mantra.isActive } : mantra
      );
      await Storage.set(STORAGE_KEYS.MANTRAS, updatedMantras);
      setMantras(updatedMantras);
    } catch (error) {
      console.error('Error updating mantra:', error);
    }
  };

  const toggleVisionAchieved = async (id: string) => {
    try {
      const updatedVision = visionItems.map(item =>
        item.id === id ? { ...item, isAchieved: !item.isAchieved } : item
      );
      await Storage.set(STORAGE_KEYS.VISION_ITEMS, updatedVision);
      setVisionItems(updatedVision);
    } catch (error) {
      console.error('Error updating vision item:', error);
    }
  };

  const deleteMantra = async (id: string) => {
    Alert.alert(
      'Delete Mantra',
      'Are you sure you want to delete this mantra?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedMantras = mantras.filter(mantra => mantra.id !== id);
              await Storage.set(STORAGE_KEYS.MANTRAS, updatedMantras);
              setMantras(updatedMantras);
            } catch (error) {
              console.error('Error deleting mantra:', error);
            }
          },
        },
      ]
    );
  };

  const deleteVisionItem = async (id: string) => {
    Alert.alert(
      'Delete Vision',
      'Are you sure you want to delete this vision item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedVision = visionItems.filter(item => item.id !== id);
              await Storage.set(STORAGE_KEYS.VISION_ITEMS, updatedVision);
              setVisionItems(updatedVision);
            } catch (error) {
              console.error('Error deleting vision item:', error);
            }
          },
        },
      ]
    );
  };

  const getTodaysMantra = () => {
    const activeMantras = (mantras || []).filter(m => m.isActive);
    if (activeMantras.length === 0) return null;
    
    const today = new Date().getDate();
    return activeMantras[today % activeMantras.length];
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      motivation: '#EF4444',
      focus: '#6366F1',
      growth: '#10B981',
      peace: '#8B5CF6',
      career: '#F59E0B',
      lifestyle: '#EC4899',
      personal: '#06B6D4',
      health: '#84CC16',
    };
    return colors[category as keyof typeof colors] || '#6B7280';
  };

  const TabButton = ({ 
    id, 
    title, 
    icon 
  }: { 
    id: 'mantras' | 'vision' | 'reboot', 
    title: string, 
    icon: React.ReactNode
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
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Typography variant="body" color="#9CA3AF">Loading focus tools...</Typography>
        </View>
      </SafeAreaView>
    );
  }

  if (rebootMode) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#000000', '#111111']}
          style={styles.gradient}
        >
          <View style={styles.rebootContainer}>
            <Typography variant="h1" color="#FFFFFF" style={styles.rebootTitle}>
              REBOOT MODE
            </Typography>
            <Typography variant="body" color="#999999" style={styles.rebootSubtitle}>
              Distraction-free focus time activated
            </Typography>
            
            <View style={styles.rebootContent}>
              {getTodaysMantra() && (
                <Card style={styles.rebootMantraCard}>
                  <Typography variant="h3" color="#FFFFFF" style={styles.rebootMantra}>
                    "{getTodaysMantra()?.text}"
                  </Typography>
                </Card>
              )}
            </View>

            <Button
              title="Exit Reboot Mode"
              onPress={() => setRebootMode(false)}
              variant="outline"
              style={styles.exitRebootButton}
            />
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
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Shield size={32} color="#6366F1" />
            <Typography variant="h2" color="#F9FAFB" style={styles.headerTitle}>
              Focus Tools
            </Typography>
          </View>
          <Button
            title="Reboot Mode"
            onPress={() => setRebootMode(true)}
            variant="outline"
            size="sm"
          />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TabButton
            id="mantras"
            title="Mantras"
            icon={<Heart size={20} color={activeTab === 'mantras' ? '#6366F1' : '#9CA3AF'} />}
          />
          <TabButton
            id="vision"
            title="Vision Board"
            icon={<Star size={20} color={activeTab === 'vision' ? '#6366F1' : '#9CA3AF'} />}
          />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {activeTab === 'mantras' && (
            <>
              {/* Today's Mantra */}
              {getTodaysMantra() && (
                <Card style={styles.todayMantraCard}>
                  <Typography variant="overline" color="#6366F1" style={styles.todayLabel}>
                    Today's Mantra
                  </Typography>
                  <Typography variant="h3" color="#F9FAFB" style={styles.todayMantraText}>
                    "{getTodaysMantra()?.text}"
                  </Typography>
                </Card>
              )}

              {/* Add New Mantra */}
              <Card style={styles.addCard}>
                <Typography variant="h3" color="#F9FAFB" style={styles.sectionTitle}>
                  Add New Mantra
                </Typography>
                
                <View style={styles.categorySelector}>
                  <Typography variant="caption" color="#9CA3AF" style={styles.inputLabel}>
                    Category
                  </Typography>
                  <View style={styles.categoryButtons}>
                    {(['motivation', 'focus', 'growth', 'peace'] as const).map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryButton,
                          newMantraCategory === category && styles.selectedCategoryButton,
                          { borderColor: getCategoryColor(category) }
                        ]}
                        onPress={() => setNewMantraCategory(category)}
                      >
                        <Typography
                          variant="caption"
                          color={newMantraCategory === category ? getCategoryColor(category) : '#9CA3AF'}
                        >
                          {category}
                        </Typography>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <Input
                  value={newMantraText}
                  onChangeText={setNewMantraText}
                  placeholder="Enter your mantra..."
                  style={styles.textInput}
                />
                
                <Button
                  title="Add Mantra"
                  onPress={addMantra}
                  style={styles.addButton}
                />
              </Card>

              {/* Mantras List */}
              <View style={styles.itemsList}>
                <Typography variant="h3" color="#F9FAFB" style={styles.sectionTitle}>
                  Your Mantras
                </Typography>
                
                {mantras.length > 0 ? (
                  mantras.map((mantra) => (
                    <Card key={mantra.id} style={styles.mantraCard}>
                      <View style={styles.mantraHeader}>
                        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(mantra.category) }]}>
                          <Typography variant="overline" color="#FFFFFF">
                            {mantra.category}
                          </Typography>
                        </View>
                        <View style={styles.mantraActions}>
                          <TouchableOpacity
                            onPress={() => toggleMantraActive(mantra.id)}
                            style={styles.toggleButton}
                          >
                            {mantra.isActive ? (
                              <Eye size={16} color="#10B981" />
                            ) : (
                              <EyeOff size={16} color="#6B7280" />
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => deleteMantra(mantra.id)}
                            style={styles.deleteButton}
                          >
                            <Trash2 size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Typography 
                        variant="body" 
                        color={mantra.isActive ? '#F9FAFB' : '#9CA3AF'}
                        style={styles.mantraText}
                      >
                        "{mantra.text}"
                      </Typography>
                    </Card>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Heart size={48} color="#6B7280" />
                    <Typography variant="h3" color="#9CA3AF" style={styles.emptyTitle}>
                      No Mantras Yet
                    </Typography>
                    <Typography variant="body" color="#6B7280" style={styles.emptyDescription}>
                      Create mantras to inspire and motivate yourself daily
                    </Typography>
                  </View>
                )}
              </View>
            </>
          )}

          {activeTab === 'vision' && (
            <>
              {/* Add New Vision Item */}
              <Card style={styles.addCard}>
                <Typography variant="h3" color="#F9FAFB" style={styles.sectionTitle}>
                  Add to Vision Board
                </Typography>
                
                <View style={styles.categorySelector}>
                  <Typography variant="caption" color="#9CA3AF" style={styles.inputLabel}>
                    Category
                  </Typography>
                  <View style={styles.categoryButtons}>
                    {(['career', 'lifestyle', 'personal', 'health'] as const).map((category) => (
                      <TouchableOpacity
                        key={category}
                        style={[
                          styles.categoryButton,
                          newVisionCategory === category && styles.selectedCategoryButton,
                          { borderColor: getCategoryColor(category) }
                        ]}
                        onPress={() => setNewVisionCategory(category)}
                      >
                        <Typography
                          variant="caption"
                          color={newVisionCategory === category ? getCategoryColor(category) : '#9CA3AF'}
                        >
                          {category}
                        </Typography>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <Input
                  value={newVisionTitle}
                  onChangeText={setNewVisionTitle}
                  placeholder="Vision title..."
                  style={styles.textInput}
                />

                <Input
                  value={newVisionDescription}
                  onChangeText={setNewVisionDescription}
                  placeholder="Describe your vision in detail..."
                  multiline
                  numberOfLines={3}
                  style={[styles.textInput, styles.textArea]}
                />
                
                <Button
                  title="Add to Vision Board"
                  onPress={addVisionItem}
                  style={styles.addButton}
                />
              </Card>

              {/* Vision Board */}
              <View style={styles.itemsList}>
                <Typography variant="h3" color="#F9FAFB" style={styles.sectionTitle}>
                  Your Vision Board
                </Typography>
                
                {visionItems.length > 0 ? (
                  visionItems.map((item) => (
                    <Card key={item.id} style={[styles.visionCard, item.isAchieved && styles.achievedVisionCard]}>
                      <View style={styles.visionHeader}>
                        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
                          <Typography variant="overline" color="#FFFFFF">
                            {item.category}
                          </Typography>
                        </View>
                        <View style={styles.visionActions}>
                          <TouchableOpacity
                            onPress={() => toggleVisionAchieved(item.id)}
                            style={styles.toggleButton}
                          >
                            <Star 
                              size={16} 
                              color={item.isAchieved ? '#F59E0B' : '#6B7280'}
                              fill={item.isAchieved ? '#F59E0B' : 'none'}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => deleteVisionItem(item.id)}
                            style={styles.deleteButton}
                          >
                            <Trash2 size={16} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <Typography 
                        variant="h3" 
                        color={item.isAchieved ? '#10B981' : '#F9FAFB'}
                        style={[styles.visionTitle, item.isAchieved && styles.achievedText]}
                      >
                        {item.title}
                      </Typography>
                      <Typography 
                        variant="body" 
                        color={item.isAchieved ? '#9CA3AF' : '#E5E7EB'}
                        style={[styles.visionDescription, item.isAchieved && styles.achievedText]}
                      >
                        {item.description}
                      </Typography>
                    </Card>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Star size={48} color="#6B7280" />
                    <Typography variant="h3" color="#9CA3AF" style={styles.emptyTitle}>
                      No Vision Items
                    </Typography>
                    <Typography variant="body" color="#6B7280" style={styles.emptyDescription}>
                      Create your vision board to visualize your goals
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  todayMantraCard: {
    marginBottom: 20,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    padding: 24,
  },
  todayLabel: {
    marginBottom: 8,
  },
  todayMantraText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
  addCard: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  categorySelector: {
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
  },
  categoryButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  selectedCategoryButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  textInput: {
    marginBottom: 16,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  addButton: {
    width: '100%',
  },
  itemsList: {
    marginBottom: 20,
  },
  mantraCard: {
    marginBottom: 12,
  },
  mantraHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  mantraActions: {
    flexDirection: 'row',
    gap: 12,
  },
  toggleButton: {
    padding: 4,
  },
  deleteButton: {
    padding: 4,
  },
  mantraText: {
    fontStyle: 'italic',
    lineHeight: 24,
  },
  visionCard: {
    marginBottom: 16,
  },
  achievedVisionCard: {
    opacity: 0.7,
  },
  visionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  visionActions: {
    flexDirection: 'row',
    gap: 12,
  },
  visionTitle: {
    marginBottom: 8,
  },
  visionDescription: {
    lineHeight: 24,
  },
  achievedText: {
    textDecorationLine: 'line-through',
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
  
  // Reboot Mode Styles
  rebootContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  rebootTitle: {
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 2,
  },
  rebootSubtitle: {
    textAlign: 'center',
    marginBottom: 60,
  },
  rebootContent: {
    width: '100%',
    marginBottom: 60,
  },
  rebootMantraCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 30,
  },
  rebootMantra: {
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 32,
  },
  exitRebootButton: {
    paddingHorizontal: 32,
  },
  
  bottomPadding: {
    height: 40,
  },
});