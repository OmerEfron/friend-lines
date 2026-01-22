import { APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { putItem, getItem, scanTable, deleteItem } from '../utils/dynamo';
import { successResponse, errorResponse } from '../utils/response';
import { withAuth, AuthenticatedEvent } from '../utils/middleware';

const USERS_TABLE = process.env.USERS_TABLE || 'friendlines-users';
const FRIENDSHIPS_TABLE =
  process.env.FRIENDSHIPS_TABLE || 'friendlines-friendships';
const GROUPS_TABLE = process.env.GROUPS_TABLE || 'friendlines-groups';
const BOOKMARKS_TABLE = process.env.BOOKMARKS_TABLE || 'friendlines-bookmarks';
const NEWSFLASHES_TABLE =
  process.env.NEWSFLASHES_TABLE || 'friendlines-newsflashes';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  passwordHash?: string;
  createdAt?: string;
}

interface Friendship {
  userId: string;
  friendId: string;
  status: string;
}

interface Group {
  id: string;
  name: string;
  userIds: string[];
  createdBy: string;
}

interface Bookmark {
  userId: string;
  newsflashId: string;
}

interface Newsflash {
  id: string;
  userId: string;
}

export async function handler(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  console.log('Users Event:', JSON.stringify(event, null, 2));

  try {
    const method = event.httpMethod;
    const path = event.path;

    // GET /users/search - Search users (Protected)
    if (method === 'GET' && path === '/users/search') {
      return await withAuth(handleSearchUsers)(event);
    }

    // GET /users - List all users (Protected)
    if (method === 'GET' && path === '/users') {
      return await withAuth(handleGetUsers)(event);
    }

    // GET /users/{id} - Get specific user (Protected)
    if (method === 'GET' && event.pathParameters?.id) {
      return await withAuth(handleGetUser)(event);
    }

    // PUT /users/{id} - Update user (Protected)
    if (method === 'PUT' && event.pathParameters?.id) {
      return await withAuth(handleUpdateUser)(event);
    }

    // POST /users - Create new user (kept for backward compatibility, not used with auth)
    if (method === 'POST' && path === '/users') {
      return await handleCreateUser(event);
    }

    // DELETE /users/{id} - Delete user account (Protected)
    if (method === 'DELETE' && event.pathParameters?.id) {
      return await withAuth(handleDeleteUser)(event);
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error'
    );
  }
}

async function handleSearchUsers(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  const query = event.queryStringParameters?.q;

  if (!query || query.trim().length === 0) {
    return errorResponse('Search query is required', 400);
  }

  const searchQuery = query.trim().toLowerCase();
  const allUsers = (await scanTable(USERS_TABLE)) as User[];

  // Filter users by name or username
  const matchedUsers = allUsers.filter((u) => {
    const name = u.name.toLowerCase();
    const username = u.username.toLowerCase();
    return name.includes(searchQuery) || username.includes(searchQuery);
  });

  // Remove password hashes from response
  const sanitizedUsers = matchedUsers.map((u) => {
    const { passwordHash, ...userWithoutPassword } = u;
    return userWithoutPassword;
  });

  return successResponse({ users: sanitizedUsers });
}

async function handleGetUsers(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  const users = (await scanTable(USERS_TABLE)) as User[];
  
  // Remove password hashes from response
  const sanitizedUsers = users.map((u) => {
    const { passwordHash, ...userWithoutPassword } = u;
    return userWithoutPassword;
  });
  
  return successResponse({ users: sanitizedUsers });
}

async function handleGetUser(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  const { id } = event.pathParameters!;
  const user = await getItem(USERS_TABLE, { id }) as User | undefined;
  
  if (!user) {
    return errorResponse('User not found', 404);
  }
  
  // Remove password hash
  const { passwordHash, ...userWithoutPassword } = user;
  return successResponse({ user: userWithoutPassword });
}

async function handleUpdateUser(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  const { id } = event.pathParameters!;
  const userId = event.userId!;

  // Users can only update their own profile
  if (id !== userId) {
    return errorResponse('You can only update your own profile', 403);
  }

  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  const body = JSON.parse(event.body);
  const { name, username, avatar } = body;

  // Get existing user
  const existingUser = await getItem(USERS_TABLE, { id }) as User | undefined;
  
  if (!existingUser) {
    return errorResponse('User not found', 404);
  }

  // If username is being changed, check if it's available
  if (username && username !== existingUser.username) {
    const allUsers = (await scanTable(USERS_TABLE)) as User[];
    const usernameExists = allUsers.some(
      (u) => u.username === username.toLowerCase() && u.id !== id
    );

    if (usernameExists) {
      return errorResponse('Username already taken', 409);
    }
  }

  // Update user with new values
  const updatedUser: User = {
    ...existingUser,
    name: name || existingUser.name,
    username: username ? username.toLowerCase() : existingUser.username,
    avatar: avatar !== undefined ? avatar : existingUser.avatar,
  };

  await putItem(USERS_TABLE, updatedUser);

  // Remove password hash from response
  const { passwordHash, ...userWithoutPassword } = updatedUser;
  return successResponse({ user: userWithoutPassword });
}

async function handleCreateUser(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  const body = JSON.parse(event.body);
  const { name, username, avatar } = body;

  if (!name || !username) {
    return errorResponse('Name and username are required', 400);
  }

  const user: Partial<User> = {
    id: uuidv4(),
    name,
    username,
    avatar: avatar || undefined,
  };

  await putItem(USERS_TABLE, user);
  return successResponse({ user }, 201);
}

async function handleDeleteUser(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  const { id } = event.pathParameters!;
  const userId = event.userId!;

  // Users can only delete their own account
  if (id !== userId) {
    return errorResponse('You can only delete your own account', 403);
  }

  // Verify user exists
  const existingUser = (await getItem(USERS_TABLE, { id })) as User | undefined;
  if (!existingUser) {
    return errorResponse('User not found', 404);
  }

  // Cascade delete all related data
  await cascadeDeleteUserData(userId);

  // Delete the user
  await deleteItem(USERS_TABLE, { id });

  return successResponse({ message: 'Account deleted' });
}

// Helper: Delete all data related to a user
async function cascadeDeleteUserData(userId: string): Promise<void> {
  // 1. Delete all friendships involving this user
  const allFriendships = (await scanTable(FRIENDSHIPS_TABLE)) as Friendship[];
  for (const f of allFriendships) {
    if (f.userId === userId || f.friendId === userId) {
      await deleteItem(FRIENDSHIPS_TABLE, {
        userId: f.userId,
        friendId: f.friendId,
      });
    }
  }

  // 2. Delete all groups created by this user
  const allGroups = (await scanTable(GROUPS_TABLE)) as Group[];
  for (const g of allGroups) {
    if (g.createdBy === userId) {
      await deleteItem(GROUPS_TABLE, { id: g.id });
    }
  }

  // 3. Remove user from other users' groups
  for (const g of allGroups) {
    if (g.createdBy !== userId && g.userIds.includes(userId)) {
      const updatedUserIds = g.userIds.filter((id) => id !== userId);
      const updatedGroup = { ...g, userIds: updatedUserIds };
      await putItem(GROUPS_TABLE, updatedGroup);
    }
  }

  // 4. Delete all bookmarks by this user
  const allBookmarks = (await scanTable(BOOKMARKS_TABLE)) as Bookmark[];
  for (const b of allBookmarks) {
    if (b.userId === userId) {
      await deleteItem(BOOKMARKS_TABLE, {
        userId: b.userId,
        newsflashId: b.newsflashId,
      });
    }
  }

  // 5. Delete all newsflashes by this user
  const allNewsflashes = (await scanTable(NEWSFLASHES_TABLE)) as Newsflash[];
  for (const nf of allNewsflashes) {
    if (nf.userId === userId) {
      // Also delete any bookmarks referencing this newsflash
      for (const b of allBookmarks) {
        if (b.newsflashId === nf.id) {
          await deleteItem(BOOKMARKS_TABLE, {
            userId: b.userId,
            newsflashId: b.newsflashId,
          });
        }
      }
      await deleteItem(NEWSFLASHES_TABLE, { id: nf.id });
    }
  }
}
