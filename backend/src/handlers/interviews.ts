/**
 * AI Reporter Interview Handler
 * Manages interview sessions for generating newsflashes via AI.
 */

import { APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { putItem, getItem, queryItems } from '../utils/dynamo';
import { successResponse, errorResponse } from '../utils/response';
import { withAuth, AuthenticatedEvent } from '../utils/middleware';
import { getAIProvider, PROMPT_VERSION } from '../ai';
import type { ChatMessage, InterviewContext, InterviewDimension, NewsflashDraft, SupportedLanguage } from '../ai';

const INTERVIEW_SESSIONS_TABLE =
  process.env.INTERVIEW_SESSIONS_TABLE || 'friendlines-interview-sessions';
const USERS_TABLE = process.env.USERS_TABLE || 'friendlines-users';
const MAX_DAILY_INTERVIEWS = parseInt(process.env.MAX_DAILY_INTERVIEWS || '3', 10);
const MAX_MESSAGES_PER_SESSION = parseInt(process.env.MAX_MESSAGES_PER_SESSION || '8', 10);

// 24 hours in seconds for TTL
const SESSION_TTL_SECONDS = 24 * 60 * 60;

// Map language codes to locales for date formatting
const LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-US',
  he: 'he-IL',
  es: 'es-ES',
};

interface InterviewSession {
  id: string;
  userId: string;
  status: 'active' | 'generating' | 'completed' | 'cancelled';
  messages: ChatMessage[];
  context: InterviewContext;
  coveredDimensions: InterviewDimension[];
  draftNewsflash?: NewsflashDraft;
  promptVersion: string;
  createdAt: string;
  updatedAt: string;
  ttl: number;
}

interface User {
  id: string;
  name: string;
  username: string;
}

export async function handler(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  return withAuth(async (authenticatedEvent) => {
    console.log('[Interviews] Event:', JSON.stringify(authenticatedEvent, null, 2));

    try {
      const method = authenticatedEvent.httpMethod;
      const path = authenticatedEvent.path;
      const userId = authenticatedEvent.userId!;

      // POST /interviews - Start new interview
      if (method === 'POST' && path === '/interviews') {
        return await handleStartInterview(authenticatedEvent, userId);
      }

      // POST /interviews/{id}/messages - Send message
      if (
        method === 'POST' &&
        path.match(/^\/interviews\/[^/]+\/messages$/) &&
        authenticatedEvent.pathParameters?.id
      ) {
        return await handleSendMessage(
          authenticatedEvent,
          authenticatedEvent.pathParameters.id,
          userId
        );
      }

      // GET /interviews/{id} - Get interview session
      if (
        method === 'GET' &&
        path.match(/^\/interviews\/[^/]+$/) &&
        authenticatedEvent.pathParameters?.id
      ) {
        return await handleGetInterview(
          authenticatedEvent.pathParameters.id,
          userId
        );
      }

      return errorResponse('Not found', 404);
    } catch (error) {
      console.error('[Interviews] Error:', error);
      return errorResponse(
        error instanceof Error ? error.message : 'Internal server error'
      );
    }
  })(event);
}

/**
 * Start a new interview session
 */
async function handleStartInterview(
  event: AuthenticatedEvent,
  userId: string
): Promise<APIGatewayProxyResult> {
  // Parse request body for interview type and language
  let interviewType: 'daily' | 'weekly' | 'event' = 'daily';
  let language: SupportedLanguage = 'en';
  
  if (event.body) {
    const body = JSON.parse(event.body);
    if (['daily', 'weekly', 'event'].includes(body.type)) {
      interviewType = body.type;
    }
    if (['en', 'he', 'es'].includes(body.language)) {
      language = body.language;
    }
  }

  // Check rate limit
  const rateLimitResult = await checkRateLimit(userId);
  if (!rateLimitResult.allowed) {
    return errorResponse(
      `You've reached the daily limit of ${MAX_DAILY_INTERVIEWS} interviews. Try again tomorrow!`,
      429
    );
  }

  // Get user info for context
  const user = (await getItem(USERS_TABLE, { id: userId })) as User | undefined;
  const userName = user?.name || 'friend';

  // Build interview context with localized day of week
  const now = new Date();
  const hour = now.getHours();
  const timeOfDay: 'morning' | 'midday' | 'evening' =
    hour < 12 ? 'morning' : hour < 17 ? 'midday' : 'evening';
  const locale = LOCALE_MAP[language];
  const dayOfWeek = now.toLocaleDateString(locale, { weekday: 'long' });

  const context: InterviewContext = {
    timeOfDay,
    dayOfWeek,
    interviewType,
    userName,
    language,
  };

  // Get first question from AI
  const aiProvider = getAIProvider();
  const firstTurn = await aiProvider.continueInterview([], context);

  // Create session
  const sessionId = uuidv4();
  const nowISO = now.toISOString();
  const ttl = Math.floor(now.getTime() / 1000) + SESSION_TTL_SECONDS;

  const session: InterviewSession = {
    id: sessionId,
    userId,
    status: 'active',
    messages: [{ role: 'assistant', content: firstTurn.question }],
    context,
    coveredDimensions: firstTurn.coveredDimensions,
    promptVersion: PROMPT_VERSION,
    createdAt: nowISO,
    updatedAt: nowISO,
    ttl,
  };

  await putItem(INTERVIEW_SESSIONS_TABLE, session);

  console.log(`[Interviews] Created session ${sessionId} for user ${userId}`);

  return successResponse({ session }, 201);
}

/**
 * Send a message in an interview session
 */
async function handleSendMessage(
  event: AuthenticatedEvent,
  sessionId: string,
  userId: string
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  const body = JSON.parse(event.body);
  const { message } = body;

  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    return errorResponse('message is required', 400);
  }

  // Get session
  const session = (await getItem(INTERVIEW_SESSIONS_TABLE, {
    id: sessionId,
  })) as InterviewSession | undefined;

  if (!session) {
    return errorResponse('Interview session not found', 404);
  }

  // Verify ownership
  if (session.userId !== userId) {
    return errorResponse('Access denied', 403);
  }

  // Check status
  if (session.status !== 'active') {
    return errorResponse(
      `Interview is ${session.status}. Cannot send more messages.`,
      400
    );
  }

  // Check message cap
  if (session.messages.length >= MAX_MESSAGES_PER_SESSION) {
    // Force completion
    console.log(`[Interviews] Session ${sessionId} hit message cap, forcing completion`);
    return await forceCompleteSession(session);
  }

  // Add user message
  const updatedMessages: ChatMessage[] = [
    ...session.messages,
    { role: 'user', content: message.trim() },
  ];

  // Get AI response
  const aiProvider = getAIProvider();
  const turnResult = await aiProvider.continueInterview(updatedMessages, session.context);

  // Add AI response
  updatedMessages.push({ role: 'assistant', content: turnResult.question });

  const now = new Date().toISOString();

  // Check if interview is done
  if (turnResult.isDone) {
    // Generate newsflash
    console.log(`[Interviews] Session ${sessionId} complete, generating newsflash`);
    
    const updatedSession: InterviewSession = {
      ...session,
      status: 'generating',
      messages: updatedMessages,
      coveredDimensions: turnResult.coveredDimensions,
      updatedAt: now,
    };
    await putItem(INTERVIEW_SESSIONS_TABLE, updatedSession);

    const draft = await aiProvider.generateNewsflash(updatedMessages, session.context);

    const finalSession: InterviewSession = {
      ...updatedSession,
      status: 'completed',
      draftNewsflash: draft,
      updatedAt: new Date().toISOString(),
    };
    await putItem(INTERVIEW_SESSIONS_TABLE, finalSession);

    return successResponse({ session: finalSession });
  }

  // Update session with new messages
  const updatedSession: InterviewSession = {
    ...session,
    messages: updatedMessages,
    coveredDimensions: turnResult.coveredDimensions,
    updatedAt: now,
  };
  await putItem(INTERVIEW_SESSIONS_TABLE, updatedSession);

  return successResponse({ session: updatedSession });
}

/**
 * Get an interview session (for resuming)
 */
async function handleGetInterview(
  sessionId: string,
  userId: string
): Promise<APIGatewayProxyResult> {
  const session = (await getItem(INTERVIEW_SESSIONS_TABLE, {
    id: sessionId,
  })) as InterviewSession | undefined;

  if (!session) {
    return errorResponse('Interview session not found', 404);
  }

  // Verify ownership
  if (session.userId !== userId) {
    return errorResponse('Access denied', 403);
  }

  return successResponse({ session });
}

/**
 * Check if user has exceeded daily interview limit
 */
async function checkRateLimit(
  userId: string
): Promise<{ allowed: boolean; count: number }> {
  // Get today's start timestamp
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayStartISO = todayStart.toISOString();

  // Query sessions created today
  const todaySessions = (await queryItems(
    INTERVIEW_SESSIONS_TABLE,
    'userId-createdAt-index',
    'userId = :userId AND createdAt >= :todayStart',
    {
      ':userId': userId,
      ':todayStart': todayStartISO,
    }
  )) as InterviewSession[];

  const count = todaySessions.length;
  const allowed = count < MAX_DAILY_INTERVIEWS;

  console.log(`[Interviews] Rate limit check for ${userId}: ${count}/${MAX_DAILY_INTERVIEWS}`);

  return { allowed, count };
}

/**
 * Force complete a session that hit the message cap
 */
async function forceCompleteSession(
  session: InterviewSession
): Promise<APIGatewayProxyResult> {
  const aiProvider = getAIProvider();
  const now = new Date().toISOString();

  // Update status to generating
  const generatingSession: InterviewSession = {
    ...session,
    status: 'generating',
    updatedAt: now,
  };
  await putItem(INTERVIEW_SESSIONS_TABLE, generatingSession);

  // Generate newsflash from what we have
  const draft = await aiProvider.generateNewsflash(session.messages, session.context);

  const finalSession: InterviewSession = {
    ...generatingSession,
    status: 'completed',
    draftNewsflash: draft,
    updatedAt: new Date().toISOString(),
  };
  await putItem(INTERVIEW_SESSIONS_TABLE, finalSession);

  return successResponse({ session: finalSession });
}
