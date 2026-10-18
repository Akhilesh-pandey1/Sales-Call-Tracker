import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DialerScreen } from '@/features/dialer';
import { MyStatsScreen, SettingsScreen } from '@/features/stats';
import { useJanitor, useSync } from '@/features/tracking';
import { Icon } from '@/components/ui/icon';
import { ChartColumn, Phone, Settings } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { MainTabsParamList } from './main-tabs-param-list';

const MainTabs = createBottomTabNavigator<MainTabsParamList>();

function TabIcon({ focused, icon }: { focused: boolean; icon: LucideIcon }) {
  const iconSize = 20;
  const iconColorClass = focused ? 'text-primary' : 'text-muted-foreground';
  return <Icon as={icon} size={iconSize} className={iconColorClass} />;
}

function DialerTabIcon({ focused }: { focused: boolean }) {
  return <TabIcon focused={focused} icon={Phone} />;
}

function MyStatsTabIcon({ focused }: { focused: boolean }) {
  return <TabIcon focused={focused} icon={ChartColumn} />;
}

function SettingsTabIcon({ focused }: { focused: boolean }) {
  return <TabIcon focused={focused} icon={Settings} />;
}

export function AppNavigator() {
  useJanitor();
  useSync();

  return (
    <MainTabs.Navigator screenOptions={{ headerShown: false }}>
      <MainTabs.Screen
        name="Dialer"
        component={DialerScreen}
        options={{ tabBarIcon: DialerTabIcon }}
      />
      <MainTabs.Screen
        name="My Stats"
        component={MyStatsScreen}
        options={{ tabBarIcon: MyStatsTabIcon }}
      />
      <MainTabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarIcon: SettingsTabIcon }}
      />
    </MainTabs.Navigator>
  );
}
