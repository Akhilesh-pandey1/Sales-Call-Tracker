import {
  createBottomTabNavigator,
  type BottomTabNavigationOptions,
} from '@react-navigation/bottom-tabs';
import { DialerScreen } from '@/features/dialer';
import { MyStatsScreen, SettingsScreen } from '@/features/stats';
import { useSync } from '@/features/tracking';
import { Icon } from '@/components/ui/icon';
import { ChartColumn, Phone, Settings } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import type { MainTabsParamList } from './main-tabs-param-list';

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
const MyStatsTabIcon = createTabIcon(ChartColumn);
const SettingsTabIcon = createTabIcon(Settings);

export function AppNavigator() {
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
