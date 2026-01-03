import { APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { putItem, getItem, scanTable, deleteItem } from '../utils/dynamo';
import { successResponse, errorResponse } from '../utils/response';
import { withAuth, AuthenticatedEvent } from '../utils/middleware';

const GROUPS_TABLE = process.env.GROUPS_TABLE || 'friendlines-groups';
const USERS_TABLE = process.env.USERS_TABLE || 'friendlines-users';

interface Group {
  id: string;
  name: string;
  userIds: string[];
  createdBy: string;
  createdAt: string;
}

export async function handler(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  return withAuth(async (authenticatedEvent) => {
    console.log('Groups Event:', JSON.stringify(authenticatedEvent, null, 2));

    try {
      const method = authenticatedEvent.httpMethod;
      const path = authenticatedEvent.path;
      const userId = authenticatedEvent.userId!;

      // GET /groups - List user's groups
      if (method === 'GET' && path === '/groups') {
        return await handleGetGroups(userId);
      }

      // GET /groups/{id} - Get specific group
      if (
        method === 'GET' &&
        path.startsWith('/groups/') &&
        authenticatedEvent.pathParameters?.id
      ) {
        return await handleGetGroup(
          authenticatedEvent.pathParameters.id,
          userId
        );
      }

      // POST /groups - Create new group
      if (method === 'POST' && path === '/groups') {
        return await handleCreateGroup(authenticatedEvent, userId);
      }

      // PUT /groups/{id}/members - Update group members
      if (
        method === 'PUT' &&
        path.match(/^\/groups\/[^/]+\/members$/) &&
        authenticatedEvent.pathParameters?.id
      ) {
        return await handleUpdateMembers(
          authenticatedEvent,
          authenticatedEvent.pathParameters.id,
          userId
        );
      }

      // DELETE /groups/{id} - Delete group
      if (
        method === 'DELETE' &&
        path.startsWith('/groups/') &&
        authenticatedEvent.pathParameters?.id
      ) {
        return await handleDeleteGroup(
          authenticatedEvent.pathParameters.id,
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

// Get user's groups (only groups created by the user)
async function handleGetGroups(
  userId: string
): Promise<APIGatewayProxyResult> {
  const allGroups = (await scanTable(GROUPS_TABLE)) as Group[];
  
  // Filter groups where user is the creator (groups are personal, not shared)
  const userGroups = allGroups.filter((g) => g.createdBy === userId);

  return successResponse({ groups: userGroups });
}

// Get specific group
async function handleGetGroup(
  groupId: string,
  userId: string
): Promise<APIGatewayProxyResult> {
  const group = (await getItem(GROUPS_TABLE, { id: groupId })) as
    | Group
    | undefined;

  if (!group) {
    return errorResponse('Group not found', 404);
  }

  // Check if user is the creator (groups are personal)
  if (group.createdBy !== userId) {
    return errorResponse('Access denied', 403);
  }

  return successResponse({ group });
}

// Create new group
async function handleCreateGroup(
  event: AuthenticatedEvent,
  userId: string
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  const body = JSON.parse(event.body);
  const { name, userIds } = body;

  if (!name || !name.trim()) {
    return errorResponse('Group name is required', 400);
  }

  if (!Array.isArray(userIds) || userIds.length === 0) {
    return errorResponse('At least one user must be in the group', 400);
  }

  // Ensure creator is in the group
  const members = Array.from(new Set([userId, ...userIds]));

  // Verify all users exist
  const allUsers = await scanTable(USERS_TABLE);
  const validUserIds = new Set(allUsers.map((u: any) => u.id));
  
  for (const memberId of members) {
    if (!validUserIds.has(memberId)) {
      return errorResponse(`User ${memberId} not found`, 404);
    }
  }

  const group: Group = {
    id: uuidv4(),
    name: name.trim(),
    userIds: members,
    createdBy: userId,
    createdAt: new Date().toISOString(),
  };

  await putItem(GROUPS_TABLE, group);

  return successResponse({ group }, 201);
}

// Update group members
async function handleUpdateMembers(
  event: AuthenticatedEvent,
  groupId: string,
  userId: string
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  const group = (await getItem(GROUPS_TABLE, { id: groupId })) as
    | Group
    | undefined;

  if (!group) {
    return errorResponse('Group not found', 404);
  }

  // Only creator can modify members
  if (group.createdBy !== userId) {
    return errorResponse('Only group creator can modify members', 403);
  }

  const body = JSON.parse(event.body);
  const { userIds } = body;

  if (!Array.isArray(userIds)) {
    return errorResponse('userIds must be an array', 400);
  }

  // Ensure creator stays in the group
  const members = Array.from(new Set([userId, ...userIds]));

  const updatedGroup = {
    ...group,
    userIds: members,
  };

  await putItem(GROUPS_TABLE, updatedGroup);

  return successResponse({ group: updatedGroup });
}

// Delete group
async function handleDeleteGroup(
  groupId: string,
  userId: string
): Promise<APIGatewayProxyResult> {
  const group = (await getItem(GROUPS_TABLE, { id: groupId })) as
    | Group
    | undefined;

  if (!group) {
    return errorResponse('Group not found', 404);
  }

  // Only creator can delete
  if (group.createdBy !== userId) {
    return errorResponse('Only group creator can delete the group', 403);
  }

  await deleteItem(GROUPS_TABLE, { id: groupId });

  return successResponse({ message: 'Group deleted' });
}

