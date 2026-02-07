/**
 * AI Provider Types
 * Provider-agnostic interfaces for the AI Reporter feature.
 * These types are used across all AI provider implementations.
 */

export interface ChatMessage {
  role: 'system' | 'assistant' | 'user';
  content: string;
}

export type InterviewDimension = 'who' | 'what' | 'when' | 'where' | 'why' | 'emotion';

export interface InterviewTurnResult {
  question: string;
  isDone: boolean;
  coveredDimensions: InterviewDimension[];
}

export interface NewsflashDraft {
  headline: string;
  subHeadline: string;
  category: 'GENERAL' | 'LIFESTYLE' | 'ENTERTAINMENT' | 'SPORTS' | 'FOOD' | 'TRAVEL' | 'OPINION';
  severity: 'STANDARD' | 'BREAKING' | 'DEVELOPING';
}

export type SupportedLanguage = 'en' | 'he' | 'es';

export interface InterviewContext {
  timeOfDay: 'morning' | 'midday' | 'evening';
  dayOfWeek: string;
  interviewType: 'daily' | 'weekly' | 'event';
  userName: string;
  language: SupportedLanguage;
  /** Optional feedback for regenerating the newsflash */
  regenerationFeedback?: string;
}

export interface AIProvider {
  continueInterview(
    history: ChatMessage[],
    context: InterviewContext
  ): Promise<InterviewTurnResult>;

  generateNewsflash(
    history: ChatMessage[],
    context: InterviewContext
  ): Promise<NewsflashDraft>;
}

// JSON Schema definitions for OpenAI Structured Outputs
export const INTERVIEW_TURN_SCHEMA = {
  type: 'object',
  properties: {
    question: { type: 'string', description: 'The next interview question to ask' },
    isDone: { type: 'boolean', description: 'Whether the interview has enough information' },
    coveredDimensions: {
      type: 'array',
      items: { type: 'string', enum: ['who', 'what', 'when', 'where', 'why', 'emotion'] },
      description: 'Which dimensions have been covered so far',
    },
  },
  required: ['question', 'isDone', 'coveredDimensions'],
  additionalProperties: false,
} as const;

export const NEWSFLASH_DRAFT_SCHEMA = {
  type: 'object',
  properties: {
    headline: { type: 'string', description: 'The newsflash headline (max 100 chars)' },
    subHeadline: { type: 'string', description: 'Supporting details (max 200 chars)' },
    category: {
      type: 'string',
      enum: ['GENERAL', 'LIFESTYLE', 'ENTERTAINMENT', 'SPORTS', 'FOOD', 'TRAVEL', 'OPINION'],
    },
    severity: {
      type: 'string',
      enum: ['STANDARD', 'BREAKING', 'DEVELOPING'],
    },
  },
  required: ['headline', 'subHeadline', 'category', 'severity'],
  additionalProperties: false,
} as const;
