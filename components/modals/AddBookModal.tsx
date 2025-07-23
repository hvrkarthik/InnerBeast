import React, { useState } from 'react';
import { View, StyleSheet, Modal, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from '@/components/ui/Card';
import { Typography } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { X, BookOpen, Star, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import { Storage, STORAGE_KEYS } from '@/utils/storage';
import { Book } from '@/types';

interface AddBookModalProps {
  visible: boolean;
  onClose: () => void;
  onBookAdded: () => void;
}

const STATUS_OPTIONS = [
  { id: 'wishlist', label: 'Want to Read', color: '#6B7280', icon: '📚' },
  { id: 'reading', label: 'Currently Reading', color: '#F59E0B', icon: '📖' },
  { id: 'completed', label: 'Completed', color: '#10B981', icon: '✅' },
] as const;

const POPULAR_BOOKS = [
  { title: 'Atomic Habits', author: 'James Clear' },
  { title: 'The 7 Habits of Highly Effective People', author: 'Stephen Covey' },
  { title: 'Think and Grow Rich', author: 'Napoleon Hill' },
  { title: 'The Power of Now', author: 'Eckhart Tolle' },
  { title: 'Mindset', author: 'Carol Dweck' },
];

export function AddBookModal({ visible, onClose, onBookAdded }: AddBookModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState<'reading' | 'completed' | 'wishlist'>('wishlist');
  const [rating, setRating] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const resetForm = () => {
    setTitle('');
    setAuthor('');
    setStatus('wishlist');
    setRating(0);
    setNotes('');
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
      setError('Please enter the book title.');
      return false;
    }
    if (title.trim().length < 2) {
      setError('Book title must be at least 2 characters long.');
      return false;
    }
    if (!author.trim()) {
      setError('Please enter the author name.');
      return false;
    }
    if (author.trim().length < 2) {
      setError('Author name must be at least 2 characters long.');
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
      const existingBooks = await Storage.get<Book[]>(STORAGE_KEYS.BOOKS) || [];
      
      // Check for duplicate books
      const duplicateBook = existingBooks.find(
        book => book.title.toLowerCase().trim() === title.toLowerCase().trim() &&
                book.author.toLowerCase().trim() === author.toLowerCase().trim()
      );
      
      if (duplicateBook) {
        setError('This book is already in your library. Please check your existing books.');
        setLoading(false);
        return;
      }

      const currentDate = new Date().toISOString().split('T')[0];
      
      const newBook: Book = {
        id: Date.now().toString(),
        title: title.trim(),
        author: author.trim(),
        status,
        rating: status === 'completed' ? rating : 0,
        notes: notes.trim(),
        startDate: status === 'reading' ? currentDate : undefined,
        completedDate: status === 'completed' ? currentDate : undefined,
      };

      const updatedBooks = [...existingBooks, newBook];
      await Storage.set(STORAGE_KEYS.BOOKS, updatedBooks);
      
      setSuccess('Book added successfully! 📚');

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
        onBookAdded();
        handleClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error saving book:', error);
      setError('Failed to save your book. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillPopularBook = (book: { title: string; author: string }) => {
    setTitle(book.title);
    setAuthor(book.author);
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
            <BookOpen size={24} color="#6366F1" />
            <Typography variant="h2" color="#F9FAFB" style={styles.headerTitle}>
              Add Book
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
            {/* Popular Books */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Popular Books
              </Typography>
              <View style={styles.popularBooksContainer}>
                {POPULAR_BOOKS.map((book, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.popularBookButton}
                    onPress={() => fillPopularBook(book)}
                    disabled={loading}
                  >
                    <Typography variant="caption" color="#6366F1" style={styles.popularBookTitle}>
                      {book.title}
                    </Typography>
                    <Typography variant="overline" color="#9CA3AF">
                      by {book.author}
                    </Typography>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Title */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Book Title *
              </Typography>
              <Input
                value={title}
                onChangeText={(text) => {
                  setTitle(text);
                  setError(null);
                }}
                placeholder="Enter book title..."
                style={styles.input}
                maxLength={200}
                editable={!loading}
              />
              <Typography variant="overline" color="#6B7280" style={styles.charCount}>
                {title.length}/200
              </Typography>
            </View>

            {/* Author */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Author *
              </Typography>
              <Input
                value={author}
                onChangeText={(text) => {
                  setAuthor(text);
                  setError(null);
                }}
                placeholder="Enter author name..."
                style={styles.input}
                maxLength={100}
                editable={!loading}
              />
              <Typography variant="overline" color="#6B7280" style={styles.charCount}>
                {author.length}/100
              </Typography>
            </View>

            {/* Status */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Reading Status
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
                    onPress={() => {
                      setStatus(option.id);
                      if (option.id !== 'completed') {
                        setRating(0);
                      }
                    }}
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

            {/* Rating */}
            {status === 'completed' && (
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
                  {rating === 0 ? 'Tap stars to rate' : `${rating} out of 5 stars`}
                </Typography>
              </View>
            )}

            {/* Notes */}
            <View style={styles.inputGroup}>
              <Typography variant="caption" color="#9CA3AF" style={styles.label}>
                Notes (optional)
              </Typography>
              <Input
                value={notes}
                onChangeText={setNotes}
                placeholder="Your thoughts about this book..."
                multiline
                numberOfLines={4}
                style={[styles.input, styles.textArea]}
                maxLength={500}
                editable={!loading}
              />
              <Typography variant="overline" color="#6B7280" style={styles.charCount}>
                {notes.length}/500
              </Typography>
            </View>
          </Card>

          {/* Save Button */}
          <View style={styles.buttonContainer}>
            <Button
              title={loading ? 'Saving...' : 'Add Book'}
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
  popularBooksContainer: {
    gap: 8,
  },
  popularBookButton: {
    padding: 12,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  popularBookTitle: {
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