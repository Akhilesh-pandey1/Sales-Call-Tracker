import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DialerScreen } from '@/features/dialer';
import { MyStatsScreen } from '@/features/stats';

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
