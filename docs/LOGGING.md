# Logging Guide

Where to find logs for the Friendlines backend and push notifications.

## Production Logs (AWS CloudWatch)

### Method 1: AWS Console (Web UI)

1. Go to [AWS CloudWatch Console](https://console.aws.amazon.com/cloudwatch/)
2. Navigate to **Logs** → **Log groups**
3. Filter by: `/aws/lambda/friendlines-backend-prod-`
4. Click on a function name to view logs:
   - `NewsflashesFunction` - Newsflash creation and push notifications
   - `DevicesFunction` - Push token registration
   - `FriendshipsFunction` - Friend requests and notifications
   - `AuthFunction` - Authentication
   - `UsersFunction` - User operations

### Method 2: SAM CLI (Command Line)

```bash
cd backend

# View logs for Newsflashes (push notifications)
sam logs -n NewsflashesFunction --stack-name friendlines-backend-prod --tail

# View logs for Devices (token registration)
sam logs -n DevicesFunction --stack-name friendlines-backend-prod --tail

# View logs for Friendships (friend notifications)
sam logs -n FriendshipsFunction --stack-name friendlines-backend-prod --tail

# View logs for any function
sam logs -n {FunctionName} --stack-name friendlines-backend-prod --tail
```

### Method 3: AWS CLI

```bash
# List recent log streams
aws logs describe-log-streams \
  --log-group-name "/aws/lambda/friendlines-backend-prod-NewsflashesFunction-{ID}" \
  --order-by LastEventTime \
  --descending \
  --max-items 1 \
  --region us-east-1 \
  --no-cli-pager

# Get log events
aws logs get-log-events \
  --log-group-name "/aws/lambda/friendlines-backend-prod-NewsflashesFunction-{ID}" \
  --log-stream-name "{stream-name}" \
  --region us-east-1 \
  --no-cli-pager
```

## Local Development Logs

### Backend (SAM Local)

When running `sam local start-api`, logs appear in the terminal where you started it.

```bash
cd backend
sam local start-api --docker-network friendlines-net
# Logs appear here in real-time
```

### DynamoDB Local

```bash
docker logs dynamodb-local --tail 50 -f
```

### LocalStack (S3)

```bash
docker logs localstack --tail 50 -f
```

## Frontend Logs

### React Native / Expo

Logs appear in:
- **Terminal** where you ran `npx expo start`
- **Metro bundler console**
- **Device logs** (if using physical device)

### View Push Token Logs

The push token is logged with this format:
```
═══════════════════════════════════════════════════════
📱 EXPO PUSH TOKEN (for testing):
ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
═══════════════════════════════════════════════════════
```

## What to Look For

### Push Notification Logs

In `NewsflashesFunction` logs, look for:
- `"Send push notifications to friends"` - Notification triggered
- `"Failed to notify friends:"` - Notification errors
- `"No valid Expo push tokens to send to"` - No tokens found

In `DevicesFunction` logs, look for:
- `"Push token registered successfully"` - Token saved
- `"Failed to register push token"` - Registration errors

### Common Log Patterns

**Successful notification:**
```
Devices Event: {...}
Push token registered with backend
```

**Notification sent:**
```
Send push notifications to friends
Expo Push API: 200
```

**Error patterns:**
```
Failed to notify friends: [error]
Expo Push API error: 429 (rate limit)
Failed to get push token: [error]
```

## Filtering Logs

### CloudWatch Logs Insights

1. Go to CloudWatch → **Logs** → **Logs Insights**
2. Select log group: `/aws/lambda/friendlines-backend-prod-NewsflashesFunction-*`
3. Query examples:

```sql
-- Find all push notification attempts
fields @timestamp, @message
| filter @message like /push|notification|Expo/
| sort @timestamp desc
| limit 100

-- Find errors
fields @timestamp, @message
| filter @level = "ERROR" or @message like /error|Error|failed|Failed/
| sort @timestamp desc
| limit 100

-- Find specific user's notifications
fields @timestamp, @message
| filter @message like /userId.*b015a4ec/
| sort @timestamp desc
```

## Quick Commands Reference

```bash
# Tail Newsflashes logs (push notifications)
sam logs -n NewsflashesFunction --stack-name friendlines-backend-prod --tail

# Tail Devices logs (token registration)
sam logs -n DevicesFunction --stack-name friendlines-backend-prod --tail

# View last 100 lines
sam logs -n NewsflashesFunction --stack-name friendlines-backend-prod --tail -n 100

# Follow logs in real-time
sam logs -n NewsflashesFunction --stack-name friendlines-backend-prod --tail -f
```

