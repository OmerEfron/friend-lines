import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { putItem, scanTable, queryItems } from '../utils/dynamo';
import { uploadFile } from '../utils/s3';
import { successResponse, errorResponse } from '../utils/response';

const NEWSFLASHES_TABLE =
  process.env.NEWSFLASHES_TABLE || 'friendlines-newsflashes';
const MEDIA_BUCKET = process.env.MEDIA_BUCKET || 'friendlines-media-local';

interface Newsflash {
  id: string;
  userId: string;
  headline: string;
  subHeadline?: string;
  media?: string;
  timestamp: string;
}

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log('Event:', JSON.stringify(event, null, 2));

  try {
    const method = event.httpMethod;
    const path = event.path;

    // GET /newsflashes - List all newsflashes (optionally by userId)
    if (method === 'GET' && path === '/newsflashes') {
      const userId = event.queryStringParameters?.userId;

      let newsflashes;
      if (userId) {
        newsflashes = await queryItems(
          NEWSFLASHES_TABLE,
          'userId-timestamp-index',
          'userId = :userId',
          { ':userId': userId }
        );
      } else {
        newsflashes = await scanTable(NEWSFLASHES_TABLE);
      }

      // Sort by timestamp descending
      newsflashes.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      return successResponse({ newsflashes });
    }

    // POST /newsflashes - Create new newsflash
    if (method === 'POST' && path === '/newsflashes') {
      if (!event.body) {
        return errorResponse('Request body is required', 400);
      }

      const body = JSON.parse(event.body);
      const { userId, headline, subHeadline, mediaBase64 } = body;

      if (!userId || !headline) {
        return errorResponse('userId and headline are required', 400);
      }

      let mediaUrl: string | undefined;

      // Handle media upload if provided
      if (mediaBase64) {
        const mediaId = uuidv4();
        const buffer = Buffer.from(mediaBase64, 'base64');
        mediaUrl = await uploadFile(
          MEDIA_BUCKET,
          `media/${mediaId}.jpg`,
          buffer,
          'image/jpeg'
        );
      }

      const newsflash: Newsflash = {
        id: uuidv4(),
        userId,
        headline,
        subHeadline: subHeadline || undefined,
        media: mediaUrl,
        timestamp: new Date().toISOString(),
      };

      await putItem(NEWSFLASHES_TABLE, newsflash);
      return successResponse({ newsflash }, 201);
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error'
    );
  }
}

