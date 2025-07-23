import { Tabs } from 'expo-router';
import { Home, Brain, BarChart3, BookOpen, Shield } from 'lucide-react-native';
import { StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#6366F1',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabelStyle: styles.tabBarLabel,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="checkin"
        options={{
          title: 'Check-in',
          tabBarIcon: ({ size, color }) => (
            <Brain size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="stats"
        options={{
          title: 'Stats',
          tabBarIcon: ({ size, color }) => (
            <BarChart3 size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ size, color }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="focus"
        options={{
          title: 'Focus',
          tabBarIcon: ({ size, color }) => (
            <Shield size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#111827',
    borderTopColor: '#374151',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    height: 80,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    marginTop: 4,
  },
});