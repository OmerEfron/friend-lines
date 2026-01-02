import { APIGatewayProxyResult } from 'aws-lambda';
import { scanTable, getItem } from '../utils/dynamo';
import { successResponse, errorResponse } from '../utils/response';
import { withAuth, AuthenticatedEvent } from '../utils/middleware';

const NEWSFLASHES_TABLE = process.env.NEWSFLASHES_TABLE || 'friendlines-newsflashes';
const FRIENDSHIPS_TABLE = process.env.FRIENDSHIPS_TABLE || 'friendlines-friendships';
const GROUPS_TABLE = process.env.GROUPS_TABLE || 'friendlines-groups';
const USERS_TABLE = process.env.USERS_TABLE || 'friendlines-users';

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

interface Group {
  id: string;
  name: string;
  userIds: string[];
  createdBy: string;
}

export async function handler(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  return withAuth(async (authenticatedEvent) => {
    console.log('Feeds Event:', JSON.stringify(authenticatedEvent, null, 2));

    try {
      const method = authenticatedEvent.httpMethod;
      const path = authenticatedEvent.path;
      const userId = authenticatedEvent.userId!;

      // GET /feeds/main - Get main feed (friends' newsflashes)
      if (method === 'GET' && path === '/feeds/main') {
        return await handleMainFeed(userId);
      }

      // GET /feeds/group/{groupId} - Get group feed
      if (
        method === 'GET' &&
        path.match(/^\/feeds\/group\/[^/]+$/) &&
        authenticatedEvent.pathParameters?.groupId
      ) {
        return await handleGroupFeed(
          authenticatedEvent.pathParameters.groupId,
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

// Get main feed (friends' newsflashes)
async function handleMainFeed(
  userId: string
): Promise<APIGatewayProxyResult> {
  // Get user's friends
  const allFriendships = await scanTable(FRIENDSHIPS_TABLE);
  const friendships = allFriendships.filter(
    (f: any) => f.userId === userId
  );
  const friendIds = friendships.map((f: any) => f.friendId);

  // Include user's own newsflashes
  const relevantUserIds = [userId, ...friendIds];

  // Get all newsflashes
  const allNewsflashes = (await scanTable(NEWSFLASHES_TABLE)) as Newsflash[];
  
  // Filter newsflashes from relevant users
  const feedNewsflashes = allNewsflashes
    .filter((n) => relevantUserIds.includes(n.userId))
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  // Enrich newsflashes with user data
  const usersMap = new Map<string, User>();
  const allUsers = (await scanTable(USERS_TABLE)) as User[];
  allUsers.forEach((u) => usersMap.set(u.id, u));

  const enrichedNewsflashes = feedNewsflashes.map((newsflash) => ({
    ...newsflash,
    user: usersMap.get(newsflash.userId),
  }));

  return successResponse({ newsflashes: enrichedNewsflashes });
}

// Get group feed
async function handleGroupFeed(
  groupId: string,
  userId: string
): Promise<APIGatewayProxyResult> {
  // Get group
  const group = (await getItem(GROUPS_TABLE, { id: groupId })) as
    | Group
    | undefined;

  if (!group) {
    return errorResponse('Group not found', 404);
  }

  // Check if user is a member
  if (!group.userIds.includes(userId)) {
    return errorResponse('Not a member of this group', 403);
  }

  // Get all newsflashes
  const allNewsflashes = (await scanTable(NEWSFLASHES_TABLE)) as Newsflash[];
  
  // Filter newsflashes from group members
  const feedNewsflashes = allNewsflashes
    .filter((n) => group.userIds.includes(n.userId))
    .sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  // Enrich newsflashes with user data
  const usersMap = new Map<string, User>();
  const allUsers = (await scanTable(USERS_TABLE)) as User[];
  allUsers.forEach((u) => usersMap.set(u.id, u));

  const enrichedNewsflashes = feedNewsflashes.map((newsflash) => ({
    ...newsflash,
    user: usersMap.get(newsflash.userId),
  }));

  return successResponse({ 
    group,
    newsflashes: enrichedNewsflashes 
  });
}

