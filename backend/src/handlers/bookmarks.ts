import { APIGatewayProxyResult } from 'aws-lambda';
import { putItem, getItem, scanTable, deleteItem } from '../utils/dynamo';
import { successResponse, errorResponse } from '../utils/response';
import { withAuth, AuthenticatedEvent } from '../utils/middleware';

const BOOKMARKS_TABLE = process.env.BOOKMARKS_TABLE || 'friendlines-bookmarks';
const NEWSFLASHES_TABLE = process.env.NEWSFLASHES_TABLE || 'friendlines-newsflashes';
const USERS_TABLE = process.env.USERS_TABLE || 'friendlines-users';

interface Bookmark {
  userId: string;
  newsflashId: string;
  createdAt: string;
}

interface Newsflash {
  id: string;
  userId: string;
  headline: string;
  subHeadline?: string;
  media?: string;
  timestamp: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
}

export async function handler(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  return withAuth(async (authenticatedEvent) => {
    console.log('Bookmarks Event:', JSON.stringify(authenticatedEvent, null, 2));

    try {
      const method = authenticatedEvent.httpMethod;
      const path = authenticatedEvent.path;
      const userId = authenticatedEvent.userId!;

      // GET /bookmarks - List user's bookmarks with full newsflash data
      if (method === 'GET' && path === '/bookmarks') {
        return await handleGetBookmarks(userId);
      }

      // POST /bookmarks - Add bookmark
      if (method === 'POST' && path === '/bookmarks') {
        return await handleAddBookmark(authenticatedEvent, userId);
      }

      // DELETE /bookmarks/{newsflashId} - Remove bookmark
      if (
        method === 'DELETE' &&
        path.startsWith('/bookmarks/') &&
        authenticatedEvent.pathParameters?.newsflashId
      ) {
        return await handleRemoveBookmark(
          authenticatedEvent.pathParameters.newsflashId,
          userId
        );
      }

      return errorResponse('Not found', 404);
    } catch (error) {
      console.error('Error:', error);
      return errorResponse(
        error instanceof Error ? error.message : 'Internal server error'
      );
    }
  })(event);
}

// Get user's bookmarks with enriched newsflash data
async function handleGetBookmarks(
  userId: string
): Promise<APIGatewayProxyResult> {
  // Get all bookmarks for this user
  const allBookmarks = await scanTable(BOOKMARKS_TABLE);
  const userBookmarks = allBookmarks.filter(
    (b: Bookmark) => b.userId === userId
  );

  // Get all newsflashes and users for enrichment
  const allNewsflashes = (await scanTable(NEWSFLASHES_TABLE)) as Newsflash[];
  const allUsers = (await scanTable(USERS_TABLE)) as User[];

  // Create maps for quick lookup
  const newsflashMap = new Map<string, Newsflash>();
  allNewsflashes.forEach((nf) => newsflashMap.set(nf.id, nf));

  const userMap = new Map<string, User>();
  allUsers.forEach((u) => {
    const { passwordHash, ...userWithoutPassword } = u as any;
    userMap.set(u.id, userWithoutPassword);
  });

  // Enrich bookmarks with newsflash and user data
  const enrichedBookmarks = userBookmarks
    .map((bookmark: Bookmark) => {
      const newsflash = newsflashMap.get(bookmark.newsflashId);
      if (!newsflash) return null;

      const user = userMap.get(newsflash.userId);
      return {
        ...newsflash,
        user,
      };
    })
    .filter(Boolean)
    .sort(
      (a: any, b: any) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  return successResponse({ newsflashes: enrichedBookmarks });
}

// Add bookmark
async function handleAddBookmark(
  event: AuthenticatedEvent,
  userId: string
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  const body = JSON.parse(event.body);
  const { newsflashId } = body;

  if (!newsflashId) {
    return errorResponse('newsflashId is required', 400);
  }

  // Verify newsflash exists
  const newsflash = await getItem(NEWSFLASHES_TABLE, { id: newsflashId });
  if (!newsflash) {
    return errorResponse('Newsflash not found', 404);
  }

  // Check if already bookmarked
  const existing = await getItem(BOOKMARKS_TABLE, {
    userId,
    newsflashId,
  });

  if (existing) {
    return errorResponse('Already bookmarked', 409);
  }

  // Create bookmark
  const bookmark: Bookmark = {
    userId,
    newsflashId,
    createdAt: new Date().toISOString(),
  };

  await putItem(BOOKMARKS_TABLE, bookmark);

  return successResponse({ bookmark }, 201);
}

// Remove bookmark
async function handleRemoveBookmark(
  newsflashId: string,
  userId: string
): Promise<APIGatewayProxyResult> {
  // Check if bookmark exists
  const existing = await getItem(BOOKMARKS_TABLE, {
    userId,
    newsflashId,
  });

  if (!existing) {
    return errorResponse('Bookmark not found', 404);
  }

  await deleteItem(BOOKMARKS_TABLE, {
    userId,
    newsflashId,
  });

  return successResponse({ message: 'Bookmark removed' });
}

