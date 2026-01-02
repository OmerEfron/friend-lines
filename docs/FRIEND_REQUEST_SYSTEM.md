# Friend Request System Documentation

Complete documentation for the friend request system implementation in Friendlines.

## Overview

The friend request system replaces the instant add/remove friendship functionality with a proper request-approval flow, following social media best practices.

## Architecture

### State Model

Friendships can have three states:
- **pending**: Request sent but not yet responded to
- **accepted**: Both users are friends
- **rejected**: Request was denied

### Request Flow

```
User A sends request to User B
        ↓
Status: pending (one record)
        ↓
User B accepts/rejects
        ↓
If accepted: Two records created (bidirectional, both "accepted")
If rejected: Original record marked as "rejected"
```

## Database Schema

### Friendships Table (Updated)

```
Partition Key: userId (String)
Sort Key: friendId (String)
Attributes:
  - status: String (pending | accepted | rejected)
  - initiatorId: String (who sent the request)
  - createdAt: String (ISO 8601)
  - updatedAt: String (ISO 8601)
```

**Key points:**
- Pending requests have ONE record (initiator → receiver)
- Accepted friendships have TWO records (bidirectional)
- Rejected requests keep the original record marked as rejected

## Backend API

### New Endpoints

#### 1. Get Received Requests
`GET /friend-requests/received`

Returns pending friend requests sent TO the authenticated user.

**Response:**
```json
{
  "requests": [
    {
      "userId": "initiator-id",
      "friendId": "your-id",
      "status": "pending",
      "initiatorId": "initiator-id",
      "createdAt": "2026-01-02T...",
      "updatedAt": "2026-01-02T...",
      "user": {
        "id": "initiator-id",
        "name": "John Doe",
        "username": "johndoe",
        "avatar": "..."
      }
    }
  ]
}
```

#### 2. Get Sent Requests
`GET /friend-requests/sent`

Returns pending friend requests sent BY the authenticated user.

**Response:**
```json
{
  "requests": [
    {
      "userId": "your-id",
      "friendId": "recipient-id",
      "status": "pending",
      "initiatorId": "your-id",
      "createdAt": "2026-01-02T...",
      "updatedAt": "2026-01-02T...",
      "user": {
        "id": "recipient-id",
        "name": "Jane Smith",
        "username": "janesmith",
        "avatar": "..."
      }
    }
  ]
}
```

#### 3. Accept Request
`PUT /friend-requests/{requestId}/accept`

Accepts a friend request. Creates bidirectional relationship.

**Request ID format:** `{initiatorUserId}_{receiverUserId}`

**Example:** `PUT /friend-requests/abc123_def456/accept`

**Response:**
```json
{
  "message": "Friend request accepted"
}
```

**Actions:**
1. Updates original request to `status: "accepted"`
2. Creates reverse record with `status: "accepted"`

#### 4. Reject Request
`PUT /friend-requests/{requestId}/reject`

Rejects a friend request.

**Response:**
```json
{
  "message": "Friend request rejected"
}
```

**Actions:**
1. Updates original request to `status: "rejected"`

### Updated Endpoints

#### Send Friend Request
`POST /friendships`

**Before:** Instantly created bidirectional friendship
**Now:** Creates pending request (one record)

**Request Body:**
```json
{
  "friendId": "user-id-to-befriend"
}
```

**Validations:**
- Cannot send request to yourself
- Cannot send duplicate pending requests
- Cannot send request if already friends
- If other user already sent you a request, returns error asking to accept theirs instead

#### Get Friendships
`GET /friendships`

**Before:** Returned all friendships
**Now:** Only returns `status: "accepted"` friendships

#### Get Friends
`GET /friends`

**Before:** Returned all friend details
**Now:** Only returns details for accepted friends

## Frontend Implementation

### 1. FriendRequestsScreen

**Location:** `src/screens/FriendRequestsScreen.tsx`

**Features:**
- Tabbed interface (Received / Sent)
- Received tab: Shows requests with Approve/Deny buttons
- Sent tab: Shows pending outgoing requests
- Real-time count updates
- Date formatting (Today, Yesterday, X days ago)

**Usage:**
```typescript
navigation.navigate('FriendRequests')
```

### 2. ProfileScreen Updates

**Added:**
- "Friend Requests" menu item
- Badge showing pending request count
- Auto-updates badge on screen focus

### 3. AddFriendScreen Updates

**Shows different states:**

| Relationship Status | Button Display |
|-------------------|----------------|
| No relationship | "Send Request" button |
| Request sent by you | "Request Sent" text |
| Request received | "Respond" button (navigates to requests) |
| Already friends | "Friends ✓" text |

**Features:**
- Loads all requests on mount to determine status
- Refreshes requests after sending new request
- Shows user avatars if available

### 4. FriendsListScreen

**Behavior:**
- Only shows accepted friendships (automatic from API)
- No changes needed to the component itself

## User Experience Flow

### Sending a Friend Request

1. User A searches for User B in "Add Friend"
2. Sees "Send Request" button
3. Clicks button → Request sent
4. Button changes to "Request Sent"
5. User B sees notification badge on Profile → Friend Requests

### Receiving and Accepting

1. User B opens Profile → sees badge (e.g., "1 pending request")
2. Taps "Friend Requests"
3. Sees "Received" tab with User A's request
4. Taps "Accept"
5. Request disappears from both users' pending lists
6. Both users see each other in "My Friends"

### Rejecting a Request

1. User B taps "Reject" instead
2. Request disappears from received list
3. User A's request stays in "Sent" tab with "Pending" status
4. Backend marks request as rejected (prevents re-sending)

## Migration from Old System

### Existing Friendships

The seed script automatically creates friendships with:
```javascript
{
  status: 'accepted',
  initiatorId: userId,
  createdAt: now,
  updatedAt: now
}
```

**No migration needed** - old friendships without status field will be filtered out by the new API (only returns `status: "accepted"`).

## Testing

### Backend Test

Re-seed the database to create accepted friendships and a pending request:

```bash
./scripts/seed.sh
```

This creates:
- 4 test users as accepted friends
- 1 pending friend request for testing

### Frontend Test Scenarios

1. **View received requests:**
   - Login as seeded user
   - Check Profile → Friend Requests badge
   - Open Friend Requests → see pending request

2. **Accept request:**
   - Tap "Accept" on received request
   - Verify request disappears
   - Check "My Friends" → see new friend

3. **Send request:**
   - Go to "Add Friend"
   - Search for user
   - Tap "Send Request"
   - Verify button changes to "Request Sent"

4. **Reject request:**
   - Create test request
   - Tap "Reject" 
   - Verify request disappears

## Error Handling

### Backend Validations

| Error | Status Code | Message |
|-------|------------|---------|
| Send request to self | 400 | "You cannot send a friend request to yourself" |
| Duplicate pending | 409 | "Friend request already sent" |
| Already friends | 409 | "Already friends" |
| Reverse pending exists | 409 | "This user has already sent you a friend request. Accept it instead." |
| Invalid requestId | 404 | "Friend request not found" |
| Already processed | 400 | "This request has already been processed" |
| Accept/reject not your request | 403 | "You can only accept/reject requests sent to you" |

### Frontend Handling

All API errors are caught and logged to console. User sees:
- Failed actions don't update UI
- Loading states prevent double-clicks
- Can retry by performing action again

## Performance Considerations

### Current Implementation

- Uses DynamoDB Scan to fetch all friendships
- Filters in Lambda for user-specific data
- Enriches with user data from Users table

### For Production

Consider adding:
- GSI on `friendId` for faster lookups
- GSI on `status` + `friendId` for pending requests
- Pagination for large friend lists
- Caching layer for frequently accessed data

## Future Enhancements

1. **Push Notifications:** Notify users of new friend requests
2. **Mutual Friends:** Show mutual friends count in search
3. **Friend Suggestions:** Recommend friends based on mutual connections
4. **Block Users:** Prevent specific users from sending requests
5. **Request Expiry:** Auto-reject requests after X days
6. **Undo Accept:** Allow brief window to undo acceptance
7. **Bulk Actions:** Accept/reject multiple requests at once

## Files Modified

### Backend
- `backend/src/handlers/friendships.ts` - Complete rewrite with request system
- `backend/template.yaml` - Added new API Gateway events
- `backend/seed-database.js` - Updated to create accepted friendships + test request

### Frontend
- `src/screens/FriendRequestsScreen.tsx` - NEW: Main requests screen
- `src/screens/ProfileScreen.tsx` - Added Friend Requests menu with badge
- `src/screens/AddFriendScreen.tsx` - Shows relationship status
- `src/navigation/TabNavigator.tsx` - Added FriendRequestsScreen to navigation

## Security Notes

1. **Authorization:** All endpoints require JWT authentication
2. **Ownership:** Users can only accept/reject their own received requests
3. **Validation:** Server-side validation prevents duplicate/invalid requests
4. **Data Privacy:** Password hashes removed from all user responses

## Conclusion

The friend request system provides a proper social media experience where users must consent to friendships. It follows industry best practices and provides clear feedback at every step of the flow.

