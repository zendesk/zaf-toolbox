# getUsersByIds Function Design

## Overview

Add a new function to `ZendeskApiService` that retrieves multiple Zendesk users using comma-separated IDs in a single API call.

## Requirements

- Fetch multiple users by their IDs efficiently
- Match the pattern established by `getZendeskTickets()`
- Support generic typing for custom user fields
- Enforce a maximum limit of 100 users per request

## Function Signature

```typescript
public async getUsersByIds<T = IZendeskUserFieldValue>(userIds: number[]): Promise<IZendeskUser<T>[]>
```

**Location:** `src/services/zendesk-api-service.ts`, positioned near the existing `getUser()` method (around line 182)

**Parameters:**
- `userIds: number[]` - Array of Zendesk user IDs to fetch
- Generic type parameter `T` for custom user field values (defaults to `IZendeskUserFieldValue`)

**Returns:**
- `Promise<IZendeskUser<T>[]>` - Array of user objects

## Implementation

### API Endpoint

- **URL:** `/api/v2/users/show_many?ids={comma-separated-ids}`
- **Method:** GET
- **Content Type:** application/json

### Request Flow

1. **Validation:** Check if `userIds.length > 100`
   - If true, throw error: `"A limit of 100 users can be retrieved at a time."`
   - This matches the behavior of `getZendeskTickets()` which uses `MAX_TICKETS_PER_REQUEST = 100`

2. **API Call:** Make single request with IDs joined by commas
   ```typescript
   await this.client.request<ISearchUserResults<T>>({
       url: `/api/v2/users/show_many?ids=${userIds.join(",")}`,
       type: "GET",
       contentType: "application/json"
   })
   ```

3. **Response Extraction:** Extract and return the `users` array from the response

### Response Type

The API returns a response matching the existing `ISearchUserResults<T>` interface:
```typescript
interface ISearchUserResults<T = IZendeskUserFieldValue> extends IZendeskResponse {
    users: IZendeskUser<T>[];
}
```

### Error Handling

- **Invalid input:** Throw error if more than 100 user IDs are provided
- **API errors:** Let Zendesk API errors bubble up naturally (non-existent user IDs, permission errors, etc.)

## Testing

Add tests to `__tests__/services/zendesk-api-service.spec.ts` in the "User" section.

### Test Cases

1. **Retrieve multiple users by IDs**
   - Mock successful API response with multiple users
   - Verify correct endpoint URL with comma-separated IDs
   - Verify returned array matches expected data

2. **Handle single user ID**
   - Test edge case with array containing one ID
   - Verify request is made correctly

3. **Enforce 100-user limit**
   - Create array with 101 user IDs
   - Verify error is thrown with correct message
   - Verify no API request is made

### Test Structure

```typescript
describe("getUsersByIds", () => {
    it("should retrieve multiple users by their IDs", async () => {
        // Mock response, make request, verify URL and results
    })
    
    it("should handle single user ID", async () => {
        // Test single ID case
    })
    
    it("should throw an error when trying to retrieve more than 100 users", async () => {
        // Test limit enforcement
    })
})
```

## Design Rationale

### Why Approach 1 (show_many endpoint)?

This approach was chosen over alternatives for several reasons:

**vs. Batch individual requests:**
- Single API call vs. N requests (where N = number of users)
- Better performance and lower rate limit consumption
- More scalable

**vs. Search endpoint:**
- Direct lookup vs. search query
- More reliable and consistent
- Proper use of API semantics

### Consistency with Existing Code

- Mirrors `getZendeskTickets()` implementation pattern exactly
- Uses same 100-item limit constant concept
- Follows established error handling conventions
- Maintains type safety with generic parameters

## Files Modified

1. `src/services/zendesk-api-service.ts` - Add new method
2. `__tests__/services/zendesk-api-service.spec.ts` - Add test suite

## Risks and Considerations

- **Assumption:** Zendesk API supports `/api/v2/users/show_many` endpoint
  - This is a standard Zendesk pattern (tickets use it)
  - If endpoint doesn't exist, fallback to individual `getUser()` calls with `Promise.all()`
  
- **User order:** API may not return users in the same order as requested IDs
  - Document this behavior if confirmed
  
- **Missing users:** API may silently omit non-existent or inaccessible user IDs
  - This is expected Zendesk behavior, not an error condition
