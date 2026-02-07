/**
 * OpenAI Provider Implementation
 * Uses OpenAI Chat Completions API with Structured Outputs for reliable JSON.
 */

import {
  AIProvider,
  ChatMessage,
  InterviewContext,
  InterviewTurnResult,
  NewsflashDraft,
  INTERVIEW_TURN_SCHEMA,
  NEWSFLASH_DRAFT_SCHEMA,
  SupportedLanguage,
} from './types';
import { buildInterviewSystemPrompt, buildGenerationSystemPrompt, PROMPT_VERSION } from './prompts';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  he: 'Hebrew',
  es: 'Spanish',
};

export class OpenAIProvider implements AIProvider {
  private apiKey: string;
  private interviewModel: string;
  private generationModel: string;

  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || '';
    this.interviewModel = process.env.AI_INTERVIEW_MODEL || 'gpt-4o-mini';
    this.generationModel = process.env.AI_GENERATION_MODEL || 'gpt-4o';

    if (!this.apiKey) {
      console.warn('[OpenAIProvider] OPENAI_API_KEY not set');
    }
  }

  async continueInterview(
    history: ChatMessage[],
    context: InterviewContext
  ): Promise<InterviewTurnResult> {
    const languageName = LANGUAGE_NAMES[context.language] || 'English';
    const systemPrompt = buildInterviewSystemPrompt(
      context.userName,
      context.timeOfDay,
      context.dayOfWeek,
      context.interviewType,
      languageName
    );

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.filter((m) => m.role !== 'system'),
    ];

    const response = await this.callOpenAI(
      this.interviewModel,
      messages,
      'interview_turn',
      INTERVIEW_TURN_SCHEMA
    );

    return response as InterviewTurnResult;
  }

  async generateNewsflash(
    history: ChatMessage[],
    context: InterviewContext
  ): Promise<NewsflashDraft> {
    const languageName = LANGUAGE_NAMES[context.language] || 'English';
    
    // Build transcript from conversation history
    const transcript = history
      .filter((m) => m.role !== 'system')
      .map((m) => `${m.role === 'assistant' ? 'Reporter' : 'User'}: ${m.content}`)
      .join('\n');

    const systemPrompt = buildGenerationSystemPrompt(context.userName, transcript, languageName);

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: 'Generate the newsflash now.' },
    ];

    const response = await this.callOpenAI(
      this.generationModel,
      messages,
      'newsflash_draft',
      NEWSFLASH_DRAFT_SCHEMA
    );

    return response as NewsflashDraft;
  }

  private async callOpenAI(
    model: string,
    messages: Array<{ role: string; content: string }>,
    schemaName: string,
    schema: object
  ): Promise<unknown> {
    console.log(`[OpenAIProvider] Calling ${model} with schema: ${schemaName}`);

    const requestBody = {
      model,
      messages,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: schemaName,
          strict: true,
          schema,
        },
      },
    };

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[OpenAIProvider] API error: ${response.status} - ${errorBody}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    console.log(`[OpenAIProvider] Response: ${content.substring(0, 200)}...`);

    return JSON.parse(content);
  }

  getPromptVersion(): string {
    return PROMPT_VERSION;
  }
}
