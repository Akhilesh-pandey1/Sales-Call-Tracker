import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { LoginScreen, useAuth } from '@/features/auth';
import { AppNavigator } from './app-navigator';

export function RootNavigator() {
  const { authStatus, loginUser } = useAuth();

  if (authStatus === 'checking') {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {authStatus === 'logged-in' ? (
        <AppNavigator />
      ) : (
        <LoginScreen onLogin={loginUser} />
      )}
    </NavigationContainer>
  );
}
