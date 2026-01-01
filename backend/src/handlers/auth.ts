import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { putItem, getItem, scanTable } from '../utils/dynamo';
import { successResponse, errorResponse } from '../utils/response';
import {
  generateToken,
  hashPassword,
  comparePassword,
} from '../utils/auth';
import { withAuth, AuthenticatedEvent } from '../utils/middleware';

const USERS_TABLE = process.env.USERS_TABLE || 'friendlines-users';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  createdAt: string;
}

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log('Auth Event:', JSON.stringify(event, null, 2));

  try {
    const method = event.httpMethod;
    const path = event.path;

    // POST /auth/register - Create new user
    if (method === 'POST' && path === '/auth/register') {
      return await handleRegister(event);
    }

    // POST /auth/login - Authenticate user
    if (method === 'POST' && path === '/auth/login') {
      return await handleLogin(event);
    }

    // GET /auth/me - Get current user (protected)
    if (method === 'GET' && path === '/auth/me') {
      return await withAuth(handleMe)(event);
    }

    return errorResponse('Not found', 404);
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error'
    );
  }
}

// Register new user
async function handleRegister(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  const body = JSON.parse(event.body);
  const { name, username, email, password } = body;

  // Validate required fields
  if (!name || !username || !email || !password) {
    return errorResponse(
      'Name, username, email, and password are required',
      400
    );
  }

  // Validate password length
  if (password.length < 6) {
    return errorResponse('Password must be at least 6 characters', 400);
  }

  // Check if email already exists
  const existingUsers = await scanTable(USERS_TABLE);
  const emailExists = existingUsers.some(
    (u: any) => u.email === email.toLowerCase()
  );

  if (emailExists) {
    return errorResponse('Email already registered', 409);
  }

  // Check if username already exists
  const usernameExists = existingUsers.some(
    (u: any) => u.username === username.toLowerCase()
  );

  if (usernameExists) {
    return errorResponse('Username already taken', 409);
  }

  // Hash password
  const passwordHash = await hashPassword(password);

  // Create user
  const user: User = {
    id: uuidv4(),
    name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    passwordHash,
    avatar: body.avatar || undefined,
    createdAt: new Date().toISOString(),
  };

  await putItem(USERS_TABLE, user);

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  // Return user without password hash
  const { passwordHash: _, ...userWithoutPassword } = user;

  return successResponse(
    {
      user: userWithoutPassword,
      token,
    },
    201
  );
}

// Login user
async function handleLogin(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  const body = JSON.parse(event.body);
  const { email, password } = body;

  if (!email || !password) {
    return errorResponse('Email and password are required', 400);
  }

  // Find user by email
  const users = await scanTable(USERS_TABLE);
  const user = users.find(
    (u: any) => u.email === email.toLowerCase()
  ) as User | undefined;

  if (!user) {
    return errorResponse('Invalid credentials', 401);
  }

  // Compare password
  const isValidPassword = await comparePassword(password, user.passwordHash);

  if (!isValidPassword) {
    return errorResponse('Invalid credentials', 401);
  }

  // Generate token
  const token = generateToken({
    userId: user.id,
    email: user.email,
  });

  // Return user without password hash
  const { passwordHash: _, ...userWithoutPassword } = user;

  return successResponse({
    user: userWithoutPassword,
    token,
  });
}

// Get current user
async function handleMe(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  const userId = event.userId!;

  const user = (await getItem(USERS_TABLE, { id: userId })) as User | undefined;

  if (!user) {
    return errorResponse('User not found', 404);
  }

  // Return user without password hash
  const { passwordHash: _, ...userWithoutPassword } = user;

  return successResponse({ user: userWithoutPassword });
}


