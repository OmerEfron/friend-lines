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
const { DynamoDBDocumentClient, PutCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
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

// Your existing user email (will be found or created)
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
  {
    name: 'Lisa Anderson',
    username: 'lisaa',
    email: 'lisa@example.com',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?img=9',
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
  {
    headline: 'Beautiful sunset at the beach today',
    subHeadline: 'Perfect end to a perfect day',
    media: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800',
  },
  {
    headline: 'Started learning a new language!',
    subHeadline: 'Spanish here I come. Any native speakers want to practice?',
  },
];

// Group templates
const groupTemplates = [
  { name: 'Weekend Warriors', description: 'For our hiking and outdoor adventures' },
  { name: 'Book Club', description: 'Monthly book discussions' },
  { name: 'Foodies', description: 'Sharing restaurant recommendations' },
  { name: 'Tech Enthusiasts', description: 'Latest tech news and discussions' },
];

async function findOrCreateYourUser() {
  console.log(`\n🔍 Looking for your user: ${YOUR_EMAIL}...`);
  
  // Scan users table to find your user
  const scanResult = await docClient.send(
    new ScanCommand({
      TableName: 'friendlines-users',
    })
  );
  
  const user = scanResult.Items?.find(
    item => item.email === YOUR_EMAIL
  );

  if (user) {
    YOUR_USER_ID = user.id;
    console.log(`✅ Found your user: ${user.name} (${YOUR_USER_ID})`);
    return user;
  } else {
    console.log(`⚠️  User not found. Creating new user...`);
    const passwordHash = await bcrypt.hash('password123', 10);
    const newUser = {
      id: uuidv4(),
      name: 'Omer',
      username: 'omer',
      email: YOUR_EMAIL,
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    
    await docClient.send(new PutCommand({
      TableName: 'friendlines-users',
      Item: newUser,
    }));
    
    YOUR_USER_ID = newUser.id;
    console.log(`✅ Created your user: ${newUser.name} (${YOUR_USER_ID})`);
    return newUser;
  }
}

async function createUser(userData) {
  // Check if user already exists
  const scanResult = await docClient.send(
    new ScanCommand({
      TableName: 'friendlines-users',
      FilterExpression: 'email = :email',
      ExpressionAttributeValues: {
        ':email': userData.email,
      },
    })
  );
  
  if (scanResult.Items && scanResult.Items.length > 0) {
    console.log(`⏭️  User ${userData.name} already exists, skipping...`);
    return scanResult.Items[0];
  }
  
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

async function createFriendship(userId, friendId, initiatorId) {
  const now = new Date().toISOString();
  
  // Check if friendship already exists
  const existing = await docClient.send(
    new ScanCommand({
      TableName: 'friendlines-friendships',
      FilterExpression: 'userId = :userId AND friendId = :friendId',
      ExpressionAttributeValues: {
        ':userId': userId,
        ':friendId': friendId,
      },
    })
  );
  
  if (existing.Items && existing.Items.length > 0) {
    return; // Already exists
  }
  
  const friendship = {
    userId,
    friendId,
    status: 'accepted',
    initiatorId,
    createdAt: now,
    updatedAt: now,
  };

  await docClient.send(new PutCommand({
    TableName: 'friendlines-friendships',
    Item: friendship,
  }));
}

async function createBidirectionalFriendship(userId1, userId2, initiatorId) {
  // Create both directions of the friendship
  await createFriendship(userId1, userId2, initiatorId);
  await createFriendship(userId2, userId1, initiatorId);
  console.log(`✅ Created friendship: ${userId1.slice(0, 8)}... ↔️ ${userId2.slice(0, 8)}...`);
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

  return newsflash;
}

async function createGroup(name, userIds, createdBy) {
  const group = {
    id: uuidv4(),
    name,
    userIds: Array.from(new Set([createdBy, ...userIds])), // Ensure creator is included
    createdBy,
    createdAt: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({
    TableName: 'friendlines-groups',
    Item: group,
  }));

  console.log(`✅ Created group: ${name} (${group.userIds.length} members)`);
  return group;
}

async function createBookmark(userId, newsflashId) {
  const bookmark = {
    userId,
    newsflashId,
    createdAt: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({
    TableName: 'friendlines-bookmarks',
    Item: bookmark,
  }));
}

async function main() {
  console.log('🌱 Seeding Friendlines Database...\n');
  console.log('='.repeat(50));

  // Find or create your user first
  await findOrCreateYourUser();

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

  // Create friendships: make all test users friends with you
  for (const user of createdUsers) {
    try {
      await createBidirectionalFriendship(YOUR_USER_ID, user.id, YOUR_USER_ID);
    } catch (error) {
      console.error(`❌ Failed to create friendship with ${user.name}:`, error.message);
    }
  }

  // Create some friendships between test users
  for (let i = 0; i < Math.min(3, createdUsers.length - 1); i++) {
    try {
      await createBidirectionalFriendship(
        createdUsers[i].id,
        createdUsers[i + 1].id,
        createdUsers[i].id
      );
    } catch (error) {
      console.error(`❌ Failed to create friendship:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n📰 Creating newsflashes...\n');

  const allNewsflashes = [];
  
  // Create newsflashes for your user
  for (let i = 0; i < 2; i++) {
    const template = newsflashTemplates[i % newsflashTemplates.length];
    try {
      const newsflash = await createNewsflash(YOUR_USER_ID, template);
      allNewsflashes.push(newsflash);
      console.log(`✅ Created newsflash: "${newsflash.headline.slice(0, 40)}..."`);
    } catch (error) {
      console.error(`❌ Failed to create newsflash:`, error.message);
    }
  }

  // Create newsflashes for each test user
  for (let i = 0; i < createdUsers.length; i++) {
    const user = createdUsers[i];
    const template = newsflashTemplates[i % newsflashTemplates.length];
    
    try {
      const newsflash = await createNewsflash(user.id, template);
      allNewsflashes.push(newsflash);
      console.log(`✅ Created newsflash for ${user.name}: "${newsflash.headline.slice(0, 40)}..."`);
      
      // Some users get 2 newsflashes
      if (i < 2) {
        const template2 = newsflashTemplates[(i + 3) % newsflashTemplates.length];
        const newsflash2 = await createNewsflash(user.id, template2);
        allNewsflashes.push(newsflash2);
        console.log(`✅ Created second newsflash for ${user.name}`);
      }
    } catch (error) {
      console.error(`❌ Failed to create newsflash for ${user.name}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n👥 Creating groups...\n');

  const createdGroups = [];
  
  // Create groups with you as creator and some friends as members
  for (let i = 0; i < Math.min(groupTemplates.length, createdUsers.length); i++) {
    const template = groupTemplates[i];
    const memberIds = createdUsers
      .slice(0, Math.min(3, createdUsers.length))
      .map(u => u.id);
    
    try {
      const group = await createGroup(template.name, memberIds, YOUR_USER_ID);
      createdGroups.push(group);
    } catch (error) {
      console.error(`❌ Failed to create group ${template.name}:`, error.message);
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n🔖 Creating bookmarks...\n');

  // Create bookmarks: you bookmark some newsflashes from friends
  let bookmarkCount = 0;
  for (let i = 0; i < Math.min(5, allNewsflashes.length); i++) {
    const newsflash = allNewsflashes[i];
    // Only bookmark newsflashes from other users
    if (newsflash.userId !== YOUR_USER_ID) {
      try {
        await createBookmark(YOUR_USER_ID, newsflash.id);
        bookmarkCount++;
        console.log(`✅ Bookmarked: "${newsflash.headline.slice(0, 40)}..."`);
      } catch (error) {
        console.error(`❌ Failed to create bookmark:`, error.message);
      }
    }
  }

  // Some test users also bookmark newsflashes
  for (let i = 0; i < Math.min(2, createdUsers.length); i++) {
    const user = createdUsers[i];
    const newsflash = allNewsflashes.find(n => n.userId !== user.id);
    if (newsflash) {
      try {
        await createBookmark(user.id, newsflash.id);
        bookmarkCount++;
      } catch (error) {
        // Silent fail for test user bookmarks
      }
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('\n✅ Seeding complete!\n');
  console.log('Summary:');
  console.log(`  - Your user: ${YOUR_USER_ID ? 'Found/Created' : 'Missing'}`);
  console.log(`  - Created ${createdUsers.length} test users`);
  console.log(`  - Created friendships (bidirectional)`);
  console.log(`  - Created ${allNewsflashes.length} newsflashes`);
  console.log(`  - Created ${createdGroups.length} groups`);
  console.log(`  - Created ${bookmarkCount} bookmarks`);
  console.log('\n📋 Test User Credentials:');
  console.log('  Email: sarah@example.com, michael@example.com, etc.');
  console.log('  Password: password123 (for all test users)');
  console.log(`  Your email: ${YOUR_EMAIL}`);
  console.log('  Your password: password123');
  console.log('\n🔄 Reload your app to see the new data!');
}

main().catch(error => {
  console.error('\n❌ Seeding failed:', error);
  process.exit(1);
});
