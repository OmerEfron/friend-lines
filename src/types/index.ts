export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

// News categories
export const NEWS_CATEGORIES = [
  'GENERAL',
  'LIFESTYLE',
  'ENTERTAINMENT',
  'SPORTS',
  'FOOD',
  'TRAVEL',
  'OPINION',
] as const;
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

// Severity levels
export const NEWS_SEVERITIES = ['STANDARD', 'BREAKING', 'DEVELOPING'] as const;
export type NewsSeverity = (typeof NEWS_SEVERITIES)[number];

export interface Newsflash {
  id: string;
  userId: string;
  headline: string;
  subHeadline?: string;
  media?: string;
  category?: NewsCategory;
  severity?: NewsSeverity;
  timestamp: Date;
  user?: User; // Enriched user data from API
}

export interface Group {
  id: string;
  name: string;
  userIds: string[];
  createdBy?: string;
}

export interface Friendship {
  userId: string;
  friendId: string;
}

