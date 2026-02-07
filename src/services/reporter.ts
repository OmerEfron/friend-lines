/**
 * AI Reporter Service
 * API functions for managing interview sessions.
 */

import { apiCall, apiConfig } from '../config/api';
import { InterviewSession, InterviewType, SupportedLanguage } from '../types';

interface StartInterviewResponse {
  session: InterviewSession;
}

interface SendMessageResponse {
  session: InterviewSession;
}

interface GetInterviewResponse {
  session: InterviewSession;
}

interface RegenerateResponse {
  session: InterviewSession;
}

/**
 * Start a new AI reporter interview session
 */
export async function startInterview(
  type: InterviewType = 'daily',
  language: SupportedLanguage = 'en'
): Promise<InterviewSession> {
  const response = await apiCall<StartInterviewResponse>(
    apiConfig.endpoints.interviews,
    {
      method: 'POST',
      body: JSON.stringify({ type, language }),
    }
  );
  return response.session;
}

/**
 * Send a message in an active interview session
 */
export async function sendInterviewMessage(
  sessionId: string,
  message: string
): Promise<InterviewSession> {
  const response = await apiCall<SendMessageResponse>(
    `${apiConfig.endpoints.interviews}/${sessionId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify({ message }),
    }
  );
  return response.session;
}

/**
 * Get an interview session (for resuming)
 */
export async function getInterview(
  sessionId: string
): Promise<InterviewSession> {
  const response = await apiCall<GetInterviewResponse>(
    `${apiConfig.endpoints.interviews}/${sessionId}`
  );
  return response.session;
}

/**
 * Regenerate newsflash with feedback (for completed sessions)
 */
export async function regenerateNewsflash(
  sessionId: string,
  feedback: string
): Promise<InterviewSession> {
  const response = await apiCall<RegenerateResponse>(
    `${apiConfig.endpoints.interviews}/${sessionId}/regenerate`,
    {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    }
  );
  return response.session;
}
