/**
 * AI Provider Factory
 * Returns the configured AI provider instance.
 * Add new providers here when expanding beyond OpenAI.
 */

import { AIProvider } from './types';
import { OpenAIProvider } from './openai-provider';

export type AIProviderType = 'openai';

let providerInstance: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (providerInstance) {
    return providerInstance;
  }

  const providerType = (process.env.AI_PROVIDER || 'openai') as AIProviderType;

  switch (providerType) {
    case 'openai':
      providerInstance = new OpenAIProvider();
      break;
    default:
      console.warn(`[AIFactory] Unknown provider: ${providerType}, falling back to openai`);
      providerInstance = new OpenAIProvider();
  }

  console.log(`[AIFactory] Initialized provider: ${providerType}`);
  return providerInstance;
}

// Re-export types for convenience
export * from './types';
export { PROMPT_VERSION } from './prompts';
