import { APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { putItem, getItem, scanTable } from '../utils/dynamo';
import { successResponse, errorResponse } from '../utils/response';
import { withAuth, AuthenticatedEvent } from '../utils/middleware';

const USERS_TABLE = process.env.USERS_TABLE || 'friendlines-users';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  passwordHash?: string;
  createdAt?: string;
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
  const allUsers = await scanTable(USERS_TABLE);

  // Filter users by name or username
  const matchedUsers = allUsers.filter((u: User) => {
    const name = u.name.toLowerCase();
    const username = u.username.toLowerCase();
    return name.includes(searchQuery) || username.includes(searchQuery);
  });

  // Remove password hashes from response
  const sanitizedUsers = matchedUsers.map((u: User) => {
    const { passwordHash, ...userWithoutPassword } = u;
    return userWithoutPassword;
  });

  return successResponse({ users: sanitizedUsers });
}

async function handleGetUsers(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  const users = await scanTable(USERS_TABLE);
  
  // Remove password hashes from response
  const sanitizedUsers = users.map((u: User) => {
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
    const allUsers = await scanTable(USERS_TABLE);
    const usernameExists = allUsers.some(
      (u: User) => u.username === username.toLowerCase() && u.id !== id
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

