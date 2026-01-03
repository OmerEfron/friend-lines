#!/usr/bin/env node

const path = require('path');
const Module = require('module');

// Add backend node_modules to module search paths
const backendNodeModules = path.resolve(__dirname, '..', 'backend', 'node_modules');
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function(request, parent, isMain, options) {
  try {
    return originalResolveFilename.call(this, request, parent, isMain, options);
  } catch (err) {
    if (err.code === 'MODULE_NOT_FOUND') {
      // Try resolving from backend node_modules
      const backendOptions = {
        paths: [backendNodeModules, ...(options?.paths || [])],
      };
      try {
        return originalResolveFilename.call(this, request, parent, isMain, backendOptions);
      } catch (e) {
        throw err;
      }
    }
    throw err;
  }
};

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, ScanCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');

// Configure DynamoDB client for local
const client = new DynamoDBClient({
  endpoint: 'http://localhost:8000',
  region: 'us-east-1',
  credentials: {
    accessKeyId: 'test',
    secretAccessKey: 'test',
  },
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLES = [
  'friendlines-users',
  'friendlines-newsflashes',
  'friendlines-groups',
  'friendlines-friendships',
  'friendlines-bookmarks',
];

async function deleteAllItems(tableName) {
  console.log(`\n🗑️  Cleaning ${tableName}...`);
  
  let deletedCount = 0;
  let lastEvaluatedKey = undefined;
  
  do {
    // Scan the table
    const scanResult = await docClient.send(
      new ScanCommand({
        TableName: tableName,
        ExclusiveStartKey: lastEvaluatedKey,
      })
    );
    
    const items = scanResult.Items || [];
    
    // Delete each item
    for (const item of items) {
      // Determine the key based on table structure
      let key;
      
      if (tableName === 'friendlines-users') {
        key = { id: item.id };
      } else if (tableName === 'friendlines-newsflashes') {
        key = { id: item.id };
      } else if (tableName === 'friendlines-groups') {
        key = { id: item.id };
      } else if (tableName === 'friendlines-friendships') {
        key = { userId: item.userId, friendId: item.friendId };
      } else if (tableName === 'friendlines-bookmarks') {
        key = { userId: item.userId, newsflashId: item.newsflashId };
      }
      
      if (key) {
        await docClient.send(
          new DeleteCommand({
            TableName: tableName,
            Key: key,
          })
        );
        deletedCount++;
      }
    }
    
    lastEvaluatedKey = scanResult.LastEvaluatedKey;
  } while (lastEvaluatedKey);
  
  console.log(`   ✅ Deleted ${deletedCount} items`);
  return deletedCount;
}

async function main() {
  console.log('🧹 Cleaning DynamoDB Tables...\n');
  console.log('='.repeat(50));
  
  let totalDeleted = 0;
  
  for (const tableName of TABLES) {
    try {
      const count = await deleteAllItems(tableName);
      totalDeleted += count;
    } catch (error) {
      if (error.name === 'ResourceNotFoundException') {
        console.log(`   ⚠️  Table ${tableName} does not exist (skipping)`);
      } else {
        console.error(`   ❌ Error cleaning ${tableName}:`, error.message);
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log(`\n✅ Cleanup complete!`);
  console.log(`   Total items deleted: ${totalDeleted}`);
  console.log('\n📋 Tables are now empty and ready for fresh data.');
  console.log('   You can now run: node scripts/seed-database.js');
}

main().catch(error => {
  console.error('\n❌ Cleanup failed:', error);
  process.exit(1);
});

