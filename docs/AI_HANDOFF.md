# AI Handoff Guide

Instructions for AI agents working on the Friendlines codebase.

## Quick Orientation

### Where to Look First

| Task | Start Here |
|------|-----------|
| Frontend UI changes | `src/screens/`, `src/components/` |
| API integration | `src/services/api.ts`, `src/config/api.ts` |
| Navigation changes | `src/navigation/TabNavigator.tsx` |
| Backend endpoints | `backend/src/handlers/` |
| Database operations | `backend/src/utils/dynamo.ts` |
| Auth logic | `backend/src/handlers/auth.ts`, `src/services/auth.ts` |
| API routes | `backend/template.yaml` (Events sections) |
| Types/interfaces | `src/types/index.ts` |

### Key Entry Points

- **App entry**: `App.js` - wraps providers, handles auth routing
- **Navigation root**: `src/navigation/TabNavigator.tsx`
- **API client**: `src/config/api.ts` - `apiCall()` function
- **Lambda entry**: Each `backend/src/handlers/*.ts` exports `handler`

## Naming Conventions

### Files
- Screens: `PascalCaseScreen.tsx` (e.g., `MainFeedScreen.tsx`)
- Components: `PascalCase.tsx` (e.g., `NewsflashCard.tsx`)
- Services: `camelCase.ts` (e.g., `api.ts`, `auth.ts`)
- Handlers: `camelCase.ts` (e.g., `friendships.ts`)
- Utils: `camelCase.ts` (e.g., `dynamo.ts`)

### Code
- React components: PascalCase
- Functions: camelCase
- Interfaces: PascalCase
- Constants: UPPER_SNAKE_CASE
- DynamoDB tables: `friendlines-{entity}` (lowercase, hyphenated)

## Patterns to Follow

### Frontend

1. **Screens use hooks for data**
   ```typescript
   const { user } = useAuth();
   const [data, setData] = useState([]);
   useEffect(() => { fetchData().then(setData); }, []);
   ```

2. **API calls through services**
   ```typescript
   // Good: Use service layer
   import { fetchFriends } from '../services/api';
   
   // Bad: Direct fetch in component
   fetch('http://localhost:3000/friends')
   ```

3. **Navigation with typed params**
   ```typescript
   navigation.navigate('GroupFeed', { group });
   ```

4. **Styling with StyleSheet**
   ```typescript
   const styles = StyleSheet.create({
     container: { flex: 1, padding: 16 },
   });
   ```

### Backend

1. **Handler structure**
   ```typescript
   export async function handler(event) {
     try {
       // Route based on method + path
       if (method === 'GET' && path === '/resource') {
         return await handleGet(event);
       }
       return errorResponse('Not found', 404);
     } catch (error) {
       return errorResponse(error.message);
     }
   }
   ```

2. **Protected routes use withAuth**
   ```typescript
   if (method === 'GET' && path === '/protected') {
     return await withAuth(handleProtected)(event);
   }
   ```

3. **Response format**
   ```typescript
   // Success
   return successResponse({ data }, 200);
   
   // Error
   return errorResponse('Message', 400);
   ```

4. **DynamoDB operations**
   ```typescript
   import { putItem, getItem, scanTable } from '../utils/dynamo';
   ```

## Patterns to Avoid

### Do NOT

1. **Modify `backend/template.yaml` structure** without understanding SAM
2. **Change JWT_SECRET** in any environment
3. **Remove `withAuth`** from protected endpoints
4. **Use `localhost`** in Lambda code (use `dynamodb-local` hostname)
5. **Hardcode user IDs** - always get from `event.userId` after auth
6. **Skip input validation** in handlers
7. **Create circular imports** between services/contexts

### Watch Out For

1. **Duplicate API calls**: Check if data is already in context
2. **Missing error handling**: All API calls need try/catch
3. **Timestamp formats**: Backend uses ISO strings, frontend converts to Date
4. **Password exposure**: Never return `passwordHash` from auth endpoints

## "Do Not Break" Areas

### Critical Files - Extra Caution

| File | Risk | Why |
|------|------|-----|
| `backend/src/handlers/auth.ts` | HIGH | Breaks all authentication |
| `backend/src/utils/middleware.ts` | HIGH | JWT verification |
| `backend/template.yaml` | HIGH | Breaks entire backend |
| `src/context/AuthContext.tsx` | HIGH | App-wide auth state |
| `src/config/api.ts` | HIGH | All API calls |

### Critical Flows to Test

1. **Login/Register** - Must work end-to-end
2. **Token refresh** - Stored token validation
3. **Protected routes** - Auth middleware functioning
4. **Feed loading** - Main app experience

## Testing Safely

### Before Making Changes

```bash
# Verify backend builds
cd backend && sam build

# Verify frontend compiles
npx tsc --noEmit
```

### After Making Changes

```bash
# Run integration tests
./scripts/test-full-api.sh

# Manual test auth flow
# 1. Register new user
# 2. Login with same credentials
# 3. Create newsflash
# 4. Verify in feed
```

## Glossary

| Term | Meaning |
|------|---------|
| Newsflash | A post/update shared by a user |
| SAM | AWS Serverless Application Model |
| Feed | Aggregated newsflashes from friends |
| Friendship | Bidirectional friend connection |
| Friend Request | Pending friendship (status: pending) |
| Group | User-created collection of friends |
| Bookmark | Saved newsflash reference |

## Common Tasks Reference

### Add screen → see `docs/GOLDEN_PATHS.md` Recipe 1
### Add endpoint → see `docs/GOLDEN_PATHS.md` Recipe 2
### Add service function → see `docs/GOLDEN_PATHS.md` Recipe 3
### Full integration → see `docs/GOLDEN_PATHS.md` Recipe 5

## Questions/Unknowns

1. **No unit tests**: Only bash integration tests exist
2. **No shared types**: FE/BE types are manually synced
3. **No CI/CD**: Manual deployment only
4. **Media uploads**: Partially implemented, may need work
5. **Friend request flow**: Has `status` field but UI handling unclear

