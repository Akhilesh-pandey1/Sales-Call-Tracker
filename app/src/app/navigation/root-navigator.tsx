import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View } from 'react-native';
import { LoginScreen, useAuth } from '@/features/auth';
import { useCallTracker } from '@/features/tracking';
import { AppNavigator } from './app-navigator';

function AuthenticatedApp() {
  useCallTracker();
  return <AppNavigator />;
}

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
        <AuthenticatedApp />
      ) : (
        <LoginScreen onLogin={loginUser} />
      )}
    </NavigationContainer>
  );
}
