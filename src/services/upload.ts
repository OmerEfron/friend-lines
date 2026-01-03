import { apiCall } from '../config/api';

interface PresignedUrlResponse {
  presignedUrl: string;
  publicUrl: string;
  key: string;
  expiresIn: number;
}

/**
 * Upload an image file to S3
 * @param fileUri - Local file URI from image picker
 * @param fileName - Name of the file
 * @param fileType - MIME type of the file
 * @returns Public URL of the uploaded file
 */
export async function uploadImage(
  fileUri: string,
  fileName: string,
  fileType: string
): Promise<string> {
  try {
    // Step 1: Get presigned URL from backend
    const { presignedUrl, publicUrl } = await apiCall<PresignedUrlResponse>(
      '/uploads/presigned-url',
      {
        method: 'POST',
        body: JSON.stringify({ fileName, fileType }),
      }
    );

    // Step 2: Upload file to S3 using presigned URL
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const uploadResponse = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': fileType,
      },
      body: blob,
    });

    if (!uploadResponse.ok) {
      throw new Error(`Upload failed with status ${uploadResponse.status}`);
    }

    // Step 3: Return public URL
    return publicUrl;
  } catch (error) {
    console.error('Upload failed:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to upload image'
    );
  }
}

/**
 * Get file name and type from URI
 */
export function getFileInfo(uri: string): {
  fileName: string;
  fileType: string;
} {
  const fileName = uri.split('/').pop() || 'image.jpg';
  const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg';

  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
  };

  return {
    fileName,
    fileType: mimeTypes[extension] || 'image/jpeg',
  };
}



