# getUsersByIds Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a method to ZendeskApiService to fetch multiple Zendesk users by IDs in a single API call.

**Architecture:** Mirror the existing `getZendeskTickets()` pattern - use the `/api/v2/users/show_many` endpoint with comma-separated IDs, enforce a 100-user limit, and support generic typing for custom user fields.

**Tech Stack:** TypeScript, Jest, Zendesk API v2

---

## File Structure

**Files to modify:**
- `src/services/zendesk-api-service.ts` - Add `getUsersByIds()` method after line 181
- `__tests__/services/zendesk-api-service.spec.ts` - Add test suite in "User" section after line 277

## Task 1: Add Tests for getUsersByIds

**Files:**
- Modify: `__tests__/services/zendesk-api-service.spec.ts:277`

Add a complete test suite for the new `getUsersByIds()` method following TDD.

- [ ] **Step 1: Write the test suite**

Add this test suite after the `getUser` describe block (after line 277):

```typescript
        describe("getUsersByIds", () => {
            const mockUsers: IZendeskUser[] = [
                {
                    id: 1,
                    name: "Test User 1",
                    email: "test1@example.com",
                    created_at: "2023-01-01T00:00:00Z",
                    updated_at: "2023-01-01T00:00:00Z",
                    url: "https://example.zendesk.com/api/v2/users/1.json",
                    time_zone: "UTC",
                    iana_time_zone: "UTC",
                    phone: null,
                    photo: null,
                    locale_id: 1,
                    locale: "en-US",
                    organization_id: 100,
                    role: "end-user",
                    verified: true,
                    external_id: null,
                    tags: [],
                    alias: "",
                    active: true,
                    shared: false,
                    shared_agent: false,
                    shared_phone_number: null,
                    last_login_at: "2023-01-01T00:00:00Z",
                    two_factor_auth_enabled: null,
                    signature: "",
                    details: "",
                    notes: "",
                    role_type: 0,
                    custom_role_id: 0,
                    moderator: false,
                    ticket_restriction: null,
                    only_private_comments: false,
                    restricted_agent: false,
                    suspended: false,
                    default_group_id: 0,
                    report_csv: false,
                    user_fields: {}
                },
                {
                    id: 2,
                    name: "Test User 2",
                    email: "test2@example.com",
                    created_at: "2023-01-02T00:00:00Z",
                    updated_at: "2023-01-02T00:00:00Z",
                    url: "https://example.zendesk.com/api/v2/users/2.json",
                    time_zone: "UTC",
                    iana_time_zone: "UTC",
                    phone: null,
                    photo: null,
                    locale_id: 1,
                    locale: "en-US",
                    organization_id: 100,
                    role: "end-user",
                    verified: true,
                    external_id: null,
                    tags: [],
                    alias: "",
                    active: true,
                    shared: false,
                    shared_agent: false,
                    shared_phone_number: null,
                    last_login_at: "2023-01-02T00:00:00Z",
                    two_factor_auth_enabled: null,
                    signature: "",
                    details: "",
                    notes: "",
                    role_type: 0,
                    custom_role_id: 0,
                    moderator: false,
                    ticket_restriction: null,
                    only_private_comments: false,
                    restricted_agent: false,
                    suspended: false,
                    default_group_id: 0,
                    report_csv: false,
                    user_fields: {}
                }
            ];

            it("should retrieve multiple users by their IDs", async () => {
                requestMock.mockResolvedValueOnce({ users: mockUsers });

                const result = await service.getUsersByIds([1, 2]);

                expect(requestMock).toHaveBeenCalledWith({
                    url: `/api/v2/users/show_many?ids=1,2`,
                    type: "GET",
                    contentType: "application/json"
                });
                expect(result).toEqual(mockUsers);
            });

            it("should handle single user ID", async () => {
                requestMock.mockResolvedValueOnce({ users: [mockUsers[0]] });

                const result = await service.getUsersByIds([1]);

                expect(requestMock).toHaveBeenCalledWith({
                    url: `/api/v2/users/show_many?ids=1`,
                    type: "GET",
                    contentType: "application/json"
                });
                expect(result).toEqual([mockUsers[0]]);
            });

            it("should throw an error when trying to retrieve more than 100 users", async () => {
                const manyUserIds = Array.from({ length: 101 }, (_, index) => index + 1);

                await expect(service.getUsersByIds(manyUserIds)).rejects.toThrow(
                    "A limit of 100 users can be retrieved at a time."
                );

                expect(requestMock).not.toHaveBeenCalled();
            });
        });
```

- [ ] **Step 2: Run tests to verify they fail**

Run the test suite:

```bash
npm test -- __tests__/services/zendesk-api-service.spec.ts -t "getUsersByIds"
```

Expected output: All 3 tests FAIL with error indicating `service.getUsersByIds is not a function`

- [ ] **Step 3: Commit the failing tests**

```bash
git add __tests__/services/zendesk-api-service.spec.ts
git commit -m "test: add failing tests for getUsersByIds method"
```

## Task 2: Implement getUsersByIds Method

**Files:**
- Modify: `src/services/zendesk-api-service.ts:182`

Implement the `getUsersByIds()` method to make all tests pass.

- [ ] **Step 1: Add the method implementation**

Add this method after the `getUser()` method (after line 181):

```typescript
    /**
     * Retrieve multiple zendesk users
     * A limit of 100 users can be retrieved at a time.
     */
    public async getUsersByIds<T = IZendeskUserFieldValue>(userIds: number[]): Promise<IZendeskUser<T>[]> {
        if (userIds.length > MAX_TICKETS_PER_REQUEST) {
            throw new Error("A limit of 100 users can be retrieved at a time.");
        }

        const { users } = await this.client.request<ISearchUserResults<T>>({
            url: `/api/v2/users/show_many?ids=${userIds.join(",")}`,
            type: "GET",
            contentType: "application/json"
        });

        return users;
    }
```

- [ ] **Step 2: Run tests to verify they pass**

Run the test suite:

```bash
npm test -- __tests__/services/zendesk-api-service.spec.ts -t "getUsersByIds"
```

Expected output: All 3 tests PASS

- [ ] **Step 3: Run full test suite to ensure no regressions**

Run all tests:

```bash
npm test -- __tests__/services/zendesk-api-service.spec.ts
```

Expected output: All tests PASS (including the new getUsersByIds tests)

- [ ] **Step 4: Run linter**

```bash
npm run lint
```

Expected output: No linting errors

- [ ] **Step 5: Commit the implementation**

```bash
git add src/services/zendesk-api-service.ts
git commit -m "feat: add getUsersByIds method to ZendeskApiService

- Retrieves multiple users by IDs using show_many endpoint
- Enforces 100-user limit matching getZendeskTickets pattern
- Supports generic typing for custom user fields"
```

## Task 3: Verification and Documentation

**Files:**
- Check: All modified files

Final verification that everything works correctly.

- [ ] **Step 1: Run full test suite**

```bash
npm test
```

Expected output: All tests PASS with coverage maintained

- [ ] **Step 2: Run build to verify TypeScript compilation**

```bash
npm run build
```

Expected output: Build succeeds with no TypeScript errors

- [ ] **Step 3: Run prettier check**

```bash
npm run prettier
```

Expected output: No formatting issues

- [ ] **Step 4: Review changes**

```bash
git diff HEAD~2
```

Verify:
- Method signature matches design spec
- Tests cover all specified cases
- Implementation follows existing patterns
- No unintended changes

## Success Criteria

✅ All tests pass including 3 new tests for getUsersByIds
✅ Method enforces 100-user limit
✅ Method uses correct API endpoint with comma-separated IDs
✅ Generic typing works for custom user fields
✅ No linting or TypeScript errors
✅ Code follows existing patterns (matches getZendeskTickets)
