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

export type NewsflashAudience = 'ALL_FRIENDS' | 'GROUPS';

export interface Newsflash {
  id: string;
  userId: string;
  headline: string;
  subHeadline?: string;
  media?: string;
  category?: NewsCategory;
  severity?: NewsSeverity;
  audience?: NewsflashAudience;
  groupIds?: string[];
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


// Interview types for AI Reporter
export type InterviewType = 'daily' | 'weekly' | 'event';
export type InterviewStatus = 'active' | 'generating' | 'completed' | 'cancelled';
export type InterviewDimension = 'who' | 'what' | 'when' | 'where' | 'why' | 'emotion';

export interface InterviewMessage {
  role: 'system' | 'assistant' | 'user';
  content: string;
}

export interface InterviewContext {
  timeOfDay: 'morning' | 'midday' | 'evening';
  dayOfWeek: string;
  interviewType: InterviewType;
  userName: string;
}

export interface NewsflashDraft {
  headline: string;
  subHeadline: string;
  category: NewsCategory;
  severity: NewsSeverity;
}

export interface InterviewSession {
  id: string;
  userId: string;
  status: InterviewStatus;
  messages: InterviewMessage[];
  context: InterviewContext;
  coveredDimensions: InterviewDimension[];
  draftNewsflash?: NewsflashDraft;
  promptVersion: string;
  createdAt: string;
  updatedAt: string;
}
