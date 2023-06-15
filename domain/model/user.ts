import { SubscriptionLevel } from "@/domain/model/subscription_level.ts";

export interface OAuthGithubAccount {
  id: string;
  username: string;
}

export interface InitUser {
  sessionId: string;
  stripeCustomerId?: string;
  subscriptionLevel: SubscriptionLevel;
  oauthAccounts: {
    github?: OAuthGithubAccount;
  };
}

export interface User extends InitUser {
  id: string;
  createdAt: number;
}
