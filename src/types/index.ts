export enum SourceSystem {
  STRIPE = "https://api.stripe.com",
  SHOPIFY = "https://api.shopify.com",
  RAZORPAY = "https://api.razorpay.com",
  GITHUB = "https://api.github.com",
  SLACK = "https://slack.com/api"
}

export interface WebhookEvent {
  userId: string,
  sourceUrl: SourceSystem;
  eventType: string;
  payload: Record<string, any>;
}
