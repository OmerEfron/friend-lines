const { DynamoDBClient, ScanCommand } = require('@aws-sdk/client-dynamodb');
const { unmarshall } = require('@aws-sdk/util-dynamodb');

const client = new DynamoDBClient({
  endpoint: 'http://localhost:8000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  }
});

async function run() {
  try {
    const command = new ScanCommand({
      TableName: 'friendlines-friendships',
    });
    const response = await client.send(command);
    const items = response.Items.map(i => unmarshall(i));
    console.log('Friendships:', JSON.stringify(items, null, 2));
  } catch (e) {
    console.error(e);
  }
}

run();

