import {
  createBottomTabNavigator,
  type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { DialerScreen, useTappedNumberLinks } from '@/features/dialer';
import { ScheduledScreen } from '@/features/scheduled';
import { MyStatsScreen, SettingsScreen } from '@/features/stats';
import { useReminderPress, useSync } from '@/features/tracking';
import { Icon } from '@/components/ui/icon';
import { Calendar, ChartColumn, Phone, Settings } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { MainTabsParamList } from './main-tabs-param-list';
import { useReminderPressNavigation } from './use-reminder-press-navigation';
import { useTappedNumberNavigation } from './use-tapped-number-navigation';

const MainTabs = createBottomTabNavigator<MainTabsParamList>();

type TabIconProps = { focused: boolean };
type TabBarIconComponent = NonNullable<
  BottomTabNavigationOptions['tabBarIcon']
>;

function createTabIcon(icon: LucideIcon): TabBarIconComponent {
  function TabIcon({ focused }: TabIconProps) {
    const iconSize = 20;
    const iconColorClass = focused ? 'text-primary' : 'text-muted-foreground';
    return <Icon as={icon} size={iconSize} className={iconColorClass} />;
  }
  return TabIcon;
}

const DialerTabIcon = createTabIcon(Phone);
const ScheduledTabIcon = createTabIcon(Calendar);
const MyStatsTabIcon = createTabIcon(ChartColumn);
const SettingsTabIcon = createTabIcon(Settings);

export function AppNavigator() {
  useSync();
  useReminderPress();
  useReminderPressNavigation();
  useTappedNumberNavigation();
  useTappedNumberLinks();

  return (
    <MainTabs.Navigator screenOptions={{ headerShown: false }}>
      <MainTabs.Screen
        name="Dialer"
        component={DialerScreen}
        options={{ tabBarIcon: DialerTabIcon }}
      />
      <MainTabs.Screen
        name="Scheduled"
        component={ScheduledScreen}
        options={{ tabBarIcon: ScheduledTabIcon }}
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
