export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing';
export type UserRole = 'admin' | 'user' | 'guest';

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number;
  features: {
    machines: number;
    reports: boolean;
    api_access?: boolean;
    white_label?: boolean;
  };
}

export interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
}

export interface UserProfile {
  id: string;
  userId: string;
  role: UserRole;
  company_name?: string;
  phone?: string;
  stripeCustomerId?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  };
  settings: Record<string, any>;
}

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  key: string;
  lastUsedAt?: Date;
  expiresAt?: Date;
  revoked: boolean;
}