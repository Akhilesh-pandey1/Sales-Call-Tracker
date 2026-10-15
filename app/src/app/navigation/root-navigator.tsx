import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { LoginScreen } from '@/features/auth/screens/login-screen';
import { AppNavigator } from './app-navigator';

export function RootNavigator() {
  const authStatus = useAuth();

  if (authStatus === 'checking') {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {authStatus === 'logged-in' ? <AppNavigator /> : <LoginScreen />}
    </NavigationContainer>
  );
}
