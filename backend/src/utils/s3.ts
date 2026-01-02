import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

// Configure S3 client based on environment
const isLocal = process.env.IS_LOCAL === 'true';

const s3Config = isLocal
  ? {
      endpoint: 'http://localstack:4566',
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
      forcePathStyle: true,
    }
  : {};

export const s3Client = new S3Client(s3Config);

export async function uploadFile(
  bucket: string,
  key: string,
  body: Buffer | string,
  contentType: string = 'application/octet-stream'
) {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  await s3Client.send(command);

  // Return the URL for local or cloud
  if (isLocal) {
    return `http://localhost:4566/${bucket}/${key}`;
  }
  return `https://${bucket}.s3.amazonaws.com/${key}`;
}

