export interface DailyCheckIn {
  id: string;
  date: string;
  focus: string;
  mood: number;
  feeling: string;
  avoidance: string;
  journal?: string;
  timestamp: number;
}

export interface LifeStat {
  id: string;
  category: 'career' | 'health' | 'habits' | 'personal';
  title: string;
  description?: string;
  progress: number;
  target: number;
  unit: string;
  createdAt: number;
  updatedAt: number;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  rating: number;
  status: 'reading' | 'completed' | 'wishlist';
  startDate?: string;
  completedDate?: string;
  notes?: string;
}

export interface Place {
  id: string;
  name: string;
  location: string;
  date: string;
  rating: number;
  memories?: string;
  photo?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'planning' | 'in-progress' | 'completed';
  technologies: string[];
  githubUrl?: string;
  liveUrl?: string;
  screenshots: string[];
  createdAt: number;
  completedAt?: number;
}

export interface Distraction {
  id: string;
  content: string;
  type: 'social-media' | 'entertainment' | 'procrastination' | 'other';
  timestamp: number;
  intensity: number; // 1-5
}

export interface JournalEntry {
  id: string;
  content: string;
  mood: number;
  tags: string[];
  date: string;
  aiReflection?: string;
  timestamp: number;
}

export interface Mantra {
  id: string;
  text: string;
  category: 'motivation' | 'focus' | 'growth' | 'peace';
  isActive: boolean;
  createdAt: number;
}

export interface VisionItem {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  category: 'career' | 'lifestyle' | 'personal' | 'health';
  targetDate?: string;
  isAchieved: boolean;
  createdAt: number;
}