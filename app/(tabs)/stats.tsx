import { AddBookModal } from '@/components/modals/AddBookModal';
import { AddGoalModal } from '@/components/modals/AddGoalModal';
import { AddPlaceModal } from '@/components/modals/AddPlaceModal';
import { AddProjectModal } from '@/components/modals/AddProjectModal';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Book, LifeStat, Place, Project } from '@/types';
import { Storage, STORAGE_KEYS } from '@/utils/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart3, BookOpen, Code, MapPin, Target, Trash2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Stats() {
  const [lifeStats, setLifeStats] = useState<LifeStat[]>([]);
  const [books, setBooks] = useState<Book[]>([]);
  const [places, setPlaces] = useState<Place[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeTab, setActiveTab] = useState<'goals' | 'books' | 'places' | 'projects'>('goals');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);
  const [showAddPlaceModal, setShowAddPlaceModal] = useState(false);
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);

  useEffect(() => {
    loadStatsData();
  }, []);

  const loadStatsData = async () => {
    try {
      const [statsResult, booksResult, placesResult, projectsResult] = await Promise.all([
        Storage.get<LifeStat[]>(STORAGE_KEYS.LIFE_STATS),
        Storage.get<Book[]>(STORAGE_KEYS.BOOKS),
        Storage.get<Place[]>(STORAGE_KEYS.PLACES),
        Storage.get<Project[]>(STORAGE_KEYS.PROJECTS),
      ]);

      const statsData = statsResult || [];
      const booksData = booksResult || [];
      const placesData = placesResult || [];
      const projectsData = projectsResult || [];

      setLifeStats(statsData);
      setBooks(booksData);
      setPlaces(placesData);
      setProjects(projectsData);
    } catch (error) {
      console.error('Error loading stats data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateGoalProgress = async (goalId: string, newProgress: number) => {
    try {
      const updatedStats = lifeStats.map(stat =>
        stat.id === goalId 
          ? { ...stat, progress: Math.max(0, Math.min(newProgress, stat.target)), updatedAt: Date.now() }
          : stat
      );
      await Storage.set(STORAGE_KEYS.LIFE_STATS, updatedStats);
      setLifeStats(updatedStats);
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  const deleteGoal = async (goalId: string) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedStats = lifeStats.filter(stat => stat.id !== goalId);
              await Storage.set(STORAGE_KEYS.LIFE_STATS, updatedStats);
              setLifeStats(updatedStats);
            } catch (error) {
              console.error('Error deleting goal:', error);
            }
          },
        },
      ]
    );
  };

  const getCompletedBooksCount = () => (books || []).filter(b => b.status === 'completed').length;
  const getVisitedPlacesCount = () => (places || []).length;
  const getCompletedProjectsCount = () => (projects || []).filter(p => p.status === 'completed').length;

  const TabButton = ({ 
    id, 
    title, 
    icon, 
    count 
  }: { 
    id: 'goals' | 'books' | 'places' | 'projects', 
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

  const renderGoalsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Typography variant="h3" color="#F9FAFB">
          Life Goals
        </Typography>
        <Button
          title="Add Goal"
          onPress={() => setShowAddGoalModal(true)}
          variant="outline"
          size="sm"
        />
      </View>

      {(lifeStats || []).length > 0 ? (
        <View style={styles.goalsList}>
          {(lifeStats || []).map((stat) => (
            <Card key={stat.id} style={styles.goalCard}>
              <View style={styles.goalHeader}>
                <View style={styles.goalInfo}>
                  <Typography variant="h3" color="#F9FAFB">
                    {stat.title}
                  </Typography>
                  <View style={[styles.categoryBadge, styles[`${stat.category}Badge`]]}>
                    <Typography variant="overline" color="#F9FAFB">
                      {stat.category}
                    </Typography>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => deleteGoal(stat.id)}
                  style={styles.deleteButton}
                >
                  <Trash2 size={16} color="#EF4444" />
                </TouchableOpacity>
              </View>
              {stat.description && (
                <Typography variant="caption" color="#9CA3AF" style={styles.goalDescription}>
                  {stat.description}
                </Typography>
              )}
              <View style={styles.goalProgress}>
                <View style={styles.progressInfo}>
                  <Typography variant="body" color="#F9FAFB">
                    {stat.progress} / {stat.target} {stat.unit}
                  </Typography>
                  <Typography variant="caption" color="#6366F1">
                    {Math.round((stat.progress / stat.target) * 100)}%
                  </Typography>
                </View>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${Math.min((stat.progress / stat.target) * 100, 100)}%` }
                    ]} 
                  />
                </View>
                <View style={styles.progressControls}>
                  <Button
                    title="-"
                    onPress={() => updateGoalProgress(stat.id, stat.progress - 1)}
                    variant="ghost"
                    size="sm"
                    style={styles.progressButton}
                  />
                  <Button
                    title="+1"
                    onPress={() => updateGoalProgress(stat.id, stat.progress + 1)}
                    variant="primary"
                    size="sm"
                    style={styles.progressButton}
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Target size={48} color="#6B7280" />
          <Typography variant="h3" color="#9CA3AF" style={styles.emptyTitle}>
            No Goals Yet
          </Typography>
          <Typography variant="body" color="#6B7280" style={styles.emptyDescription}>
            Set your first goal to start tracking your progress
          </Typography>
          <Button 
            title="Add Goal" 
            onPress={() => setShowAddGoalModal(true)} 
            style={styles.emptyButton} 
          />
        </View>
      )}
    </View>
  );

  const renderBooksTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Typography variant="h3" color="#F9FAFB">
          Reading List
        </Typography>
        <Button
          title="Add Book"
          onPress={() => setShowAddBookModal(true)}
          variant="outline"
          size="sm"
        />
      </View>

      {(books || []).length > 0 ? (
        <View style={styles.booksList}>
          {(books || []).map((book) => (
            <Card key={book.id} style={styles.bookCard}>
              <View style={styles.bookHeader}>
                <View style={styles.bookInfo}>
                  <Typography variant="h3" color="#F9FAFB">
                    {book.title}
                  </Typography>
                  <Typography variant="caption" color="#9CA3AF">
                    by {book.author}
                  </Typography>
                </View>
                <View style={[styles.statusBadge, styles[`${book.status}Status`]]}>
                  <Typography variant="overline" color="#F9FAFB">
                    {book.status}
                  </Typography>
                </View>
              </View>
              <View style={styles.bookRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Typography
                    key={star}
                    variant="body"
                    color={star <= book.rating ? '#F59E0B' : '#6B7280'}
                  >
                    ★
                  </Typography>
                ))}
              </View>
              {book.notes && (
                <Typography variant="caption" color="#9CA3AF" style={styles.bookNotes}>
                  {book.notes}
                </Typography>
              )}
            </Card>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <BookOpen size={48} color="#6B7280" />
          <Typography variant="h3" color="#9CA3AF" style={styles.emptyTitle}>
            No Books Tracked
          </Typography>
          <Typography variant="body" color="#6B7280" style={styles.emptyDescription}>
            Start tracking your reading journey
          </Typography>
          <Button 
            title="Add Book" 
            onPress={() => setShowAddBookModal(true)} 
            style={styles.emptyButton} 
          />
        </View>
      )}
    </View>
  );

  const renderPlacesTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Typography variant="h3" color="#F9FAFB">
          Places Visited
        </Typography>
        <Button
          title="Add Place"
          onPress={() => setShowAddPlaceModal(true)}
          variant="outline"
          size="sm"
        />
      </View>

      {(places || []).length > 0 ? (
        <View style={styles.placesList}>
          {(places || []).map((place) => (
            <Card key={place.id} style={styles.placeCard}>
              <Typography variant="h3" color="#F9FAFB">
                {place.name}
              </Typography>
              <Typography variant="caption" color="#9CA3AF">
                {place.location} • {place.date}
              </Typography>
              <View style={styles.placeRating}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Typography
                    key={star}
                    variant="body"
                    color={star <= place.rating ? '#F59E0B' : '#6B7280'}
                  >
                    ★
                  </Typography>
                ))}
              </View>
              {place.memories && (
                <Typography variant="caption" color="#9CA3AF" style={styles.placeMemories}>
                  {place.memories}
                </Typography>
              )}
            </Card>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <MapPin size={48} color="#6B7280" />
          <Typography variant="h3" color="#9CA3AF" style={styles.emptyTitle}>
            No Places Visited
          </Typography>
          <Typography variant="body" color="#6B7280" style={styles.emptyDescription}>
            Document your travel experiences
          </Typography>
          <Button 
            title="Add Place" 
            onPress={() => setShowAddPlaceModal(true)} 
            style={styles.emptyButton} 
          />
        </View>
      )}
    </View>
  );

  const renderProjectsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.tabHeader}>
        <Typography variant="h3" color="#F9FAFB">
          Projects
        </Typography>
        <Button
          title="Add Project"
          onPress={() => setShowAddProjectModal(true)}
          variant="outline"
          size="sm"
        />
      </View>

      {(projects || []).length > 0 ? (
        <View style={styles.projectsList}>
          {(projects || []).map((project) => (
            <Card key={project.id} style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <Typography variant="h3" color="#F9FAFB">
                  {project.title}
                </Typography>
                <View style={[styles.statusBadge, styles[`${project.status}Status`]]}>
                  <Typography variant="overline" color="#F9FAFB">
                    {project.status.replace('-', ' ')}
                  </Typography>
                </View>
              </View>
              <Typography variant="caption" color="#9CA3AF" style={styles.projectDescription}>
                {project.description}
              </Typography>
              <View style={styles.projectTech}>
                {(project.technologies || []).slice(0, 3).map((tech) => (
                  <View key={tech} style={styles.techBadge}>
                    <Typography variant="overline" color="#6366F1">
                      {tech}
                    </Typography>
                  </View>
                ))}
                {(project.technologies || []).length > 3 && (
                  <Typography variant="caption" color="#9CA3AF">
                    +{(project.technologies || []).length - 3} more
                  </Typography>
                )}
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Code size={48} color="#6B7280" />
          <Typography variant="h3" color="#9CA3AF" style={styles.emptyTitle}>
            No Projects Yet
          </Typography>
          <Typography variant="body" color="#6B7280" style={styles.emptyDescription}>
            Showcase your completed work
          </Typography>
          <Button 
            title="Add Project" 
            onPress={() => setShowAddProjectModal(true)} 
            style={styles.emptyButton} 
          />
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Typography variant="body" color="#9CA3AF">Loading stats...</Typography>
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
            <BarChart3 size={32} color="#6366F1" />
            <Typography variant="h2" color="#F9FAFB" style={styles.headerTitle}>
              Life Stats
            </Typography>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabNavigation}>
          <TabButton
            id="goals"
            title="Goals"
            icon={<Target size={20} color={activeTab === 'goals' ? '#6366F1' : '#9CA3AF'} />}
            count={(lifeStats || []).length}
          />
          <TabButton
            id="books"
            title="Books"
            icon={<BookOpen size={20} color={activeTab === 'books' ? '#6366F1' : '#9CA3AF'} />}
            count={getCompletedBooksCount()}
          />
          <TabButton
            id="places"
            title="Places"
            icon={<MapPin size={20} color={activeTab === 'places' ? '#6366F1' : '#9CA3AF'} />}
            count={getVisitedPlacesCount()}
          />
          <TabButton
            id="projects"
            title="Projects"
            icon={<Code size={20} color={activeTab === 'projects' ? '#6366F1' : '#9CA3AF'} />}
            count={getCompletedProjectsCount()}
          />
        </View>

        {/* Tab Content */}
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {activeTab === 'goals' && renderGoalsTab()}
          {activeTab === 'books' && renderBooksTab()}
          {activeTab === 'places' && renderPlacesTab()}
          {activeTab === 'projects' && renderProjectsTab()}
          
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Modals */}
        <AddGoalModal
          visible={showAddGoalModal}
          onClose={() => setShowAddGoalModal(false)}
          onGoalAdded={loadStatsData}
        />
        <AddBookModal
          visible={showAddBookModal}
          onClose={() => setShowAddBookModal(false)}
          onBookAdded={loadStatsData}
        />
        <AddPlaceModal
          visible={showAddPlaceModal}
          onClose={() => setShowAddPlaceModal(false)}
          onPlaceAdded={loadStatsData}
        />
        <AddProjectModal
          visible={showAddProjectModal}
          onClose={() => setShowAddProjectModal(false)}
          onProjectAdded={loadStatsData}
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
  },
  tabContent: {
    paddingHorizontal: 20,
  },
  tabHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  // Goals styles
  goalsList: {
    gap: 16,
  },
  goalCard: {
    padding: 20,
  },
  goalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  goalInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginRight: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  careerBadge: {
    backgroundColor: '#6366F1',
  },
  healthBadge: {
    backgroundColor: '#10B981',
  },
  habitsBadge: {
    backgroundColor: '#F59E0B',
  },
  personalBadge: {
    backgroundColor: '#EC4899',
  },
  deleteButton: {
    padding: 4,
  },
  goalDescription: {
    marginBottom: 16,
  },
  goalProgress: {
    gap: 8,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressBar: {
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
  progressControls: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  progressButton: {
    minWidth: 60,
  },

  // Books styles
  booksList: {
    gap: 16,
  },
  bookCard: {
    padding: 20,
  },
  bookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bookInfo: {
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  readingStatus: {
    backgroundColor: '#F59E0B',
  },
  completedStatus: {
    backgroundColor: '#10B981',
  },
  wishlistStatus: {
    backgroundColor: '#6B7280',
  },
  bookRating: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  bookNotes: {
    marginTop: 8,
  },

  // Places styles
  placesList: {
    gap: 16,
  },
  placeCard: {
    padding: 20,
  },
  placeRating: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 8,
  },
  placeMemories: {
    marginTop: 8,
  },

  // Projects styles
  projectsList: {
    gap: 16,
  },
  projectCard: {
    padding: 20,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  planningStatus: {
    backgroundColor: '#6B7280',
  },
  'in-progressStatus': {
    backgroundColor: '#F59E0B',
  },
  projectDescription: {
    marginBottom: 12,
  },
  projectTech: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  techBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    paddingHorizontal: 32,
  },
  
  bottomPadding: {
    height: 40,
  },
});