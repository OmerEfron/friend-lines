import { APIGatewayProxyResult } from 'aws-lambda';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '../utils/s3';
import { successResponse, errorResponse } from '../utils/response';
import { withAuth, AuthenticatedEvent } from '../utils/middleware';

const MEDIA_BUCKET = process.env.MEDIA_BUCKET || 'friendlines-media';
const PRESIGNED_URL_EXPIRATION = 300; // 5 minutes

export async function handler(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  return withAuth(async (authenticatedEvent) => {
    console.log('Uploads Event:', JSON.stringify(authenticatedEvent, null, 2));

    try {
      const method = authenticatedEvent.httpMethod;
      const path = authenticatedEvent.path;
      const userId = authenticatedEvent.userId!;

      // POST /uploads/presigned-url - Generate presigned URL for upload
      if (method === 'POST' && path === '/uploads/presigned-url') {
        return await handlePresignedUrl(authenticatedEvent, userId);
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

async function handlePresignedUrl(
  event: AuthenticatedEvent,
  userId: string
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  const body = JSON.parse(event.body);
  const { fileName, fileType } = body;

  if (!fileName || !fileType) {
    return errorResponse('fileName and fileType are required', 400);
  }

  // Validate file type (images only)
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(fileType.toLowerCase())) {
    return errorResponse('Invalid file type. Only images are allowed.', 400);
  }

  // Generate unique key for the file
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const key = `uploads/${userId}/${timestamp}_${sanitizedFileName}`;

  try {
    // Create PutObjectCommand
    const command = new PutObjectCommand({
      Bucket: MEDIA_BUCKET,
      Key: key,
      ContentType: fileType,
    });

    // Generate presigned URL
    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: PRESIGNED_URL_EXPIRATION,
      signableHeaders: new Set(['content-type']),
    });

    // Generate public URL for the uploaded file
    const publicUrl = `https://${MEDIA_BUCKET}.s3.amazonaws.com/${key}`;

    return successResponse({
      presignedUrl,
      publicUrl,
      key,
      expiresIn: PRESIGNED_URL_EXPIRATION,
    });
  } catch (error) {
    console.error('Failed to generate presigned URL:', error);
    return errorResponse('Failed to generate upload URL');
  }
}



