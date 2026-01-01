import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { putItem, getItem, scanTable } from '../utils/dynamo';
import { successResponse, errorResponse } from '../utils/response';

const USERS_TABLE = process.env.USERS_TABLE || 'friendlines-users';

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
}

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const method = event.httpMethod;
    const path = event.path;

    // GET /users - List all users
    if (method === 'GET' && path === '/users') {
      const users = await scanTable(USERS_TABLE);
      return successResponse({ users });
    }

    // GET /users/{id} - Get specific user
    if (method === 'GET' && event.pathParameters?.id) {
      const { id } = event.pathParameters;
      const user = await getItem(USERS_TABLE, { id });
      
      if (!user) {
        return errorResponse('User not found', 404);
      }
      
      return successResponse({ user });
    }

    // POST /users - Create new user
    if (method === 'POST' && path === '/users') {
      if (!event.body) {
        return errorResponse('Request body is required', 400);
      }

      const body = JSON.parse(event.body);
      const { name, username, avatar } = body;

      if (!name || !username) {
        return errorResponse('Name and username are required', 400);
      }

      const user: User = {
        id: uuidv4(),
        name,
        username,
        avatar: avatar || undefined,
      };

      await putItem(USERS_TABLE, user);
      return successResponse({ user }, 201);
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error'
    );
  }
}

