#!/usr/bin/env node

const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

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

// Your existing user ID (we'll fetch this)
const YOUR_EMAIL = 'omer@example.com';
let YOUR_USER_ID = null;

// Test users to create
const testUsers = [
  {
    name: 'Sarah Williams',
    username: 'sarahw',
    email: 'sarah@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=1',
  },
  {
    name: 'Michael Chen',
    username: 'mchen',
    email: 'michael@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=13',
  },
  {
    name: 'Emma Johnson',
    username: 'emmaj',
    email: 'emma@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=5',
  },
  {
    name: 'David Martinez',
    username: 'davidm',
    email: 'david@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=12',
  },
];

// Sample newsflashes
const newsflashTemplates = [
  {
    headline: 'Just found the cutest coffee shop on 5th street!',
    subHeadline: 'They have the best caramel lattes and free wifi',
    media: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
  },
  {
    headline: 'Finally finished that project I was working on',
    subHeadline: 'So relieved! Time to celebrate with some gaming tonight',
  },
  {
    headline: 'Completed my first 5K run this morning!',
    subHeadline: 'My legs are killing me but totally worth it',
    media: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
  },
  {
    headline: 'Got my bike fixed, ready for weekend rides',
    subHeadline: 'Anyone want to join me for a trail ride on Saturday?',
    media: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800',
  },
  {
    headline: 'Reading the most amazing book right now',
    subHeadline: "Can't put it down! Will recommend at next book club",
  },
  {
    headline: 'Tried that new Italian place everyone\'s talking about',
    subHeadline: 'Best pasta I\'ve had in years! Going back next week for sure',
    media: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
  },
];

async function findYourUser() {
  console.log(`\n🔍 Looking for your user: ${YOUR_EMAIL}...`);
  
  // Scan users table to find your user
  const AWS = require('@aws-sdk/client-dynamodb');
  const scanClient = new AWS.DynamoDBClient({
    endpoint: 'http://localhost:8000',
    region: 'us-east-1',
    credentials: {
      accessKeyId: 'test',
      secretAccessKey: 'test',
    },
  });

  const command = new AWS.ScanCommand({
    TableName: 'friendlines-users',
  });

  const response = await scanClient.send(command);
  const user = response.Items?.find(
    item => item.email?.S === YOUR_EMAIL
  );

  if (user) {
    YOUR_USER_ID = user.id.S;
    console.log(`✅ Found your user: ${user.name.S} (${YOUR_USER_ID})`);
    return true;
  } else {
    console.error(`❌ Could not find user with email: ${YOUR_EMAIL}`);
    console.log('Please make sure you registered with that email first!');
    return false;
  }
}

async function createUser(userData) {
  const passwordHash = await bcrypt.hash(userData.password, 10);
  
  const user = {
    id: uuidv4(),
    name: userData.name,
    username: userData.username,
    email: userData.email,
    passwordHash,
    avatar: userData.avatar,
    createdAt: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({
    TableName: 'friendlines-users',
    Item: user,
  }));

  console.log(`✅ Created user: ${user.name} (@${user.username})`);
  return user;
}

async function createFriendship(userId, friendId) {
  const friendship = {
    userId,
    friendId,
  };

  await docClient.send(new PutCommand({
    TableName: 'friendlines-friendships',
    Item: friendship,
  }));

  console.log(`✅ Created friendship: ${userId.slice(0, 8)}... ↔️ ${friendId.slice(0, 8)}...`);
}

async function createNewsflash(userId, template) {
  const newsflash = {
    id: uuidv4(),
    userId,
    headline: template.headline,
    subHeadline: template.subHeadline || undefined,
    media: template.media || undefined,
    timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  };

  await docClient.send(new PutCommand({
    TableName: 'friendlines-newsflashes',
    Item: newsflash,
  }));

  console.log(`✅ Created newsflash: "${newsflash.headline.slice(0, 40)}..."`);
}

async function main() {
  console.log('🌱 Seeding Friendlines Database...\n');
  console.log('='.repeat(50));

  // Find your user first
  const foundUser = await findYourUser();
  if (!foundUser) {
    process.exit(1);
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n📝 Creating test users...\n');

  const createdUsers = [];
  for (const userData of testUsers) {
    try {
      const user = await createUser(userData);
      createdUsers.push(user);
    } catch (error) {
      console.error(`❌ Failed to create ${userData.name}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n👥 Creating friendships...\n');

  for (const user of createdUsers) {
    try {
      // Make them friends with you
      await createFriendship(YOUR_USER_ID, user.id);
      // Make you their friend too (bidirectional)
      await createFriendship(user.id, YOUR_USER_ID);
    } catch (error) {
      console.error(`❌ Failed to create friendship with ${user.name}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n📰 Creating newsflashes...\n');

  // Create newsflashes for each user
  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i];
    const template = newsflashTemplates[i % newsflashTemplates.length];
    
    try {
      await createNewsflash(user.id, template);
      
      // Some users get 2 newsflashes
      if (i < 2) {
        const template2 = newsflashTemplates[(i + 3) % newsflashTemplates.length];
        await createNewsflash(user.id, template2);
      }
    } catch (error) {
      console.error(`❌ Failed to create newsflash for ${user.name}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Seeding complete!\n');
  console.log('Summary:');
  console.log(`  - Created ${createdUsers.length} test users`);
  console.log(`  - Created ${createdUsers.length * 2} friendships`);
  console.log(`  - Created ${createdUsers.length + 2} newsflashes`);
  console.log('\n📋 Test User Credentials:');
  console.log('  Email: sarah@example.com, michael@example.com, etc.');
  console.log('  Password: password123 (for all test users)');
  console.log('\n🔄 Reload your app to see the new data!');
}

main().catch(error => {
  console.error('\n❌ Seeding failed:', error);
  process.exit(1);
});


