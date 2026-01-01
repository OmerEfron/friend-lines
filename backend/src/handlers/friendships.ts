import { APIGatewayProxyResult } from 'aws-lambda';
import { putItem, scanTable, deleteItem, getItem } from '../utils/dynamo';
import { successResponse, errorResponse } from '../utils/response';
import { withAuth, AuthenticatedEvent } from '../utils/middleware';

const FRIENDSHIPS_TABLE =
  process.env.FRIENDSHIPS_TABLE || 'friendlines-friendships';
const USERS_TABLE = process.env.USERS_TABLE || 'friendlines-users';

interface Friendship {
  userId: string;
  friendId: string;
}

export async function handler(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  return withAuth(async (authenticatedEvent) => {
    console.log('Friendships Event:', JSON.stringify(authenticatedEvent, null, 2));

    try {
      const method = authenticatedEvent.httpMethod;
      const path = authenticatedEvent.path;
      const userId = authenticatedEvent.userId!;

      // GET /friendships - List user's friendships
      if (method === 'GET' && path === '/friendships') {
        return await handleGetFriendships(userId);
      }

      // GET /friends - Get friends with user details
      if (method === 'GET' && path === '/friends') {
        return await handleGetFriends(userId);
      }

      // POST /friendships - Add a friend
      if (method === 'POST' && path === '/friendships') {
        return await handleAddFriend(authenticatedEvent, userId);
      }

      // DELETE /friendships/{friendId} - Remove a friend
      if (
        method === 'DELETE' &&
        path.startsWith('/friendships/') &&
        authenticatedEvent.pathParameters?.friendId
      ) {
        return await handleRemoveFriend(
          userId,
          authenticatedEvent.pathParameters.friendId
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

// Get user's friendships (just the friendship records)
async function handleGetFriendships(
  userId: string
): Promise<APIGatewayProxyResult> {
  const allFriendships = await scanTable(FRIENDSHIPS_TABLE);
  const userFriendships = allFriendships.filter(
    (f: Friendship) => f.userId === userId
  );

  return successResponse({ friendships: userFriendships });
}

// Get friends with user details
async function handleGetFriends(
  userId: string
): Promise<APIGatewayProxyResult> {
  const allFriendships = await scanTable(FRIENDSHIPS_TABLE);
  const userFriendships = allFriendships.filter(
    (f: Friendship) => f.userId === userId
  );

  // Get all friend user details
  const allUsers = await scanTable(USERS_TABLE);
  const friends = userFriendships
    .map((friendship: Friendship) => {
      const friend = allUsers.find((u: any) => u.id === friendship.friendId);
      if (friend) {
        // Remove sensitive data
        const { passwordHash, ...friendData } = friend;
        return friendData;
      }
      return null;
    })
    .filter((f) => f !== null);

  return successResponse({ friends });
}

// Add a friend
async function handleAddFriend(
  event: AuthenticatedEvent,
  userId: string
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  const body = JSON.parse(event.body);
  const { friendId } = body;

  if (!friendId) {
    return errorResponse('friendId is required', 400);
  }

  if (friendId === userId) {
    return errorResponse('Cannot add yourself as a friend', 400);
  }

  // Check if friend exists
  const friend = await getItem(USERS_TABLE, { id: friendId });
  if (!friend) {
    return errorResponse('User not found', 404);
  }

  // Check if already friends
  const allFriendships = await scanTable(FRIENDSHIPS_TABLE);
  const exists = allFriendships.some(
    (f: Friendship) => f.userId === userId && f.friendId === friendId
  );

  if (exists) {
    return errorResponse('Already friends', 409);
  }

  // Create friendship
  const friendship: Friendship = {
    userId,
    friendId,
  };

  await putItem(FRIENDSHIPS_TABLE, friendship);

  return successResponse({ friendship }, 201);
}

// Remove a friend
async function handleRemoveFriend(
  userId: string,
  friendId: string
): Promise<APIGatewayProxyResult> {
  await deleteItem(FRIENDSHIPS_TABLE, {
    userId,
    friendId,
  });

  return successResponse({ message: 'Friendship removed' });
}


