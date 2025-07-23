import { DailyCheckIn, LifeStat } from '@/types';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'target' | 'flame';
  color: string;
  unlocked: boolean;
  progress?: number;
  maxProgress?: number;
}

export function calculateAchievements(
  checkIns: DailyCheckIn[] = [],
  lifeStats: LifeStat[] = []
): Achievement[] {
  try {
    const safeCheckIns = Array.isArray(checkIns) ? checkIns : [];
    const safeLifeStats = Array.isArray(lifeStats) ? lifeStats : [];
    
    const achievements: Achievement[] = [
      {
        id: 'first-checkin',
        title: 'First Steps',
        description: 'Complete your first daily check-in',
        icon: 'star',
        color: '#10B981',
        unlocked: safeCheckIns.length > 0,
      },
      {
        id: 'week-streak',
        title: 'Week Warrior',
        description: 'Complete 7 consecutive check-ins',
        icon: 'flame',
        color: '#F59E0B',
        unlocked: getConsecutiveStreak(safeCheckIns) >= 7,
        progress: Math.min(getConsecutiveStreak(safeCheckIns), 7),
        maxProgress: 7,
      },
      {
        id: 'month-streak',
        title: 'Monthly Master',
        description: 'Complete 30 consecutive check-ins',
        icon: 'trophy',
        color: '#6366F1',
        unlocked: getConsecutiveStreak(safeCheckIns) >= 30,
        progress: Math.min(getConsecutiveStreak(safeCheckIns), 30),
        maxProgress: 30,
      },
      {
        id: 'goal-setter',
        title: 'Goal Setter',
        description: 'Create your first life goal',
        icon: 'target',
        color: '#EC4899',
        unlocked: safeLifeStats.length > 0,
      },
      {
        id: 'goal-achiever',
        title: 'Goal Achiever',
        description: 'Complete your first goal',
        icon: 'trophy',
        color: '#10B981',
        unlocked: safeLifeStats.some(stat => 
          stat && typeof stat.progress === 'number' && 
          typeof stat.target === 'number' && 
          stat.progress >= stat.target
        ),
      },
      {
        id: 'reflection-master',
        title: 'Reflection Master',
        description: 'Complete 50 check-ins',
        icon: 'star',
        color: '#8B5CF6',
        unlocked: safeCheckIns.length >= 50,
        progress: Math.min(safeCheckIns.length, 50),
        maxProgress: 50,
      },
    ];

    return achievements;
  } catch (error) {
    console.error('Error calculating achievements:', error);
    return [];
  }
}

function getConsecutiveStreak(checkIns: DailyCheckIn[]): number {
  try {
    if (!Array.isArray(checkIns) || checkIns.length === 0) return 0;

    const sortedDates = checkIns
      .filter(c => c && c.date && typeof c.date === 'string')
      .map(c => c.date)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (sortedDates.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();

    for (const dateStr of sortedDates) {
      try {
        const checkDate = currentDate.toISOString().split('T')[0];
        if (dateStr === checkDate) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      } catch (error) {
        console.error('Error processing date in streak calculation:', error);
        break;
      }
    }

    return streak;
  } catch (error) {
    console.error('Error calculating consecutive streak:', error);
    return 0;
  }
}