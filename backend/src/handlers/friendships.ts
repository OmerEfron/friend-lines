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
  status: 'pending' | 'accepted' | 'rejected';
  initiatorId: string;
  createdAt: string;
  updatedAt: string;
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
    console.log('Friendships Event:', JSON.stringify(authenticatedEvent, null, 2));

    try {
      const method = authenticatedEvent.httpMethod;
      const path = authenticatedEvent.path;
      const userId = authenticatedEvent.userId!;

      // GET /friend-requests/received - Get pending requests received
      if (method === 'GET' && path === '/friend-requests/received') {
        return await handleGetReceivedRequests(userId);
      }

      // GET /friend-requests/sent - Get pending requests sent
      if (method === 'GET' && path === '/friend-requests/sent') {
        return await handleGetSentRequests(userId);
      }

      // PUT /friend-requests/{requestId}/accept - Accept request
      if (
        method === 'PUT' &&
        path.match(/^\/friend-requests\/[^/]+\/accept$/) &&
        authenticatedEvent.pathParameters?.requestId
      ) {
        return await handleAcceptRequest(
          userId,
          authenticatedEvent.pathParameters.requestId
        );
      }

      // PUT /friend-requests/{requestId}/reject - Reject request
      if (
        method === 'PUT' &&
        path.match(/^\/friend-requests\/[^/]+\/reject$/) &&
        authenticatedEvent.pathParameters?.requestId
      ) {
        return await handleRejectRequest(
          userId,
          authenticatedEvent.pathParameters.requestId
        );
      }

      // GET /friendships - List user's accepted friendships
      if (method === 'GET' && path === '/friendships') {
        return await handleGetFriendships(userId);
      }

      // GET /friends - Get accepted friends with user details
      if (method === 'GET' && path === '/friends') {
        return await handleGetFriends(userId);
      }

      // POST /friendships - Send a friend request
      if (method === 'POST' && path === '/friendships') {
        return await handleSendRequest(authenticatedEvent, userId);
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

// Get pending requests received by user
async function handleGetReceivedRequests(
  userId: string
): Promise<APIGatewayProxyResult> {
  const allFriendships = (await scanTable(FRIENDSHIPS_TABLE)) as Friendship[];
  const receivedRequests = allFriendships.filter(
    (f) => f.friendId === userId && f.status === 'pending'
  );

  // Enrich with initiator user data
  const allUsers = (await scanTable(USERS_TABLE)) as User[];
  const usersMap = new Map<string, User>();
  allUsers.forEach((u) => {
    const { passwordHash, ...userWithoutPassword } = u as any;
    usersMap.set(u.id, userWithoutPassword);
  });

  const enrichedRequests = receivedRequests.map((req) => ({
    ...req,
    user: usersMap.get(req.initiatorId),
  }));

  return successResponse({ requests: enrichedRequests });
}

// Get pending requests sent by user
async function handleGetSentRequests(
  userId: string
): Promise<APIGatewayProxyResult> {
  const allFriendships = (await scanTable(FRIENDSHIPS_TABLE)) as Friendship[];
  const sentRequests = allFriendships.filter(
    (f) => f.initiatorId === userId && f.status === 'pending'
  );

  // Enrich with recipient user data
  const allUsers = (await scanTable(USERS_TABLE)) as User[];
  const usersMap = new Map<string, User>();
  allUsers.forEach((u) => {
    const { passwordHash, ...userWithoutPassword } = u as any;
    usersMap.set(u.id, userWithoutPassword);
  });

  const enrichedRequests = sentRequests.map((req) => ({
    ...req,
    user: usersMap.get(req.friendId),
  }));

  return successResponse({ requests: enrichedRequests });
}

// Accept a friend request
async function handleAcceptRequest(
  userId: string,
  requestId: string
): Promise<APIGatewayProxyResult> {
  // Parse requestId (format: userId_friendId)
  const [initiatorId, receiverId] = requestId.split('_');

  if (receiverId !== userId) {
    return errorResponse('You can only accept requests sent to you', 403);
  }

  // Get the pending request
  const request = (await getItem(FRIENDSHIPS_TABLE, {
    userId: initiatorId,
    friendId: receiverId,
  })) as Friendship | undefined;

  if (!request) {
    return errorResponse('Friend request not found', 404);
  }

  if (request.status !== 'pending') {
    return errorResponse('This request has already been processed', 400);
  }

  const now = new Date().toISOString();

  // Update the original request to accepted
  const acceptedRequest: Friendship = {
    ...request,
    status: 'accepted',
    updatedAt: now,
  };

  await putItem(FRIENDSHIPS_TABLE, acceptedRequest);

  // Create bidirectional relationship (reverse record)
  const reverseRequest: Friendship = {
    userId: receiverId,
    friendId: initiatorId,
    status: 'accepted',
    initiatorId: initiatorId,
    createdAt: now,
    updatedAt: now,
  };

  await putItem(FRIENDSHIPS_TABLE, reverseRequest);

  return successResponse({ message: 'Friend request accepted' });
}

// Reject a friend request
async function handleRejectRequest(
  userId: string,
  requestId: string
): Promise<APIGatewayProxyResult> {
  // Parse requestId (format: userId_friendId)
  const [initiatorId, receiverId] = requestId.split('_');

  if (receiverId !== userId) {
    return errorResponse('You can only reject requests sent to you', 403);
  }

  // Get the pending request
  const request = (await getItem(FRIENDSHIPS_TABLE, {
    userId: initiatorId,
    friendId: receiverId,
  })) as Friendship | undefined;

  if (!request) {
    return errorResponse('Friend request not found', 404);
  }

  if (request.status !== 'pending') {
    return errorResponse('This request has already been processed', 400);
  }

  // Update status to rejected
  const rejectedRequest: Friendship = {
    ...request,
    status: 'rejected',
    updatedAt: new Date().toISOString(),
  };

  await putItem(FRIENDSHIPS_TABLE, rejectedRequest);

  return successResponse({ message: 'Friend request rejected' });
}

// Get user's accepted friendships (just the friendship records)
async function handleGetFriendships(
  userId: string
): Promise<APIGatewayProxyResult> {
  const allFriendships = (await scanTable(FRIENDSHIPS_TABLE)) as Friendship[];
  const userFriendships = allFriendships.filter(
    (f) => f.userId === userId && f.status === 'accepted'
  );

  return successResponse({ friendships: userFriendships });
}

// Get accepted friends with user details
async function handleGetFriends(
  userId: string
): Promise<APIGatewayProxyResult> {
  const allFriendships = (await scanTable(FRIENDSHIPS_TABLE)) as Friendship[];
  const userFriendships = allFriendships.filter(
    (f) => f.userId === userId && f.status === 'accepted'
  );

  const friendIds = userFriendships.map((f) => f.friendId);

  // Get all users
  const allUsers = (await scanTable(USERS_TABLE)) as User[];

  // Filter friends and remove password hashes
  const friends = allUsers
    .filter((u) => friendIds.includes(u.id))
    .map((u) => {
      const { passwordHash, ...userWithoutPassword } = u as any;
      return userWithoutPassword;
    });

  return successResponse({ friends });
}

// Send a friend request
async function handleSendRequest(
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
    return errorResponse('You cannot send a friend request to yourself', 400);
  }

  // Check if user exists
  const friendUser = await getItem(USERS_TABLE, { id: friendId });
  if (!friendUser) {
    return errorResponse('User not found', 404);
  }

  // Check if there's already a relationship
  const existing = (await getItem(FRIENDSHIPS_TABLE, {
    userId,
    friendId,
  })) as Friendship | undefined;

  if (existing) {
    if (existing.status === 'pending') {
      return errorResponse('Friend request already sent', 409);
    }
    if (existing.status === 'accepted') {
      return errorResponse('Already friends', 409);
    }
  }

  // Check if there's a pending request from the other user
  const reverseRequest = (await getItem(FRIENDSHIPS_TABLE, {
    userId: friendId,
    friendId: userId,
  })) as Friendship | undefined;

  if (reverseRequest && reverseRequest.status === 'pending') {
    return errorResponse(
      'This user has already sent you a friend request. Accept it instead.',
      409
    );
  }

  const now = new Date().toISOString();

  // Create pending friendship request
  const friendship: Friendship = {
    userId,
    friendId,
    status: 'pending',
    initiatorId: userId,
    createdAt: now,
    updatedAt: now,
  };

  await putItem(FRIENDSHIPS_TABLE, friendship);

  return successResponse({ friendship }, 201);
}

// Remove a friend (accepted friendship)
async function handleRemoveFriend(
  userId: string,
  friendId: string
): Promise<APIGatewayProxyResult> {
  // Check if friendship exists
  const friendship = (await getItem(FRIENDSHIPS_TABLE, {
    userId,
    friendId,
  })) as Friendship | undefined;

  if (!friendship || friendship.status !== 'accepted') {
    return errorResponse('Friendship not found', 404);
  }

  // Delete both sides of the friendship
  await deleteItem(FRIENDSHIPS_TABLE, { userId, friendId });
  await deleteItem(FRIENDSHIPS_TABLE, { userId: friendId, friendId: userId });

  return successResponse({ message: 'Friend removed' });
}
