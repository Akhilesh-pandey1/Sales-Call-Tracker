import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DialerScreen } from '@/features/dialer';
import { MyStatsScreen } from '@/features/stats';
import { useJanitor } from '@/features/tracking';

type MainTabsParamList = {
  Dialer: undefined;
  'My Stats': undefined;
};

const MainTabs = createBottomTabNavigator<MainTabsParamList>();

export function AppNavigator() {
  useJanitor();

  return (
    <MainTabs.Navigator screenOptions={{ headerShown: false }}>
      <MainTabs.Screen name="Dialer" component={DialerScreen} />
      <MainTabs.Screen name="My Stats" component={MyStatsScreen} />
    </MainTabs.Navigator>
  );
}
