import AsyncStorage from '@react-native-async-storage/async-storage';

export class Storage {
  static async get<T>(key: string): Promise<T | null> {
    try {
      if (!key || typeof key !== 'string') {
        console.error('Invalid storage key:', key);
        return null;
      }
      
      const value = await AsyncStorage.getItem(key);
      if (!value) return null;
      
      return JSON.parse(value);
    } catch (error) {
      console.error(`Error getting ${key}:`, error);
      return null;
    }
  }

  static async set<T>(key: string, value: T): Promise<boolean> {
    try {
      if (!key || typeof key !== 'string') {
        console.error('Invalid storage key:', key);
        return false;
      }
      
      if (value === undefined || value === null) {
        console.error('Cannot store null or undefined value for key:', key);
        return false;
      }
      
      await AsyncStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      return false;
    }
  }

  static async remove(key: string): Promise<boolean> {
    try {
      if (!key || typeof key !== 'string') {
        console.error('Invalid storage key:', key);
        return false;
      }
      
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key}:`, error);
      return false;
    }
  }

  static async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  static async clear(): Promise<boolean> {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  static async getMultiple(keys: string[]): Promise<Record<string, any>> {
    try {
      if (!Array.isArray(keys) || keys.length === 0) {
        return {};
      }
      
      const validKeys = keys.filter(key => key && typeof key === 'string');
      if (validKeys.length === 0) {
        return {};
      }
      
      const result = await AsyncStorage.multiGet(validKeys);
      const data: Record<string, any> = {};
      
      result.forEach(([key, value]) => {
        if (value) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      });
      
      return data;
    } catch (error) {
      console.error('Error getting multiple keys:', error);
      return {};
    }
  }

  static async setMultiple(keyValuePairs: Array<[string, any]>): Promise<boolean> {
    try {
      if (!Array.isArray(keyValuePairs) || keyValuePairs.length === 0) {
        return false;
      }
      
      const validPairs = keyValuePairs.filter(([key, value]) => 
        key && typeof key === 'string' && value !== undefined && value !== null
      );
      
      if (validPairs.length === 0) {
        return false;
      }
      
      const stringifiedPairs = validPairs.map(([key, value]) => [
        key,
        JSON.stringify(value)
      ]);
      
      await AsyncStorage.multiSet(stringifiedPairs);
      return true;
    } catch (error) {
      console.error('Error setting multiple keys:', error);
      return false;
    }
  }
}

// Storage keys
export const STORAGE_KEYS = {
  DAILY_CHECKINS: 'daily_checkins',
  LIFE_STATS: 'life_stats',
  BOOKS: 'books',
  PLACES: 'places',
  PROJECTS: 'projects',
  DISTRACTIONS: 'distractions',
  JOURNAL_ENTRIES: 'journal_entries',
  MANTRAS: 'mantras',
  VISION_ITEMS: 'vision_items',
  USER_PREFERENCES: 'user_preferences',
  FOCUS_STREAK: 'focus_streak',
  ACHIEVEMENTS: 'achievements',
  APP_SETTINGS: 'app_settings',
} as const;

// Storage utilities
export const StorageUtils = {
  // Backup all data
  async exportData(): Promise<string | null> {
    try {
      const allKeys = await Storage.getAllKeys();
      const appKeys = allKeys.filter(key => 
        Object.values(STORAGE_KEYS).includes(key as any)
      );
      
      if (appKeys.length === 0) {
        return JSON.stringify({
          version: '1.0.0',
          exportDate: new Date().toISOString(),
          data: {}
        });
      }
      
      const data = await Storage.getMultiple(appKeys);
      return JSON.stringify({
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        data
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  },

  // Restore data from backup
  async importData(jsonData: string): Promise<boolean> {
    try {
      if (!jsonData || typeof jsonData !== 'string') {
        return false;
      }
      
      const backup = JSON.parse(jsonData);
      
      if (!backup.data || typeof backup.data !== 'object') {
        throw new Error('Invalid backup format');
      }

      const keyValuePairs = Object.entries(backup.data);
      return await Storage.setMultiple(keyValuePairs);
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },

  // Get storage usage info
  async getStorageInfo(): Promise<{
    totalKeys: number;
    appKeys: number;
    estimatedSize: number;
  }> {
    try {
      const allKeys = await Storage.getAllKeys();
      const appKeys = allKeys.filter(key => 
        Object.values(STORAGE_KEYS).includes(key as any)
      );
      
      const data = await Storage.getMultiple(appKeys);
      const estimatedSize = JSON.stringify(data).length;
      
      return {
        totalKeys: allKeys.length,
        appKeys: appKeys.length,
        estimatedSize
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return {
        totalKeys: 0,
        appKeys: 0,
        estimatedSize: 0
      };
    }
  }
};