/** Port: subscriptions / IAP. MVP is feature-flag stub only. */
export interface BillingPort {
  isPremium(): Promise<boolean>;
  getEntitlements(): Promise<string[]>;
}
