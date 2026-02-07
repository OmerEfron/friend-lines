# Friendlines API Documentation

Complete documentation for the Friendlines serverless backend API.

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Newsflashes](#newsflashes)
4. [Friendships](#friendships)
5. [Groups](#groups)
6. [Feeds](#feeds)
7. [Interviews (AI Reporter)](#interviews-ai-reporter)
8. [Error Handling](#error-handling)

## Base URL

**Local Development:** `http://localhost:3000`

**Android Emulator:** `http://10.0.2.2:3000`

## Authentication

All endpoints except `/auth/register` and `/auth/login` require JWT authentication via the `Authorization` header:

```
Authorization: Bearer <token>
```

### Register

Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": null,
    "createdAt": "2025-01-02T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Login

Authenticate an existing user.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": null,
    "createdAt": "2025-01-02T10:00:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Get Current User

Get the authenticated user's profile.

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": null,
    "createdAt": "2025-01-02T10:00:00.000Z"
  }
}
```

## Users

### List All Users

**Endpoint:** `GET /users`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "avatar": null,
      "createdAt": "2025-01-02T10:00:00.000Z"
    }
  ]
}
```

### Get User by ID

**Endpoint:** `GET /users/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": null,
    "createdAt": "2025-01-02T10:00:00.000Z"
  }
}
```

### Update User

**Endpoint:** `PUT /users/:id`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "John Updated",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Updated",
    "username": "johndoe",
    "email": "john@example.com",
    "avatar": "https://example.com/avatar.jpg",
    "createdAt": "2025-01-02T10:00:00.000Z"
  }
}
```

### Search Users

**Endpoint:** `GET /users/search?q=query`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `q`: Search query (matches name or username)

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "name": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "avatar": null
    }
  ]
}
```

### Delete User

**Endpoint:** `DELETE /users/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Account deleted"
}
```

## Newsflashes

### List My Newsflashes

**Endpoint:** `GET /newsflashes`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `userId` (optional): Must match the authenticated user (useful for explicit self-queries)

**Response (200):**
```json
{
  "newsflashes": [
    {
      "id": "uuid",
      "userId": "uuid",
      "headline": "Exciting news!",
      "subHeadline": "Something amazing happened",
      "media": "https://example.com/image.jpg",
      "category": "GENERAL",
      "severity": "STANDARD",
      "audience": "ALL_FRIENDS",
      "groupIds": ["uuid"],
      "timestamp": "2025-01-02T10:00:00.000Z"
    }
  ]
}
```

### Create Newsflash

**Endpoint:** `POST /newsflashes`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "headline": "Exciting news!",
  "subHeadline": "Something amazing happened",
  "category": "GENERAL",
  "severity": "STANDARD",
  "audience": "ALL_FRIENDS",
  "groupIds": ["uuid"],
  "media": "https://example.com/image.jpg",
  "mediaBase64": "base64-encoded-jpeg-without-data-url-prefix"
}
```

**Notes:**
- **Media upload**: Provide either `media` (an existing URL) OR `mediaBase64` (server uploads to S3 and returns `media` URL).
- **BREAKING rate limit**: `severity="BREAKING"` is limited to **1 per user per 24 hours** (returns `429` if exceeded).
- **Audience targeting**:
  - Use `audience="ALL_FRIENDS"` to notify all accepted friends.
  - Use `audience="GROUPS"` with `groupIds` to notify only members of those groups.

**Response (201):**
```json
{
  "newsflash": {
    "id": "uuid",
    "userId": "uuid",
    "headline": "Exciting news!",
    "subHeadline": "Something amazing happened",
    "media": "https://example.com/image.jpg",
    "category": "GENERAL",
    "severity": "STANDARD",
    "audience": "ALL_FRIENDS",
    "groupIds": ["uuid"],
    "timestamp": "2025-01-02T10:00:00.000Z"
  }
}
```

### Not Supported

- `GET /newsflashes/:id` is **not** currently deployed. Use `GET /newsflashes` (and optionally `?userId=...`) instead.

## Friendships

### List Friendships

Get all friendships for the authenticated user.

**Endpoint:** `GET /friendships`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "friendships": [
    {
      "userId": "uuid",
      "friendId": "uuid"
    }
  ]
}
```

### List Friends with Details

Get friends with full user details.

**Endpoint:** `GET /friends`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "friends": [
    {
      "id": "uuid",
      "name": "Jane Doe",
      "username": "janedoe",
      "email": "jane@example.com",
      "avatar": null,
      "createdAt": "2025-01-02T09:00:00.000Z"
    }
  ]
}
```

### Add Friend

**Endpoint:** `POST /friendships`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "friendId": "uuid"
}
```

**Response (201):**
```json
{
  "friendship": {
    "userId": "uuid",
    "friendId": "uuid"
  }
}
```

### Remove Friend

**Endpoint:** `DELETE /friendships/:friendId`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Friendship removed"
}
```

## Groups

### List Groups

Get all groups the authenticated user is a member of.

**Endpoint:** `GET /groups`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "groups": [
    {
      "id": "uuid",
      "name": "Weekend Crew",
      "userIds": ["uuid1", "uuid2", "uuid3"],
      "createdBy": "uuid1",
      "createdAt": "2025-01-02T10:00:00.000Z"
    }
  ]
}
```

### Get Group by ID

**Endpoint:** `GET /groups/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "group": {
    "id": "uuid",
    "name": "Weekend Crew",
    "userIds": ["uuid1", "uuid2", "uuid3"],
    "createdBy": "uuid1",
    "createdAt": "2025-01-02T10:00:00.000Z"
  }
}
```

### Create Group

**Endpoint:** `POST /groups`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "Weekend Crew",
  "userIds": ["uuid2", "uuid3"]
}
```

**Response (201):**
```json
{
  "group": {
    "id": "uuid",
    "name": "Weekend Crew",
    "userIds": ["uuid1", "uuid2", "uuid3"],
    "createdBy": "uuid1",
    "createdAt": "2025-01-02T10:00:00.000Z"
  }
}
```

### Update Group Members

**Endpoint:** `PUT /groups/:id/members`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "userIds": ["uuid2", "uuid3", "uuid4"]
}
```

**Response (200):**
```json
{
  "group": {
    "id": "uuid",
    "name": "Weekend Crew",
    "userIds": ["uuid1", "uuid2", "uuid3", "uuid4"],
    "createdBy": "uuid1",
    "createdAt": "2025-01-02T10:00:00.000Z"
  }
}
```

### Delete Group

**Endpoint:** `DELETE /groups/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Group deleted"
}
```

## Feeds

### Get Main Feed

Get newsflashes from friends (including own newsflashes), filtered and enriched.

**Endpoint:** `GET /feeds/main`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "newsflashes": [
    {
      "id": "uuid",
      "userId": "uuid",
      "headline": "Exciting news!",
      "subHeadline": "Something amazing happened",
      "media": "https://example.com/image.jpg",
      "timestamp": "2025-01-02T10:00:00.000Z",
      "user": {
        "id": "uuid",
        "name": "Jane Doe",
        "username": "janedoe",
        "email": "jane@example.com",
        "avatar": null
      }
    }
  ]
}
```

### Get Group Feed

Get newsflashes from group members, filtered and enriched.

**Endpoint:** `GET /feeds/group/:groupId`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "group": {
    "id": "uuid",
    "name": "Weekend Crew",
    "userIds": ["uuid1", "uuid2", "uuid3"],
    "createdBy": "uuid1",
    "createdAt": "2025-01-02T10:00:00.000Z"
  },
  "newsflashes": [
    {
      "id": "uuid",
      "userId": "uuid",
      "headline": "Exciting news!",
      "subHeadline": "Something amazing happened",
      "media": "https://example.com/image.jpg",
      "timestamp": "2025-01-02T10:00:00.000Z",
      "user": {
        "id": "uuid",
        "name": "Jane Doe",
        "username": "janedoe",
        "email": "jane@example.com",
        "avatar": null
      }
    }
  ]
}
```

## Uploads

### Get Presigned URL

Generate a presigned URL for uploading media to S3.

**Endpoint:** `POST /uploads/presigned-url`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "fileName": "image.jpg",
  "fileType": "image/jpeg"
}
```

**Response (200):**
```json
{
  "presignedUrl": "https://friendlines-media.s3.amazonaws.com/uploads/...",
  "publicUrl": "https://friendlines-media.s3.amazonaws.com/uploads/user-id/timestamp_image.jpg",
  "key": "uploads/user-id/timestamp_image.jpg",
  "expiresIn": 300
}
```

## Devices

### Register Device Token

Register a device for push notifications.

**Endpoint:** `POST /devices/token`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "deviceId": "unique-device-id",
  "expoPushToken": "ExponentPushToken[xxxxxxxx]",
  "platform": "ios"
}
```

**Response (201):**
```json
{
  "message": "Token registered"
}
```

### Remove Device Token

Unregister a device from push notifications.

**Endpoint:** `DELETE /devices/token`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "deviceId": "unique-device-id"
}
```

**Response (200):**
```json
{
  "message": "Token removed"
}
```

## Interviews (AI Reporter)

The AI Reporter conducts brief conversational interviews to generate newsflashes about the user's day, week, or specific events. Supports multiple languages (English, Hebrew, Spanish).

### Start Interview

Start a new interview session with the AI reporter.

**Endpoint:** `POST /interviews`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "type": "daily",
  "language": "en"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `type` | string | No | Interview type: `daily`, `weekly`, or `event`. Defaults to `daily`. |
| `language` | string | No | Language code: `en`, `he`, or `es`. Defaults to `en`. |

**Response (201):**
```json
{
  "session": {
    "id": "uuid",
    "userId": "uuid",
    "status": "active",
    "messages": [
      {
        "role": "assistant",
        "content": "Hey! How's your Tuesday going so far?"
      }
    ],
    "context": {
      "timeOfDay": "midday",
      "dayOfWeek": "Tuesday",
      "interviewType": "daily",
      "userName": "John",
      "language": "en"
    },
    "createdAt": "2026-02-07T12:00:00.000Z",
    "updatedAt": "2026-02-07T12:00:00.000Z"
  }
}
```

### Send Message

Send a user message to continue the interview. The AI will respond with follow-up questions until it has enough information, then generate a newsflash draft.

**Endpoint:** `POST /interviews/:id/messages`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "message": "It was great! I went hiking with friends."
}
```

**Response (200) - Interview continues:**
```json
{
  "session": {
    "id": "uuid",
    "userId": "uuid",
    "status": "active",
    "messages": [
      { "role": "assistant", "content": "Hey! How's your Tuesday going so far?" },
      { "role": "user", "content": "It was great! I went hiking with friends." },
      { "role": "assistant", "content": "Nice! Where did you go hiking?" }
    ],
    "context": { ... },
    "createdAt": "2026-02-07T12:00:00.000Z",
    "updatedAt": "2026-02-07T12:01:00.000Z"
  }
}
```

**Response (200) - Interview complete:**
```json
{
  "session": {
    "id": "uuid",
    "userId": "uuid",
    "status": "completed",
    "messages": [ ... ],
    "context": { ... },
    "draftNewsflash": {
      "headline": "John Conquers Mountain Trail",
      "subHeadline": "An adventurous Tuesday hike with friends to celebrate the sunny weather",
      "category": "LIFESTYLE",
      "severity": "STANDARD"
    },
    "createdAt": "2026-02-07T12:00:00.000Z",
    "updatedAt": "2026-02-07T12:05:00.000Z"
  }
}
```

### Get Interview

Retrieve an existing interview session (useful for resuming).

**Endpoint:** `GET /interviews/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "session": {
    "id": "uuid",
    "userId": "uuid",
    "status": "active",
    "messages": [ ... ],
    "context": { ... },
    "createdAt": "2026-02-07T12:00:00.000Z",
    "updatedAt": "2026-02-07T12:01:00.000Z"
  }
}
```

### Data Models

#### InterviewSession

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique session identifier |
| `userId` | string | Owner user ID |
| `status` | string | `active`, `completed`, or `abandoned` |
| `messages` | array | Conversation history |
| `context` | object | Interview metadata |
| `draftNewsflash` | object | Generated newsflash (when complete) |
| `createdAt` | string | ISO timestamp |
| `updatedAt` | string | ISO timestamp |

#### InterviewMessage

| Field | Type | Description |
|-------|------|-------------|
| `role` | string | `user` or `assistant` |
| `content` | string | Message text |

#### NewsflashDraft

| Field | Type | Description |
|-------|------|-------------|
| `headline` | string | Main headline (max 100 chars) |
| `subHeadline` | string | Supporting detail (max 200 chars) |
| `category` | string | `GENERAL`, `LIFESTYLE`, `WORK`, etc. |
| `severity` | string | `STANDARD` or `BREAKING` |

### Rate Limits

- **Max daily interviews**: 3 per user per day
- **Max messages per session**: 8 user messages

## Error Handling

All errors follow this format:

```json
{
  "error": "Error message"
}
```

### Common Status Codes

- **200 OK**: Request succeeded
- **201 Created**: Resource created successfully
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Access denied (e.g., not a group member)
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

### Authentication Errors

**Invalid credentials:**
```json
{
  "error": "Invalid credentials"
}
```

**Token expired:**
```json
{
  "error": "Token expired"
}
```

**Missing token:**
```json
{
  "error": "No token provided"
}
```

### Validation Errors

**Missing required fields:**
```json
{
  "error": "Field 'name' is required"
}
```

**Invalid email format:**
```json
{
  "error": "Invalid email format"
}
```

**User already exists:**
```json
{
  "error": "User already exists"
}
```

### Authorization Errors

**Not a group member:**
```json
{
  "error": "Not a member of this group"
}
```

**Not the group creator:**
```json
{
  "error": "Only group creator can delete the group"
}
```

## Rate Limiting

Currently no rate limiting is implemented in the local development environment. In production, consider implementing rate limiting to prevent abuse.

## Security Notes

1. **JWT Secret**: Change the `JWT_SECRET` in production
2. **Password Hashing**: Passwords are hashed using bcrypt with 10 rounds
3. **Token Expiration**: Tokens expire after 7 days
4. **HTTPS**: Always use HTTPS in production
5. **Input Validation**: All inputs are validated before processing



