import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DialerScreen } from '@/features/dialer';
import { MyStatsScreen, SettingsScreen } from '@/features/stats';
import type { MainTabsParamList } from './main-tabs-param-list';

const MainTabs = createBottomTabNavigator<MainTabsParamList>();

export function AppNavigator() {
  return (
    <MainTabs.Navigator screenOptions={{ headerShown: false }}>
      <MainTabs.Screen name="Dialer" component={DialerScreen} />
      <MainTabs.Screen name="My Stats" component={MyStatsScreen} />
      <MainTabs.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ tabBarButton: () => null }}
      />
    </MainTabs.Navigator>
  );
}
