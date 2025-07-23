import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, Code, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Github, Globe } from 'lucide-react-native';
import { Storage, STORAGE_KEYS } from '@/utils/storage';
import { Project } from '@/types';

interface AddProjectModalProps {
  visible: boolean;
  onClose: () => void;
  onProjectAdded: () => void;
}

const STATUS_OPTIONS = [
  { id: 'planning', label: 'Planning', color: '#6B7280', icon: '📋' },
  { id: 'in-progress', label: 'In Progress', color: '#F59E0B', icon: '⚡' },
  { id: 'completed', label: 'Completed', color: '#10B981', icon: '✅' },
] as const;

const POPULAR_TECHNOLOGIES = [
  'React', 'TypeScript', 'Node.js', 'Python', 'JavaScript', 'Swift',
  'Kotlin', 'Flutter', 'React Native', 'Vue.js', 'Angular', 'Express',
  'MongoDB', 'PostgreSQL', 'Firebase', 'AWS', 'Docker', 'Git'
];

const PROJECT_EXAMPLES = [
  { title: 'Personal Portfolio Website', description: 'A responsive portfolio showcasing my projects and skills' },
  { title: 'Task Management App', description: 'A mobile app for organizing daily tasks and productivity' },
  { title: 'E-commerce Platform', description: 'Full-stack web application for online shopping' },
  { title: 'Weather Dashboard', description: 'Real-time weather tracking with beautiful visualizations' },
];

export function AddProjectModal({ visible, onClose, onProjectAdded }: AddProjectModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'planning' | 'in-progress' | 'completed'>('planning');
  const [technologies, setTechnologies] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [liveUrl, setLiveUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setStatus('planning');
    setTechnologies('');
    setGithubUrl('');
    setLiveUrl('');
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
      setError('Please enter the project title.');
      return false;
    }
    if (title.trim().length < 3) {
      setError('Project title must be at least 3 characters long.');
      return false;
    }
    if (!description.trim()) {
      setError('Please enter the project description.');
      return false;
    }
    if (description.trim().length < 10) {
      setError('Project description must be at least 10 characters long.');
      return false;
    }

    // Validate URLs if provided
    if (githubUrl.trim() && !isValidUrl(githubUrl.trim())) {
      setError('Please enter a valid GitHub URL.');
      return false;
    }
    if (liveUrl.trim() && !isValidUrl(liveUrl.trim())) {
      setError('Please enter a valid live URL.');
      return false;
    }

    return true;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const existingProjects = await Storage.get<Project[]>(STORAGE_KEYS.PROJECTS) || [];
      
      // Check for duplicate projects
      const duplicateProject = existingProjects.find(
        project => project.title.toLowerCase().trim() === title.toLowerCase().trim()
      );
      
      if (duplicateProject) {
        setError('A project with this title already exists. Please choose a different title.');
        setLoading(false);
        return;
      }

      const techArray = technologies.trim() 
        ? technologies.split(',').map(tech => tech.trim()).filter(tech => tech.length > 0)
        : [];

      const newProject: Project = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        status,
        technologies: techArray,
        githubUrl: githubUrl.trim() || undefined,
        liveUrl: liveUrl.trim() || undefined,
        screenshots: [],
        createdAt: Date.now(),
        completedAt: status === 'completed' ? Date.now() : undefined,
      };

      const updatedProjects = [...existingProjects, newProject];
      await Storage.set(STORAGE_KEYS.PROJECTS, updatedProjects);
      
      setSuccess('Project added successfully! 🚀');

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
        onProjectAdded();
        handleClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error saving project:', error);
      setError('Failed to save your project. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillExample = (example: { title: string; description: string }) => {
    setTitle(example.title);
    setDescription(example.description);
    setError(null);
  };

  const addTechnology = (tech: string) => {
    const currentTechs = technologies.split(',').map(t => t.trim()).filter(t => t.length > 0);
    if (!currentTechs.includes(tech)) {
      const newTechs = [...currentTechs, tech];
      setTechnologies(newTechs.join(', '));
    }
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
            <Code size={24} color="#6366F1" />
            <Typography variant="h2" color="#F9FAFB" style={styles.headerTitle}>
              Add Project
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
            {/* Project Examples */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Project Ideas
              </Typography>
              <View style={styles.examplesContainer}>
                {PROJECT_EXAMPLES.map((example, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.exampleButton}
                    onPress={() => fillExample(example)}
                    disabled={loading}
                  >
                    <Typography variant="caption" color="#6366F1" style={styles.exampleTitle}>
                      {example.title}
                    </Typography>
                    <Typography variant="overline" color="#9CA3AF">
                      {example.description}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Title */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Project Title *
              </Typography>
              <Input
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  setError(null);
                }}
                placeholder="Enter project title..."
                style={styles.input}
                maxLength={100}
                editable={!loading}
              />
              <Typography variant="overline" color="#6B7280" style={styles.charCount}>
                {title.length}/100
              </Typography>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Description *
              </Typography>
              <Input
                value={description}
                onChangeText={(text) => {
                  setDescription(text);
                  setError(null);
                }}
                placeholder="Describe your project..."
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
                maxLength={500}
                editable={!loading}
              />
              <Typography variant="overline" color="#6B7280" style={styles.charCount}>
                {description.length}/500
              </Typography>
            </View>

            {/* Status */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Project Status
              </Typography>
              <View style={styles.statusGrid}>
                {STATUS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={[
                      styles.statusButton,
                      status === option.id && styles.selectedStatusButton,
                      { borderColor: option.color }
                    ]}
                    onPress={() => setStatus(option.id)}
                    disabled={loading}
                  >
                    <Typography variant="body" style={styles.statusIcon}>
                      {option.icon}
                    </Typography>
                    <Typography
                      variant="caption"
                      color={status === option.id ? option.color : '#9CA3AF'}
                    >
                      {option.label}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Technologies */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Technologies (optional)
              </Typography>
              <View style={styles.techContainer}>
                <Typography variant="overline" color="#9CA3AF" style={styles.techLabel}>
                  Popular technologies:
                </Typography>
                <View style={styles.techSuggestions}>
                  {POPULAR_TECHNOLOGIES.slice(0, 8).map((tech) => (
                    <TouchableOpacity
                      key={tech}
                      style={styles.techSuggestionButton}
                      onPress={() => addTechnology(tech)}
                      disabled={loading}
                    >
                      <Typography variant="overline" color="#6366F1">
                        {tech}
                      </Typography>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <Input
                value={technologies}
                onChangeText={setTechnologies}
                placeholder="React, TypeScript, Node.js (comma separated)"
                style={styles.input}
                maxLength={200}
                editable={!loading}
              />
              <Typography variant="overline" color="#6B7280" style={styles.charCount}>
                {technologies.length}/200
              </Typography>
            </View>

            {/* GitHub URL */}
            <View style={styles.inputGroup}>
              <View style={styles.urlHeader}>
                <Github size={16} color="#6366F1" />
                <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                  GitHub URL (optional)
                </Typography>
              </View>
              <Input
                value={githubUrl}
                onChangeText={(text) => {
                  setGithubUrl(text);
                  setError(null);
                }}
                placeholder="https://github.com/username/project"
                style={styles.input}
                autoCapitalize="none"
                maxLength={200}
                editable={!loading}
              />
            </View>

            {/* Live URL */}
            <View style={styles.inputGroup}>
              <View style={styles.urlHeader}>
                <Globe size={16} color="#6366F1" />
                <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                  Live URL (optional)
                </Typography>
              </View>
              <Input
                value={liveUrl}
                onChangeText={(text) => {
                  setLiveUrl(text);
                  setError(null);
                }}
                placeholder="https://yourproject.com"
                style={styles.input}
                autoCapitalize="none"
                maxLength={200}
                editable={!loading}
              />
            </View>
          </Card>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={loading ? 'Saving...' : 'Add Project'}
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
  exampleTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },
  statusGrid: {
    gap: 12,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#374151',
    borderWidth: 2,
    borderColor: '#4B5563',
    alignItems: 'center',
    gap: 4,
  },
  selectedStatusButton: {
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
  },
  statusIcon: {
    fontSize: 20,
  },
  techContainer: {
    marginBottom: 12,
  },
  techLabel: {
    marginBottom: 8,
  },
  techSuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  techSuggestionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  urlHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
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