import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { DialerScreen } from '@/features/dialer';
import { MyStatsScreen } from '@/features/stats';
import type { MainTabsParamList } from './main-tabs-param-list';

function SettingsPlaceholderScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <Text className="text-2xl font-semibold text-foreground">Settings</Text>
    </View>
  );
}

const MainTabs = createBottomTabNavigator<MainTabsParamList>();

export function AppNavigator() {
  return (
    <MainTabs.Navigator screenOptions={{ headerShown: false }}>
      <MainTabs.Screen name="Dialer" component={DialerScreen} />
      <MainTabs.Screen name="My Stats" component={MyStatsScreen} />
      <MainTabs.Screen
        name="Settings"
        component={SettingsPlaceholderScreen}
        options={{ tabBarButton: () => null }}
      />
    </MainTabs.Navigator>
  );
}
