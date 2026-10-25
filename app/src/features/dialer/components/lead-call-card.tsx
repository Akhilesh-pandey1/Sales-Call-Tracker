import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { maxLeadAttempts } from '@/config/app-config';
import { formatInternationalPhoneNumber } from '@/shared/utils/phone-formatter';
import { Copy, Phone } from 'lucide-react-native';
import { ActivityIndicator, View } from 'react-native';
import { CopyNumberButton } from './copy-number-button';

export type LeadCallCardVariant = 'ready' | 'dialing';

function buildAttemptLabel(attemptCount: number): string {
  const currentAttemptNumber = attemptCount + 1;
  const attemptLabel = `Attempt ${currentAttemptNumber} of ${maxLeadAttempts}`;
  return attemptLabel;
}

type LeadCallCardProps = {
  variant: LeadCallCardVariant;
  phoneNumber: string;
  attemptCount: number;
  onDialCurrentLead: () => void;
};

function LeadCallCardStatus({ variant }: { variant: LeadCallCardVariant }) {
  if (variant === 'dialing') {
    return (
      <View className="flex-row items-center justify-center gap-2">
        <ActivityIndicator size="small" className="text-primary" />
        <Text className="text-xs font-semibold text-muted-foreground">
          Calling now… the post-call popup opens when the call ends.
        </Text>
      </View>
    );
  }
  const readyStatusMessage = 'Review the number, then call when you are ready.';
  return (
    <Text className="text-center text-xs font-semibold text-muted-foreground">
      {readyStatusMessage}
    </Text>
  );
}

export function LeadCallCard({
  variant,
  phoneNumber,
  attemptCount,
  onDialCurrentLead,
}: LeadCallCardProps) {
  const displayedPhoneNumber = formatInternationalPhoneNumber(phoneNumber);
  const attemptLabel = buildAttemptLabel(attemptCount);
  const handleDialPress = () => onDialCurrentLead();

  return (
    <View className="flex-1 justify-center px-3 pb-4 pt-2">
      <Card className="gap-4 rounded-3xl px-3 py-6">
        <View className="items-center gap-2">
          <Text className="text-center text-2xl font-extrabold tabular-nums tracking-tight">
            {displayedPhoneNumber}
          </Text>
          {variant === 'dialing' ? (
            <CopyNumberButton
              phoneNumber={phoneNumber}
              className="flex-row items-center gap-1.5 rounded-full border border-border bg-card px-4 py-1.5 active:bg-muted"
            >
              <Icon as={Copy} size={14} className="text-primary" />
              <Text className="text-xs font-semibold text-primary">Copy</Text>
            </CopyNumberButton>
          ) : null}
          <View className="rounded-full bg-muted px-2.5 py-0.5">
            <Text className="text-[11px] font-semibold text-muted-foreground">
              {attemptLabel}
            </Text>
          </View>
        </View>

        <LeadCallCardStatus variant={variant} />

        {variant === 'ready' ? (
          <Button
            onPress={handleDialPress}
            className="h-14 rounded-2xl bg-accent active:bg-accent/90"
          >
            <Icon as={Phone} size={24} className="text-accent-foreground" />
            <Text className="text-lg font-bold text-accent-foreground">Call now</Text>
          </Button>
        ) : null}
      </Card>
    </View>
  );
}
