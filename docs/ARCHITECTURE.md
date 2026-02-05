# Friendlines Architecture

## Overview

Friendlines is a minimal social network mobile app with a news aesthetic. The system consists of an **Expo/React Native** frontend and an **AWS SAM** serverless backend.

Product constraint: **no comments, likes, shares, or reposts** — Friendlines is intentionally headline-only.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Mobile App (Expo)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Screens  │  │ Contexts │  │ Services │  │ Config (api.ts)  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
│       │             │             │                 │           │
└───────┼─────────────┼─────────────┼─────────────────┼───────────┘
        │             │             │                 │
        └─────────────┴──────┬──────┴─────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    AWS API Gateway                               │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                 Lambda Functions (SAM)                          │
│  ┌──────┐ ┌───────┐ ┌────────────┐ ┌───────────┐ ┌──────────┐  │
│  │ Auth │ │ Users │ │Newsflashes │ │Friendships│ │ Groups   │  │
│  └──┬───┘ └───┬───┘ └─────┬──────┘ └─────┬─────┘ └────┬─────┘  │
│     │         │           │              │            │        │
│  ┌──────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐             │
│  │Feeds │  │Bookmarks│  │ Uploads │  │  Utils  │             │
│  └──┬───┘  └────┬────┘  └────┬────┘  └─────────┘             │
└─────┼───────────┼────────────┼───────────────────────────────────┘
      │           │            │
      ▼           ▼            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      AWS Services                                │
│  ┌─────────────────────────────┐  ┌────────────────────────────┐ │
│  │        DynamoDB             │  │           S3               │ │
│  │  - friendlines-users        │  │  - friendlines-media       │ │
│  │  - friendlines-newsflashes  │  │    (presigned uploads)     │ │
│  │  - friendlines-groups       │  └────────────────────────────┘ │
│  │  - friendlines-friendships  │                                 │
│  │  - friendlines-bookmarks    │                                 │
│  └─────────────────────────────┘                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Models

### User
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Primary key |
| name | string | Display name |
| username | string | Unique, lowercase |
| email | string | Unique, lowercase |
| passwordHash | string | bcrypt hash |
| avatar | string? | URL |
| createdAt | string | ISO timestamp |

### Newsflash
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Primary key |
| userId | string | Author reference |
| headline | string | Main content |
| subHeadline | string? | Secondary text |
| media | string? | Media URL |
| category | string? | News category |
| severity | string? | STANDARD / BREAKING / DEVELOPING |
| audience | string? | `ALL_FRIENDS` or `GROUPS` |
| groupIds | string[]? | Only when `audience="GROUPS"` |
| timestamp | string | ISO timestamp |

### Group
| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Primary key |
| name | string | Group name |
| userIds | string[] | Member IDs |

### Friendship
| Field | Type | Description |
|-------|------|-------------|
| userId | string | Hash key |
| friendId | string | Range key |
| status | string | pending/accepted |
| createdAt | string | ISO timestamp |

### Bookmark
| Field | Type | Description |
|-------|------|-------------|
| userId | string | Hash key |
| newsflashId | string | Range key |

## Authentication Flow

1. **Register** (`POST /auth/register`)
   - Validates email/username uniqueness
   - Hashes password with bcrypt
   - Returns JWT token + user object

2. **Login** (`POST /auth/login`)
   - Validates credentials
   - Returns JWT token + user object

3. **Protected Routes**
   - `withAuth` middleware extracts userId from JWT
   - Token stored in AsyncStorage on mobile
   - Auto-attached via `apiCall()` helper

**Source of Truth**: `backend/src/handlers/auth.ts`, `backend/src/utils/middleware.ts`

## API Endpoints

| Method | Path | Handler | Description |
|--------|------|---------|-------------|
| POST | /auth/register | auth.ts | Create account |
| POST | /auth/login | auth.ts | Authenticate |
| GET | /auth/me | auth.ts | Current user |
| GET | /users | users.ts | List users |
| GET | /users/{id} | users.ts | Get user |
| GET | /users/search | users.ts | Search users |
| DELETE | /users/{id} | users.ts | Delete account |
| POST | /newsflashes | newsflashes.ts | Create post |
| GET | /newsflashes | newsflashes.ts | List posts |
| GET | /feeds/main | feeds.ts | Friends feed |
| GET | /feeds/group/{id} | feeds.ts | Group feed |
| POST | /friendships | friendships.ts | Send request |
| DELETE | /friendships/{id} | friendships.ts | Remove friend |
| GET | /friends | friendships.ts | List friends |
| GET | /friend-requests/* | friendships.ts | Request mgmt |
| POST | /groups | groups.ts | Create group |
| GET | /groups | groups.ts | List groups |
| DELETE | /groups/{id} | groups.ts | Delete group |
| POST | /bookmarks | bookmarks.ts | Save post |
| DELETE | /bookmarks/{id} | bookmarks.ts | Unsave post |
| POST | /uploads/presigned-url | uploads.ts | Get upload URL |
| POST | /devices/token | devices.ts | Register push token |
| DELETE | /devices/token | devices.ts | Remove push token |

**Source of Truth**: `backend/template.yaml`

## Frontend Structure

```
src/
├── components/        # Reusable UI (FeedList, NewsflashCard)
├── config/api.ts      # API client, base URL, apiCall()
├── context/           # React contexts (Auth, Data, Bookmarks, Theme)
├── navigation/        # React Navigation (Tab + Stack)
├── screens/           # Screen components
├── services/          # API wrappers (api.ts, auth.ts, upload.ts)
├── theme/             # Material Design 3 theme
└── types/             # TypeScript interfaces
```

## Navigation Structure

```
RootStack
├── MainTabs (Tab.Navigator)
│   ├── Feed → MainFeedScreen
│   ├── Groups → GroupsStackScreen
│   │   ├── GroupsList
│   │   └── GroupFeed
│   └── Profile → ProfileStackScreen
│       ├── ProfileMain
│       ├── Saved
│       ├── FriendsList
│       ├── AddFriend
│       ├── FriendRequests
│       ├── UserFeed
│       └── EditProfile
├── CreateNewsflash (modal)
└── CreateGroup (modal)
```

**Source of Truth**: `src/navigation/TabNavigator.tsx`

## Error Handling

- **Backend**: `successResponse()` / `errorResponse()` utilities
- **Frontend**: try/catch in services, 401 clears token automatically
- **Logging**: Console logs prefixed with `[API]`

## Environment Configuration

### Frontend

| Variable / Storage Key | Usage | Location |
|------------------------|-------|----------|
| `API_URL` | Optional API base URL override | `src/config/api.ts` |
| `USE_PRODUCTION_API` | Toggle prod vs local base URL selection | `src/config/api.ts` |
| `PRODUCTION_API_URL` | Production API Gateway base URL | `src/config/api.ts` |
| `@friendlines_auth_token` | Stored JWT token | AsyncStorage (`src/services/auth.ts`, `src/config/api.ts`) |
| `@friendlines_user` | Stored current user object | AsyncStorage (`src/services/auth.ts`) |

### Backend

| Variable | Backend Usage | Location |
|----------|--------------|----------|
| JWT_SECRET | Token signing | env.json, template.yaml |
| IS_LOCAL | DynamoDB endpoint switch | env.json |
| *_TABLE | DynamoDB table names | template.yaml globals |
| MEDIA_BUCKET | S3 bucket name | template.yaml |

**Source of Truth**: `backend/env.json`, `backend/template.yaml`

## Questions/Unknowns

1. **Production deployment**: CI/CD is configured via GitHub Actions (`.github/workflows/deploy-backend.yml`) but requires GitHub secrets + correct `backend/samconfig.prod.toml` parameters.
2. **Pagination**: Feed endpoints implement cursor-based pagination (`limit`, `cursor`), but most list endpoints still use full-table scans (no pagination).
3. **Rate limiting**: Only BREAKING news is rate-limited (1 per 24 hours). No global API rate limiting is configured.


