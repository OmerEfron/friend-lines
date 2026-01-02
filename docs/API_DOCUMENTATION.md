# Friendlines API Documentation

Complete documentation for the Friendlines serverless backend API.

## Table of Contents

1. [Authentication](#authentication)
2. [Users](#users)
3. [Newsflashes](#newsflashes)
4. [Friendships](#friendships)
5. [Groups](#groups)
6. [Feeds](#feeds)
7. [Error Handling](#error-handling)

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

## Newsflashes

### List All Newsflashes

**Endpoint:** `GET /newsflashes`

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
  "media": "https://example.com/image.jpg",
  "userId": "uuid"
}
```

**Response (201):**
```json
{
  "newsflash": {
    "id": "uuid",
    "userId": "uuid",
    "headline": "Exciting news!",
    "subHeadline": "Something amazing happened",
    "media": "https://example.com/image.jpg",
    "timestamp": "2025-01-02T10:00:00.000Z"
  }
}
```

### Get Newsflash by ID

**Endpoint:** `GET /newsflashes/:id`

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "newsflash": {
    "id": "uuid",
    "userId": "uuid",
    "headline": "Exciting news!",
    "subHeadline": "Something amazing happened",
    "media": "https://example.com/image.jpg",
    "timestamp": "2025-01-02T10:00:00.000Z"
  }
}
```

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

