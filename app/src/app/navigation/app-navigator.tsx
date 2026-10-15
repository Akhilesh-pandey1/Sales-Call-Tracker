import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DialerScreen } from '@/features/dialer/screens/dialer-screen';
import { MyStatsScreen } from '@/features/stats/screens/my-stats-screen';

type MainTabsParamList = {
  Dialer: undefined;
  'My Stats': undefined;
};

const MainTabs = createBottomTabNavigator<MainTabsParamList>();

export function AppNavigator() {
  return (
    <MainTabs.Navigator screenOptions={{ headerShown: false }}>
      <MainTabs.Screen name="Dialer" component={DialerScreen} />
      <MainTabs.Screen name="My Stats" component={MyStatsScreen} />
    </MainTabs.Navigator>
  );
}
