import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

// Configure DynamoDB client based on environment
const isLocal = process.env.IS_LOCAL === 'true';

const dynamoConfig = isLocal
  ? {
      endpoint: 'http://dynamodb-local:8000',
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'test',
        secretAccessKey: 'test',
      },
    }
  : {};

const client = new DynamoDBClient(dynamoConfig);
const docClient = DynamoDBDocumentClient.from(client);

export async function putItem(tableName: string, item: Record<string, any>) {
  const command = new PutCommand({
    TableName: tableName,
    Item: item,
  });
  return await docClient.send(command);
}

export async function getItem(
  tableName: string,
  key: Record<string, any>
) {
  const command = new GetCommand({
    TableName: tableName,
    Key: key,
  });
  const response = await docClient.send(command);
  return response.Item;
}

export async function queryItems(
  tableName: string,
  indexName: string | undefined,
  keyConditionExpression: string,
  expressionAttributeValues: Record<string, any>
) {
  const command = new QueryCommand({
    TableName: tableName,
    IndexName: indexName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  });
  const response = await docClient.send(command);
  return response.Items || [];
}

export async function scanTable(tableName: string) {
  const command = new ScanCommand({
    TableName: tableName,
  });
  const response = await docClient.send(command);
  return response.Items || [];
}

export async function deleteItem(
  tableName: string,
  key: Record<string, any>
) {
  const command = new DeleteCommand({
    TableName: tableName,
    Key: key,
  });
  return await docClient.send(command);
}

