import { useState } from 'react';
import { ScrollView, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { AlertCircle, Phone } from 'lucide-react-native';
import type { LoginResult } from '../hooks/use-auth';

type LoginScreenProps = {
  onLogin: (userName: string, userPassword: string) => Promise<LoginResult>;
};

const screenPaddingHorizontal = 24;
const screenPaddingVertical = 40;

const loginContentContainerStyle: StyleProp<ViewStyle> = {
  flexGrow: 1,
  justifyContent: 'center',
  paddingHorizontal: screenPaddingHorizontal,
  paddingVertical: screenPaddingVertical,
};

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [userName, setUserName] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [loginErrorMessage, setLoginErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLoginPress(): Promise<void> {
    if (isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    setLoginErrorMessage(null);
    const loginResult: LoginResult = await onLogin(userName, userPassword);
    setIsSubmitting(false);
    if (!loginResult.success) {
      setLoginErrorMessage(loginResult.errorMessage);
    }
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={loginContentContainerStyle}
      keyboardShouldPersistTaps="handled"
    >
      <View className="items-center">
        <View className="h-14 w-14 items-center justify-center rounded-2xl bg-primary">
          <Icon as={Phone} className="text-primary-foreground" size={32} />
        </View>
        <Text className="mt-4 text-xl font-bold tracking-tight">Apex Sales Call</Text>
        <Text className="mt-1 text-sm text-muted-foreground">Sign in to start calling</Text>
      </View>

      <View className="mt-7 rounded-2xl border border-border bg-card p-5 shadow-sm shadow-black/5">
        <Text className="text-sm font-medium">Name</Text>
        <Input
          className="mt-1.5 h-12 rounded-xl px-4"
          placeholder="e.g. Priya Sharma"
          autoComplete="username"
          autoCorrect={false}
          returnKeyType="done"
          value={userName}
          onChangeText={setUserName}
        />

        <Text className="mt-4 text-sm font-medium">Password</Text>
        <Input
          className="mt-1.5 h-12 rounded-xl px-4"
          placeholder="Your password"
          autoComplete="password"
          secureTextEntry
          returnKeyType="done"
          value={userPassword}
          onChangeText={setUserPassword}
          onSubmitEditing={handleLoginPress}
        />

        {loginErrorMessage ? (
          <View role="alert" className="mt-5 flex-row items-center gap-2.5 rounded-xl bg-destructive px-4 py-3">
            <Icon as={AlertCircle} className="shrink-0 text-destructive-foreground" size={20} />
            <Text className="flex-1 text-sm font-semibold leading-snug text-destructive-foreground">
              {loginErrorMessage}
            </Text>
          </View>
        ) : null}

        <Button
          className="mt-5 h-12 rounded-xl"
          onPress={handleLoginPress}
          disabled={isSubmitting}
        >
          {isSubmitting ? <Text>Logging in...</Text> : <Text>Login</Text>}
        </Button>
      </View>

      <Text className="mt-5 text-center text-xs text-muted-foreground">
        Your calls are logged and sent to your manager by themselves.
      </Text>
    </ScrollView>
  );
}
