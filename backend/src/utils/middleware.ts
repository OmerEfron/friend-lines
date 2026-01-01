import { APIGatewayProxyEvent } from 'aws-lambda';
import { verifyToken, extractToken } from './auth';
import { errorResponse } from './response';

export interface AuthenticatedEvent extends APIGatewayProxyEvent {
  userId?: string;
  userEmail?: string;
}

// Verify JWT and extract user info
export function requireAuth(event: APIGatewayProxyEvent): {
  userId: string;
  userEmail: string;
} | null {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  const token = extractToken(authHeader);

  if (!token) {
    return null;
  }

  try {
    const payload = verifyToken(token);
    return {
      userId: payload.userId,
      userEmail: payload.email,
    };
  } catch (error) {
    return null;
  }
}

// Middleware wrapper for protected routes
export function withAuth(
  handler: (event: AuthenticatedEvent) => Promise<any>
) {
  return async (event: APIGatewayProxyEvent) => {
    const auth = requireAuth(event);

    if (!auth) {
      return errorResponse('Unauthorized - Invalid or missing token', 401);
    }

    // Attach user info to event
    const authenticatedEvent = event as AuthenticatedEvent;
    authenticatedEvent.userId = auth.userId;
    authenticatedEvent.userEmail = auth.userEmail;

    return handler(authenticatedEvent);
  };
}


