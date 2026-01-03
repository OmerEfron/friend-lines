# Golden Paths

Step-by-step recipes for common development tasks in Friendlines.

## Recipe 1: Add a New Mobile Screen

### Step 1: Create Screen Component

Create `src/screens/MyNewScreen.tsx`:

```typescript
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';

export default function MyNewScreen() {
  return (
    <Surface style={styles.container}>
      <Text variant="headlineMedium">My New Screen</Text>
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
});
```

### Step 2: Add to Navigator

Edit `src/navigation/TabNavigator.tsx`:

```typescript
// 1. Import the screen
import MyNewScreen from '../screens/MyNewScreen';

// 2. Add to appropriate stack
<ProfileStack.Screen 
  name="MyNew" 
  component={MyNewScreen}
  options={{ title: 'My New Screen' }}
/>
```

### Step 3: Navigate to Screen

From any component:

```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();
navigation.navigate('MyNew');
```

**Files to modify**: `src/screens/`, `src/navigation/TabNavigator.tsx`

---

## Recipe 2: Add a New API Endpoint

### Step 1: Create or Update Handler

Edit existing handler or create `backend/src/handlers/myfeature.ts`:

```typescript
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../utils/response';
import { withAuth, AuthenticatedEvent } from '../utils/middleware';
import { putItem, getItem, scanTable } from '../utils/dynamo';

const TABLE_NAME = process.env.MY_TABLE || 'friendlines-mytable';

export async function handler(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
  console.log('MyFeature Event:', JSON.stringify(event, null, 2));

  try {
    const method = event.httpMethod;
    const path = event.path;

    if (method === 'GET' && path === '/myfeature') {
      return await withAuth(handleGetAll)(event);
    }

    if (method === 'POST' && path === '/myfeature') {
      return await withAuth(handleCreate)(event);
    }

    return errorResponse('Not found', 404);
  } catch (error) {
    console.error('Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Internal server error'
    );
  }
}

async function handleGetAll(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  const items = await scanTable(TABLE_NAME);
  return successResponse({ items });
}

async function handleCreate(
  event: AuthenticatedEvent
): Promise<APIGatewayProxyResult> {
  if (!event.body) {
    return errorResponse('Request body required', 400);
  }
  
  const body = JSON.parse(event.body);
  // Validate and create...
  
  return successResponse({ item: body }, 201);
}
```

### Step 2: Add to SAM Template

Edit `backend/template.yaml`:

```yaml
MyFeatureFunction:
  Type: AWS::Serverless::Function
  Metadata:
    BuildMethod: esbuild
    BuildProperties:
      Minify: false
      Target: "es2022"
      EntryPoints:
        - src/handlers/myfeature.ts
  Properties:
    CodeUri: ./
    Handler: src/handlers/myfeature.handler
    Policies:
      - DynamoDBCrudPolicy:
          TableName: !Ref MyTable
    Events:
      GetAll:
        Type: Api
        Properties:
          RestApiId: !Ref FriendlinesApi
          Path: /myfeature
          Method: GET
      Create:
        Type: Api
        Properties:
          RestApiId: !Ref FriendlinesApi
          Path: /myfeature
          Method: POST
```

### Step 3: Add Environment Variables

Edit `backend/env.json`:

```json
"MyFeatureFunction": {
  "MY_TABLE": "friendlines-mytable",
  "IS_LOCAL": "true",
  "JWT_SECRET": "local-dev-secret-change-in-production",
  "AWS_ACCESS_KEY_ID": "test",
  "AWS_SECRET_ACCESS_KEY": "test",
  "AWS_DEFAULT_REGION": "us-east-1"
}
```

### Step 4: Rebuild and Test

```bash
cd backend && sam build
# Restart SAM local API
./scripts/start-api.sh

# Test endpoint
curl http://localhost:3000/myfeature \
  -H "Authorization: Bearer <token>"
```

**Files to modify**: `backend/src/handlers/`, `backend/template.yaml`, `backend/env.json`

---

## Recipe 3: Add Frontend Service for New Endpoint

### Step 1: Add API Function

Edit `src/services/api.ts`:

```typescript
export interface MyItem {
  id: string;
  name: string;
}

export async function fetchMyItems(): Promise<MyItem[]> {
  const response = await apiCall<{ items: MyItem[] }>('/myfeature');
  return response.items;
}

export async function createMyItem(
  data: Omit<MyItem, 'id'>
): Promise<MyItem> {
  const response = await apiCall<{ item: MyItem }>('/myfeature', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.item;
}
```

### Step 2: Add Type Definition (if new entity)

Edit `src/types/index.ts`:

```typescript
export interface MyItem {
  id: string;
  name: string;
}
```

### Step 3: Use in Screen

```typescript
import { fetchMyItems, createMyItem } from '../services/api';

// In component
const [items, setItems] = useState<MyItem[]>([]);

useEffect(() => {
  fetchMyItems().then(setItems).catch(console.error);
}, []);
```

**Files to modify**: `src/services/api.ts`, `src/types/index.ts`

---

## Recipe 4: Add Shared Type Between FE and BE

Currently, types are duplicated. To add a new shared type:

### Step 1: Define in Frontend Types

Edit `src/types/index.ts`:

```typescript
export interface NewEntity {
  id: string;
  field1: string;
  field2?: number;
}
```

### Step 2: Mirror in Backend Handler

In the relevant `backend/src/handlers/*.ts`:

```typescript
interface NewEntity {
  id: string;
  field1: string;
  field2?: number;
}
```

**Note**: No shared package exists. Keep types in sync manually.

---

## Recipe 5: End-to-End Integration (New Feature)

### Example: Add "Reactions" Feature

#### 1. Backend: Create Handler

Create `backend/src/handlers/reactions.ts` with CRUD operations.

#### 2. Backend: Update SAM Template

Add `ReactionsFunction` and DynamoDB table if needed.

#### 3. Backend: Add to env.json

Add function environment variables.

#### 4. Backend: Rebuild

```bash
cd backend && sam build
```

#### 5. Frontend: Add Service Functions

Add to `src/services/api.ts`:
- `fetchReactions(newsflashId)`
- `addReaction(newsflashId, type)`

#### 6. Frontend: Update UI Component

Modify `src/components/NewsflashCard.tsx` to show reactions.

#### 7. Test Integration

```bash
# Start backend
./scripts/start-api.sh

# Start frontend
npm start

# Run integration tests
./scripts/test-full-api.sh
```

---

## Verification Checklist

Before submitting changes:

- [ ] TypeScript compiles: `npx tsc --noEmit`
- [ ] Backend builds: `cd backend && sam build`
- [ ] API tests pass: `./scripts/test-full-api.sh`
- [ ] Manual test in app
- [ ] No console errors in Metro bundler
- [ ] Handler has proper error handling
- [ ] Protected routes use `withAuth` middleware

## Questions/Unknowns

1. No automated unit test framework configured
2. No shared types package between FE/BE
3. No database migrations - schema changes require manual table updates

