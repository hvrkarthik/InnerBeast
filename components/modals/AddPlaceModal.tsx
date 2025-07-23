import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, MapPin, Star, CircleCheck as CheckCircle, CircleAlert as AlertCircle, Calendar } from 'lucide-react-native';
import { Storage, STORAGE_KEYS } from '@/utils/storage';
import { Place } from '@/types';

interface AddPlaceModalProps {
  visible: boolean;
  onClose: () => void;
  onPlaceAdded: () => void;
}

const POPULAR_DESTINATIONS = [
  { name: 'Eiffel Tower', location: 'Paris, France' },
  { name: 'Times Square', location: 'New York, USA' },
  { name: 'Machu Picchu', location: 'Peru' },
  { name: 'Great Wall of China', location: 'China' },
  { name: 'Taj Mahal', location: 'Agra, India' },
];

const DATE_SUGGESTIONS = [
  'January 2024',
  'February 2024',
  'March 2024',
  'Summer 2023',
  'Winter 2023',
  'Last month',
];

export function AddPlaceModal({ visible, onClose, onPlaceAdded }: AddPlaceModalProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState('');
  const [rating, setRating] = useState(0);
  const [memories, setMemories] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setName('');
    setLocation('');
    setDate('');
    setRating(0);
    setMemories('');
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    if (loading) return;
    resetForm();
    onClose();
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      setError('Please enter the place name.');
      return false;
    }
    if (name.trim().length < 2) {
      setError('Place name must be at least 2 characters long.');
      return false;
    }
    if (!location.trim()) {
      setError('Please enter the location.');
      return false;
    }
    if (location.trim().length < 2) {
      setError('Location must be at least 2 characters long.');
      return false;
    }
    if (!date.trim()) {
      setError('Please enter when you visited this place.');
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
      const existingPlaces = await Storage.get<Place[]>(STORAGE_KEYS.PLACES) || [];
      
      // Check for duplicate places
      const duplicatePlace = existingPlaces.find(
        place => place.name.toLowerCase().trim() === name.toLowerCase().trim() &&
                 place.location.toLowerCase().trim() === location.toLowerCase().trim()
      );
      
      if (duplicatePlace) {
        setError('This place is already in your travel list. Please check your existing places.');
        setLoading(false);
        return;
      }

      const newPlace: Place = {
        id: Date.now().toString(),
        name: name.trim(),
        location: location.trim(),
        date: date.trim(),
        rating,
        memories: memories.trim(),
      };

      const updatedPlaces = [...existingPlaces, newPlace];
      await Storage.set(STORAGE_KEYS.PLACES, updatedPlaces);
      
      setSuccess('Place added successfully! 🗺️');

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
        onPlaceAdded();
        handleClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error saving place:', error);
      setError('Failed to save your place. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillPopularDestination = (destination: { name: string; location: string }) => {
    setName(destination.name);
    setLocation(destination.location);
    setError(null);
  };

  const fillDateSuggestion = (dateSuggestion: string) => {
    setDate(dateSuggestion);
    setError(null);
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
            <MapPin size={24} color="#6366F1" />
            <Typography variant="h2" color="#F9FAFB" style={styles.headerTitle}>
              Add Place
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
            {/* Popular Destinations */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Popular Destinations
              </Typography>
              <View style={styles.destinationsContainer}>
                {POPULAR_DESTINATIONS.map((destination, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.destinationButton}
                    onPress={() => fillPopularDestination(destination)}
                    disabled={loading}
                  >
                    <Typography variant="caption" color="#6366F1" style={styles.destinationName}>
                      {destination.name}
                    </Typography>
                    <Typography variant="overline" color="#9CA3AF">
                      {destination.location}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Name */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Place Name *
              </Typography>
              <Input
                value={name}
                onChangeText={(text) => {
                  setName(text);
                  setError(null);
                }}
                placeholder="e.g., Eiffel Tower, Central Park..."
                style={styles.input}
                maxLength={100}
                editable={!loading}
              />
              <Typography variant="overline" color="#6B7280" style={styles.charCount}>
                {name.length}/100
              </Typography>
            </View>

            {/* Location */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Location *
              </Typography>
              <Input
                value={location}
                onChangeText={(text) => {
                  setLocation(text);
                  setError(null);
                }}
                placeholder="e.g., Paris, France"
                style={styles.input}
                maxLength={100}
                editable={!loading}
              />
              <Typography variant="overline" color="#6B7280" style={styles.charCount}>
                {location.length}/100
              </Typography>
            </View>

            {/* Date */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Date Visited *
              </Typography>
              <View style={styles.dateContainer}>
                <Calendar size={16} color="#6366F1" />
                <Typography variant="caption" color="#9CA3AF">
                  Quick suggestions:
                </Typography>
              </View>
              <View style={styles.dateSuggestions}>
                {DATE_SUGGESTIONS.map((dateSuggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.dateSuggestionButton}
                    onPress={() => fillDateSuggestion(dateSuggestion)}
                    disabled={loading}
                  >
                    <Typography variant="overline" color="#6366F1">
                      {dateSuggestion}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
              <Input
                value={date}
                onChangeText={(text) => {
                  setDate(text);
                  setError(null);
                }}
                placeholder="e.g., March 2024, Summer 2023..."
                style={styles.input}
                maxLength={50}
                editable={!loading}
              />
            </View>

            {/* Rating */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Rating
              </Typography>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => setRating(star)}
                    style={styles.starButton}
                    disabled={loading}
                  >
                    <Star
                      size={32}
                      color={star <= rating ? '#F59E0B' : '#6B7280'}
                      fill={star <= rating ? '#F59E0B' : 'none'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
              <Typography variant="caption" color="#9CA3AF" style={styles.ratingText}>
                {rating === 0 ? 'Tap stars to rate your experience' : `${rating} out of 5 stars`}
              </Typography>
            </View>

            {/* Memories */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Memories & Notes (optional)
              </Typography>
              <Input
                value={memories}
                onChangeText={setMemories}
                placeholder="Share your favorite memories from this place..."
                multiline
                numberOfLines={4}
                style={[styles.input, styles.textArea]}
                maxLength={500}
                editable={!loading}
              />
              <Typography variant="overline" color="#6B7280" style={styles.charCount}>
                {memories.length}/500
              </Typography>
            </View>
          </Card>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={loading ? 'Saving...' : 'Add Place'}
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
    minHeight: 100,
  },
  charCount: {
    textAlign: 'right',
    marginTop: 4,
  },
  destinationsContainer: {
    gap: 8,
  },
  destinationButton: {
    padding: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  destinationName: {
    fontWeight: '600',
    marginBottom: 2,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  dateSuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  dateSuggestionButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    textAlign: 'center',
    fontStyle: 'italic',
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