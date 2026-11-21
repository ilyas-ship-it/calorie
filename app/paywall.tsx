import { useRouter } from 'expo-router';
import { StyleSheet } from 'react-native';

import { Text } from '@/components/Themed';
import { Card, Muted, PrimaryButton, Screen, Subtitle, Title } from '@/components/ui';
import { env } from '@/src/config/env';

/** Soft paywall stub — billing seam is feature-flag only until Phase 3. */
export default function PaywallScreen() {
  const router = useRouter();

  return (
    <Screen>
      <Title>Premium (stub)</Title>
      <Subtitle>
        Commercialization seam only. Real IAP / RevenueCat / Stripe comes later behind BillingPort.
      </Subtitle>
      <Card>
        <Text style={styles.bullet}>Deeper insights</Text>
        <Text style={styles.bullet}>Export meal history</Text>
        <Text style={styles.bullet}>Advanced flags</Text>
        <Muted>
          EXPO_PUBLIC_FEATURE_PREMIUM is currently{' '}
          {env.featurePremiumStub ? 'true' : 'false (default)'}.
        </Muted>
      </Card>
      <PrimaryButton label="Not now" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  bullet: { fontSize: 16, fontWeight: '600' },
});
