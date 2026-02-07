/**
 * AI Reporter Service
 * API functions for managing interview sessions.
 */

import { apiCall, apiConfig } from '../config/api';
import { InterviewSession, InterviewType } from '../types';

interface StartInterviewResponse {
  session: InterviewSession;
}

interface SendMessageResponse {
  session: InterviewSession;
}

interface GetInterviewResponse {
  session: InterviewSession;
}

/**
 * Start a new AI reporter interview session
 */
export async function startInterview(
  type: InterviewType = 'daily'
): Promise<InterviewSession> {
  const response = await apiCall<StartInterviewResponse>(
    apiConfig.endpoints.interviews,
    {
      method: 'POST',
      body: JSON.stringify({ type }),
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
