import type { BillingPort } from '@/src/ports/billing';
import { env } from '@/src/config/env';

/** Feature-flag billing stub — swap for RevenueCat / IAP / Stripe. */
export class StubBillingAdapter implements BillingPort {
  async isPremium(): Promise<boolean> {
    return env.featurePremiumStub;
  }

  async getEntitlements(): Promise<string[]> {
    return (await this.isPremium()) ? ['premium_insights', 'export'] : [];
  }
}
